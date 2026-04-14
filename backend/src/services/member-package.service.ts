import { supabase } from '../lib/supabase';

// ==================== 購買組合包 ====================
export const purchasePackage = async (
  customer_id: number,
  package_id: string,
  purchase_date?: string,
  expiry_date?: string | null,
  total_uses?: number
) => {
  // 1. 取得組合包模板（含品項列表，僅供快照）
  const { data: pkg, error: pkgErr } = await supabase
    .from('service_packages')
    .select('*, items:service_package_items(service_id, quantity)')
    .eq('id', package_id)
    .single();
  if (pkgErr) throw new Error(pkgErr.message);
  if (!pkg) throw new Error('組合包不存在');

  // 總次數 = 所有品項次數總和（依原始設計，每個品項的數量是該品項在組合包中的次數，總次數即為所有數量相加）
  const templateTotal = pkg.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const purchaseDate = purchase_date ? new Date(purchase_date) : new Date();
  const expiry = expiry_date ? new Date(expiry_date) : null;
  const finalTotalUses = total_uses ?? templateTotal;

//   console.log('pkg.items:', pkg.items);
  // 2. 插入會員組合包記錄（不再插入品項剩餘表）
  const { data: memberPkg, error: insertErr } = await supabase
    .from('member_service_packages')  // 從品項表開始插入，方便關聯服務資料
    .insert({
      customer_id,
      package_id,
      snapshot_name: pkg.name,
      snapshot_description: pkg.description,
      purchase_date: purchaseDate,
      expiry_date: expiry,
      total_uses: finalTotalUses,
      remaining_uses: finalTotalUses,
      status: 'active',
    })
    .select()
    .single();
  if (insertErr) throw new Error(insertErr.message);

  const snapshotItems = pkg.items.map(item => ({
    member_package_id: memberPkg.id,
    service_id: item.service_id,
    original_quantity: item.quantity,
    remaining_quantity: 0, // 總次數模式下不使用，但保留結構
    }));
    // await supabase.from('member_service_package_items').insert(snapshotItems);

    console.log('准备插入快照，数据：', JSON.stringify(snapshotItems));
    const { error: snapshotErr } = await supabase.from('member_service_package_items').insert(snapshotItems);
    if (snapshotErr) {
    console.error('快照插入错误:', snapshotErr);
    // 回滚主记录
    await supabase.from('member_service_packages').delete().eq('id', memberPkg.id);
    throw new Error('建立快照失败');
    } else {
    console.log('快照插入成功');
    }

  return memberPkg;
};

// ==================== 查詢客戶的所有組合包（分步查詢版） ====================
export const getCustomerPackages = async (customer_id: number) => {
  // 1. 查主记录
  const { data: packages, error: pkgErr } = await supabase
    .from('member_service_packages')
    .select('*')
    .eq('customer_id', customer_id)
    .gt('remaining_uses', 0)
    .order('created_at', { ascending: false });
  if (pkgErr) throw new Error(pkgErr.message);
  if (!packages) return [];

  // 2. 对每个包查快照项
  const result = await Promise.all(packages.map(async (pkg) => {
    // 查快照项（只取 service_id 和 original_quantity）
    const { data: items, error: itemsErr } = await supabase
      .from('member_service_package_items')
      .select('service_id, original_quantity')
      .eq('member_package_id', pkg.id);
    if (itemsErr) {
      console.warn(`查快照失败 ${pkg.id}:`, itemsErr);
      return { ...pkg, snapshot_items: [] };
    }
    if (!items.length) return { ...pkg, snapshot_items: [] };

    // 批量获取服务名称
    const serviceIds = items.map(item => item.service_id);
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds);
    const serviceMap = Object.fromEntries((services || []).map(s => [s.id, s.name]));

    const snapshot_items = items.map(item => ({
      service_id: item.service_id,
      original_quantity: item.original_quantity,
      service: { id: item.service_id, name: serviceMap[item.service_id] || '未知服務' }
    }));
    return { ...pkg, snapshot_items };
  }));
  return result;
};

