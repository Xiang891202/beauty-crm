import { supabase } from '../lib/supabase';

// ==================== 購買組合包 ====================
export const purchasePackage = async (
  customer_id: number,
  package_id: string,
  purchase_date?: string,
  expiry_date?: string | null,
  total_uses?: number,
  tenantId?: number
) => {
  // 1. 查詢組合包模板（加上 tenant 過濾，防止跨租户購買）
  let pkgQuery = supabase
    .from('service_packages')
    .select('*, items:service_package_items(service_id, quantity)')
    .eq('id', package_id);
  if (tenantId) pkgQuery = pkgQuery.eq('tenant_id', tenantId);
  const { data: pkg, error: pkgErr } = await pkgQuery.single();
  if (pkgErr) throw new Error(pkgErr.message);
  if (!pkg) throw new Error('組合包不存在');

  const templateTotal = pkg.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const purchaseDate = purchase_date ? new Date(purchase_date) : new Date();
  const expiry = expiry_date ? new Date(expiry_date) : null;
  const finalTotalUses = total_uses ?? templateTotal;

  // 2. 插入會員組合包記錄（注入 tenant_id）
  const insertData: any = {
    customer_id,
    package_id,
    snapshot_name: pkg.name,
    snapshot_description: pkg.description,
    purchase_date: purchaseDate,
    expiry_date: expiry,
    total_uses: finalTotalUses,
    remaining_uses: finalTotalUses,
    status: 'active',
  };
  if (tenantId) insertData.tenant_id = tenantId;

  const { data: memberPkg, error: insertErr } = await supabase
    .from('member_service_packages')
    .insert(insertData)
    .select()
    .single();
  if (insertErr) throw new Error(insertErr.message);

  // 3. 插入快照品項
  const snapshotItems = pkg.items.map((item: any) => ({
    member_package_id: memberPkg.id,
    service_id: item.service_id,
    original_quantity: item.quantity,
    remaining_quantity: 0,
  }));
  const { error: snapshotErr } = await supabase.from('member_service_package_items').insert(snapshotItems);
  if (snapshotErr) {
    console.error('快照插入错误:', snapshotErr);
    await supabase.from('member_service_packages').delete().eq('id', memberPkg.id);
    throw new Error('建立快照失败');
  }

  return memberPkg;
};

// ==================== 查詢客戶的所有組合包（管理員用） ====================
export const getCustomerPackages = async (customer_id: number, tenantId?: number) => {
  let query = supabase
    .from('member_service_packages')
    .select('*')
    .eq('customer_id', customer_id)
    .gt('remaining_uses', 0)
    .order('created_at', { ascending: false });
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data: packages, error: pkgErr } = await query;
  if (pkgErr) throw new Error(pkgErr.message);
  if (!packages) return [];

  const result = await Promise.all(packages.map(async (pkg: any) => {
    const { data: items, error: itemsErr } = await supabase
      .from('member_service_package_items')
      .select('service_id, original_quantity')
      .eq('member_package_id', pkg.id);
    if (itemsErr || !items?.length) return { ...pkg, snapshot_items: [] };

    const serviceIds = items.map((item: any) => item.service_id);
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds);
    const serviceMap: Record<number, string> = {};
    (services || []).forEach((s: any) => { serviceMap[s.id] = s.name; });

    const snapshot_items = items.map((item: any) => ({
      service_id: item.service_id,
      original_quantity: item.original_quantity,
      service: { id: item.service_id, name: serviceMap[item.service_id] || '未知服務' }
    }));
    return { ...pkg, snapshot_items };
  }));
  return result;
};

// ==================== 查詢單一組合包詳細 ====================
export const getMemberPackageDetail = async (member_package_id: string, tenantId?: number) => {
  let query = supabase
    .from('member_service_packages')
    .select('*')
    .eq('id', member_package_id);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data: pkg, error: pkgErr } = await query.single();
  if (pkgErr) throw new Error(pkgErr.message);
  if (!pkg) throw new Error('組合包不存在');

  const { data: items, error: itemsErr } = await supabase
    .from('member_service_package_items')
    .select('service_id, original_quantity')
    .eq('member_package_id', member_package_id);
  if (itemsErr) {
    console.warn('查快照失敗:', itemsErr);
    return { ...pkg, snapshot_items: [] };
  }
  if (!items?.length) return { ...pkg, snapshot_items: [] };

  const serviceIds = items.map((item: any) => item.service_id);
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .in('id', serviceIds);
  const serviceMap: Record<number, string> = {};
  (services || []).forEach((s: any) => { serviceMap[s.id] = s.name; });
  const snapshot_items = items.map((item: any) => ({
    service_id: item.service_id,
    original_quantity: item.original_quantity,
    service: { id: item.service_id, name: serviceMap[item.service_id] || '未知服務' }
  }));
  return { ...pkg, snapshot_items };
};

