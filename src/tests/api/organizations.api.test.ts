import request from 'supertest';
import { createApp } from '../../app';
import { registerAndLogin, authHeader, orgHeader, createOrganization } from '../helpers';

const app = createApp();

describe('Organizations API', () => {
  it('creates and lists organizations', async () => {
    const { accessToken } = await registerAndLogin(app);
    const org = await createOrganization(app, accessToken);
    const res = await request(app).get('/api/organizations').set(authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].id).toBe(org.id);
  });

  it('gets organization details', async () => {
    const { accessToken } = await registerAndLogin(app, {
      email: 'org2@example.com',
      password: 'Password123!',
      firstName: 'O',
      lastName: '2',
    });
    const org = await createOrganization(app, accessToken);
    const res = await request(app)
      .get(`/api/organizations/${org.id}`)
      .set(authHeader(accessToken))
      .set(orgHeader(org.id));
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Org');
  });

  it('updates organization as admin', async () => {
    const { accessToken } = await registerAndLogin(app, {
      email: 'org3@example.com',
      password: 'Password123!',
      firstName: 'O',
      lastName: '3',
    });
    const org = await createOrganization(app, accessToken);
    const res = await request(app)
      .patch(`/api/organizations/${org.id}`)
      .set(authHeader(accessToken))
      .set(orgHeader(org.id))
      .send({ name: 'Updated Org' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Org');
  });

  it('forbids non-member access', async () => {
    const user1 = await registerAndLogin(app, {
      email: 'org4a@example.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'A',
    });
    const user2 = await registerAndLogin(app, {
      email: 'org4b@example.com',
      password: 'Password123!',
      firstName: 'B',
      lastName: 'B',
    });
    const org = await createOrganization(app, user1.accessToken);
    const res = await request(app)
      .get(`/api/organizations/${org.id}`)
      .set(authHeader(user2.accessToken))
      .set(orgHeader(org.id));
    expect(res.status).toBe(403);
  });
});
