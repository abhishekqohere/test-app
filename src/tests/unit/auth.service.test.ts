import { AuthService } from '../../modules/auth/auth.service';
import { UserRepository } from '../../modules/users/users.repository';
import { UserService } from '../../modules/users/users.service';
import { AuthRepository } from '../../modules/auth/auth.repository';
import { ActivityService } from '../../modules/activities/activities.service';
import { ActivityRepository } from '../../modules/activities/activities.repository';

describe('AuthService', () => {
  const userRepo = new UserRepository();
  const userService = new UserService(userRepo);
  const authRepo = new AuthRepository();
  const activityService = new ActivityService(new ActivityRepository());
  const authService = new AuthService(userRepo, userService, authRepo, activityService);

  it('registers a new user', async () => {
    const result = await authService.register({
      email: 'newuser@example.com',
      password: 'SecurePass1!',
      firstName: 'New',
      lastName: 'User',
    });
    expect(result.user.email).toBe('newuser@example.com');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await authService.register({
      email: 'dup@example.com',
      password: 'SecurePass1!',
      firstName: 'A',
      lastName: 'B',
    });
    await expect(
      authService.register({
        email: 'dup@example.com',
        password: 'SecurePass1!',
        firstName: 'C',
        lastName: 'D',
      }),
    ).rejects.toThrow('Email already registered');
  });

  it('logs in with valid credentials', async () => {
    await authService.register({
      email: 'login@example.com',
      password: 'SecurePass1!',
      firstName: 'Login',
      lastName: 'User',
    });
    const result = await authService.login({
      email: 'login@example.com',
      password: 'SecurePass1!',
    });
    expect(result.tokens.accessToken).toBeDefined();
  });

  it('rejects invalid login', async () => {
    await expect(
      authService.login({ email: 'nobody@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
