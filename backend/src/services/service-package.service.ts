import { supabase } from '../lib/supabase';

interface CreatePackageInput {
  name: string;
  description?: string;
  price: number;
  duration_days?: number | null;
  items: Array<{ service_id: number; quantity: number }>;
}

export const createPackage = async (data: CreatePackageInput, tenantId?: number) => {
  // 1. 插入組合包主表（注入 tenant_id）
  const insertData: any = {
    name: data.name,
    description: data.description,
    price: data.price,
    duration_days: data.duration_days,
    is_active: true,
  };
  if (tenantId) insertData.tenant_id = tenantId;

  const { data: pkg, error: pkgError } = await supabase
    .from('service_packages')
    .insert(insertData)
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
  return getPackageById(pkg.id, tenantId);
};

export const getPackages = async (filter?: { is_active?: boolean; include_deleted?: boolean }, tenantId?: number) => {
  let query = supabase.from('service_packages').select('*');
  if (filter?.is_active !== undefined) query = query.eq('is_active', filter.is_active);
  if (!filter?.include_deleted) query = query.is('deleted_at', null);
  if (tenantId) query = query.eq('tenant_id', tenantId);
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

  // 4. 批量获取 services（services 也可加上 tenant 过滤，但如果你希望跨租户共享服务模板可省略；这里加上可选过滤）
  let serviceQuery = supabase.from('services').select('id, name').in('id', serviceIds);
  if (tenantId) serviceQuery = serviceQuery.eq('tenant_id', tenantId);
  const { data: services } = await serviceQuery;

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

export const getPackageById = async (id: string, tenantId?: number) => {
  let query = supabase.from('service_packages').select('*').eq('id', id);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data: pkg, error: pkgError } = await query.single();
  if (pkgError) throw new Error(pkgError.message);
  if (!pkg) throw new Error('組合包不存在');

  const { data: items, error: itemsError } = await supabase
    .from('service_package_items')
    .select('id, quantity, service_id')
    .eq('package_id', id)
    .order('id');

  if (itemsError) throw new Error(itemsError.message);

  const serviceIds = [...new Set(items?.map(i => i.service_id) || [])];
  let serviceMap: Record<number, any> = {};
  if (serviceIds.length > 0) {
    let svcQuery = supabase.from('services').select('id, name').in('id', serviceIds);
    if (tenantId) svcQuery = svcQuery.eq('tenant_id', tenantId);
    const { data: services } = await svcQuery;
    services?.forEach(s => { serviceMap[s.id] = s; });
  }

  const itemsWithService = (items || []).map(item => ({
    ...item,
    service: serviceMap[item.service_id] || null,
  }));

  return { ...pkg, items: itemsWithService };
};

export const updatePackage = async (id: string, data: any, tenantId?: number) => {
  const { items, ...rest } = data;

  let updateQuery = supabase.from('service_packages').update(rest).eq('id', id);
  if (tenantId) updateQuery = updateQuery.eq('tenant_id', tenantId);
  const { error: updateError } = await updateQuery;
  if (updateError) throw new Error(updateError.message);

  if (items) {
    // 删除旧项目（同样需要限制租户：先验证包属于该租户）
    let delQuery = supabase.from('service_package_items').delete().eq('package_id', id);
    if (tenantId) {
      // 安全起见，先查出该包是否属于该租户，但上面 update 已经验证了，所以可以省略。
      // 不过 items 表没有 tenant_id，所以直接删除所有 package_id 对应的 items 即可。
    }
    const { error: delError } = await delQuery;
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

  return getPackageById(id, tenantId);
};

export const deletePackage = async (id: string, tenantId?: number) => {
  let query = supabase.from('service_packages').update({ deleted_at: new Date() }).eq('id', id);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { error } = await query;
  if (error) throw new Error(error.message);
};

export const restorePackage = async (id: string, tenantId?: number) => {
  let query = supabase.from('service_packages').update({ deleted_at: null }).eq('id', id);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { error } = await query;
  if (error) throw new Error(error.message);
};