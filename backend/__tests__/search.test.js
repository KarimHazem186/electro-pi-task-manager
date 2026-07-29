import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import ProjectMember from '../src/models/ProjectMember.js';
import Task from '../src/models/Task.js';

describe('Search API', () => {
  let adminToken;
  let adminUser;
  let memberToken;
  let memberUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123456',
      role: 'admin',
    });
    memberUser = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: 'Member@123456',
      role: 'member',
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123456' });
    adminToken = adminLogin.body.tokens?.accessToken;

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@test.com', password: 'Member@123456' });
    memberToken = memberLogin.body.tokens?.accessToken;
  });

  it('should require a minimum query length', async () => {
    const res = await request(app)
      .get('/api/search?q=a')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.projects).toEqual([]);
    expect(res.body.data.tasks).toEqual([]);
  });

  it('should find a project by name', async () => {
    const project = await Project.create({
      name: 'Marketing Campaign',
      description: 'Q4 launch',
      ownerId: adminUser._id,
    });

    const res = await request(app)
      .get('/api/search?q=Marketing')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.projects.length).toBeGreaterThan(0);
    expect(res.body.data.projects[0].id).toBe(project.id);
  });

  it('should find tasks by title', async () => {
    const project = await Project.create({
      name: 'Demo',
      description: 'desc',
      ownerId: adminUser._id,
    });
    await ProjectMember.create({
      projectId: project._id,
      userId: adminUser._id,
      role: 'owner',
    });
    const task = await Task.create({
      title: 'Write launch announcement',
      description: 'Press release copy',
      status: 'todo',
      priority: 'high',
      projectId: project._id,
      creatorId: adminUser._id,
    });

    const res = await request(app)
      .get('/api/search?q=launch')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);
    expect(res.body.data.tasks[0].id).toBe(task.id);
  });

  it('should scope results to accessible projects for non-admins', async () => {
    // Project visible to admin only
    const adminOnlyProject = await Project.create({
      name: 'AdminSecret Plan',
      description: 'confidential',
      ownerId: adminUser._id,
    });
    await ProjectMember.create({
      projectId: adminOnlyProject._id,
      userId: adminUser._id,
      role: 'owner',
    });

    const res = await request(app)
      .get('/api/search?q=AdminSecret')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.projects).toEqual([]);
  });

  it('should respect types=projects filter', async () => {
    await Project.create({
      name: 'Filterable Project',
      description: 'x',
      ownerId: adminUser._id,
    });

    const res = await request(app)
      .get('/api/search?q=Filterable&types=projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.projects.length).toBeGreaterThan(0);
    expect(res.body.data.tasks).toEqual([]);
  });
});
