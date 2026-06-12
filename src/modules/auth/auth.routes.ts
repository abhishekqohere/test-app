import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  logoutSchema,
} from './auth.validation';
import type { AuthController } from './auth.controller';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();
  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login', validate(loginSchema), controller.login);
  router.post('/logout', validate(logoutSchema), controller.logout);
  router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
  router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
  router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
  router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
  router.get('/me', authenticate, controller.me);
  return router;
};
