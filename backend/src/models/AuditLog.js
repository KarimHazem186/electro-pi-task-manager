import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'deleted', 'status_changed', 'assigned', 'unassigned', 'priority_changed', 'due_date_changed'],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['task', 'project', 'user', 'project_member'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

// Transform output
auditLogSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.userId = obj.userId?.toString();
  obj.entityId = obj.entityId?.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('AuditLog', auditLogSchema);
