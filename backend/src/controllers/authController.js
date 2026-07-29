import User from '../models/User.js';
import {
  sendTokenResponse,
  verifyRefreshToken,
  generateAccessToken,
} from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'member', // Default role
  });

  // Send token response with HTTP-only cookies
  sendTokenResponse(user, 201, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Send token response with HTTP-only cookies
  sendTokenResponse(user, 200, res);
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or request body
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found',
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Set new access token in cookie
    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };

    res.cookie('accessToken', newAccessToken, accessTokenOptions);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear cookies
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});
