import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

/**
 * Check if user has access to a project
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

      // Check if user is project owner
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Admin can access all projects
      if (req.user.role === 'admin') {
        req.project = project;
        return next();
      }

      // Owner has full access
      if (project.ownerId.toString() === req.user._id.toString()) {
        req.project = project;
        return next();
      }

      // Check project membership
      const membership = await ProjectMember.findOne({
        projectId,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
      }

      // Check role requirements
      if (requiredRole) {
        const roleHierarchy = { viewer: 1, editor: 2, owner: 3 };
        
        if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
          return res.status(403).json({
            success: false,
            message: `This action requires '${requiredRole}' role`,
          });
        }
      }

      req.project = project;
      req.membership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can modify a task
 */
export const checkTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check project access
    const project = await Project.findById(task.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Admin can access all tasks
    if (req.user.role === 'admin') {
      req.task = task;
      req.project = project;
      return next();
    }

    // Project owner can modify all tasks
    if (project.ownerId.toString() === req.user._id.toString()) {
      req.task = task;
      req.project = project;
      return next();
    }

    // Check if user is a project member with editor or owner role
    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId: req.user._id,
    });

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this task',
      });
    }

    req.task = task;
    req.project = project;
    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};
