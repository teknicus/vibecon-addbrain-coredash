import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    whatsappNumber: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    timezone: { type: String, default: 'UTC' },
    digestTime: { type: String, default: '08:00' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
