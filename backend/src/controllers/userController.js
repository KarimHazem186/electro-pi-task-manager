import User from '../models/User.js';
import ProjectMember from '../models/ProjectMember.js';
import { asyncHandler } from '../middleware/error.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper.js';

/**
 * @route   GET /api/users
 * @desc    Get users in the workspace, scoped by role
 *          - admin:    every user
 *          - manager:  users that share a project with the manager
 *          - member:   users that share a project with the member
 * @access  Private
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;

  const limit = parseInt(pageSize);
  const skip = (parseInt(page) - 1) * limit;

  let query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Non-admins: only return users that share a project with them
  if (req.user.role !== 'admin') {
    const memberships = await ProjectMember.find({ userId: req.user._id }).select('projectId');
    const owned = await User.find({ _id: req.user._id }).select('_id');
    void owned;
    const myProjectIds = memberships.map((m) => m.projectId);

    if (myProjectIds.length === 0) {
      // No project access yet — only show the user themselves
      query._id = req.user._id;
    } else {
      const coMembers = await ProjectMember.find({
        projectId: { $in: myProjectIds },
      }).select('userId');
      const coMemberIds = [...new Set(coMembers.map((m) => m.userId.toString()))];
      query._id = { $in: coMemberIds };
    }
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  // Get project counts for each user
  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      const projectsCount = await ProjectMember.countDocuments({ userId: user._id });
      const userObj = user.toJSON();
      userObj.projectsCount = projectsCount;
      return userObj;
    })
  );

  res.json({
    success: true,
    data: usersWithCounts,
    page: parseInt(page),
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/users/all
 * @desc    Get all users without pagination
 * @access  Private
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ name: 1 });

  const usersData = users.map(user => user.toJSON());

  res.json({
    success: true,
    data: usersData,
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const projectsCount = await ProjectMember.countDocuments({ userId: user._id });
  const userObj = user.toJSON();
  userObj.projectsCount = projectsCount;

  res.json({
    success: true,
    data: userObj,
  });
});

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update a user's workspace role (Admin only)
 * @access  Private (Admin)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const allowed = ['admin', 'manager', 'member'];
  if (!allowed.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role must be one of: ${allowed.join(', ')}`,
    });
  }

  // Prevent the last admin from demoting themselves
  if (
    id === req.user.id &&
    role !== 'admin'
  ) {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote the last admin',
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

/**
 * @route   POST /api/users/invite
 * @desc    Invite a user to the workspace
 * @access  Private (Admin)
 */
export const inviteUser = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Generate temporary password
  const tempPassword = crypto.randomBytes(12).toString('hex');

  // Create new user with temporary password
  const user = await User.create({
    name: email.split('@')[0], // Use email prefix as default name
    email,
    password: tempPassword,
    role: role || 'member',
  });

  // Send invitation email
  try {
    const inviteUrl = `${process.env.FRONTEND_URL}/login`;
    await sendEmail({
      to: email,
      subject: 'You\'ve been invited to join Task Manager',
      html: `
        <h2>Welcome to Task Manager!</h2>
        <p>You've been invited to join the workspace as a ${role}.</p>
        <p><strong>Your temporary credentials:</strong></p>
        <p>Email: ${email}</p>
        <p>Password: ${tempPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <p><a href="${inviteUrl}">Log in to Task Manager</a></p>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send invitation email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    message: 'User invited successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user from the workspace
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent user from deleting themselves
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account',
    });
  }

  // Remove user from all projects
  await ProjectMember.deleteMany({ userId });

  // Delete the user
  await User.findByIdAndDelete(userId);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * @route   PUT /api/users/profile/avatar
 * @desc    Update user profile picture
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file',
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Delete old avatar if exists
  if (user.avatarPublicId) {
    try {
      await deleteFromCloudinary(user.avatarPublicId);
    } catch (error) {
      console.error('Failed to delete old avatar:', error);
    }
  }

  // Upload new avatar
  const result = await uploadToCloudinary(req.file.buffer, 'task-manager/profiles');

  // Update user
  user.avatarUrl = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save();

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    data: {
      avatarUrl: user.avatarUrl,
    },
  });
});

/**
 * @route   DELETE /api/users/profile/avatar
 * @desc    Delete user profile picture
 * @access  Private
 */
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (!user.avatarPublicId) {
    return res.status(400).json({
      success: false,
      message: 'No profile picture to delete',
    });
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(user.avatarPublicId);

  // Update user
  user.avatarUrl = null;
  user.avatarPublicId = null;
  await user.save();

  res.json({
    success: true,
    message: 'Profile picture deleted successfully',
  });
});
