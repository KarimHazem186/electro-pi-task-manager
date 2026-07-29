import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Notification from '../src/models/Notification.js';
import Project from '../src/models/Project.js';
import ProjectMember from '../src/models/ProjectMember.js';
import Task from '../src/models/Task.js';

describe('Notifications API', () => {
  let token;
  let user;
  let otherUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});

    user = await User.create({
      name: 'Recipient',
      email: 'me@test.com',
      password: 'Test@123456',
      role: 'member',
    });
    otherUser = await User.create({
      name: 'Actor',
      email: 'actor@test.com',
      password: 'Test@123456',
      role: 'admin',
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'me@test.com', password: 'Test@123456' });
    token = login.body.tokens?.accessToken;

    await Notification.create({
      recipientId: user._id,
      actorId: otherUser._id,
      type: 'task_assigned',
      title: 'You were assigned a task',
      body: 'Take a look',
      read: false,
    });
    await Notification.create({
      recipientId: user._id,
      actorId: otherUser._id,
      type: 'system',
      title: 'Welcome',
      body: 'Hi',
      read: true,
    });
  });

  it('should list notifications for the current user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('should return the unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('should mark a single notification as read', async () => {
    const n = await Notification.findOne({ recipientId: user._id, read: false });
    const res = await request(app)
      .patch(`/api/notifications/${n._id}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.read).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const remaining = await Notification.countDocuments({
      recipientId: user._id,
      read: false,
    });
    expect(remaining).toBe(0);
  });

  it('should delete a single notification', async () => {
    const n = await Notification.findOne({ recipientId: user._id });
    const res = await request(app)
      .delete(`/api/notifications/${n._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const found = await Notification.findById(n._id);
    expect(found).toBeNull();
  });

  it('should reject access without a token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
  });
});
