import request from 'supertest';
import { createApp } from '../../app';
import { registerAndLogin, authHeader, orgHeader, createOrganization } from '../helpers';

const app = createApp();

describe('Projects & Tasks API', () => {
  const setup = async () => {
    const auth = await registerAndLogin(app, {
      email: `proj-${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'P',
      lastName: 'T',
    });
    const org = await createOrganization(app, auth.accessToken);
    return { ...auth, orgId: org.id };
  };

  it('creates project and task flow', async () => {
    const { accessToken, userId, orgId } = await setup();

    const projectRes = await request(app)
      .post('/api/projects')
      .set(authHeader(accessToken))
      .set(orgHeader(orgId))
      .send({ name: 'Sprint 1', description: 'First sprint', status: 'Active' });
    expect(projectRes.status).toBe(201);
    const projectId = projectRes.body.data.id;

    const taskRes = await request(app)
      .post('/api/tasks')
      .set(authHeader(accessToken))
      .set(orgHeader(orgId))
      .send({
        title: 'Implement API',
        projectId,
        priority: 'High',
        status: 'Todo',
        assigneeId: userId,
      });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.data.id;

    const listRes = await request(app)
      .get('/api/tasks')
      .query({ projectId, status: 'Todo' })
      .set(authHeader(accessToken))
      .set(orgHeader(orgId));
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(1);

    const statusRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set(authHeader(accessToken))
      .set(orgHeader(orgId))
      .send({ status: 'Done' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('Done');

    const statsRes = await request(app)
      .get(`/api/projects/${projectId}/statistics`)
      .set(authHeader(accessToken))
      .set(orgHeader(orgId));
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.totalTasks).toBe(1);
  });

  it('archives and restores project', async () => {
    const { accessToken, orgId } = await setup();
    const projectRes = await request(app)
      .post('/api/projects')
      .set(authHeader(accessToken))
      .set(orgHeader(orgId))
      .send({ name: 'Archive Me' });
    const projectId = projectRes.body.data.id;

    await request(app)
      .post(`/api/projects/${projectId}/archive`)
      .set(authHeader(accessToken))
      .set(orgHeader(orgId));

    const restoreRes = await request(app)
      .post(`/api/projects/${projectId}/restore`)
      .set(authHeader(accessToken))
      .set(orgHeader(orgId));
    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.archivedAt).toBeNull();
  });
});
