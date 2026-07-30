import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      weekly: {
        type: Boolean,
        default: false,
      },
      deadlines: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Transform output to match frontend types
userPreferencesSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('UserPreferences', userPreferencesSchema);
