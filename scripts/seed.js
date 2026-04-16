import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { Card } from '../lib/models/Card.js';
import { User } from '../lib/models/User.js';

const DEMO_PHONE = '919995554710';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

const SAMPLE_CARDS = [
  {
    content: 'Read "Thinking Fast and Slow" — chapter on cognitive biases is critical for product decisions',
    sourceType: 'text',
    status: 'inbox',
    tags: ['books', 'psychology', 'product'],
    topic: 'book recommendation',
    sentiment: 'positive',
    summary: 'Read Kahneman book on cognitive biases for product work',
  },
  {
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ — great explainer on transformer architecture',
    sourceType: 'link',
    status: 'inbox',
    tags: ['ml', 'transformers', 'learning'],
    topic: 'machine learning',
    sentiment: 'positive',
    summary: 'Watch transformer architecture explainer video',
  },
  {
    content: "Shower thought: what if the onboarding flow started with the user's goal, not their email?",
    sourceType: 'text',
    status: 'indexed',
    tags: ['product', 'onboarding', 'ux'],
    topic: 'product idea',
    sentiment: 'positive',
    summary: 'Explore goal-first onboarding flow redesign',
  },
  {
    content: 'Podcast: Lex Fridman ep #367 with Sam Altman — key insight: AGI transition will be gradual',
    sourceType: 'text',
    status: 'indexed',
    tags: ['ai', 'podcast', 'future'],
    topic: 'AGI transition',
    sentiment: 'neutral',
    summary: 'Review Sam Altman insights on gradual AGI transition',
  },
  {
    content: 'Need to refactor the auth module — using deprecated bcrypt calls, security risk',
    sourceType: 'text',
    status: 'indexed',
    tags: ['coding', 'security', 'refactor'],
    topic: 'tech debt',
    sentiment: 'negative',
    summary: 'Fix deprecated bcrypt calls in auth module immediately',
  },
  {
    content: 'Book: "The Mom Test" by Rob Fitzpatrick — best book on customer interviews, reread every 6 months',
    sourceType: 'text',
    status: 'inspect',
    tags: ['books', 'startups', 'customer-research'],
    topic: 'customer interviews',
    sentiment: 'positive',
    summary: 'Reread The Mom Test for customer interview refresher',
  },
  {
    content: 'Idea: build a VS Code extension that shows PR comments inline while coding',
    sourceType: 'text',
    status: 'inspect',
    tags: ['coding', 'tooling', 'vscode'],
    topic: 'developer tool',
    sentiment: 'positive',
    summary: 'Build VS Code extension for inline PR comment review',
  },
  {
    content: 'https://arxiv.org/abs/2310.06825 — "Mistral 7B" paper, beats LLaMA 2 on all benchmarks',
    sourceType: 'link',
    status: 'inspect',
    tags: ['ml', 'llm', 'research'],
    topic: 'LLM research',
    sentiment: 'positive',
    summary: 'Review Mistral 7B paper benchmarks and architecture',
  },
  {
    content: 'Meeting note: Marco mentioned the API rate limits are causing issues for enterprise customers',
    sourceType: 'text',
    status: 'implement',
    tags: ['product', 'enterprise', 'api'],
    topic: 'customer issue',
    sentiment: 'negative',
    summary: 'Increase API rate limits for enterprise tier customers',
  },
  {
    content: 'Write a blog post about building with LLMs in production — lessons learned from 6 months',
    sourceType: 'text',
    status: 'implement',
    tags: ['writing', 'llm', 'engineering'],
    topic: 'content creation',
    sentiment: 'positive',
    summary: 'Write LLM production lessons blog post from experience',
  },
  {
    content: 'Set up automated weekly digest email for inactive users — re-engagement campaign',
    sourceType: 'text',
    status: 'implement',
    tags: ['marketing', 'email', 'retention'],
    topic: 're-engagement',
    sentiment: 'neutral',
    summary: 'Build automated weekly digest for inactive user re-engagement',
  },
  {
    content: 'Finished reading "Zero to One" — best part: the contrarian question framework',
    sourceType: 'text',
    status: 'done',
    tags: ['books', 'startups', 'strategy'],
    topic: 'startup strategy',
    sentiment: 'positive',
    summary: 'Apply contrarian question framework to next product decision',
  },
  {
    content: 'Completed the TypeScript migration of the API layer — all tests passing',
    sourceType: 'text',
    status: 'done',
    tags: ['coding', 'typescript', 'milestone'],
    topic: 'engineering milestone',
    sentiment: 'positive',
    summary: 'TypeScript API migration completed successfully',
  },
  {
    content: 'Listened to "How I Built This" ep on Duolingo — gamification > guilt for retention',
    sourceType: 'text',
    status: 'done',
    tags: ['podcast', 'product', 'gamification'],
    topic: 'retention strategy',
    sentiment: 'positive',
    summary: 'Apply Duolingo gamification lessons to onboarding retention',
  },
  {
    content: 'https://stripe.com/docs/connect — need to implement Stripe Connect for marketplace payouts',
    sourceType: 'link',
    status: 'indexed',
    tags: ['coding', 'payments', 'stripe'],
    topic: 'payments integration',
    sentiment: 'neutral',
    summary: 'Implement Stripe Connect for marketplace payout flow',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { whatsappNumber: DEMO_PHONE },
      {
        $setOnInsert: {
          whatsappNumber: DEMO_PHONE,
          name: 'Demo User',
          timezone: 'Asia/Kolkata',
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ User: ${user.whatsappNumber}`);

    await Card.deleteMany({ userId: user._id.toString() });
    console.log('🗑️  Cleared existing cards');

    const now = Date.now();
    const cards = SAMPLE_CARDS.map((c, i) => ({
      ...c,
      userId: user._id.toString(),
      reviewCount: c.status === 'done' ? 1 : 0,
      capturedAt: new Date(now - i * 2 * 60 * 60 * 1000),
      nextSurfaceAt: new Date(now + 24 * 60 * 60 * 1000),
      isArchived: false,
    }));

    await Card.insertMany(cards);
    console.log(`✅ Seeded ${cards.length} cards for user ${DEMO_PHONE}`);

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
