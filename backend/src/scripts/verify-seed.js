import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

/**
 * Verify Seed Data
 * 
 * This script checks that the database was seeded correctly
 * and reports statistics about the data.
 */

const verifySeed = async () => {
  try {
    console.log('🔍 Verifying seeded data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count all documents
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const projectMemberCount = await ProjectMember.countDocuments();
    const taskCount = await Task.countDocuments();
    const auditLogCount = await AuditLog.countDocuments();

    // User statistics
    const adminCount = await User.countDocuments({ role: 'admin' });
    const managerCount = await User.countDocuments({ role: 'manager' });
    const memberCount = await User.countDocuments({ role: 'member' });

    // Project statistics
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const archivedProjects = await Project.countDocuments({ status: 'archived' });

    // Task statistics
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    const doneTasks = await Task.countDocuments({ status: 'done' });

    const urgentTasks = await Task.countDocuments({ priority: 'urgent' });
    const highTasks = await Task.countDocuments({ priority: 'high' });
    const mediumTasks = await Task.countDocuments({ priority: 'medium' });
    const lowTasks = await Task.countDocuments({ priority: 'low' });

    const assignedTasks = await Task.countDocuments({ assigneeId: { $ne: null } });
    const unassignedTasks = await Task.countDocuments({ assigneeId: null });

    // Relationship checks
    const projectsWithOwners = await Project.countDocuments({ ownerId: { $exists: true } });
    const tasksWithCreators = await Task.countDocuments({ creatorId: { $exists: true } });
    const auditLogsWithUsers = await AuditLog.countDocuments({ userId: { $exists: true } });

    // Sample data checks
    const sampleUser = await User.findOne({ email: 'admin@taskmanager.com' }).select('name email role');
    const sampleProject = await Project.findOne({ status: 'active' }).select('name status slug');
    const sampleTask = await Task.findOne().populate('assigneeId', 'name email').populate('creatorId', 'name');

    // Print Results
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              📊 DATABASE VERIFICATION REPORT              ║');
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  📈 Document Counts                                       ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Users:            ${userCount.toString().padEnd(35)} ║`);
    console.log(`║  Projects:         ${projectCount.toString().padEnd(35)} ║`);
    console.log(`║  Project Members:  ${projectMemberCount.toString().padEnd(35)} ║`);
    console.log(`║  Tasks:            ${taskCount.toString().padEnd(35)} ║`);
    console.log(`║  Audit Logs:       ${auditLogCount.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  👥 User Breakdown                                        ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Admins:           ${adminCount.toString().padEnd(35)} ║`);
    console.log(`║  Managers:         ${managerCount.toString().padEnd(35)} ║`);
    console.log(`║  Members:          ${memberCount.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  📁 Project Status                                        ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Active:           ${activeProjects.toString().padEnd(35)} ║`);
    console.log(`║  Archived:         ${archivedProjects.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  📝 Task Status                                           ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Todo:             ${todoTasks.toString().padEnd(35)} ║`);
    console.log(`║  In Progress:      ${inProgressTasks.toString().padEnd(35)} ║`);
    console.log(`║  Done:             ${doneTasks.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  🎯 Task Priority                                         ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Urgent:           ${urgentTasks.toString().padEnd(35)} ║`);
    console.log(`║  High:             ${highTasks.toString().padEnd(35)} ║`);
    console.log(`║  Medium:           ${mediumTasks.toString().padEnd(35)} ║`);
    console.log(`║  Low:              ${lowTasks.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  📌 Task Assignment                                       ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Assigned:         ${assignedTasks.toString().padEnd(35)} ║`);
    console.log(`║  Unassigned:       ${unassignedTasks.toString().padEnd(35)} ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  🔗 Relationship Integrity                                ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Projects with owners:      ${projectsWithOwners}/${projectCount}                      ║`);
    console.log(`║  Tasks with creators:       ${tasksWithCreators}/${taskCount}                     ║`);
    console.log(`║  Audit logs with users:     ${auditLogsWithUsers}/${auditLogCount}                     ║`);
    console.log('║                                                           ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  🔍 Sample Data                                           ║');
    console.log('║  ─────────────────────────────────────────────────────    ║');
    if (sampleUser) {
      console.log(`║  User: ${sampleUser.name.padEnd(47)} ║`);
      console.log(`║    Email: ${sampleUser.email.padEnd(44)} ║`);
      console.log(`║    Role: ${sampleUser.role.padEnd(45)} ║`);
    }
    console.log('║                                                           ║');
    if (sampleProject) {
      console.log(`║  Project: ${sampleProject.name.padEnd(43)} ║`);
      console.log(`║    Slug: ${sampleProject.slug.padEnd(45)} ║`);
      console.log(`║    Status: ${sampleProject.status.padEnd(43)} ║`);
    }
    console.log('║                                                           ║');
    if (sampleTask) {
      console.log(`║  Task: ${sampleTask.title.substring(0, 45).padEnd(47)} ║`);
      if (sampleTask.assigneeId) {
        console.log(`║    Assigned to: ${sampleTask.assigneeId.name.padEnd(37)} ║`);
      }
      if (sampleTask.creatorId) {
        console.log(`║    Created by: ${sampleTask.creatorId.name.padEnd(38)} ║`);
      }
    }
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Validation
    console.log('\n🧪 Running validation checks...\n');

    const checks = [
      { name: 'Users exist', pass: userCount >= 10, expected: '10+', actual: userCount },
      { name: 'Projects exist', pass: projectCount >= 7, expected: '7+', actual: projectCount },
      { name: 'Tasks exist', pass: taskCount >= 12, expected: '12+', actual: taskCount },
      { name: 'Admin exists', pass: adminCount >= 1, expected: '1+', actual: adminCount },
      { name: 'All projects have owners', pass: projectsWithOwners === projectCount, expected: projectCount, actual: projectsWithOwners },
      { name: 'All tasks have creators', pass: tasksWithCreators === taskCount, expected: taskCount, actual: tasksWithCreators },
      { name: 'Audit logs exist', pass: auditLogCount > 0, expected: '1+', actual: auditLogCount },
    ];

    let allPassed = true;
    checks.forEach(check => {
      const status = check.pass ? '✅' : '❌';
      const result = check.pass ? 'PASS' : 'FAIL';
      console.log(`${status} ${check.name}: ${result} (Expected: ${check.expected}, Got: ${check.actual})`);
      if (!check.pass) allPassed = false;
    });

    console.log();
    if (allPassed) {
      console.log('🎉 All validation checks passed!');
      console.log('✅ Database is properly seeded and ready to use.\n');
    } else {
      console.log('⚠️  Some validation checks failed.');
      console.log('❌ Please re-run the seed script: npm run seed\n');
    }

    await mongoose.connection.close();
    console.log('👋 Connection closed.');
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Error verifying seed data:', error);
    process.exit(1);
  }
};

verifySeed();
