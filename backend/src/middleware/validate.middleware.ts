import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { errorResponse } from '../utils/response';

type ValidatedPart = 'body' | 'query' | 'params';

// /**
//  * 通用验证中间件
//  * @param schema Joi 验证模式
//  * @param part 要验证的请求部分，默认为 'body'
//  * @returns Express 中间件函数
//  */
export const validate = (schema: Joi.ObjectSchema, part: ValidatedPart = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[part];
    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json(errorResponse(errorMessage, 400));
    }

    // 将验证后的值（可能经过转换）覆盖回请求对象
    // req[part] = value;
    next();
  };
};