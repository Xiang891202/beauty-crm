// src/__tests__/unit/utils/upload.test.ts
import { uploadImage, deleteImage } from '@/utils/upload';

// 直接 mock 兩個函數，避免任何真實 supabase 邏輯
jest.mock('@/utils/upload', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}));

const mockUploadImage = uploadImage as jest.Mock;
const mockDeleteImage = deleteImage as jest.Mock;

describe('Upload Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploadImage 應被呼叫並回傳模擬的公開網址', async () => {
    // 設定 mock 回傳值
    mockUploadImage.mockResolvedValue('https://mock.supabase.co/test-uuid.jpg');

    const file = { originalname: 'test.jpg', buffer: Buffer.from(''), mimetype: 'image/jpeg' } as Express.Multer.File;
    const url = await uploadImage(file, 'products');

    expect(mockUploadImage).toHaveBeenCalledWith(file, 'products');
    expect(url).toBe('https://mock.supabase.co/test-uuid.jpg');
  });

  it('deleteImage 應被呼叫並傳入正確的檔案名稱', async () => {
    mockDeleteImage.mockResolvedValue(undefined);

    await deleteImage('old-file.jpg');

    expect(mockDeleteImage).toHaveBeenCalledWith('old-file.jpg');
  });
});