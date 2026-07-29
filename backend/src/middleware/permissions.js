import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const PROJECT_ROLE_ORDER = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

/**
 * Resolve the effective project role for a user. Returns 'owner' for admins
 * and project owners, the membership role for members, and `null` for users
 * with no access.
 */
export const getEffectiveProjectRole = async (projectId, user) => {
  if (!projectId || !user) return null;

  if (user.role === 'admin') {
    return 'owner';
  }

  const project = await Project.findById(projectId).select('ownerId');
  if (!project) return null;

  if (project.ownerId.toString() === user._id.toString()) {
    return 'owner';
  }

  const membership = await ProjectMember.findOne({
    projectId,
    userId: user._id,
  }).select('role');

  return membership?.role ?? null;
};

export const hasProjectRoleAtLeast = (currentRole, requiredRole) => {
  if (!currentRole || !requiredRole) return false;
  return PROJECT_ROLE_ORDER[currentRole] >= PROJECT_ROLE_ORDER[requiredRole];
};

/**
 * Check if user has access to a project
 * Optional requiredRole: viewer | editor | owner
 */
export const checkProjectAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required',
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const role = await getEffectiveProjectRole(projectId, req.user);

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
      }

      if (requiredRole && !hasProjectRoleAtLeast(role, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `This action requires '${requiredRole}' role on the project`,
        });
      }

      req.project = project;
      req.projectRole = role;
      if (role !== 'owner' || project.ownerId.toString() !== req.user._id.toString()) {
        const membership = await ProjectMember.findOne({
          projectId,
          userId: req.user._id,
        });
        if (membership) req.membership = membership;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has access to a task through its project.
 * Optional requiredRole: viewer | editor | owner
 */
export const checkTaskAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id || req.params.taskId;

      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
      }

      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      const role = await getEffectiveProjectRole(task.projectId, req.user);

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this task',
        });
      }

      if (requiredRole && !hasProjectRoleAtLeast(role, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `This action requires '${requiredRole}' role on the task's project`,
        });
      }

      req.task = task;
      req.projectRole = role;
      const project = await Project.findById(task.projectId);
      if (project) req.project = project;
      next();
    } catch (error) {
      next(error);
    }
  };
};