// ==================== 使用服務（扣總次數） ====================
interface UseServiceParams {
  member_package_id: string;
  selected_service_ids: number[];
  notes?: string;
  signature_url?: string;
  staff_id?: number;
  created_by?: number;
  gifts?: Array<{ description: string; notes?: string }>;
}

export const useService = async (params: UseServiceParams, tenantId?: number) => {
  // 1. 查詢組合包剩餘次數（限當前租戶）
  let pkgQuery = supabase
    .from('member_service_packages')
    .select('remaining_uses, customer_id, snapshot_name')
    .eq('id', params.member_package_id);
  if (tenantId) pkgQuery = pkgQuery.eq('tenant_id', tenantId);
  const { data: memberPkg, error: pkgErr } = await pkgQuery.single();
  if (pkgErr || !memberPkg) throw new Error('組合包不存在');
  if (memberPkg.remaining_uses < 1) throw new Error('剩餘次數不足');

  // 2. 扣減總次數 1 次（同樣加上 tenant 條件）
  const newRemaining = memberPkg.remaining_uses - 1;
  let updateQuery = supabase
    .from('member_service_packages')
    .update({ remaining_uses: newRemaining })
    .eq('id', params.member_package_id);
  if (tenantId) updateQuery = updateQuery.eq('tenant_id', tenantId);
  const { error: updatePkgErr } = await updateQuery;
  if (updatePkgErr) throw new Error(updatePkgErr.message);

  // 3. 插入使用紀錄
  const usageData: any = {
    customer_id: memberPkg.customer_id,
    member_package_id: params.member_package_id,
    service_id: null,
    quantity: 1,
    notes: params.notes,
    signature_url: params.signature_url,
    staff_id: params.staff_id,
    created_by: params.created_by,
    usage_date: new Date(),
    snapshot_package_name: memberPkg.snapshot_name,
    selected_service_ids: params.selected_service_ids,
  };
  if (tenantId) usageData.tenant_id = tenantId;
  const { data: usageLog, error: logErr } = await supabase
    .from('service_usage_logs')
    .insert(usageData)
    .select()
    .single();
  if (logErr) throw new Error(logErr.message);

  // 4. 插入使用品項關聯記錄
  if (params.selected_service_ids.length) {
    const itemsToInsert = params.selected_service_ids.map(sid => ({
      usage_log_id: usageLog.id,
      service_id: sid,
    }));
    const { error: itemsErr } = await supabase.from('service_usage_items').insert(itemsToInsert);
    if (itemsErr) console.warn('使用品項記錄失敗:', itemsErr.message);
  }

  // 5. 贈品處理
  if (params.gifts?.length) {
    const giftsToInsert = params.gifts.map(g => ({
      member_package_id: params.member_package_id,
      gift_description: g.description,
      notes: g.notes || `關聯使用紀錄 ${usageLog.id}`,
      service_usage_log_id: usageLog.id,
      is_redeemed: true,
      created_at: new Date(),
    }));
    const { error: giftsErr } = await supabase.from('package_gifts').insert(giftsToInsert);
    if (giftsErr) console.warn('贈品插入失敗:', giftsErr.message);
  }

  if (!params.signature_url) throw new Error('簽名為必填項目');

  // 6. 更新組合包狀態
  if (newRemaining === 0) {
    let statusQuery = supabase
      .from('member_service_packages')
      .update({ status: 'used_up' })
      .eq('id', params.member_package_id);
    if (tenantId) statusQuery = statusQuery.eq('tenant_id', tenantId);
    await statusQuery;
  }

  return usageLog;
};

// ==================== 查詢使用紀錄 ====================
export const getUsageLogs = async (filter: { customer_id?: number; member_package_id?: string }, tenantId?: number) => {
  let query = supabase
    .from('service_usage_logs')
    .select(`*, items:service_usage_items(service_id, service:services(id, name))`);
  if (filter.customer_id) query = query.eq('customer_id', filter.customer_id);
  if (filter.member_package_id) query = query.eq('member_package_id', filter.member_package_id);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== 客戶已用完的組合包 ====================
export const getCustomerUsedPackages = async (customer_id: number, tenantId?: number) => {
  let query = supabase
    .from('member_service_packages')
    .select('*')
    .eq('customer_id', customer_id)
    .eq('status', 'used_up')
    .order('created_at', { ascending: false });
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data: packages, error } = await query;
  if (error) throw new Error(error.message);
  if (!packages?.length) return [];

  const result = await Promise.all(packages.map(async (pkg: any) => {
    const { data: items } = await supabase
      .from('member_service_package_items')
      .select('service_id, original_quantity')
      .eq('member_package_id', pkg.id);
    if (!items?.length) return { ...pkg, snapshot_items: [] };

    const serviceIds = items.map((item: any) => item.service_id);
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds);
    const serviceMap: Record<number, string> = {};
    (services || []).forEach((s: any) => { serviceMap[s.id] = s.name; });

    const snapshot_items = items.map((item: any) => ({
      service_id: item.service_id,
      original_quantity: item.original_quantity,
      service_name: serviceMap[item.service_id] || '未知服務',
    }));
    return { ...pkg, snapshot_items };
  }));
  return result;
};

