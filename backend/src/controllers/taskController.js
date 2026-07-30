import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/error.js';
import { emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitTaskStatusChanged } from '../config/socket.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper.js';
import {
  notifyTaskAssigned,
  notifyTaskUpdated,
  notifyTaskCompleted,
} from '../services/notificationService.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filters
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    pageSize = 8,
    search = '',
    sortBy = 'createdAt',
    sortDir = 'desc',
    projectId,
    status,
    priority,
    assigneeId,
  } = req.query;

  const limit = parseInt(pageSize);
  const skip = (parseInt(page) - 1) * limit;

  // Build query
  let query = {};

  // Filter by projects user has access to
  if (req.user.role !== 'admin') {
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const ownedProjects = await Project.find({ ownerId: req.user._id }).select('_id');
    
    const accessibleProjectIds = [
      ...memberships.map((m) => m.projectId.toString()),
      ...ownedProjects.map((p) => p._id.toString()),
    ];

    if (projectId) {
      if (!accessibleProjectIds.includes(projectId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
      }
      query.projectId = projectId;
    } else {
      query.projectId = { $in: accessibleProjectIds };
    }
  } else if (projectId) {
    query.projectId = projectId;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  if (assigneeId && assigneeId !== 'all') {
    query.assigneeId = assigneeId;
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortDir === 'asc' ? 1 : -1;

  const tasks = await Task.find(query)
    .populate('assigneeId', 'name email avatarUrl role')
    .populate('creatorId', 'name email avatarUrl role')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(query);

  // Transform tasks
  const transformedTasks = tasks.map((task) => {
    const taskObj = task.toObject();
    // When populated, assigneeId becomes the full user object
    if (taskObj.assigneeId && typeof taskObj.assigneeId === 'object') {
      taskObj.assignee = {
        id: taskObj.assigneeId._id.toString(),
        name: taskObj.assigneeId.name,
        email: taskObj.assigneeId.email,
        avatarUrl: taskObj.assigneeId.avatarUrl,
        role: taskObj.assigneeId.role,
      };
      taskObj.assigneeId = taskObj.assigneeId._id.toString();
    } else {
      taskObj.assigneeId = taskObj.assigneeId?.toString() || null;
      taskObj.assignee = null;
    }
    
    // Same for creatorId
    if (taskObj.creatorId && typeof taskObj.creatorId === 'object') {
      taskObj.creator = {
        id: taskObj.creatorId._id.toString(),
        name: taskObj.creatorId.name,
        email: taskObj.creatorId.email,
        avatarUrl: taskObj.creatorId.avatarUrl,
        role: taskObj.creatorId.role,
      };
      taskObj.creatorId = taskObj.creatorId._id.toString();
    } else {
      taskObj.creatorId = taskObj.creatorId?.toString();
    }
    
    taskObj.id = taskObj._id.toString();
    taskObj.projectId = taskObj.projectId.toString();
    delete taskObj._id;
    delete taskObj.__v;
    
    return taskObj;
  });

  res.json({
    success: true,
    data: transformedTasks,
    page: parseInt(page),
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/tasks/all
 * @desc    Get all tasks without pagination (for Kanban)
 * @access  Private
 */
export const getAllTasks = asyncHandler(async (req, res) => {
  const { search = '', projectId, status, priority, assigneeId } = req.query;

  // Build query
  let query = {};

  // Filter by projects user has access to
  if (req.user.role !== 'admin') {
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const ownedProjects = await Project.find({ ownerId: req.user._id }).select('_id');
    
    const accessibleProjectIds = [
      ...memberships.map((m) => m.projectId.toString()),
      ...ownedProjects.map((p) => p._id.toString()),
    ];

    if (projectId) {
      if (!accessibleProjectIds.includes(projectId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project',
        });
      }
      query.projectId = projectId;
    } else {
      query.projectId = { $in: accessibleProjectIds };
    }
  } else if (projectId) {
    query.projectId = projectId;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  if (assigneeId && assigneeId !== 'all') {
    query.assigneeId = assigneeId;
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  const tasks = await Task.find(query)
    .populate('assigneeId', 'name email avatarUrl role')
    .populate('creatorId', 'name email avatarUrl role')
    .sort({ createdAt: -1 });

  // Transform tasks
  const transformedTasks = tasks.map((task) => {
    const taskObj = task.toObject();
    // When populated, assigneeId becomes the full user object
    if (taskObj.assigneeId && typeof taskObj.assigneeId === 'object') {
      taskObj.assignee = {
        id: taskObj.assigneeId._id.toString(),
        name: taskObj.assigneeId.name,
        email: taskObj.assigneeId.email,
        avatarUrl: taskObj.assigneeId.avatarUrl,
        role: taskObj.assigneeId.role,
      };
      taskObj.assigneeId = taskObj.assigneeId._id.toString();
    } else {
      taskObj.assigneeId = taskObj.assigneeId?.toString() || null;
      taskObj.assignee = null;
    }
    
    // Same for creatorId
    if (taskObj.creatorId && typeof taskObj.creatorId === 'object') {
      taskObj.creator = {
        id: taskObj.creatorId._id.toString(),
        name: taskObj.creatorId.name,
        email: taskObj.creatorId.email,
        avatarUrl: taskObj.creatorId.avatarUrl,
        role: taskObj.creatorId.role,
      };
      taskObj.creatorId = taskObj.creatorId._id.toString();
    } else {
      taskObj.creatorId = taskObj.creatorId?.toString();
    }
    
    taskObj.id = taskObj._id.toString();
    taskObj.projectId = taskObj.projectId.toString();
    delete taskObj._id;
    delete taskObj.__v;
    
    return taskObj;
  });

  res.json({
    success: true,
    data: transformedTasks,
  });
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assigneeId', 'name email avatarUrl role')
    .populate('creatorId', 'name email avatarUrl role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check if user has access to the project
  const project = await Project.findById(task.projectId);

  if (req.user.role !== 'admin' && project.ownerId.toString() !== req.user._id.toString()) {
    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task',
      });
    }
  }

  const taskObj = task.toObject();
  // When populated, assigneeId becomes the full user object
  if (taskObj.assigneeId && typeof taskObj.assigneeId === 'object') {
    taskObj.assignee = {
      id: taskObj.assigneeId._id.toString(),
      name: taskObj.assigneeId.name,
      email: taskObj.assigneeId.email,
      avatarUrl: taskObj.assigneeId.avatarUrl,
      role: taskObj.assigneeId.role,
    };
    taskObj.assigneeId = taskObj.assigneeId._id.toString();
  } else {
    taskObj.assigneeId = taskObj.assigneeId?.toString() || null;
    taskObj.assignee = null;
  }
  
  // Same for creatorId
  if (taskObj.creatorId && typeof taskObj.creatorId === 'object') {
    taskObj.creator = {
      id: taskObj.creatorId._id.toString(),
      name: taskObj.creatorId.name,
      email: taskObj.creatorId.email,
      avatarUrl: taskObj.creatorId.avatarUrl,
      role: taskObj.creatorId.role,
    };
    taskObj.creatorId = taskObj.creatorId._id.toString();
  } else {
    taskObj.creatorId = taskObj.creatorId?.toString();
  }
  
  taskObj.id = taskObj._id.toString();
  taskObj.projectId = taskObj.projectId.toString();
  delete taskObj._id;
  delete taskObj.__v;

  res.json({
    success: true,
    data: taskObj,
  });
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;

  // Check if user has access to the project
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  if (req.user.role !== 'admin' && project.ownerId.toString() !== req.user._id.toString()) {
    const membership = await ProjectMember.findOne({
      projectId,
      userId: req.user._id,
    });

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create tasks in this project',
      });
    }
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    assigneeId: assigneeId || null,
    projectId,
    creatorId: req.user._id,
  });

  // Populate references
  const populatedTask = await Task.findById(task._id)
    .populate('assigneeId', 'name email avatarUrl role')
    .populate('creatorId', 'name email avatarUrl role');

  // Transform task
  const taskObj = populatedTask.toObject();
  // When populated, assigneeId becomes the full user object
  if (taskObj.assigneeId && typeof taskObj.assigneeId === 'object') {
    taskObj.assignee = {
      id: taskObj.assigneeId._id.toString(),
      name: taskObj.assigneeId.name,
      email: taskObj.assigneeId.email,
      avatarUrl: taskObj.assigneeId.avatarUrl,
      role: taskObj.assigneeId.role,
    };
    taskObj.assigneeId = taskObj.assigneeId._id.toString();
  } else {
    taskObj.assigneeId = taskObj.assigneeId?.toString() || null;
    taskObj.assignee = null;
  }
  
  // Same for creatorId
  if (taskObj.creatorId && typeof taskObj.creatorId === 'object') {
    taskObj.creator = {
      id: taskObj.creatorId._id.toString(),
      name: taskObj.creatorId.name,
      email: taskObj.creatorId.email,
      avatarUrl: taskObj.creatorId.avatarUrl,
      role: taskObj.creatorId.role,
    };
    taskObj.creatorId = taskObj.creatorId._id.toString();
  } else {
    taskObj.creatorId = taskObj.creatorId?.toString();
  }
  
  taskObj.id = taskObj._id.toString();
  taskObj.projectId = taskObj.projectId.toString();
  delete taskObj._id;
  delete taskObj.__v;

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'created',
    entityType: 'task',
    entityId: task._id,
    metadata: { title: task.title, projectId },
  });

  // Emit socket event
  emitTaskCreated(projectId.toString(), taskObj);

  // Fire-and-forget personal notification + email when the task is assigned
  notifyTaskAssigned({ task: taskObj, project, actorId: req.user._id }).catch((err) =>
    console.error('notifyTaskAssigned error:', err.message),
  );

  res.status(201).json({
    success: true,
    data: taskObj,
  });
});

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Get project first for later use
  const project = await Project.findById(task.projectId);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check permissions
  // Admins can edit any task
  // Task creator can edit their task
  // Task assignee can edit their assigned task
  // Project editors can edit tasks in their project
  const isAdmin = req.user.role === 'admin';
  const isCreator = task.creatorId.toString() === req.user._id.toString();
  const isAssignee = task.assigneeId && task.assigneeId.toString() === req.user._id.toString();

  if (!isAdmin && !isCreator && !isAssignee) {
    // Check project role
    if (project.ownerId.toString() !== req.user._id.toString()) {
      const membership = await ProjectMember.findOne({
        projectId: task.projectId,
        userId: req.user._id,
      });

      if (!membership || membership.role === 'viewer') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this task',
        });
      }
    }
  }

  const oldStatus = task.status;
  const changes = {};

  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      changes[field] = req.body[field];
    }
  });

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, changes, {
    new: true,
    runValidators: true,
  })
    .populate('assigneeId', 'name email avatarUrl role')
    .populate('creatorId', 'name email avatarUrl role');

  // Transform task
  const taskObj = updatedTask.toObject();
  // When populated, assigneeId becomes the full user object
  if (taskObj.assigneeId && typeof taskObj.assigneeId === 'object') {
    taskObj.assignee = {
      id: taskObj.assigneeId._id.toString(),
      name: taskObj.assigneeId.name,
      email: taskObj.assigneeId.email,
      avatarUrl: taskObj.assigneeId.avatarUrl,
      role: taskObj.assigneeId.role,
    };
    taskObj.assigneeId = taskObj.assigneeId._id.toString();
  } else {
    taskObj.assigneeId = taskObj.assigneeId?.toString() || null;
    taskObj.assignee = null;
  }
  
  // Same for creatorId
  if (taskObj.creatorId && typeof taskObj.creatorId === 'object') {
    taskObj.creator = {
      id: taskObj.creatorId._id.toString(),
      name: taskObj.creatorId.name,
      email: taskObj.creatorId.email,
      avatarUrl: taskObj.creatorId.avatarUrl,
      role: taskObj.creatorId.role,
    };
    taskObj.creatorId = taskObj.creatorId._id.toString();
  } else {
    taskObj.creatorId = taskObj.creatorId?.toString();
  }
  
  taskObj.id = taskObj._id.toString();
  taskObj.projectId = taskObj.projectId.toString();
  delete taskObj._id;
  delete taskObj.__v;

  // Log status change
  if (changes.status && changes.status !== oldStatus) {
    await AuditLog.create({
      userId: req.user._id,
      action: 'status_changed',
      entityType: 'task',
      entityId: task._id,
      changes: { from: oldStatus, to: changes.status },
      metadata: { title: task.title },
    });
    // Emit status changed event
    emitTaskStatusChanged(task.projectId.toString(), taskObj);

    if (changes.status === 'done') {
      notifyTaskCompleted({ task: taskObj, project, actor: req.user }).catch((err) =>
        console.error('notifyTaskCompleted error:', err.message),
      );
    }
  } else {
    await AuditLog.create({
      userId: req.user._id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      changes,
      metadata: { title: task.title },
    });
    // Emit updated event
    emitTaskUpdated(task.projectId.toString(), taskObj);

    notifyTaskUpdated({
      task: taskObj,
      project,
      actor: req.user,
      changes,
    }).catch((err) => console.error('notifyTaskUpdated error:', err.message));
  }

  // If the assignee changed to a new person, notify them as well
  if (
    changes.assigneeId !== undefined &&
    changes.assigneeId &&
    String(changes.assigneeId) !== String(taskObj.assigneeId)
  ) {
    notifyTaskAssigned({ task: taskObj, project, actorId: req.user._id }).catch((err) =>
      console.error('notifyTaskAssigned error:', err.message),
    );
  }

  res.json({
    success: true,
    data: taskObj,
  });
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check permissions: Admin, task creator, or project editors can delete
  const isAdmin = req.user.role === 'admin';
  const isCreator = task.creatorId.toString() === req.user._id.toString();

  if (!isAdmin && !isCreator) {
    // Check if user is project owner or editor
    const project = await Project.findById(task.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }
    
    const isOwner = project.ownerId.toString() === req.user._id.toString();
    
    if (!isOwner) {
      const membership = await ProjectMember.findOne({
        projectId: task.projectId,
        userId: req.user._id,
      });

      if (!membership || membership.role === 'viewer') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this task. Only project owner, editors, task creator, or admin can delete tasks.',
        });
      }
    }
  }

  await task.deleteOne();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'deleted',
    entityType: 'task',
    entityId: task._id,
    metadata: { title: task.title, projectId: task.projectId },
  });

  // Emit socket event
  emitTaskDeleted(task.projectId.toString(), task._id.toString());

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

