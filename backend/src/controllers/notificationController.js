import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @route   GET /api/notifications
 * @desc    Get the most recent notifications for the current user
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, unreadOnly = 'false' } = req.query;

  const lim = Math.min(parseInt(limit) || 20, 100);
  const filter = { recipientId: req.user._id };
  if (String(unreadOnly) === 'true') {
    filter.read = false;
  }

  const notifications = await Notification.find(filter)
    .populate('actorId', 'name email avatarUrl role')
    .populate('projectId', 'name slug')
    .sort({ createdAt: -1 })
    .limit(lim);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    data: {
      items: notifications.map((n) => n.toJSON()),
      unreadCount,
    },
  });
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Just the unread count (for the bell badge)
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    read: false,
  });
  res.json({ success: true, data: { unreadCount } });
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipientId: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.json({ success: true, data: notification.toJSON() });
});

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark every notification for the user as read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipientId: req.user._id, read: false },
    { $set: { read: true, readAt: new Date() } },
  );

  res.json({ success: true, data: { updated: result.modifiedCount || 0 } });
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a single notification
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await Notification.deleteOne({
    _id: req.params.id,
    recipientId: req.user._id,
  });
  res.json({ success: true, data: { deleted: result.deletedCount } });
});

/**
 * @route   DELETE /api/notifications
 * @desc    Clear all notifications for the user
 * @access  Private
 */
export const clearAll = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ recipientId: req.user._id });
  res.json({ success: true, data: { deleted: result.deletedCount } });
});
