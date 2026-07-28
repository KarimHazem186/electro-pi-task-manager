import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import ProjectMember from '../src/models/ProjectMember.js';
import Task from '../src/models/Task.js';

describe('Task API', () => {
  let token;
  let user;
  let project;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager-test');
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

    // Create user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      role: 'member',
    });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test@123456' });
    token = loginRes.body.token;

    // Create project
    project = await Project.create({
      name: 'Test Project',
      description: 'Test description',
      ownerId: user._id,
    });

    // Add user as member
    await ProjectMember.create({
      projectId: project._id,
      userId: user._id,
      role: 'owner',
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          status: 'todo',
          priority: 'high',
          projectId: project._id.toString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.status).toBe('todo');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test description',
          projectId: project._id.toString(),
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'AB', // Too short
          description: 'Test description',
          projectId: project._id.toString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          priority: 'high',
          projectId: project._id,
          creatorId: user._id,
        },
        {
          title: 'Task 2',
          description: 'Description 2',
          status: 'in_progress',
          priority: 'medium',
          projectId: project._id,
          creatorId: user._id,
        },
        {
          title: 'Task 3',
          description: 'Description 3',
          status: 'done',
          priority: 'low',
          projectId: project._id,
          creatorId: user._id,
        },
      ]);
    });

    it('should get all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(task => task.status === 'todo')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(task => task.priority === 'high')).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&pageSize=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pageSize', 2);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task', async () => {
      const task = await Task.create({
        title: 'Original Title',
        description: 'Original description',
        status: 'todo',
        priority: 'low',
        projectId: project._id,
        creatorId: user._id,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'in_progress',
          priority: 'high',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.priority).toBe('high');
    });

    it('should track status changes', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'medium',
        projectId: project._id,
        creatorId: user._id,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'done',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('done');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'medium',
        projectId: project._id,
        creatorId: user._id,
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task is deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });
});
