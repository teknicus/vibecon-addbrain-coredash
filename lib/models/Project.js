import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project || mongoose.model('Project', ProjectSchema);
