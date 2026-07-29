import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/error.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper.js';
import { notifyProjectMemberAdded } from '../services/notificationService.js';

/**
 * @route   GET /api/projects
 * @desc    Get all projects accessible to the user
 * @access  Private
 */
export const getProjects = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search = '', sortBy = 'createdAt', sortDir = 'desc' } = req.query;

  const limit = parseInt(pageSize);
  const skip = (parseInt(page) - 1) * limit;

  let query = {};

  // Admin can see all projects
  if (req.user.role !== 'admin') {
    // Get projects where user is owner or member
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const projectIds = memberships.map((m) => m.projectId);

    query = {
      $or: [{ ownerId: req.user._id }, { _id: { $in: projectIds } }],
    };
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortDir === 'asc' ? 1 : -1;

  const projects = await Project.find(query)
    .populate({
      path: 'members',
      populate: { path: 'userId', select: 'name email avatarUrl role' },
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Project.countDocuments(query);

  // Calculate task counts for each project
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const taskCount = await Task.countDocuments({ projectId: project._id });
      const completedTaskCount = await Task.countDocuments({
        projectId: project._id,
        status: 'done',
      });

      // Transform members BEFORE project.toJSON() so they're still Mongoose docs
      // and the custom toJSON() on ProjectMember runs.
      let serializedMembers = [];
      if (project.members) {
        serializedMembers = project.members.map((m) =>
          m.toJSON ? m.toJSON() : m,
        );
      }

      const projectObj = project.toJSON();
      projectObj.taskCount = taskCount;
      projectObj.completedTaskCount = completedTaskCount;
      projectObj.members = serializedMembers;

      return projectObj;
    })
  );

  res.json({
    success: true,
    data: projectsWithCounts,
    page: parseInt(page),
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate({
    path: 'members',
    populate: { path: 'userId', select: 'name email avatarUrl role' },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check access
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    const membership = await ProjectMember.findOne({
      projectId: project._id,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }
  }

  const taskCount = await Task.countDocuments({ projectId: project._id });
  const completedTaskCount = await Task.countDocuments({
    projectId: project._id,
    status: 'done',
  });

  // Transform members BEFORE project.toJSON() so they remain Mongoose docs
  let serializedMembers = [];
  if (project.members) {
    serializedMembers = project.members.map((m) => (m.toJSON ? m.toJSON() : m));
  }

  const projectObj = project.toJSON();
  projectObj.taskCount = taskCount;
  projectObj.completedTaskCount = completedTaskCount;
  projectObj.members = serializedMembers;

  res.json({
    success: true,
    data: projectObj,
  });
});

/**
 * @route   GET /api/projects/by-slug/:slug
 * @desc    Get project by slug
 * @access  Private
 */
export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug }).populate({
    path: 'members',
    populate: { path: 'userId', select: 'name email avatarUrl role' },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check access
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    const membership = await ProjectMember.findOne({
      projectId: project._id,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }
  }

  const taskCount = await Task.countDocuments({ projectId: project._id });
  const completedTaskCount = await Task.countDocuments({
    projectId: project._id,
    status: 'done',
  });

  // Transform members BEFORE project.toJSON() so they remain Mongoose docs
  let serializedMembers = [];
  if (project.members) {
    serializedMembers = project.members.map((m) => (m.toJSON ? m.toJSON() : m));
  }

  const projectObj = project.toJSON();
  projectObj.taskCount = taskCount;
  projectObj.completedTaskCount = completedTaskCount;
  projectObj.members = serializedMembers;

  res.json({
    success: true,
    data: projectObj,
  });
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    ownerId: req.user._id,
  });

  // Add creator as owner member
  await ProjectMember.create({
    projectId: project._id,
    userId: req.user._id,
    role: 'owner',
  });

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'created',
    entityType: 'project',
    entityId: project._id,
    metadata: { name: project.name },
  });

  const projectObj = project.toJSON();
  projectObj.taskCount = 0;
  projectObj.completedTaskCount = 0;
  projectObj.members = [];

  res.status(201).json({
    success: true,
    data: projectObj,
  });
});

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update a project
 * @access  Private (Owner or Admin)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check ownership
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only project owner or admin can update project',
    });
  }

  const changes = {};
  if (name) changes.name = name;
  if (description) changes.description = description;
  if (status) changes.status = status;

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    changes,
    { new: true, runValidators: true }
  ).populate({
    path: 'members',
    populate: { path: 'userId', select: 'name email avatarUrl role' },
  });

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'project',
    entityId: project._id,
    changes,
    metadata: { name: updatedProject.name },
  });

  const taskCount = await Task.countDocuments({ projectId: updatedProject._id });
  const completedTaskCount = await Task.countDocuments({
    projectId: updatedProject._id,
    status: 'done',
  });

  // Transform members BEFORE updatedProject.toJSON() so they remain Mongoose docs
  let serializedMembers = [];
  if (updatedProject.members) {
    serializedMembers = updatedProject.members.map((m) =>
      m.toJSON ? m.toJSON() : m,
    );
  }

  const projectObj = updatedProject.toJSON();
  projectObj.taskCount = taskCount;
  projectObj.completedTaskCount = completedTaskCount;
  projectObj.members = serializedMembers;

  res.json({
    success: true,
    data: projectObj,
  });
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (Owner or Admin)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check ownership
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only project owner or admin can delete project',
    });
  }

  // Delete all related data
  await Task.deleteMany({ projectId: project._id });
  await ProjectMember.deleteMany({ projectId: project._id });

  await project.deleteOne();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'deleted',
    entityType: 'project',
    entityId: project._id,
    metadata: { name: project.name },
  });

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});

