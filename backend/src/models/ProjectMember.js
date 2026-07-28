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
  obj.userId = obj.userId?.toString();
  
  // Transform populated user
  if (obj.user && obj.user._id) {
    obj.user.id = obj.user._id.toString();
    delete obj.user._id;
    delete obj.user.__v;
  }
  
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('ProjectMember', projectMemberSchema);
