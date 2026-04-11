import Joi from 'joi';

//管理員登入驗證規則
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});


//客戶登入驗證規則
export const customerLoginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^09\d{8}$/) // 確保是09開頭以及10位數字
    .required()
    .messages({
      'string.pattern.base': '請輸入有效的台灣手機號碼(09XXXXXXXX)',
      'any.required': '請輸入手機號碼',
    }),
  password: Joi.string().min(8).required().messages({
    'string.min': '密碼至少需要8個字元',
    'any.required': '請輸入密碼',
  }),
});