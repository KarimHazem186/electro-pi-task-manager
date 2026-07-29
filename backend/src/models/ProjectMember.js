import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
projectMemberSchema.index({ userId: 1 });
projectMemberSchema.index({ projectId: 1 });

// Transform output to match frontend types
projectMemberSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.projectId = obj.projectId?.toString();

  // Handle populated userId: expose it as a `user` object and keep `userId` as a string
  if (obj.userId && typeof obj.userId === 'object' && obj.userId._id) {
    const user = obj.userId;
    obj.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
    };
    obj.userId = user._id.toString();
  } else if (obj.userId) {
    obj.userId = obj.userId.toString();
  }

  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('ProjectMember', projectMemberSchema);
