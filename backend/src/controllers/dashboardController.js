import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  let projectQuery = {};
  let taskQuery = {};

  // Admin can see all stats
  if (req.user.role !== 'admin') {
    // Get projects where user is owner or member
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const ownedProjects = await Project.find({ ownerId: req.user._id }).select('_id');

    const accessibleProjectIds = [
      ...memberships.map((m) => m.projectId),
      ...ownedProjects.map((p) => p._id),
    ];

    projectQuery = {
      $or: [{ ownerId: req.user._id }, { _id: { $in: memberships.map((m) => m.projectId) } }],
    };

    taskQuery = { projectId: { $in: accessibleProjectIds } };
  }

  // Get counts
  const totalProjects = await Project.countDocuments(projectQuery);
  const totalTasks = await Task.countDocuments(taskQuery);
  const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'done' });
  const pendingTasks = await Task.countDocuments({
    ...taskQuery,
    status: { $in: ['todo', 'in_progress'] },
  });

  res.json({
    success: true,
    data: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
    },
  });
});

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity events
 * @access  Private
 */
export const getDashboardActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  let activityQuery = {};

  // Admin can see all activity
  if (req.user.role !== 'admin') {
    // Get accessible projects
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const ownedProjects = await Project.find({ ownerId: req.user._id }).select('_id');

    const accessibleProjectIds = [
      ...memberships.map((m) => m.projectId.toString()),
      ...ownedProjects.map((p) => p._id.toString()),
    ];

    // Only show activity for accessible projects or user's own actions
    activityQuery = {
      $or: [
        { userId: req.user._id },
        { resourceId: { $in: accessibleProjectIds } },
      ],
    };
  }

  // Get recent audit logs
  const logs = await AuditLog.find(activityQuery)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  // Transform to activity events format
  const activities = logs.map((log) => ({
    id: log._id.toString(),
    type: log.action,
    message: formatActivityMessage(log),
    user: log.userId ? {
      id: log.userId._id.toString(),
      name: log.userId.name,
      email: log.userId.email,
    } : null,
    timestamp: log.createdAt,
    metadata: log.metadata,
  }));

  res.json({
    success: true,
    data: activities,
  });
});

/**
 * Format activity log message
 */
function formatActivityMessage(log) {
  const userName = log.userId?.name || 'Someone';
  
  switch (log.action) {
    case 'create':
      return `${userName} created ${log.resourceType} "${log.metadata?.name || log.resourceId}"`;
    case 'update':
      return `${userName} updated ${log.resourceType} "${log.metadata?.name || log.resourceId}"`;
    case 'delete':
      return `${userName} deleted ${log.resourceType}`;
    case 'login':
      return `${userName} logged in`;
    case 'logout':
      return `${userName} logged out`;
    case 'register':
      return `${userName} registered`;
    default:
      return `${userName} performed ${log.action} on ${log.resourceType}`;
  }
}
