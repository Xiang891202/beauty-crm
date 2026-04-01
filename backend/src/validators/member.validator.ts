// member.validator.ts
import Joi from 'joi';

export const createMemberSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^09\d{8}$/).required(),
  birthday: Joi.date().iso().optional(),
  notes: Joi.string().optional(),
  password: Joi.string().min(6).required().messages({
    'string.min': '密碼長度至少 6 位',
    'any.required': '請設定客戶密碼',
  }),
});

export const updateMemberSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().pattern(/^09\d{8}$/).optional(),
  birthday: Joi.date().iso().optional(),
  notes: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
});