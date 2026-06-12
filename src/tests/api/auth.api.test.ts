import request from 'supertest';
import { createApp } from '../../app';
import { defaultUser, authHeader } from '../helpers';

const app = createApp();

describe('Auth API', () => {
  it('POST /api/auth/register - creates user', async () => {
    const res = await request(app).post('/api/auth/register').send(defaultUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(defaultUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('POST /api/auth/register - validates input', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - authenticates user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login2@example.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'B',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });

  it('GET /api/auth/me - returns current user', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      email: 'me@example.com',
      password: 'Password123!',
      firstName: 'Me',
      lastName: 'User',
    });
    const token = reg.body.data.tokens.accessToken;
    const res = await request(app).get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@example.com');
  });

  it('POST /api/auth/refresh - refreshes token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      email: 'refresh@example.com',
      password: 'Password123!',
      firstName: 'R',
      lastName: 'U',
    });
    const refreshToken = reg.body.data.tokens.refreshToken;
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/logout - logs out', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      email: 'logout@example.com',
      password: 'Password123!',
      firstName: 'L',
      lastName: 'U',
    });
    const refreshToken = reg.body.data.tokens.refreshToken;
    const res = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(res.status).toBe(200);
  });

  it('POST /api/auth/forgot-password - returns message', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'forgot@example.com',
      password: 'Password123!',
      firstName: 'F',
      lastName: 'U',
    });
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'forgot@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.resetToken).toBeDefined();
  });

  it('rejects unauthorized /me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
