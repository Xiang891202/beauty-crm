// services/signature.service.ts
import { supabase } from '../config/storage';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

//SSL 憑證過期導致無法連接 先暫時跳過
// export class SignatureService {
//   static async upload(file: Express.Multer.File): Promise<string> {
//     //1.測試與 supabase 主機連線
//     try {
//         const testResponse = await fetch('https://db.bsgmgwwogsrtageajzks.supabase.co');
//         console.log('Supabase 連線測試成功，狀態碼:', testResponse.status);
//     } catch (testError: any) {
//         console.error('Supabase 連線測試失敗:', testError);
//         throw new Error(`無法連線至 Supabase: ${testError.message}`);
//     }

//     //2.檢查環境變數
//     if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY){
//         throw new Error('Supabase 尚未設定，無法上傳簽名');
//     }

//     //3.準備上傳
//     const fileExt = file.originalname.split('.').pop();
//     const fileName = `${randomUUID()}.${fileExt}`;
//     const filePath = `signatures/${fileName}`;

//     console.log('📤 準備上傳檔案:', {
//       bucket: env.SUPABASE_BUCKET,
//       path: filePath,
//       size: file.size,
//       type: file.mimetype
//     });

//     //4. 上傳到 supabase Storage
//     const { data, error } = await supabase.storage
//       .from(env.SUPABASE_BUCKET)
//       .upload(filePath, file.buffer, {
//         contentType: file.mimetype,
//         upsert: false
//       });

//     if (error) { 
//         console.error('❌ Supabase 上傳錯誤:', error);
//         throw new Error(`上傳簽名失敗: ${error.message}`);
//     }

//     console.log('✅ 上傳成功，data:', data);

//     // 5.取得公開 URL
//     const { data: publicUrlData } = supabase.storage
//       .from(env.SUPABASE_BUCKET!)
//       .getPublicUrl(filePath);

//     console.log('🔗 公開 URL:', publicUrlData.publicUrl);
//     return publicUrlData.publicUrl;
//   }
// }

//採取 固定URL
export class SignatureService {
  static async upload(file: Express.Multer.File): Promise<string> {
    console.warn('⚠️ 簽名上傳暫時跳過（SSL 憑證問題），回傳模擬 URL');
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'https://example.com/signature-placeholder.png';
  }
}