/**
 * @route   POST /api/tasks/:id/attachments
 * @desc    Add attachment to task
 * @access  Private
 */
export const addTaskAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file',
    });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check permissions
  const project = await Project.findById(task.projectId);
  if (req.user.role !== 'admin' && project.ownerId.toString() !== req.user._id.toString()) {
    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId: req.user._id,
    });

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task',
      });
    }
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'task-manager/task-attachments');

  // Add to task attachments
  task.attachments.push({
    url: result.secure_url,
    publicId: result.public_id,
    uploadedBy: req.user._id,
    uploadedAt: new Date(),
  });

  await task.save();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'task',
    entityId: task._id,
    metadata: { title: task.title, action: 'attachment_added' },
  });

  res.json({
    success: true,
    message: 'Attachment added successfully',
    data: {
      attachments: task.attachments,
    },
  });
});

/**
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @desc    Delete attachment from task
 * @access  Private
 */
export const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check permissions
  const project = await Project.findById(task.projectId);
  if (req.user.role !== 'admin' && project.ownerId.toString() !== req.user._id.toString()) {
    const membership = await ProjectMember.findOne({
      projectId: task.projectId,
      userId: req.user._id,
    });

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task',
      });
    }
  }

  // Find attachment
  const attachment = task.attachments.id(req.params.attachmentId);
  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: 'Attachment not found',
    });
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(attachment.publicId);

  // Remove from task
  task.attachments.pull(req.params.attachmentId);
  await task.save();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'task',
    entityId: task._id,
    metadata: { title: task.title, action: 'attachment_deleted' },
  });

  res.json({
    success: true,
    message: 'Attachment deleted successfully',
  });
});
