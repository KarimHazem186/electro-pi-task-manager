import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/error.js';
import { emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitTaskStatusChanged } from '../config/socket.js';

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
      ...memberships.map((m) => m.projectId),
      ...ownedProjects.map((p) => p._id),
    ];

    query.projectId = { $in: accessibleProjectIds };
  }

  // Apply filters
  if (projectId) {
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
    const taskObj = task.toJSON();
    if (taskObj.assigneeId) {
      taskObj.assignee = taskObj.assigneeId;
    }
    if (taskObj.creatorId) {
      taskObj.creator = taskObj.creatorId;
    }
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
      ...memberships.map((m) => m.projectId),
      ...ownedProjects.map((p) => p._id),
    ];

    query.projectId = { $in: accessibleProjectIds };
  }

  // Apply filters
  if (projectId) {
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
    const taskObj = task.toJSON();
    if (taskObj.assigneeId) {
      taskObj.assignee = taskObj.assigneeId;
    }
    if (taskObj.creatorId) {
      taskObj.creator = taskObj.creatorId;
    }
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

  const taskObj = task.toJSON();
  if (taskObj.assigneeId) {
    taskObj.assignee = taskObj.assigneeId;
  }
  if (taskObj.creatorId) {
    taskObj.creator = taskObj.creatorId;
  }

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
  const taskObj = populatedTask.toJSON();
  if (taskObj.assigneeId) {
    taskObj.assignee = taskObj.assigneeId;
  }
  if (taskObj.creatorId) {
    taskObj.creator = taskObj.creatorId;
  }

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
  const taskObj = updatedTask.toJSON();
  if (taskObj.assigneeId) {
    taskObj.assignee = taskObj.assigneeId;
  }
  if (taskObj.creatorId) {
    taskObj.creator = taskObj.creatorId;
  }

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
  } else {
    await AuditLog.create({
      userId: req.user._id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      changes,
    });
    // Emit updated event
    emitTaskUpdated(task.projectId.toString(), taskObj);
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
        message: 'You do not have permission to delete this task',
      });
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
