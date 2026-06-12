import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.logout(req.body.refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await this.authService.refresh(req.body.refreshToken);
    sendSuccess(res, tokens, 'Token refreshed');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    sendSuccess(res, null, 'Password changed successfully');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.forgotPassword(req.body.email);
    sendSuccess(res, result, result.message);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.resetPassword(req.body.token, req.body.newPassword);
    sendSuccess(res, null, 'Password reset successful');
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getCurrentUser(req.user!.id);
    sendSuccess(res, user);
  });
}
