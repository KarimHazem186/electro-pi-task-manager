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
        { entityId: { $in: accessibleProjectIds } },
      ],
    };
  }

  // Get recent audit logs
  const logs = await AuditLog.find(activityQuery)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  // For logs missing metadata names, fetch entity names from DB in bulk
  const taskIds = [];
  const projectIds = [];
  for (const log of logs) {
    if (!log.metadata?.title && !log.metadata?.name && log.entityId) {
      if (log.entityType === 'task') taskIds.push(log.entityId);
      else if (log.entityType === 'project') projectIds.push(log.entityId);
    }
  }

  // Bulk fetch only what we need
  const [taskMap, projectMap] = await Promise.all([
    taskIds.length
      ? Task.find({ _id: { $in: taskIds } }, 'title projectId').then((docs) =>
          docs.reduce((m, d) => { m[d._id.toString()] = { title: d.title, projectId: d.projectId?.toString() }; return m; }, {}),
        )
      : {},
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } }, 'name slug').then((docs) =>
          docs.reduce((m, d) => { m[d._id.toString()] = { name: d.name, slug: d.slug }; return m; }, {}),
        )
      : {},
  ]);

  // Also fetch slugs for tasks that have projectId in metadata
  const metadataProjectIds = logs
    .filter((log) => log.entityType === 'task' && log.metadata?.projectId)
    .map((log) => log.metadata.projectId.toString());
  const allProjectIds = [...new Set([...projectIds.map(String), ...metadataProjectIds])];
  const slugMap = allProjectIds.length
    ? await Project.find({ _id: { $in: allProjectIds } }, 'slug').then((docs) =>
        docs.reduce((m, d) => { m[d._id.toString()] = d.slug; return m; }, {}),
      )
    : {};

  // Transform to activity events format
  const activities = logs.map((log) => {
    const target = resolveTarget(log, taskMap, projectMap);
    const href = resolveHref(log, taskMap, projectMap, slugMap);
    return {
      id: log._id.toString(),
      type: log.action,
      message: formatActivityMessage(log, target),
      user: log.userId ? {
        id: log.userId._id.toString(),
        name: log.userId.name,
        email: log.userId.email,
      } : null,
      actor: log.userId ? {
        id: log.userId._id.toString(),
        name: log.userId.name,
        email: log.userId.email,
      } : null,
      action: formatAction(log.action),
      target,
      href,
      entityType: log.entityType,
      timestamp: log.createdAt,
      createdAt: log.createdAt,
      metadata: log.metadata,
    };
  });

  res.json({
    success: true,
    data: activities,
  });
});

/**
 * Format activity log message
 */
function formatActivityMessage(log, target) {
  const userName = log.userId?.name || 'Someone';
  
  switch (log.action) {
    case 'created':
      return `${userName} created ${log.entityType} "${target}"`;
    case 'updated':
      return `${userName} updated ${log.entityType} "${target}"`;
    case 'deleted':
      return `${userName} deleted ${log.entityType} "${target}"`;
    case 'status_changed':
      return `${userName} changed status of "${target}" from ${log.changes?.from} to ${log.changes?.to}`;
    default:
      return `${userName} performed ${log.action} on ${log.entityType}`;
  }
}

/**
 * Human-readable action verb
 */
function formatAction(action) {
  switch (action) {
    case 'created': return 'created';
    case 'updated': return 'updated';
    case 'deleted': return 'deleted';
    case 'status_changed': return 'changed status of';
    default: return action;
  }
}

/**
 * Resolve the display name of the entity, using DB lookup maps for missing metadata
 */
function resolveTarget(log, taskMap, projectMap) {
  // Prefer stored metadata name/title
  if (log.metadata?.title) return log.metadata.title;
  if (log.metadata?.name) return log.metadata.name;

  // Fall back to DB lookup
  const id = log.entityId?.toString();
  if (!id) return '';
  if (log.entityType === 'task') return taskMap[id]?.title || id;
  if (log.entityType === 'project') return projectMap[id]?.name || id;
  return id;
}

/**
 * Build a navigable href for the activity event
 * - project  → /projects/:slug
 * - task     → /projects/:projectSlug  (tasks live inside a project board)
 */
function resolveHref(log, taskMap, projectMap, slugMap) {
  const id = log.entityId?.toString();
  if (!id) return null;

  if (log.entityType === 'project') {
    const slug = projectMap[id]?.slug || slugMap[id];
    return slug ? `/projects/${slug}` : null;
  }

  if (log.entityType === 'task') {
    // Get projectId from metadata or from DB lookup
    const projectId =
      (log.metadata?.projectId || taskMap[id]?.projectId || '').toString();
    const slug = slugMap[projectId];
    return slug ? `/projects/${slug}` : null;
  }

  return null;
}
