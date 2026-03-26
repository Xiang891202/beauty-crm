// src/validators/service_log.validator.ts
import Joi from 'joi';

// 用于创建使用记录
export const createUsageSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required(),
  service_id: Joi.number().integer().positive().required(),
  used_at: Joi.date().iso().default(Date.now),
  notes: Joi.string().max(500).optional(),
  signature_url: Joi.string().max(255).optional(),
});

// 用于更新备注
export const updateUsageNotesSchema = Joi.object({
  notes: Joi.string().max(500).required(),
});

// 用于列表查询
export const listUsagesQuerySchema = Joi.object({
  customer_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});