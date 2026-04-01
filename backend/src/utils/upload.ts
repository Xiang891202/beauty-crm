import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 使用 service_role key 以繞過 RLS
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 上傳簽名圖片到 Supabase Storage
 * @param file Express.Multer.File 物件
 * @param customerId 客戶 ID
 * @returns 公開 URL
 */
export const uploadSignature = async (file: Express.Multer.File, customerId: number): Promise<string> => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `signature_${customerId}_${Date.now()}.${fileExt}`;
  const filePath = `signatures/${fileName}`;

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