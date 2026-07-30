/**
 * Role-Based Access Control (RBAC) Test Suite
 *
 * Tests the complete role matrix across workspace and project scopes.
 *
 * Workspace Roles:
 *   - admin:   Full workspace access, user management, sees all projects
 *   - manager: Can create projects, manage own projects
 *   - member:  Can create projects, manage own projects
 *
 * Project Roles:
 *   - owner:  Full project control (edit project, manage members, delete)
 *   - editor: Can create/edit/delete tasks, view project
 *   - viewer: Read-only access to project and tasks
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import ProjectMember from '../src/models/ProjectMember.js';
import Task from '../src/models/Task.js';

describe('RBAC - Role-Based Access Control', () => {
  let admin, manager, member, outsider;
  let adminToken, managerToken, memberToken, outsiderToken;
  let project, task;

  beforeAll(async () => {
    // Connect to test database (MongoDB Memory Server URI is set in globalSetup)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});

    // Create users with different workspace roles
    admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    manager = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      password: 'Manager@123456',
      role: 'manager',
    });

    member = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: 'Member@123456',
      role: 'member',
    });

    outsider = await User.create({
      name: 'Outsider User',
      email: 'outsider@test.com',
      password: 'Outsider@123456',
      role: 'member',
    });

    // Get auth tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123456' });
    adminToken = adminRes.body.tokens?.accessToken;

    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'Manager@123456' });
    managerToken = managerRes.body.tokens?.accessToken;

    const memberRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@test.com', password: 'Member@123456' });
    memberToken = memberRes.body.tokens?.accessToken;

    const outsiderRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'outsider@test.com', password: 'Outsider@123456' });
    outsiderToken = outsiderRes.body.tokens?.accessToken;

    // Create a test project owned by manager with members
    project = await Project.create({
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project for RBAC',
      ownerId: manager._id,
      status: 'active',
    });

    // Add project members with different roles
    await ProjectMember.create({
      projectId: project._id,
      userId: manager._id,
      role: 'owner',
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: member._id,
      role: 'editor',
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: outsider._id,
      role: 'viewer',
    });

    // Create a test task
    task = await Task.create({
      title: 'Test Task',
      description: 'A test task',
      projectId: project._id,
      status: 'todo',
      priority: 'medium',
      creatorId: manager._id,
    });
  });

  describe('Workspace Roles - Admin', () => {
    it('should allow admin to see all projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should allow admin to access any project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow admin to delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${outsider._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow admin to change user roles', async () => {
      const res = await request(app)
        .patch(`/api/users/${member._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'manager' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('manager');
    });
  });

  describe('Workspace Roles - Manager & Member', () => {
    it('should allow manager to create projects', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Manager Project',
          slug: 'manager-project',
          description: 'Created by manager',
        });

      expect(res.status).toBe(201);
    });

    it('should allow member to create projects', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Member Project',
          slug: 'member-project',
          description: 'Created by member',
        });

      expect(res.status).toBe(201);
    });

    it('should not allow manager to delete other users', async () => {
      const res = await request(app)
        .delete(`/api/users/${member._id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
    });

    it('should not allow member to change user roles', async () => {
      const res = await request(app)
        .patch(`/api/users/${outsider._id}/role`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });
  });

  describe('Project Roles - Owner', () => {
    it('should allow project owner to update project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Updated Project Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Project Name');
    });

    it('should allow project owner to delete project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow project owner to add members', async () => {
      const newMember = await User.create({
        name: 'New Member',
        email: 'newmember@test.com',
        password: 'NewMember@123456',
        role: 'member',
      });

      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          userId: newMember._id,
          role: 'editor',
        });

      expect(res.status).toBe(201);
    });

    it('should allow project owner to remove members', async () => {
      const membership = await ProjectMember.findOne({
        projectId: project._id,
        userId: outsider._id,
      });

      const res = await request(app)
        .delete(`/api/projects/${project._id}/members/${membership._id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Project Roles - Editor', () => {
    it('should allow editor to create tasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Editor Task',
          description: 'Created by editor',
          projectId: project._id,
          status: 'todo',
          priority: 'medium',
        });

      expect(res.status).toBe(201);
    });

    it('should allow editor to update tasks', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Updated Task Title' });

      expect(res.status).toBe(200);
    });

    it('should allow editor to delete tasks', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it('should not allow editor to update project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Unauthorized Update' });

      expect(res.status).toBe(403);
    });

    it('should not allow editor to delete project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should not allow editor to manage project members', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: admin._id,
          role: 'viewer',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Project Roles - Viewer', () => {
    it('should allow viewer to view project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow viewer to view tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(200);
    });

    it('should not allow viewer to create tasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({
          title: 'Viewer Task',
          projectId: project._id,
          status: 'todo',
          priority: 'medium',
        });

      expect(res.status).toBe(403);
    });

    it('should not allow viewer to update tasks', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(res.status).toBe(403);
    });

    it('should not allow viewer to delete tasks', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it('should not allow viewer to update project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ name: 'Unauthorized Update' });

      expect(res.status).toBe(403);
    });
  });

  describe('No Access - Non-Members', () => {
    let nonMember, nonMemberToken;

    beforeEach(async () => {
      nonMember = await User.create({
        name: 'Non Member',
        email: 'nonmember@test.com',
        password: 'NonMember@123456',
        role: 'member',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonmember@test.com', password: 'NonMember@123456' });
      nonMemberToken = res.body.tokens?.accessToken;
    });

    it('should not allow non-member to access project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${nonMemberToken}`);

      expect(res.status).toBe(403);
    });

    it('should not allow non-member to view tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${nonMemberToken}`);

      expect(res.status).toBe(403);
    });

    it('should not allow non-member to create tasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .send({
          title: 'Non-member Task',
          projectId: project._id,
          status: 'todo',
          priority: 'medium',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Dashboard Scoping by Role', () => {
    it('should return all workspace stats for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalProjects');
      expect(res.body.data).toHaveProperty('totalTasks');
    });

    it('should return scoped stats for manager (only accessible projects)', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalProjects).toBe(1);
    });

    it('should return scoped stats for member (only accessible projects)', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalProjects).toBe(1);
    });
  });
});
