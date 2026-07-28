import User from '../models/User.js';
import ProjectMember from '../models/ProjectMember.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only for full list, others for project members)
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
