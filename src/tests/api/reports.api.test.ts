import request from 'supertest';
import { createApp } from '../../app';
import { registerAndLogin, authHeader, orgHeader, createOrganization } from '../helpers';

const app = createApp();

describe('Reports API', () => {
  it('returns organization summary and task reports', async () => {
    const auth = await registerAndLogin(app, {
      email: `reports-${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'R',
      lastName: 'P',
    });
    const org = await createOrganization(app, auth.accessToken);

    const project = await request(app)
      .post('/api/projects')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id))
      .send({ name: 'Report Project' });

    await request(app)
      .post('/api/tasks')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id))
      .send({
        title: 'Report Task',
        projectId: project.body.data.id,
        priority: 'High',
        status: 'Todo',
      });

    const summary = await request(app)
      .get('/api/reports/organization-summary')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id));
    expect(summary.status).toBe(200);
    expect(summary.body.data.totalTasks).toBeGreaterThanOrEqual(1);

    const byStatus = await request(app)
      .get('/api/reports/tasks-by-status')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id));
    expect(byStatus.status).toBe(200);
    expect(Array.isArray(byStatus.body.data)).toBe(true);
  });
});
