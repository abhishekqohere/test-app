import request from 'supertest';
import { createApp } from '../../app';
import { registerAndLogin, authHeader, orgHeader, createOrganization } from '../helpers';

const app = createApp();

describe('Comments & Notifications API', () => {
  it('creates comment and lists notifications', async () => {
    const auth = await registerAndLogin(app, {
      email: `comment-${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'C',
      lastName: 'N',
    });
    const org = await createOrganization(app, auth.accessToken);

    const project = await request(app)
      .post('/api/projects')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id))
      .send({ name: 'Comment Project' });

    const task = await request(app)
      .post('/api/tasks')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id))
      .send({ title: 'Task with comments', projectId: project.body.data.id });

    const commentRes = await request(app)
      .post('/api/comments')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id))
      .send({ content: 'Great progress!', taskId: task.body.data.id });
    expect(commentRes.status).toBe(201);

    const listRes = await request(app)
      .get(`/api/comments/task/${task.body.data.id}`)
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id));
    expect(listRes.body.data).toHaveLength(1);

    const notifRes = await request(app)
      .get('/api/notifications')
      .set(authHeader(auth.accessToken))
      .set(orgHeader(org.id));
    expect(notifRes.status).toBe(200);
  });
});
