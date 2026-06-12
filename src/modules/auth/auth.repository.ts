import { RefreshToken, PasswordReset, type IRefreshToken, type IPasswordReset } from './auth.model';

export class AuthRepository {
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<IRefreshToken> {
    const [doc] = await RefreshToken.create([{ userId, token, expiresAt }]);
    return doc;
  }

  async findRefreshToken(token: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ token, expiresAt: { $gt: new Date() } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }

  async savePasswordReset(userId: string, token: string, expiresAt: Date): Promise<IPasswordReset> {
    await PasswordReset.updateMany({ userId, used: false }, { used: true });
    const [doc] = await PasswordReset.create([{ userId, token, expiresAt }]);
    return doc;
  }

  async findPasswordReset(token: string): Promise<IPasswordReset | null> {
    return PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  }

  async markPasswordResetUsed(id: string): Promise<void> {
    await PasswordReset.findByIdAndUpdate(id, { used: true });
  }
}