// ==================== 查詢單一組合包詳細（分步查詢版） ====================
export const getMemberPackageDetail = async (member_package_id: string) => {
  // 主記錄
  const { data: pkg, error: pkgErr } = await supabase
    .from('member_service_packages')
    .select('*')
    .eq('id', member_package_id)
    .single();
  if (pkgErr) throw new Error(pkgErr.message);
  if (!pkg) throw new Error('組合包不存在');

  // 快照項
  const { data: items, error: itemsErr } = await supabase
    .from('member_service_package_items')
    .select('service_id, original_quantity')
    .eq('member_package_id', member_package_id);
  if (itemsErr) {
    console.warn('查快照失敗:', itemsErr);
    return { ...pkg, snapshot_items: [] };
  }
  if (!items.length) return { ...pkg, snapshot_items: [] };

  // 批量取服務名稱
  const serviceIds = items.map(item => item.service_id);
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .in('id', serviceIds);
  const serviceMap = Object.fromEntries((services || []).map(s => [s.id, s.name]));
  const snapshot_items = items.map(item => ({
    service_id: item.service_id,
    original_quantity: item.original_quantity,
    service: { id: item.service_id, name: serviceMap[item.service_id] || '未知服務' }
  }));
  return { ...pkg, snapshot_items };
};

// ==================== 使用服務（扣總次數，記錄選中的品項） ====================
interface UseServiceParams {
  member_package_id: string;
  selected_service_ids: number[];   // 本次使用的服務項目ID陣列
  notes?: string;
  signature_url?: string;
  staff_id?: number;
  created_by?: number;
  gifts?: Array<{ description: string; notes?: string }>;
}

export const useService = async (params: UseServiceParams) => {
  // 1. 查詢組合包剩餘次數
  const { data: memberPkg, error: pkgErr } = await supabase
    .from('member_service_packages')
    .select('remaining_uses, customer_id, snapshot_name')
    .eq('id', params.member_package_id)
    .single();
  if (pkgErr || !memberPkg) throw new Error('組合包不存在');
  if (memberPkg.remaining_uses < 1) throw new Error('剩餘次數不足');

  // 2. 扣減總次數 1 次
  const newRemaining = memberPkg.remaining_uses - 1;
  const { error: updatePkgErr } = await supabase
    .from('member_service_packages')
    .update({ remaining_uses: newRemaining })
    .eq('id', params.member_package_id);
  if (updatePkgErr) throw new Error(updatePkgErr.message);

  // 3. 插入使用紀錄（儲存快照品項陣列）
  const { data: usageLog, error: logErr } = await supabase
    .from('service_usage_logs')
    .insert({
      customer_id: memberPkg.customer_id,
      member_package_id: params.member_package_id,
      service_id: null,                     // 不再關聯單一服務
      quantity: 1,
      notes: params.notes,
      signature_url: params.signature_url,
      staff_id: params.staff_id,
      created_by: params.created_by,
      usage_date: new Date(),
      snapshot_package_name: memberPkg.snapshot_name,
      selected_service_ids: params.selected_service_ids,
    })
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

  // 5. 贈品處理（若有）
  if (params.gifts && params.gifts.length > 0) {
    const giftsToInsert = params.gifts.map(g => ({
      member_package_id: params.member_package_id,
      gift_description: g.description,
      notes: g.notes || `關聯使用紀錄 ${usageLog.id}`,
      service_usage_log_id: usageLog.id,
      is_redeemed: false,
      created_at: new Date(),
    }));
    const { error: giftsErr } = await supabase.from('package_gifts').insert(giftsToInsert);
    if (giftsErr) console.warn('贈品插入失敗:', giftsErr.message);
  }

    if (!params.signature_url) {
    throw new Error('簽名為必填項目');
    }

  // 6. 更新組合包狀態
  if (newRemaining === 0) {
    await supabase
      .from('member_service_packages')
      .update({ status: 'used_up' })
      .eq('id', params.member_package_id);
  }

  return usageLog;
};

