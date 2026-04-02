import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!; // 使用 service_role key 以繞過 RLS
export const supabase = createClient(supabaseUrl, supabaseKey);

// 商品/服務專用的 bucket（可從環境變數讀取）
const PRODUCTS_BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || 'products-services';

/**
 * 上傳簽名圖片到 Supabase Storage
 * @param file Express.Multer.File 物件
 * @param customerId 客戶 ID
 * @returns 公開 URL
 */

/**
 * 通用圖片上傳函數
 * @param file Express.Multer.File
 * @param folder 資料夾名稱，例如 'products' 或 'services'
 * @param bucket 儲存桶名稱（可選，預設使用商品/服務專用 bucket）
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
  bucket: string = PRODUCTS_BUCKET
): Promise<string> => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${randomBytes(8).toString('hex')}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`圖片上傳失敗: ${error.message}`);

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrlData.publicUrl;
};

/**
 * 刪除圖片
 * @param imageUrl 圖片的公開 URL
 * @param bucket 儲存桶名稱（可選，會從 URL 中解析，但簡單起見仍可指定）
 */
export const deleteImage = async (imageUrl: string, bucket: string = PRODUCTS_BUCKET) => {
  if (!imageUrl) {
    console.log('⚠️ deleteImage: imageUrl 為空，跳過刪除');
    return;
  }
  console.log('🗑️ 準備刪除圖片，完整 URL:', imageUrl);
  console.log('使用的 bucket:', bucket);
  
  // 嘗試多種方式解析路徑
  let path = null;
  const pattern1 = `/public/${bucket}/`;
  const pattern2 = `/object/public/${bucket}/`;
  
  if (imageUrl.includes(pattern1)) {
    path = imageUrl.split(pattern1)[1];
    console.log('✅ 使用 pattern1 解析，路徑:', path);
  } else if (imageUrl.includes(pattern2)) {
    path = imageUrl.split(pattern2)[1];
    console.log('✅ 使用 pattern2 解析，路徑:', path);
  } else {
    console.log('❌ 無法匹配已知模式，請檢查 URL 格式');
    return;
  }
  
  if (path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('❌ 刪除失敗:', error.message);
    } else {
      console.log('✅ 刪除成功');
    }
  }
};

//簽名上傳
export const uploadSignature = async (file: Express.Multer.File, customerId: number): Promise<string> => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `signature_${customerId}_${Date.now()}.${fileExt}`;
  const filePath = `signatures/${fileName}`;
  const bucket = process.env.SUPABASE_BUCKET || 'service-signatures';

  const { error } = await supabase.storage
    .from('service-signatures') // 請先建立此 bucket
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`圖片上傳失敗: ${error.message}`);

  const { data: publicUrlData } = supabase.storage
    .from('service-signatures')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};