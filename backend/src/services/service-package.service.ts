import { supabase } from '../lib/supabase';

interface CreatePackageInput {
  name: string;
  description?: string;
  price: number;
  duration_days?: number | null;
  items: Array<{ service_id: number; quantity: number }>;
}

export const createPackage = async (data: CreatePackageInput) => {
  // 1. 插入組合包主表
  const { data: pkg, error: pkgError } = await supabase
    .from('service_packages')
    .insert({
      name: data.name,
      description: data.description,
      price: data.price,
      duration_days: data.duration_days,
      is_active: true,
    })
    .select()
    .single();

  if (pkgError) throw new Error(pkgError.message);

  // 2. 插入項目
  if (data.items && data.items.length) {
    const itemsToInsert = data.items.map(item => ({
      package_id: pkg.id,
      service_id: item.service_id,
      quantity: item.quantity,
    }));
    const { error: itemsError } = await supabase.from('service_package_items').insert(itemsToInsert);
    if (itemsError) throw new Error(itemsError.message);
  }

  // 3. 回傳完整資料
  return getPackageById(pkg.id);
};

export const getPackages = async (filter?: { is_active?: boolean; include_deleted?: boolean }) => {
  let query = supabase.from('service_packages').select('*');
  if (filter?.is_active !== undefined) query = query.eq('is_active', filter.is_active);
  if (!filter?.include_deleted) query = query.is('deleted_at', null);
  const { data: packages, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!packages) return [];

  // 1. 获取所有 package 的 id
  const packageIds = packages.map(p => p.id);
  if (packageIds.length === 0) return [];

  // 2. 获取所有相关的 items
  const { data: allItems } = await supabase
    .from('service_package_items')
    .select('id, quantity, service_id, package_id')
    .in('package_id', packageIds);

  // 3. 收集所有 service_id
  const serviceIds = [...new Set((allItems || []).map(i => i.service_id))];

  // 4. 批量获取 services
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .in('id', serviceIds);

  const serviceMap: Record<number, any> = {};
  services?.forEach(s => { serviceMap[s.id] = s; });

  // 5. 组装
  const itemsByPackage: Record<string, any[]> = {};
  (allItems || []).forEach(item => {
    if (!itemsByPackage[item.package_id]) itemsByPackage[item.package_id] = [];
    itemsByPackage[item.package_id].push({
      ...item,
      service: serviceMap[item.service_id] || null,
    });
  });

  return packages.map(pkg => ({
    ...pkg,
    items: itemsByPackage[pkg.id] || []
  }));
};

export const getPackageById = async (id: string) => {
  const { data: pkg, error: pkgError } = await supabase
    .from('service_packages')
    .select('*')
    .eq('id', id)
    .single();
  if (pkgError) throw new Error(pkgError.message);
  if (!pkg) throw new Error('組合包不存在');

  const { data: items, error: itemsError } = await supabase
    .from('service_package_items')
    .select('id, quantity, service_id')
    .eq('package_id', id)
    .order('id'); // 確保排序一致

  if (itemsError) throw new Error(itemsError.message);

  // 手動附加服務資訊
  const serviceIds = [...new Set(items?.map(i => i.service_id) || [])];
  let serviceMap: Record<number, any> = {};
  if (serviceIds.length > 0) {
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds);
    services?.forEach(s => { serviceMap[s.id] = s; });
  }

  const itemsWithService = (items || []).map(item => ({
    ...item,
    service: serviceMap[item.service_id] || null,
  }));

  return { ...pkg, items: itemsWithService };
};

export const updatePackage = async (id: string, data: any) => {
  const { items, ...rest } = data;

  // 更新主表
  const { error: updateError } = await supabase
    .from('service_packages')
    .update(rest)
    .eq('id', id);
  if (updateError) throw new Error(updateError.message);

  // 若有 items，先刪除舊項目再新增
  if (items) {
    const { error: delError } = await supabase
      .from('service_package_items')
      .delete()
      .eq('package_id', id);
    if (delError) throw new Error(delError.message);

    if (items.length) {
      const newItems = items.map((item: any) => ({
        package_id: id,
        service_id: item.service_id,
        quantity: item.quantity,
      }));
      const { error: insertError } = await supabase.from('service_package_items').insert(newItems);
      if (insertError) throw new Error(insertError.message);
    }
  }

  return getPackageById(id);
};

// 軟刪除：設置 deleted_at 為當前時間
export const deletePackage = async (id: string) => {
  const { error } = await supabase
    .from('service_packages')
    .update({ deleted_at: new Date() })
    .eq('id', id);
  if (error) throw new Error(error.message);
};

// 恢復軟刪除（可選）
export const restorePackage = async (id: string) => {
  const { error } = await supabase
    .from('service_packages')
    .update({ deleted_at: null })
    .eq('id', id);
  if (error) throw new Error(error.message);
};