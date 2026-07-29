import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

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
    console.log('✅ Cleared existing data');

    // ==================== CREATE USERS ====================
    console.log('👥 Creating users...');
    
    // Primary user (Northwind user)
    const amara = await User.create({
      name: 'Amara Okafar',
      email: 'amara@northwind.io',
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
      name: 'Northwind Enterprise Portal',
      description: 'Modern enterprise portal for Northwind Traders with real-time inventory tracking, automated order processing, and advanced analytics dashboard',
      status: 'active',
      ownerId: amara._id,
    });

    const project2 = await Project.create({
      name: 'Customer Mobile App',
      description: 'Native mobile application for iOS and Android enabling customers to browse products, place orders, track shipments, and manage their accounts on the go',
      status: 'active',
      ownerId: amara._id,
    });

    const project3 = await Project.create({
      name: 'Warehouse Management System',
      description: 'Comprehensive WMS with barcode scanning, inventory optimization, automated restocking alerts, and real-time shipment tracking',
      status: 'active',
      ownerId: amara._id,
    });

    const project4 = await Project.create({
      name: 'Supplier Integration Platform',
      description: 'B2B platform connecting Northwind with global suppliers, featuring automated procurement, EDI integration, and supply chain visibility',
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
      // Project 1: Northwind Enterprise Portal - 6 members (Amara's)
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
      
      // Project 3: Warehouse Management System - 4 members (Amara's)
      { projectId: project3._id, userId: amara._id, role: 'owner' },
      { projectId: project3._id, userId: member1._id, role: 'editor' },
      { projectId: project3._id, userId: member4._id, role: 'editor' },
      { projectId: project3._id, userId: member5._id, role: 'viewer' },
      
      // Project 4: Supplier Integration Platform - 7 members
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
      // Project 1 tasks (Northwind Enterprise Portal) - Amara's project
      {
        projectId: project1._id,
        title: 'Review inventory dashboard wireframes',
        description: 'Review and approve the new inventory tracking dashboard designs before development begins',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Implement real-time order tracking',
        description: 'Build WebSocket integration for live order status updates on customer portal',
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
        title: 'Design product catalog page',
        description: 'Create responsive product catalog with advanced filtering and search capabilities',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member4._id,
        creatorId: amara._id,
      },
      {
        projectId: project1._id,
        title: 'Optimize database queries',
        description: 'Improve performance of inventory queries for faster page loads',
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
        title: 'Implement barcode scanner',
        description: 'Add product barcode scanning feature for quick product lookup',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member2._id,
        creatorId: amara._id,
      },
      {
        projectId: project2._id,
        title: 'Build push notification system',
        description: 'Setup Firebase Cloud Messaging for order status notifications',
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
        title: 'Create order history screen',
        description: 'Display customer order history with filtering and search',
        status: 'todo',
        priority: 'medium',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 3 tasks (Warehouse Management System) - Amara's project
      {
        projectId: project3._id,
        title: 'Test barcode scanner integration',
        description: 'Verify barcode scanner hardware works with new WMS system',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: amara._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Build inventory restocking alerts',
        description: 'Automated email alerts when inventory falls below threshold',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Create shipment tracking dashboard',
        description: 'Real-time dashboard showing all active shipments and their status',
        status: 'done',
        priority: 'high',
        dueDate: lastWeek,
        assigneeId: member4._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Implement pick and pack workflow',
        description: 'Digital workflow for warehouse staff to pick and pack orders efficiently',
        status: 'todo',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: member1._id,
        creatorId: amara._id,
      },
      {
        projectId: project3._id,
        title: 'Add warehouse location mapping',
        description: 'Visual map of warehouse with product locations',
        status: 'todo',
        priority: 'low',
        dueDate: twoWeeks,
        assigneeId: null,
        creatorId: amara._id,
      },

      // Project 4 tasks (Supplier Integration Platform)
      {
        projectId: project4._id,
        title: 'Review API documentation',
        description: 'Review supplier API integration documentation and provide feedback',
        status: 'in_progress',
        priority: 'high',
        dueDate: nextWeek,
        assigneeId: amara._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Build EDI integration module',
        description: 'Implement EDI X12 integration for automated purchase orders',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: tomorrow,
        assigneeId: member1._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Setup supplier portal authentication',
        description: 'OAuth 2.0 authentication for supplier portal access',
        status: 'done',
        priority: 'urgent',
        dueDate: lastWeek,
        assigneeId: member2._id,
        creatorId: manager1._id,
      },
      {
        projectId: project4._id,
        title: 'Create automated procurement workflow',
        description: 'Automated purchase order generation based on inventory levels',
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
        changes: { name: 'Northwind Enterprise Portal', status: 'active' },
        metadata: { source: 'web', ip: '192.168.1.100' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project2._id,
        changes: { name: 'Customer Mobile App', status: 'active' },
        metadata: { source: 'web', ip: '192.168.1.100' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project3._id,
        changes: { name: 'Warehouse Management System', status: 'active' },
        metadata: { source: 'web', ip: '192.168.1.100' },
      },
      {
        userId: manager1._id,
        action: 'created',
        entityType: 'project',
        entityId: project4._id,
        changes: { name: 'Supplier Integration Platform', status: 'active' },
        metadata: { source: 'web', ip: '192.168.1.50' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project',
        entityId: project5._id,
        changes: { name: 'Business Intelligence Dashboard', status: 'active' },
        metadata: { source: 'web', ip: '192.168.1.100' },
      },
      
      // Task assignments to Amara
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[0]._id,
        changes: { title: 'Review inventory dashboard wireframes', assignedTo: amara._id.toString(), priority: 'urgent' },
        metadata: { projectName: 'Northwind Enterprise Portal', dueDate: formatDate(tomorrow) },
      },
      {
        userId: amara._id,
        action: 'status_changed',
        entityType: 'task',
        entityId: tasks[0]._id,
        changes: { from: 'todo', to: 'in_progress' },
        metadata: { startedAt: now, comment: 'Started reviewing wireframes' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[5]._id,
        changes: { title: 'Approve app store screenshots', assignedTo: amara._id.toString(), priority: 'high' },
        metadata: { projectName: 'Customer Mobile App', dueDate: formatDate(tomorrow) },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[10]._id,
        changes: { title: 'Test barcode scanner integration', assignedTo: amara._id.toString(), priority: 'urgent' },
        metadata: { projectName: 'Warehouse Management System', dueDate: formatDate(tomorrow) },
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
        changes: { userId: manager1._id.toString(), role: 'editor' },
        metadata: { projectName: 'Northwind Enterprise Portal', addedBy: 'Amara Okafar' },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'project_member',
        entityId: projectMembers[2]._id,
        changes: { userId: member1._id.toString(), role: 'editor' },
        metadata: { projectName: 'Northwind Enterprise Portal', addedBy: 'Amara Okafar' },
      },
      {
        userId: manager1._id,
        action: 'created',
        entityType: 'project_member',
        entityId: projectMembers[17]._id,
        changes: { userId: amara._id.toString(), role: 'editor' },
        metadata: { projectName: 'Supplier Integration Platform', addedBy: 'Sarah Williams' },
      },
      
      // Project updates
      {
        userId: admin._id,
        action: 'updated',
        entityType: 'project',
        entityId: project6._id,
        changes: { status: 'archived', previousStatus: 'active' },
        metadata: { reason: 'Migration completed successfully', archivedAt: lastWeek },
      },
      
      // Additional task activity
      {
        userId: amara._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[19]._id,
        changes: { priority: 'high', previousPriority: 'medium', dueDate: formatDate(tomorrow) },
        metadata: { reason: 'Executive team needs KPIs finalized urgently' },
      },
      {
        userId: member2._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[6]._id,
        changes: { progress: 75, comment: 'Barcode scanner implementation nearly complete' },
        metadata: { taskTitle: 'Implement barcode scanner', estimatedCompletion: formatDate(nextWeek) },
      },
      {
        userId: amara._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[15]._id,
        changes: { title: 'Review API documentation', assignedTo: amara._id.toString(), priority: 'high' },
        metadata: { projectName: 'Supplier Integration Platform', dueDate: formatDate(nextWeek) },
      },
    ]);

    console.log(`✅ Created ${auditLogs.length} audit logs`);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ Comprehensive Northwind Database Seeded Successfully!   ║
║                                                               ║
║   🌟 Primary Account (Northwind):                            ║
║   ┌───────────────────────────────────────────────────────┐ ║
║   │ Name: Amara Okafar                                    │ ║
║   │ Email: amara@northwind.io                             │ ║
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
