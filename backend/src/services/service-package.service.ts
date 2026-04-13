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
  let query = supabase
    .from('service_packages')
    .select(`
      *,
      items:service_package_items(
        id,
        quantity,
        service:services(id, name)
      )
    `);

  if (filter?.is_active !== undefined) {
    query = query.eq('is_active', filter.is_active);
  }

  // 軟刪除過濾：若 include_deleted 為 false 或未提供，則只顯示 deleted_at 為 null 的記錄
  if (!filter?.include_deleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getPackageById = async (id: string) => {
  const { data, error } = await supabase
    .from('service_packages')
    .select(`
      *,
      items:service_package_items(
        id,
        quantity,
        service:services(id, name)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
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