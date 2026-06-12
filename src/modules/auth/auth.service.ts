import { env } from '../../config/env';
import { ACTIVITY_ACTIONS } from '../../config/constants';
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from '../../utils/errors';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
} from '../../utils/jwt';
import { UserRepository } from '../users/users.repository';
import { UserService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import type { ActivityService } from '../activities/activities.service';
import type {
  AuthResponse,
  RegisterInput,
  LoginInput,
  AuthTokens,
} from './auth.types';

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
    private readonly authRepo: AuthRepository,
    private readonly activityService?: ActivityService,
  ) {}

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = signAccessToken(userId, email);
    const refreshToken = signRefreshToken(userId, email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepo.saveRefreshToken(userId, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (await this.userRepo.emailExists(input.email)) {
      throw new ConflictError('Email already registered');
    }
    const hashed = await hashPassword(input.password);
    const user = await this.userRepo.create({
      email: input.email.toLowerCase(),
      password: hashed,
      firstName: input.firstName,
      lastName: input.lastName,
      globalRole: 'Member',
    });
    const tokens = await this.issueTokens(user._id.toString(), user.email);
    await this.activityService?.log({
      actorId: user._id.toString(),
      action: ACTIVITY_ACTIONS.USER_REGISTER,
      entityType: 'User',
      entityId: user._id.toString(),
    });
    return { user: this.userService.toDTO(user), tokens };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email, true);
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');
    const valid = await comparePassword(input.password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid credentials');
    const tokens = await this.issueTokens(user._id.toString(), user.email);
    await this.activityService?.log({
      actorId: user._id.toString(),
      action: ACTIVITY_ACTIONS.USER_LOGIN,
      entityType: 'User',
      entityId: user._id.toString(),
    });
    return { user: this.userService.toDTO(user), tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepo.deleteRefreshToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const stored = await this.authRepo.findRefreshToken(refreshToken);
    if (!stored) throw new UnauthorizedError('Invalid refresh token');
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      await this.authRepo.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Invalid refresh token');
    }
    if (decoded.type !== 'refresh' || decoded.sub !== stored.userId.toString()) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    await this.authRepo.deleteRefreshToken(refreshToken);
    return this.issueTokens(decoded.sub, decoded.email);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const baseUser = await this.userRepo.findById(userId);
    if (!baseUser) throw new NotFoundError('User not found');
    const user = await this.userRepo.findByEmail(baseUser.email, true);
    if (!user) throw new NotFoundError('User not found');
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');
    const hashed = await hashPassword(newPassword);
    await this.userRepo.updateById(userId, { password: hashed });
    await this.authRepo.deleteAllRefreshTokens(userId);
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return { message: 'If the email exists, a reset link has been sent' };
    const token = signResetToken(user._id.toString());
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.authRepo.savePasswordReset(user._id.toString(), token, expiresAt);
    if (env.NODE_ENV !== 'production') {
      return { message: 'Reset token generated (dev only)', resetToken: token };
    }
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch {
      throw new ValidationError('Invalid or expired reset token');
    }
    const record = await this.authRepo.findPasswordReset(token);
    if (!record) throw new ValidationError('Invalid or expired reset token');
    const hashed = await hashPassword(newPassword);
    await this.userRepo.updateById(decoded.sub, { password: hashed });
    await this.authRepo.markPasswordResetUsed(record._id.toString());
    await this.authRepo.deleteAllRefreshTokens(decoded.sub);
  }

  async getCurrentUser(userId: string) {
    return this.userService.getById(userId);
  }
}
