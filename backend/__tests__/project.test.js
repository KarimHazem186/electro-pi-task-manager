import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import ProjectMember from '../src/models/ProjectMember.js';

describe('Project API', () => {
  let adminToken;
  let memberToken;
  let adminUser;
  let memberUser;

  beforeAll(async () => {
    // Connect to test database (MongoDB Memory Server URI is set in globalSetup)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    // Create member user
    memberUser = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: 'Member@123456',
      role: 'member',
    });

    // Login admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123456' });
    adminToken = adminLogin.body.tokens?.accessToken;

    // Login member
    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@test.com', password: 'Member@123456' });
    memberToken = memberLogin.body.tokens?.accessToken;
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'Test project description',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Test Project');
      expect(res.body.data).toHaveProperty('slug');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'Test project description',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'AB', // Too short (min 3 chars)
          description: 'Test description',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    it('should get accessible projects', async () => {
      // Create project
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        ownerId: adminUser._id,
      });

      // Add admin as member
      await ProjectMember.create({
        projectId: project._id,
        userId: adminUser._id,
        role: 'owner',
      });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(res.body).toHaveProperty('total');
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update project as owner', async () => {
      const project = await Project.create({
        name: 'Original Name',
        description: 'Original description',
        ownerId: adminUser._id,
      });

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should fail to update as non-owner', async () => {
      const project = await Project.create({
        name: 'Original Name',
        description: 'Original description',
        ownerId: adminUser._id,
      });

      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project as owner', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        ownerId: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify project is deleted
      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
    });

    it('should fail to delete as non-owner', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        ownerId: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Project Members', () => {
    it('should add member to project', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        ownerId: adminUser._id,
      });

      await ProjectMember.create({
        projectId: project._id,
        userId: adminUser._id,
        role: 'owner',
      });

      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: memberUser._id.toString(),
          role: 'editor',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should get project members', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        ownerId: adminUser._id,
      });

      await ProjectMember.create({
        projectId: project._id,
        userId: adminUser._id,
        role: 'owner',
      });

      const res = await request(app)
        .get(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