// ==================== 人工補償：調整總剩餘次數 ====================
export const adjustRemaining = async (params: {
  member_package_id: string;
  delta: number;
  reason?: string;
  notes?: string;
  created_by?: number;
}, tenantId?: number) => {
  let pkgQuery = supabase
    .from('member_service_packages')
    .select('remaining_uses, customer_id, status, snapshot_name, tenant_id')
    .eq('id', params.member_package_id);
  if (tenantId) pkgQuery = pkgQuery.eq('tenant_id', tenantId);
  const { data: memberPkg, error: findErr } = await pkgQuery.single();
  if (findErr || !memberPkg) throw new Error('組合包不存在');

  const newRemaining = memberPkg.remaining_uses + params.delta;
  if (newRemaining < 0) throw new Error('剩餘次數不能為負數');

  let updateQuery = supabase
    .from('member_service_packages')
    .update({ remaining_uses: newRemaining })
    .eq('id', params.member_package_id);
  if (tenantId) updateQuery = updateQuery.eq('tenant_id', tenantId);
  const { error: updateErr } = await updateQuery;
  if (updateErr) throw new Error(updateErr.message);

  // 插入 adjustments 記錄
  const adjData: any = {
    member_package_id: params.member_package_id,
    adjustment_type: params.delta > 0 ? 'INCREASE' : 'DECREASE',
    amount: Math.abs(params.delta),
    reason: params.reason,
    notes: params.notes,
    created_by: params.created_by,
    package_snapshot_name: memberPkg.snapshot_name,
    customer_id: memberPkg.customer_id,
    member_service_id: null,
    created_at: new Date().toISOString(),
  };
  if (tenantId) adjData.tenant_id = tenantId;
  const { error: adjErr } = await supabase.from('adjustments').insert(adjData);
  if (adjErr) console.error('調整日誌寫入失敗:', adjErr);

  // 更新狀態
  if (newRemaining === 0) {
    let statusQuery = supabase
      .from('member_service_packages')
      .update({ status: 'used_up' })
      .eq('id', params.member_package_id);
    if (tenantId) statusQuery = statusQuery.eq('tenant_id', tenantId);
    await statusQuery;
  } else if (newRemaining > 0 && memberPkg.status === 'used_up') {
    let statusQuery = supabase
      .from('member_service_packages')
      .update({ status: 'active' })
      .eq('id', params.member_package_id);
    if (tenantId) statusQuery = statusQuery.eq('tenant_id', tenantId);
    await statusQuery;
  }

  return {
    member_package_id: params.member_package_id,
    old_remaining: memberPkg.remaining_uses,
    new_remaining: newRemaining,
    delta: params.delta,
  };
};

// ==================== 贈品管理（不變） ====================
export const getAllGifts = async (filter?: { member_package_id?: string; is_redeemed?: boolean }) => {
  let query = supabase.from('package_gifts').select('*, member_service_packages(customer_id, snapshot_name)');
  if (filter?.member_package_id) query = query.eq('member_package_id', filter.member_package_id);
  if (filter?.is_redeemed !== undefined) query = query.eq('is_redeemed', filter.is_redeemed);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const getGifts = async (member_package_id?: string) => {
  let query = supabase.from('package_gifts').select('*');
  if (member_package_id) query = query.eq('member_package_id', member_package_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createGift = async (data: { member_package_id: string; gift_description: string; notes?: string }) => {
  const { data: gift, error } = await supabase
    .from('package_gifts')
    .insert({ ...data, is_redeemed: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return gift;
};

export const updateGift = async (id: string, data: Partial<{ gift_description: string; is_redeemed: boolean; notes: string }>) => {
  const { data: gift, error } = await supabase
    .from('package_gifts')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return gift;
};

export const deleteGift = async (id: string) => {
  const { error } = await supabase.from('package_gifts').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const redeemGift = async (gift_id: string) => {
  const { data, error } = await supabase
    .from('package_gifts')
    .update({ is_redeemed: true, redeemed_at: new Date() })
    .eq('id', gift_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};