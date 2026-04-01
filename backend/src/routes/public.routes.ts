// backend/src/routes/public.routes.ts
import { Router } from 'express';
import { customerLogin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { customerLoginSchema } from '../validators/auth.validator';

const router = Router();

router.post(
  '/auth/customer/login',
  validate(customerLoginSchema),
  customerLogin
);

export default router;