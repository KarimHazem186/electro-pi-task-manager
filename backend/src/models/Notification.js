import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    /** The user who should receive this notification */
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** The user who triggered the notification (optional, system notifications have null) */
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    /** Notification category */
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_completed',
        'task_status_changed',
        'project_member_added',
        'project_invite',
        'mention',
        'system',
      ],
      default: 'system',
      index: true,
    },
    /** Short title shown in bold */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    /** Secondary text shown under the title */
    body: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    /** Optional deep link for the notification */
    href: {
      type: String,
      default: null,
    },
    /** Related project (for grouping) */
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    /** Related task (for grouping) */
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    /** Free-form metadata for the frontend (status, priority, etc.) */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    /** Whether the user has read the notification */
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

// Populate actor when serialised
notificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('Notification', notificationSchema);
