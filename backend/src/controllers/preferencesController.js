import UserPreferences from '../models/UserPreferences.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @route   GET /api/preferences
 * @desc    Get user preferences
 * @access  Private
 */
export const getPreferences = asyncHandler(async (req, res) => {
  let preferences = await UserPreferences.findOne({ userId: req.user._id });

  // Create default preferences if not exists
  if (!preferences) {
    preferences = await UserPreferences.create({
      userId: req.user._id,
      notifications: {
        email: true,
        weekly: false,
        deadlines: false,
      },
    });
  }

  res.json({
    success: true,
    data: preferences.toJSON(),
  });
});

/**
 * @route   PATCH /api/preferences
 * @desc    Update user preferences
 * @access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
  const { notifications } = req.body;

  let preferences = await UserPreferences.findOne({ userId: req.user._id });

  if (!preferences) {
    // Create new preferences if not exists
    preferences = await UserPreferences.create({
      userId: req.user._id,
      notifications,
    });
  } else {
    // Update existing preferences
    if (notifications) {
      preferences.notifications = {
        ...preferences.notifications,
        ...notifications,
      };
    }
    await preferences.save();
  }

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: preferences.toJSON(),
  });
});
