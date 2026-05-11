import Joi from 'joi';

export const createServiceSchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().optional().max(500),
  price: Joi.number().optional().allow(null, ''), // 改為可選
  duration_minutes: Joi.number().integer().min(1).default(60),
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().max(500),
  price: Joi.number().optional().allow(null, ''), // 改為可選
  duration_minutes: Joi.number().integer().min(1),
}).min(1);