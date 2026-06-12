import request from 'supertest';
import type { Application } from 'express';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const defaultUser: TestUser = {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
};

export const registerAndLogin = async (app: Application, user = defaultUser) => {
  await request(app).post('/api/auth/register').send(user);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  });
  const { accessToken, refreshToken } = loginRes.body.data.tokens;
  const userId = loginRes.body.data.user.id;
  return { accessToken, refreshToken, userId, user };
};

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const orgHeader = (organizationId: string) => ({ 'x-organization-id': organizationId });

export const createOrganization = async (app: Application, token: string, name = 'Test Org') => {
  const res = await request(app)
    .post('/api/organizations')
    .set(authHeader(token))
    .send({ name, description: 'Test organization' });
  return res.body.data;
};
