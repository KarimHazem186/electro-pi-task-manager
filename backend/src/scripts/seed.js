// Load environment variables
import '../config/env.js';

import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

// Helper function to format date for better logging
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const seedData = async () => {
  try {
    console.log('🌱 Starting comprehensive database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data');

    // ==================== CREATE USERS ====================
    console.log('👥 Creating users...');
    
    // Primary user (ElectroPi user)
    const amara = await User.create({
      name: 'Amara Okafar',
      email: 'amara@electropi.io',
      password: 'Amara@123456',
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskmanager.com',
      password: 'Admin@123456',
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    });

    const manager1 = await User.create({
      name: 'Sarah Williams',
      email: 'manager@taskmanager.com',
      password: 'Manager@123456',
      role: 'manager',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    });

    const manager2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@taskmanager.com',
      password: 'Manager@123456',
      role: 'manager',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    });

    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    });

    const member2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    });

    const member3 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    });

    const member4 = await User.create({
      name: 'Robert Garcia',
      email: 'robert@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    });

    const member5 = await User.create({
      name: 'Emily Brown',
      email: 'emily@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    });

    const member6 = await User.create({
      name: 'David Martinez',
      email: 'david@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    });

    const member7 = await User.create({
      name: 'Lisa Anderson',
      email: 'lisa@taskmanager.com',
      password: 'Member@123456',
      role: 'member',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    });

    const allUsers = [amara, admin, manager1, manager2, member1, member2, member3, member4, member5, member6, member7];
    console.log(`✅ Created ${allUsers.length} users`);

    // ==================== CREATE PROJECTS ====================
    console.log('📁 Creating projects...');
    
    // Projects owned by Amara
    const project1 = await Project.create({
      name: 'ElectroPi Enterprise Platform',
      description: 'Modern enterprise platform for ElectroPi Labs with real-time IoT device tracking, automated workflow processing, and advanced analytics dashboard',
      status: 'active',
      ownerId: amara._id,
    });

    const project2 = await Project.create({
      name: 'Customer Mobile App',
      description: 'Native mobile application for iOS and Android enabling customers to monitor IoT devices, configure settings, view analytics, and manage their ElectroPi ecosystem on the go',
      status: 'active',
      ownerId: amara._id,
    });

    const project3 = await Project.create({
      name: 'IoT Device Management System',
      description: 'Comprehensive device management system with remote configuration, firmware updates, automated health monitoring, and real-time diagnostics',
      status: 'active',
      ownerId: amara._id,
    });

    const project4 = await Project.create({
      name: 'Hardware Integration Platform',
      description: 'B2B platform connecting ElectroPi with global hardware suppliers, featuring automated procurement, EDI integration, and supply chain visibility',
      status: 'active',
      ownerId: manager1._id,
    });

    const project5 = await Project.create({
      name: 'Business Intelligence Dashboard',
      description: 'Executive dashboard with real-time KPIs, sales forecasting, inventory analytics, and customizable reports for data-driven decision making',
      status: 'active',
      ownerId: amara._id,
    });

    const project6 = await Project.create({
      name: 'Legacy ERP Migration',
      description: 'Successfully migrated legacy ERP system to modern cloud-based architecture with microservices and improved performance',
      status: 'archived',
      ownerId: admin._id,
    });

    const project7 = await Project.create({
      name: 'Marketing Automation Platform',
      description: 'Automated email campaigns, customer segmentation, lead scoring, and omnichannel marketing orchestration for improved customer engagement',
      status: 'active',
      ownerId: manager2._id,
    });

    const allProjects = [project1, project2, project3, project4, project5, project6, project7];
    console.log(`✅ Created ${allProjects.length} projects`);

    // ==================== CREATE PROJECT MEMBERS ====================
    console.log('👨‍💼 Creating project members...');
    
    const projectMembers = await ProjectMember.create([
      // Project 1: ElectroPi Enterprise Platform - 6 members (Amara's)
      { projectId: project1._id, userId: amara._id, role: 'owner' },
      { projectId: project1._id, userId: manager1._id, role: 'editor' },
      { projectId: project1._id, userId: member1._id, role: 'editor' },
      { projectId: project1._id, userId: member2._id, role: 'editor' },
      { projectId: project1._id, userId: member4._id, role: 'editor' },
      { projectId: project1._id, userId: member5._id, role: 'viewer' },
      
      // Project 2: Customer Mobile App - 5 members (Amara's)
      { projectId: project2._id, userId: amara._id, role: 'owner' },
      { projectId: project2._id, userId: member2._id, role: 'editor' },
      { projectId: project2._id, userId: member3._id, role: 'editor' },
      { projectId: project2._id, userId: member6._id, role: 'editor' },
      { projectId: project2._id, userId: member7._id, role: 'viewer' },
      
      // Project 3: IoT Device Management System - 4 members (Amara's)
      { projectId: project3._id, userId: amara._id, role: 'owner' },
      { projectId: project3._id, userId: member1._id, role: 'editor' },
      { projectId: project3._id, userId: member4._id, role: 'editor' },
      { projectId: project3._id, userId: member5._id, role: 'viewer' },
      
      // Project 4: Hardware Integration Platform - 7 members
      { projectId: project4._id, userId: manager1._id, role: 'owner' },
      { projectId: project4._id, userId: amara._id, role: 'editor' },
      { projectId: project4._id, userId: member1._id, role: 'editor' },
      { projectId: project4._id, userId: member2._id, role: 'editor' },
      { projectId: project4._id, userId: member3._id, role: 'editor' },
      { projectId: project4._id, userId: member6._id, role: 'viewer' },
      { projectId: project4._id, userId: member7._id, role: 'viewer' },
      
      // Project 5: Business Intelligence Dashboard - 5 members (Amara's)
      { projectId: project5._id, userId: amara._id, role: 'owner' },
      { projectId: project5._id, userId: manager1._id, role: 'editor' },
      { projectId: project5._id, userId: member2._id, role: 'editor' },
      { projectId: project5._id, userId: member4._id, role: 'editor' },
      { projectId: project5._id, userId: member6._id, role: 'viewer' },
      
      // Project 6: Legacy ERP Migration (Archived) - 3 members
      { projectId: project6._id, userId: admin._id, role: 'owner' },
      { projectId: project6._id, userId: amara._id, role: 'editor' },
      { projectId: project6._id, userId: member3._id, role: 'editor' },
      
      // Project 7: Marketing Automation Platform - 4 members
      { projectId: project7._id, userId: manager2._id, role: 'owner' },
      { projectId: project7._id, userId: amara._id, role: 'viewer' },
      { projectId: project7._id, userId: member1._id, role: 'editor' },
      { projectId: project7._id, userId: member5._id, role: 'editor' },
    ]);

    console.log(`✅ Created ${projectMembers.length} project members`);

    // ==================== CREATE TASKS ====================
    console.log('📝 Creating tasks...');
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(now);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const tasks = await Task.create([
      // Project 1 tasks (ElectroPi Enterprise Platform) - Amara's project
      {
        projectId: project1._id,
        title: 'Review IoT dashboard wireframes',
        description: 'Review and approve the new IoT device tracking dashboard designs before development begins',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Implement real-time device monitoring',
        description: 'Build WebSocket integration for live IoT device status updates on customer portal',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow,
        assigneeId: member1._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Setup authentication with Azure AD',
        description: 'Integrate enterprise SSO using Azure Active Directory for secure access',
        status: 'done',
        priority: 'urgent',
        dueDate: lastWeek,
        assigneeId: member2._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Design device catalog page',
        description: 'Create responsive IoT device catalog with advanced filtering and search capabilities',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member4._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Optimize database queries',
        description: 'Improve performance of device data queries for faster page loads',
        status: 'todo',
        priority: 'medium',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 2 tasks (Customer Mobile App) - Amara's project
      {
        projectId: project2._id,
        title: 'Approve app store screenshots',
        description: 'Review and approve final screenshots and app store listing materials',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project2._id,
        title: 'Implement QR code scanner',
        description: 'Add device QR code scanning feature for quick device registration',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member2._id,
        creatorId: amara._id,
      },
      {
        projectId: project2._id,
        title: 'Build push notification system',
        description: 'Setup Firebase Cloud Messaging for device alerts and status notifications',
        status: 'done',
        priority: 'high',
        dueDate: lastWeek,
        assigneeId: member3._id,
        creatorId: amara._id,
      },
      {
        projectId: project2._id,
        title: 'Add offline mode support',
        description: 'Enable app functionality when internet connection is unavailable',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek,
        assigneeId: member6._id,
        creatorId: amara._id,
      },
      {
        projectId: project2._id,
        title: 'Create device history screen',
        description: 'Display device activity history with filtering and search',
        status: 'todo',
        priority: 'medium',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 3 tasks (IoT Device Management System) - Amara's project
      {
        projectId: project3._id,
        title: 'Test device firmware update',
        description: 'Verify OTA firmware update works with new device management system',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Build device health monitoring alerts',
        description: 'Automated email alerts when device health metrics fall below threshold',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Create device diagnostics dashboard',
        description: 'Real-time dashboard showing all connected devices and their health status',
        status: 'done',
        priority: 'high',
        dueDate: lastWeek,
        assigneeId: member4._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Implement remote configuration workflow',
        description: 'Digital workflow for remotely configuring device settings and parameters',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Add device network topology mapping',
        description: 'Visual map of IoT device network with connection relationships',
        status: 'todo',
        priority: 'low',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 4 tasks (Hardware Integration Platform)
      {
        projectId: project4._id,
        title: 'Review API documentation',
        description: 'Review hardware supplier API integration documentation and provide feedback',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: amara._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Build EDI integration module',
        description: 'Implement EDI X12 integration for automated hardware purchase orders',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: member1._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Setup supplier portal authentication',
        description: 'OAuth 2.0 authentication for hardware supplier portal access',
        status: 'done',
        priority: 'urgent',
        dueDate: lastWeek,
        assigneeId: member2._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Create automated procurement workflow',
        description: 'Automated purchase order generation for hardware components based on project needs',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member3._id,
        creatorId: manager1._id,
      },

      // Project 5 tasks (Business Intelligence Dashboard) - Amara's project
      {
        projectId: project5._id,
        title: 'Define KPI metrics',
        description: 'Finalize list of key performance indicators for executive dashboard',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project5._id,
        title: 'Build sales forecasting model',
        description: 'Machine learning model for predicting future sales trends',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member2._id,
        creatorId: amara._id,
      },
      {
        projectId: project5._id,
        title: 'Design executive dashboard UI',
        description: 'Clean, intuitive dashboard design for C-level executives',
        status: 'done',
        priority: 'high',
        dueDate: lastWeek,
        assigneeId: manager1._id,
        creatorId: amara._id,
      },
      {
        projectId: project5._id,
        title: 'Implement custom report builder',
        description: 'Drag-and-drop interface for creating custom reports',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek,
        assigneeId: member4._id,
        creatorId: amara._id,
      },
      {
        projectId: project5._id,
        title: 'Add data export functionality',
        description: 'Export reports to PDF, Excel, and CSV formats',
        status: 'todo',
        priority: 'low',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 6 tasks (Legacy ERP Migration) - Archived
      {
        projectId: project6._id,
        title: 'Complete data migration',
        description: 'Migrate all historical data from legacy system to new platform',
        status: 'done',
        priority: 'urgent',
        dueDate: lastWeek,
        assigneeId: amara._id,
        creatorId: admin._id,
      },
      {
        projectId: project6._id,
        title: 'Perform user acceptance testing',
        description: 'Coordinate UAT with key stakeholders',
        status: 'done',
        priority: 'high',
        dueDate: lastWeek,
        assigneeId: admin._id,
        creatorId: admin._id,
      },
      {
        projectId: project6._id,
        title: 'Document migration process',
        description: 'Create comprehensive documentation of migration steps and lessons learned',
        status: 'done',
        priority: 'medium',
        dueDate: lastWeek,
        assigneeId: member3._id,
        creatorId: admin._id,
      },

      // Project 7 tasks (Marketing Automation Platform)
      {
        projectId: project7._id,
        title: 'Setup email campaign templates',
        description: 'Create responsive email templates for various campaign types',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: manager2._id,
      },
      {
        projectId: project7._id,
        title: 'Build lead scoring algorithm',
        description: 'Implement scoring based on engagement, demographics, and behavior',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member5._id,
        creatorId: manager2._id,
      },
      {
        projectId: project7._id,
        title: 'Integrate with CRM system',
        description: 'Bidirectional sync with Salesforce CRM',
        status: 'done',
        priority: 'urgent',
        dueDate: lastWeek,
        assigneeId: member1._id,
        creatorId: manager2._id,
      },
    ]);

    console.log(`✅ Created ${tasks.length} tasks`);

    // ==================== CREATE AUDIT LOGS ====================
    console.log('📋 Creating audit logs...');
    
    const auditLogs = await AuditLog.create([
      // Project creation logs
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project1._id,
        metadata: { name: 'ElectroPi Enterprise Platform' },
        changes: { status: 'active' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project2._id,
        metadata: { name: 'Customer Mobile App' },
        changes: { status: 'active' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project3._id,
        metadata: { name: 'Warehouse Management System' },
        changes: { status: 'active' },
      },
      {
        userId: manager1._id,
        action: 'created',
        entityType: 'project',
        entityId: project4._id,
        metadata: { name: 'Hardware Integration Platform' },
        changes: { status: 'active' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project5._id,
        metadata: { name: 'Business Intelligence Dashboard' },
        changes: { status: 'active' },
      },
      
      // Task assignments to Amara
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[0]._id,
        metadata: { title: 'Review IoT dashboard wireframes', projectId: project1._id },
        changes: { assignedTo: amara._id.toString(), priority: 'urgent' },
      },
      {
        userId: amara._id,
        action: 'status_changed',
        entityType: 'task',
        entityId: tasks[0]._id,
        metadata: { title: 'Review IoT dashboard wireframes', projectId: project1._id },
        changes: { from: 'todo', to: 'in_progress' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[5]._id,
        metadata: { title: 'Approve app store screenshots', projectId: project2._id },
        changes: { assignedTo: amara._id.toString(), priority: 'high' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[10]._id,
        metadata: { title: 'Test device firmware update', projectId: project3._id },
        changes: { assignedTo: amara._id.toString(), priority: 'urgent' },
      },
      
      // Task status changes
      {
        userId: member1._id,
        action: 'status_changed',
        entityType: 'task',
        entityId: tasks[1]._id,
        changes: { from: 'todo', to: 'in_progress' },
        metadata: { startedAt: now, assignee: 'John Doe' },
      },
      {
        userId: member2._id,
        action: 'status_changed',
        entityType: 'task',
        entityId: tasks[2]._id,
        changes: { from: 'in_progress', to: 'done' },
        metadata: { completedAt: lastWeek, hoursSpent: 16 },
      },
      {
        userId: member3._id,
        action: 'status_changed',
        entityType: 'task',
        entityId: tasks[7]._id,
        changes: { from: 'in_progress', to: 'done' },
        metadata: { completedAt: lastWeek, hoursSpent: 12 },
      },
      
      // Project member additions
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project_member',
        entityId: projectMembers[1]._id,
        metadata: { 
          memberName: 'Sarah Williams',
          projectName: 'ElectroPi Enterprise Platform', 
          role: 'editor',
          projectId: project1._id 
        },
        changes: { role: 'editor' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project_member',
        entityId: projectMembers[2]._id,
        metadata: { 
          memberName: 'John Doe',
          projectName: 'ElectroPi Enterprise Platform', 
          role: 'editor',
          projectId: project1._id 
        },
        changes: { role: 'editor' },
      },
      {
        userId: manager1._id,
        action: 'created',
        entityType: 'project_member',
        entityId: projectMembers[17]._id,
        metadata: { 
          memberName: 'Amara Okafar',
          projectName: 'Hardware Integration Platform', 
          role: 'editor',
          projectId: project4._id 
        },
        changes: { role: 'editor' },
      },
      
      // Project updates
      {
        userId: admin._id,
        action: 'updated',
        entityType: 'project',
        entityId: project6._id,
        metadata: { name: 'Legacy ERP Migration' },
        changes: { status: 'archived', previousStatus: 'active' },
      },
      
      // Additional task activity
      {
        userId: amara._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[19]._id,
        metadata: { title: 'Define KPI metrics', projectId: project5._id },
        changes: { priority: { from: 'medium', to: 'high' } },
      },
      {
        userId: member2._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[6]._id,
        metadata: { title: 'Implement QR code scanner', projectId: project2._id },
        changes: { description: 'Add device QR code scanning feature for quick device registration' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[15]._id,
        changes: { title: 'Review API documentation', assignedTo: amara._id.toString(), priority: 'high' },
        metadata: { projectName: 'Hardware Integration Platform', dueDate: formatDate(nextWeek) },
      },
    ]);

    console.log(`✅ Created ${auditLogs.length} audit logs`);

    // ==================== CREATE NOTIFICATIONS ====================
    console.log('🔔 Creating notifications...');
    
    const notifications = await Notification.create([
      // ========== AMARA'S NOTIFICATIONS ==========
      
      // Task Assignment Notifications (Unread - High Priority)
      {
        recipientId: amara._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Review IoT dashboard wireframes"',
        body: 'This task is marked as urgent and due tomorrow',
        href: `/projects/${project1.slug}/tasks/${tasks[0]._id}`,
        projectId: project1._id,
        taskId: tasks[0]._id,
        metadata: { 
          priority: 'urgent',
          status: 'in_progress',
          dueDate: formatDate(tomorrow),
          projectName: 'ElectroPi Enterprise Platform'
        },
        read: false,
      },
      {
        recipientId: amara._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Approve app store screenshots"',
        body: 'Task assigned in Customer Mobile App project',
        href: `/projects/${project2.slug}/tasks/${tasks[5]._id}`,
        projectId: project2._id,
        taskId: tasks[5]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          dueDate: formatDate(tomorrow),
          projectName: 'Customer Mobile App'
        },
        read: false,
      },
      {
        recipientId: amara._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Test device firmware update"',
        body: 'Urgent task requiring immediate attention',
        href: `/projects/${project3.slug}/tasks/${tasks[10]._id}`,
        projectId: project3._id,
        taskId: tasks[10]._id,
        metadata: { 
          priority: 'urgent',
          status: 'in_progress',
          dueDate: formatDate(tomorrow),
          projectName: 'IoT Device Management System'
        },
        read: false,
      },
      {
        recipientId: amara._id,
        actorId: manager1._id,
        type: 'task_assigned',
        title: 'Sarah Williams assigned you to "Review API documentation"',
        body: 'Please review the hardware supplier API integration docs',
        href: `/projects/${project4.slug}/tasks/${tasks[15]._id}`,
        projectId: project4._id,
        taskId: tasks[15]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          dueDate: formatDate(nextWeek),
          projectName: 'Hardware Integration Platform',
          actorName: 'Sarah Williams'
        },
        read: false,
      },

      // Task Status Change Notifications (Unread)
      {
        recipientId: amara._id,
        actorId: member2._id,
        type: 'task_status_changed',
        title: 'Task "Setup authentication with Azure AD" marked as done',
        body: 'Jane Smith completed this task',
        href: `/projects/${project1.slug}/tasks/${tasks[2]._id}`,
        projectId: project1._id,
        taskId: tasks[2]._id,
        metadata: { 
          status: 'done',
          previousStatus: 'in_progress',
          projectName: 'ElectroPi Enterprise Platform',
          actorName: 'Jane Smith'
        },
        read: false,
      },
      {
        recipientId: amara._id,
        actorId: member3._id,
        type: 'task_completed',
        title: 'Task "Build push notification system" completed',
        body: 'Alice Johnson finished this task ahead of schedule',
        href: `/projects/${project2.slug}/tasks/${tasks[7]._id}`,
        projectId: project2._id,
        taskId: tasks[7]._id,
        metadata: { 
          status: 'done',
          projectName: 'Customer Mobile App',
          actorName: 'Alice Johnson',
          hoursSpent: 12
        },
        read: false,
      },
      {
        recipientId: amara._id,
        actorId: member1._id,
        type: 'task_updated',
        title: 'Task "Implement real-time device monitoring" started',
        body: 'John Doe began working on this task',
        href: `/projects/${project1.slug}/tasks/${tasks[1]._id}`,
        projectId: project1._id,
        taskId: tasks[1]._id,
        metadata: { 
          status: 'in_progress',
          previousStatus: 'todo',
          projectName: 'ElectroPi Enterprise Platform',
          actorName: 'John Doe'
        },
        read: false,
      },

      // Project Member Notifications (Read)
      {
        recipientId: amara._id,
        actorId: manager1._id,
        type: 'project_member_added',
        title: 'You were added to "Hardware Integration Platform"',
        body: 'Sarah Williams added you as an editor',
        href: `/projects/${project4.slug}`,
        projectId: project4._id,
        metadata: { 
          role: 'editor',
          projectName: 'Hardware Integration Platform',
          actorName: 'Sarah Williams'
        },
        read: true,
        readAt: new Date(now - 2 * 24 * 60 * 60 * 1000), // Read 2 days ago
      },

      // System Notifications (Read)
      {
        recipientId: amara._id,
        actorId: null,
        type: 'system',
        title: 'Welcome to ElectroPi Task Manager!',
        body: 'Your account has been successfully set up. Start by creating your first project.',
        href: '/projects/new',
        metadata: { 
          systemMessage: true,
          priority: 'info'
        },
        read: true,
        readAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // Read 7 days ago
      },
      {
        recipientId: amara._id,
        actorId: null,
        type: 'system',
        title: '5 tasks due tomorrow',
        body: 'You have urgent tasks requiring attention',
        href: '/tasks?filter=due-tomorrow',
        metadata: { 
          taskCount: 5,
          urgentCount: 2,
          highCount: 3
        },
        read: true,
        readAt: new Date(now - 1 * 60 * 60 * 1000), // Read 1 hour ago
      },

      // ========== OTHER USERS' NOTIFICATIONS ==========

      // Member1 (John Doe) notifications
      {
        recipientId: member1._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'Amara Okafar assigned you to "Implement real-time device monitoring"',
        body: 'High priority task due tomorrow',
        href: `/projects/${project1.slug}/tasks/${tasks[1]._id}`,
        projectId: project1._id,
        taskId: tasks[1]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          dueDate: formatDate(tomorrow),
          projectName: 'ElectroPi Enterprise Platform',
          actorName: 'Amara Okafar'
        },
        read: false,
      },
      {
        recipientId: member1._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Build device health monitoring alerts"',
        body: 'Task in IoT Device Management System',
        href: `/projects/${project3.slug}/tasks/${tasks[11]._id}`,
        projectId: project3._id,
        taskId: tasks[11]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          projectName: 'IoT Device Management System'
        },
        read: false,
      },
      {
        recipientId: member1._id,
        actorId: manager1._id,
        type: 'project_member_added',
        title: 'Sarah Williams added you to "Hardware Integration Platform"',
        body: 'You have been given editor access',
        href: `/projects/${project4.slug}`,
        projectId: project4._id,
        metadata: { 
          role: 'editor',
          projectName: 'Hardware Integration Platform'
        },
        read: true,
        readAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },

      // Member2 (Jane Smith) notifications
      {
        recipientId: member2._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Implement QR code scanner"',
        body: 'High priority task in Customer Mobile App',
        href: `/projects/${project2.slug}/tasks/${tasks[6]._id}`,
        projectId: project2._id,
        taskId: tasks[6]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          dueDate: formatDate(nextWeek),
          projectName: 'Customer Mobile App'
        },
        read: false,
      },
      {
        recipientId: member2._id,
        actorId: amara._id,
        type: 'task_completed',
        title: 'Great work on "Setup authentication with Azure AD"!',
        body: 'Task marked as complete',
        href: `/projects/${project1.slug}/tasks/${tasks[2]._id}`,
        projectId: project1._id,
        taskId: tasks[2]._id,
        metadata: { 
          status: 'done',
          projectName: 'ElectroPi Enterprise Platform',
          completedBy: 'Jane Smith'
        },
        read: true,
        readAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },
      {
        recipientId: member2._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'Amara Okafar assigned you to "Build sales forecasting model"',
        body: 'High priority ML task in BI Dashboard project',
        href: `/projects/${project5.slug}/tasks/${tasks[20]._id}`,
        projectId: project5._id,
        taskId: tasks[20]._id,
        metadata: { 
          priority: 'high',
          status: 'in_progress',
          projectName: 'Business Intelligence Dashboard'
        },
        read: false,
      },

      // Member3 (Alice Johnson) notifications
      {
        recipientId: member3._id,
        actorId: amara._id,
        type: 'task_completed',
        title: 'Congratulations on completing "Build push notification system"!',
        body: 'Your work was completed ahead of schedule',
        href: `/projects/${project2.slug}/tasks/${tasks[7]._id}`,
        projectId: project2._id,
        taskId: tasks[7]._id,
        metadata: { 
          status: 'done',
          projectName: 'Customer Mobile App',
          hoursSpent: 12
        },
        read: false,
      },
      {
        recipientId: member3._id,
        actorId: manager1._id,
        type: 'task_assigned',
        title: 'Sarah Williams assigned you to "Create automated procurement workflow"',
        body: 'High priority task in Hardware Integration Platform',
        href: `/projects/${project4.slug}/tasks/${tasks[18]._id}`,
        projectId: project4._id,
        taskId: tasks[18]._id,
        metadata: { 
          priority: 'high',
          status: 'todo',
          projectName: 'Hardware Integration Platform'
        },
        read: false,
      },

      // Member4 (Robert Garcia) notifications
      {
        recipientId: member4._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'You were assigned to "Design device catalog page"',
        body: 'High priority UI design task',
        href: `/projects/${project1.slug}/tasks/${tasks[3]._id}`,
        projectId: project1._id,
        taskId: tasks[3]._id,
        metadata: { 
          priority: 'high',
          status: 'todo',
          dueDate: formatDate(nextWeek),
          projectName: 'ElectroPi Enterprise Platform'
        },
        read: false,
      },
      {
        recipientId: member4._id,
        actorId: amara._id,
        type: 'task_completed',
        title: 'Task "Create device diagnostics dashboard" completed',
        body: 'Great job on this deliverable!',
        href: `/projects/${project3.slug}/tasks/${tasks[12]._id}`,
        projectId: project3._id,
        taskId: tasks[12]._id,
        metadata: { 
          status: 'done',
          projectName: 'IoT Device Management System'
        },
        read: true,
        readAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      {
        recipientId: member4._id,
        actorId: amara._id,
        type: 'project_member_added',
        title: 'You were added to "ElectroPi Enterprise Platform"',
        body: 'Amara Okafar added you as an editor',
        href: `/projects/${project1.slug}`,
        projectId: project1._id,
        metadata: { 
          role: 'editor',
          projectName: 'ElectroPi Enterprise Platform'
        },
        read: true,
        readAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      },

      // Member5 (Emily Brown) notifications
      {
        recipientId: member5._id,
        actorId: manager2._id,
        type: 'task_assigned',
        title: 'You were assigned to "Build lead scoring algorithm"',
        body: 'High priority task in Marketing Automation Platform',
        href: `/projects/${project7.slug}/tasks/${tasks[29]._id}`,
        projectId: project7._id,
        taskId: tasks[29]._id,
        metadata: { 
          priority: 'high',
          status: 'todo',
          projectName: 'Marketing Automation Platform'
        },
        read: false,
      },

      // Member6 (David Martinez) notifications
      {
        recipientId: member6._id,
        actorId: amara._id,
        type: 'task_assigned',
        title: 'Amara Okafar assigned you to "Add offline mode support"',
        body: 'Medium priority task for mobile app',
        href: `/projects/${project2.slug}/tasks/${tasks[8]._id}`,
        projectId: project2._id,
        taskId: tasks[8]._id,
        metadata: { 
          priority: 'medium',
          status: 'todo',
          dueDate: formatDate(nextWeek),
          projectName: 'Customer Mobile App'
        },
        read: false,
      },

      // Manager1 (Sarah Williams) notifications
      {
        recipientId: manager1._id,
        actorId: amara._id,
        type: 'task_completed',
        title: 'Task "Design executive dashboard UI" completed',
        body: 'Dashboard design has been approved',
        href: `/projects/${project5.slug}/tasks/${tasks[21]._id}`,
        projectId: project5._id,
        taskId: tasks[21]._id,
        metadata: { 
          status: 'done',
          projectName: 'Business Intelligence Dashboard'
        },
        read: true,
        readAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },
      {
        recipientId: manager1._id,
        actorId: member1._id,
        type: 'task_status_changed',
        title: 'Task "Build EDI integration module" is now in progress',
        body: 'John Doe started working on this urgent task',
        href: `/projects/${project4.slug}/tasks/${tasks[16]._id}`,
        projectId: project4._id,
        taskId: tasks[16]._id,
        metadata: { 
          status: 'in_progress',
          previousStatus: 'todo',
          projectName: 'Hardware Integration Platform',
          actorName: 'John Doe'
        },
        read: false,
      },

      // Manager2 (Michael Chen) notifications
      {
        recipientId: manager2._id,
        actorId: member1._id,
        type: 'task_completed',
        title: 'Task "Integrate with CRM system" completed',
        body: 'Salesforce integration is now live',
        href: `/projects/${project7.slug}/tasks/${tasks[29]._id}`,
        projectId: project7._id,
        taskId: tasks[29]._id,
        metadata: { 
          status: 'done',
          projectName: 'Marketing Automation Platform',
          actorName: 'John Doe'
        },
        read: true,
        readAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },
      {
        recipientId: manager2._id,
        actorId: member1._id,
        type: 'task_updated',
        title: 'Task "Setup email campaign templates" updated',
        body: 'John Doe is making progress on email templates',
        href: `/projects/${project7.slug}/tasks/${tasks[28]._id}`,
        projectId: project7._id,
        taskId: tasks[28]._id,
        metadata: { 
          status: 'in_progress',
          projectName: 'Marketing Automation Platform',
          actorName: 'John Doe'
        },
        read: false,
      },

      // Admin notifications
      {
        recipientId: admin._id,
        actorId: null,
        type: 'system',
        title: 'Project "Legacy ERP Migration" archived',
        body: 'All tasks have been completed successfully',
        href: `/projects/${project6.slug}`,
        projectId: project6._id,
        metadata: { 
          status: 'archived',
          projectName: 'Legacy ERP Migration',
          completionRate: 100
        },
        read: true,
        readAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      {
        recipientId: admin._id,
        actorId: null,
        type: 'system',
        title: 'Weekly report: System performance metrics',
        body: 'All systems running smoothly. 98.7% uptime this week.',
        href: '/admin/reports',
        metadata: { 
          uptime: 98.7,
          activeUsers: 11,
          activeProjects: 6
        },
        read: false,
      },
    ]);

    console.log(`✅ Created ${notifications.length} notifications`);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ Comprehensive ElectroPi Database Seeded Successfully!   ║
║                                                               ║
║   🌟 Primary Account (ElectroPi Labs):                       ║
║   ┌───────────────────────────────────────────────────────┐ ║
║   │ Name: Amara Okafar                                    │ ║
║   │ Email: amara@electropi.io                             │ ║
║   │ Password: Amara@123456                                │ ║
║   │ Role: Admin                                           │ ║
║   │ Projects Owned: 5 active projects                     │ ║
║   │ Tasks Assigned: 6 urgent/high priority tasks          │ ║
║   └───────────────────────────────────────────────────────┘ ║
║                                                               ║
║   Additional Test Accounts:                                  ║
║   ┌───────────────────────────────────────────────────────┐ ║
║   │ Admin:                                                │ ║
║   │   Email: admin@taskmanager.com                        │ ║
║   │   Password: Admin@123456                              │ ║
║   ├───────────────────────────────────────────────────────┤ ║
║   │ Manager:                                              │ ║
║   │   Email: manager@taskmanager.com                      │ ║
║   │   Password: Manager@123456                            │ ║
║   ├───────────────────────────────────────────────────────┤ ║
║   │ Member:                                               │ ║
║   │   Email: john@taskmanager.com                         │ ║
║   │   Password: Member@123456                             │ ║
║   └───────────────────────────────────────────────────────┘ ║
║                                                               ║
║   📊 Seeded Data Summary:                                    ║
║   - Users: ${allUsers.length} (including Amara)                           ║
║   - Projects: ${allProjects.length} (5 active, 1 archived)                    ║
║   - Amara's Projects: 5                                      ║
║   - Project Members: ${projectMembers.length}                              ║
║   - Tasks: ${tasks.length}                                                ║
║   - Amara's Tasks: 6 assigned                                ║
║   - Due Tomorrow: 5 tasks                                    ║
║   - Audit Logs: ${auditLogs.length}                                        ║
║   - Notifications: ${notifications.length} (Amara: 10 total, 7 unread)    ║
║                                                               ║
║   🎯 Dashboard Ready:                                        ║
║   - Active projects with real team members                   ║
║   - Urgent tasks due tomorrow                                ║
║   - Recent activity logs visible                             ║
║   - Completed tasks for progress tracking                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
