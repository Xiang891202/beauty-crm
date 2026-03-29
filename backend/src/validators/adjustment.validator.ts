import Joi from 'joi';


export const createAdjustmentSchema = Joi.object({
  customer_id: Joi.number().integer().positive().optional(),
  member_service_id: Joi.number().integer().positive().optional(),
  adjustment_type: Joi.string().valid('INCREASE', 'DECREASE').required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().max(200).optional(),
}).xor('customer_id', 'member_service_id');

export const listAdjustmentsQuerySchema = Joi.object({
  usageId: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  member_service_id: Joi.number().integer().positive().optional(),
  adjustment_type: Joi.string().valid('INCREASE', 'DECREASE').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});