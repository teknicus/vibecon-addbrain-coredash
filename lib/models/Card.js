import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['text', 'voice', 'image', 'link', 'manual'],
      default: 'text',
    },
    mediaUrl: { type: String },
    tags: { type: [String], default: [] },
    topic: { type: String, default: '' },
    summary: { type: String, default: '' },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    status: {
      type: String,
      enum: ['inbox', 'indexed', 'inspect', 'implement', 'done'],
      default: 'inbox',
      index: true,
    },
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
    nextSurfaceAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    snoozedUntil: { type: Date, default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    relatedCardIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    capturedAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