/**
 * @route   GET /api/projects/:projectId/members
 * @desc    Get project members
 * @access  Private
 */
export const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await ProjectMember.find({ projectId: req.params.projectId }).populate(
    'userId',
    'name email avatarUrl role'
  );

  // toJSON on ProjectMember already produces { id, projectId, user, userId, role, joinedAt }
  const transformedMembers = members.map((member) => member.toJSON());

  res.json({
    success: true,
    data: transformedMembers,
  });
});

/**
 * @route   POST /api/projects/:projectId/members
 * @desc    Add member to project
 * @access  Private (Owner or Admin)
 */
export const addProjectMember = asyncHandler(async (req, res) => {
  const { userId, role = 'editor' } = req.body;

  const project = await Project.findById(req.params.projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check if already a member
  const existingMember = await ProjectMember.findOne({
    projectId: req.params.projectId,
    userId,
  });

  if (existingMember) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this project',
    });
  }

  const member = await ProjectMember.create({
    projectId: req.params.projectId,
    userId,
    role,
  });

  await AuditLog.create({
    userId: req.user._id,
    action: 'created',
    entityType: 'project_member',
    entityId: member._id,
    metadata: { projectId: req.params.projectId, memberId: userId, role },
  });

  const populatedMember = await ProjectMember.findById(member._id).populate(
    'userId',
    'name email avatarUrl role'
  );

  const memberObj = populatedMember.toJSON();

  // Fire-and-forget notification + email to the new member
  notifyProjectMemberAdded({
    project,
    member: populatedMember,
    actor: req.user,
  }).catch((err) => console.error('notifyProjectMemberAdded error:', err.message));

  res.status(201).json({
    success: true,
    data: memberObj,
  });
});

/**
 * @route   PATCH /api/projects/:projectId/members/:memberId
 * @desc    Update a project member's role
 * @access  Private (Project owner or Admin)
 */
export const updateProjectMember = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { projectId, memberId } = req.params;

  const member = await ProjectMember.findOne({ _id: memberId, projectId });

  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Member not found',
    });
  }

  // Cannot demote the project owner via this endpoint
  if (member.role === 'owner') {
    return res.status(400).json({
      success: false,
      message: 'Cannot change the role of the project owner',
    });
  }

  // Cannot promote anyone else to owner via this endpoint (use a separate
  // ownership transfer flow). For now, only owner→owner promotion is allowed
  // for admins on the current owner record.
  if (role === 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can assign the owner role',
    });
  }

  const previousRole = member.role;
  member.role = role;
  await member.save();

  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'project_member',
    entityId: member._id,
    changes: { role: { from: previousRole, to: role } },
    metadata: { projectId, memberId: member.userId },
  });

  const populated = await ProjectMember.findById(member._id).populate(
    'userId',
    'name email avatarUrl role'
  );

  res.json({
    success: true,
    data: populated.toJSON(),
  });
});

/**
 * @route   DELETE /api/projects/:projectId/members/:memberId
 * @desc    Remove member from project
 * @access  Private (Owner or Admin)
 */
export const removeProjectMember = asyncHandler(async (req, res) => {
  const member = await ProjectMember.findOne({
    _id: req.params.memberId,
    projectId: req.params.projectId,
  });

  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Member not found',
    });
  }

  // Cannot remove owner
  if (member.role === 'owner') {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove project owner',
    });
  }

  await member.deleteOne();

  await AuditLog.create({
    userId: req.user._id,
    action: 'deleted',
    entityType: 'project_member',
    entityId: member._id,
    metadata: { projectId: req.params.projectId, memberId: member.userId },
  });

  res.json({
    success: true,
    message: 'Member removed successfully',
  });
});

/**
 * @route   PUT /api/projects/:id/cover
 * @desc    Update project cover image
 * @access  Private (Owner or Admin)
 */
export const updateProjectCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file',
    });
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check ownership
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only project owner or admin can update cover image',
    });
  }

  // Delete old cover if exists
  if (project.coverImagePublicId) {
    try {
      await deleteFromCloudinary(project.coverImagePublicId);
    } catch (error) {
      console.error('Failed to delete old cover:', error);
    }
  }

  // Upload new cover
  const result = await uploadToCloudinary(req.file.buffer, 'task-manager/projects');

  // Update project
  project.coverImage = result.secure_url;
  project.coverImagePublicId = result.public_id;
  await project.save();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'project',
    entityId: project._id,
    metadata: { name: project.name, action: 'cover_updated' },
  });

  res.json({
    success: true,
    message: 'Cover image updated successfully',
    data: {
      coverImage: project.coverImage,
    },
  });
});

/**
 * @route   DELETE /api/projects/:id/cover
 * @desc    Delete project cover image
 * @access  Private (Owner or Admin)
 */
export const deleteProjectCover = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check ownership
  if (
    req.user.role !== 'admin' &&
    project.ownerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Only project owner or admin can delete cover image',
    });
  }

  if (!project.coverImagePublicId) {
    return res.status(400).json({
      success: false,
      message: 'No cover image to delete',
    });
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(project.coverImagePublicId);

  // Update project
  project.coverImage = null;
  project.coverImagePublicId = null;
  await project.save();

  // Audit log
  await AuditLog.create({
    userId: req.user._id,
    action: 'updated',
    entityType: 'project',
    entityId: project._id,
    metadata: { name: project.name, action: 'cover_deleted' },
  });

  res.json({
    success: true,
    message: 'Cover image deleted successfully',
  });
});