// ==================== 查詢使用紀錄（含品項明細） ====================
export const getUsageLogs = async (filter: { customer_id?: number; member_package_id?: string }) => {
  let query = supabase
    .from('service_usage_logs')
    .select(`
      *,
      items:service_usage_items(
        service_id,
        service:services(id, name)
      )
    `);
  if (filter.customer_id) query = query.eq('customer_id', filter.customer_id);
  if (filter.member_package_id) query = query.eq('member_package_id', filter.member_package_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== 人工補償：調整總剩餘次數 ====================
// export const adjustRemaining = async (params: {
//   member_package_id: string;
//   delta: number;          // 正數增加，負數減少
//   reason?: string;
//   notes?: string;
//   created_by?: number;
// }) => {
//   // 1. 查詢當前剩餘次數
//   const { data: memberPkg, error: findErr } = await supabase
//     .from('member_service_packages')
//     .select('remaining_uses, customer_id, status')
//     .eq('id', params.member_package_id)
//     .single();
//   if (findErr || !memberPkg) throw new Error('組合包不存在');

//   const newRemaining = memberPkg.remaining_uses + params.delta;
//   if (newRemaining < 0) throw new Error('剩餘次數不能為負數');

//   // 2. 更新剩餘次數
//   const { error: updateErr } = await supabase
//     .from('member_service_packages')
//     .update({ remaining_uses: newRemaining })
//     .eq('id', params.member_package_id);
//   if (updateErr) throw new Error(updateErr.message);

//   // 3. 記錄調整日誌（可選，插入 service_usage_logs）
//   const { error: logErr } = await supabase.from('service_usage_logs').insert({
//     customer_id: memberPkg.customer_id,
//     member_package_id: params.member_package_id,
//     service_id: null,
//     usage_date: new Date(),
//     quantity: params.delta,
//     notes: `人工調整：${params.reason || '無原因'}。${params.notes || ''}`,
//     staff_id: params.created_by,
//     created_by: params.created_by,
//     signature_url: null,
//     snapshot_package_name: null,
//     selected_service_ids: [],
//   });
//   if (logErr) console.warn('調整日誌寫入失敗:', logErr.message);

//   // 4. 更新狀態
//   if (newRemaining === 0) {
//     await supabase
//       .from('member_service_packages')
//       .update({ status: 'used_up' })
//       .eq('id', params.member_package_id);
//   } else if (newRemaining > 0 && memberPkg.status === 'used_up') {
//     await supabase
//       .from('member_service_packages')
//       .update({ status: 'active' })
//       .eq('id', params.member_package_id);
//   }

//   return {
//     member_package_id: params.member_package_id,
//     old_remaining: memberPkg.remaining_uses,
//     new_remaining: newRemaining,
//     delta: params.delta,
//   };
// };

// ==================== 人工補償：調整總剩餘次數（寫入 adjustments 表） ====================
export const adjustRemaining = async (params: {
  member_package_id: string;
  delta: number;          // 正數增加，負數減少
  reason?: string;
  notes?: string;
  created_by?: number;
}) => {
  // 1. 查詢當前剩餘次數及組合包快照名稱
  const { data: memberPkg, error: findErr } = await supabase
    .from('member_service_packages')
    .select('remaining_uses, customer_id, status, snapshot_name')
    .eq('id', params.member_package_id)
    .single();
  if (findErr || !memberPkg) throw new Error('組合包不存在');

  const newRemaining = memberPkg.remaining_uses + params.delta;
  if (newRemaining < 0) throw new Error('剩餘次數不能為負數');

  // 2. 更新剩餘次數
  const { error: updateErr } = await supabase
    .from('member_service_packages')
    .update({ remaining_uses: newRemaining })
    .eq('id', params.member_package_id);
  if (updateErr) throw new Error(updateErr.message);

  // 3. 記錄調整日誌到 adjustments 表（不再寫入 service_usage_logs）
  const { error: adjErr } = await supabase.from('adjustments').insert({
    member_package_id: params.member_package_id,
    adjustment_type: params.delta > 0 ? 'INCREASE' : 'DECREASE',
    amount: Math.abs(params.delta),
    reason: params.reason,
    notes: params.notes,
    created_by: params.created_by,
    package_snapshot_name: memberPkg.snapshot_name,
    customer_id: memberPkg.customer_id,
    member_service_id: null,   // 傳統服務包留空
  });
  if (adjErr) {
    console.error('調整日誌寫入失敗:', adjErr);
    // 不回滾剩餘次數，僅記錄錯誤
  }

  // 4. 更新組合包狀態
  if (newRemaining === 0) {
    await supabase
      .from('member_service_packages')
      .update({ status: 'used_up' })
      .eq('id', params.member_package_id);
  } else if (newRemaining > 0 && memberPkg.status === 'used_up') {
    await supabase
      .from('member_service_packages')
      .update({ status: 'active' })
      .eq('id', params.member_package_id);
  }

  return {
    member_package_id: params.member_package_id,
    old_remaining: memberPkg.remaining_uses,
    new_remaining: newRemaining,
    delta: params.delta,
  };
};

// ==================== 贈品管理（保持不變） ====================
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