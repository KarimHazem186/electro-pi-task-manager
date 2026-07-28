import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
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
