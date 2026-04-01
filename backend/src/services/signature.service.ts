import { supabase } from '../config/storage';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export class SignatureService {
  static async upload(file: Express.Multer.File): Promise<string> {
    // 1. 检查环境变量
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase 尚未設定，無法上傳簽名');
    }

    // 2. 生成唯一文件名
    const fileExt = file.originalname.split('.').pop() || 'png';
    const fileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase 上傳錯誤:', error);
      throw new Error(`上傳簽名失敗: ${error.message}`);
    }

    // 4. 获取公开 URL
    const { data: publicUrlData } = supabase.storage
      .from(env.SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}