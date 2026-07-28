import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskmanager.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@taskmanager.com',
      password: 'Manager@123456',
      role: 'manager',
    });

    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
    });

    const member3 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
    });

    console.log('✅ Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'active',
      ownerId: admin._id,
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      status: 'active',
      ownerId: manager._id,
    });

    const project3 = await Project.create({
      name: 'API Integration',
      description: 'Integrate third-party APIs for payment and analytics',
      status: 'active',
      ownerId: admin._id,
    });

    console.log('✅ Created projects');

    // Create project members
    await ProjectMember.create([
      // Project 1 members
      { projectId: project1._id, userId: admin._id, role: 'owner' },
      { projectId: project1._id, userId: member1._id, role: 'editor' },
      { projectId: project1._id, userId: member2._id, role: 'editor' },
      
      // Project 2 members
      { projectId: project2._id, userId: manager._id, role: 'owner' },
      { projectId: project2._id, userId: member2._id, role: 'editor' },
      { projectId: project2._id, userId: member3._id, role: 'viewer' },
      
      // Project 3 members
      { projectId: project3._id, userId: admin._id, role: 'owner' },
      { projectId: project3._id, userId: member1._id, role: 'editor' },
      { projectId: project3._id, userId: member3._id, role: 'editor' },
    ]);

    console.log('✅ Created project members');

    // Create tasks
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Task.create([
      // Project 1 tasks
      {
        projectId: project1._id,
        title: 'Design new homepage layout',
        description: 'Create mockups for the new homepage with modern design principles',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow,
        assigneeId: member1._id,
        creatorId: admin._id,
      },
      {
        projectId: project1._id,
        title: 'Set up color scheme and typography',
        description: 'Define brand colors, fonts, and design tokens',
        status: 'done',
        priority: 'medium',
        dueDate: null,
        assigneeId: member2._id,
        creatorId: admin._id,
      },
      {
        projectId: project1._id,
        title: 'Create responsive navigation',
        description: 'Build mobile-friendly navigation component',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: admin._id,
      },
      {
        projectId: project1._id,
        title: 'Optimize images for web',
        description: 'Compress and convert images to WebP format',
        status: 'todo',
        priority: 'low',
        dueDate: nextWeek,
        assigneeId: null,
        creatorId: admin._id,
      },

      // Project 2 tasks
      {
        projectId: project2._id,
        title: 'Set up React Native project',
        description: 'Initialize React Native project with Expo',
        status: 'done',
        priority: 'urgent',
        dueDate: null,
        assigneeId: member2._id,
        creatorId: manager._id,
      },
      {
        projectId: project2._id,
        title: 'Implement authentication flow',
        description: 'Build login, register, and password reset screens',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: member2._id,
        creatorId: manager._id,
      },
      {
        projectId: project2._id,
        title: 'Design app icon and splash screen',
        description: 'Create branded app icon and splash screen',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek,
        assigneeId: member3._id,
        creatorId: manager._id,
      },
      {
        projectId: project2._id,
        title: 'Configure push notifications',
        description: 'Set up Firebase Cloud Messaging for push notifications',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: null,
        creatorId: manager._id,
      },

      // Project 3 tasks
      {
        projectId: project3._id,
        title: 'Research payment gateway options',
        description: 'Compare Stripe, PayPal, and Square integration',
        status: 'done',
        priority: 'high',
        dueDate: null,
        assigneeId: member1._id,
        creatorId: admin._id,
      },
      {
        projectId: project3._id,
        title: 'Integrate Stripe payment API',
        description: 'Implement Stripe checkout and webhooks',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: member1._id,
        creatorId: admin._id,
      },
      {
        projectId: project3._id,
        title: 'Set up Google Analytics',
        description: 'Configure GA4 tracking and custom events',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek,
        assigneeId: member3._id,
        creatorId: admin._id,
      },
      {
        projectId: project3._id,
        title: 'Write API documentation',
        description: 'Document all API endpoints with Swagger',
        status: 'todo',
        priority: 'low',
        dueDate: nextWeek,
        assigneeId: null,
        creatorId: admin._id,
      },
    ]);

    console.log('✅ Created tasks');

    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ✅ Database seeded successfully!                       ║
║                                                          ║
║   Test Accounts:                                        ║
║   ┌──────────────────────────────────────────────────┐ ║
║   │ Admin:                                           │ ║
║   │   Email: admin@taskmanager.com                   │ ║
║   │   Password: Admin@123456                         │ ║
║   ├──────────────────────────────────────────────────┤ ║
║   │ Manager:                                         │ ║
║   │   Email: manager@taskmanager.com                 │ ║
║   │   Password: Manager@123456                       │ ║
║   ├──────────────────────────────────────────────────┤ ║
║   │ Member:                                          │ ║
║   │   Email: john@taskmanager.com                    │ ║
║   │   Password: Member@123456                        │ ║
║   └──────────────────────────────────────────────────┘ ║
║                                                          ║
║   Projects: 3                                           ║
║   Users: 5                                              ║
║   Tasks: 12                                             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
