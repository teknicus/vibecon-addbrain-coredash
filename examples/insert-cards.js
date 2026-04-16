// Example: How to Insert Cards into AddBrain

import mongoose from 'mongoose';
import { Card } from './lib/models/Card.js';
import { User } from './lib/models/User.js';
import { enrichCard } from './lib/agent/enrichment.js';

// ============================================
// METHOD 1: Via WhatsApp Webhook (Recommended)
// ============================================
// This is already implemented in /app/lib/agent/waba-agent.js
// Your webhook automatically handles insertion

// ============================================
// METHOD 2: Direct Database Insertion
// ============================================

async function insertCard(messageData) {
  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 2. Get or create user
  const user = await User.findOneAndUpdate(
    { whatsappNumber: '919995554710' }, // Your demo user
    {
      $setOnInsert: {
        whatsappNumber: '919995554710',
        name: 'Demo User',
        timezone: 'Asia/Kolkata',
        digestTime: '08:00',
      },
    },
    { upsert: true, new: true }
  );
  
  // 3. Enrich content with AI (optional but recommended)
  const enrichment = await enrichCard(messageData.content);
  
  // 4. Insert card
  const card = await Card.create({
    userId: user._id.toString(),
    content: messageData.content,
    sourceType: messageData.sourceType || 'text',
    mediaUrl: messageData.mediaUrl || undefined,
    
    // AI enrichment
    tags: enrichment.tags,
    topic: enrichment.topic,
    summary: enrichment.summary,
    sentiment: enrichment.sentiment,
    
    // Workflow
    status: 'indexed', // Start in Index column
    
    // Spaced repetition defaults
    reviewCount: 0,
    lastReviewedAt: null,
    nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
    
    // Metadata
    capturedAt: messageData.timestamp || new Date(),
    isArchived: false,
  });
  
  console.log('Card created:', card._id);
  return card;
}

// ============================================
// METHOD 3: Via REST API (Simplest)
// ============================================

async function insertViaAPI(content) {
  const response = await fetch('http://localhost:3000/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: content,
      sourceType: 'manual',
    }),
  });
  
  const card = await response.json();
  return card;
}

// ============================================
// EXAMPLE USAGE
// ============================================

// Example 1: Simple text message
await insertCard({
  content: 'Read "The Mom Test" book for customer research',
  sourceType: 'text',
  timestamp: new Date(),
});

// Example 2: Voice note (with media ID)
await insertCard({
  content: '[voice note]',
  sourceType: 'voice',
  mediaUrl: 'whatsapp_media_id_12345',
  timestamp: new Date(),
});

// Example 3: Image with caption
await insertCard({
  content: 'Check out this wireframe design',
  sourceType: 'image',
  mediaUrl: 'whatsapp_media_id_67890',
  timestamp: new Date(),
});

// Example 4: Link
await insertCard({
  content: 'https://stripe.com/docs/connect - implement marketplace payouts',
  sourceType: 'link',
  timestamp: new Date(),
});

// Example 5: Via API (no need to handle enrichment)
await insertViaAPI('Build a mobile app with offline sync');

// ============================================
// BATCH INSERTION
// ============================================

async function insertBatchCards(messages) {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ whatsappNumber: '919995554710' });
  
  const cards = await Promise.all(
    messages.map(async (msg) => {
      const enrichment = await enrichCard(msg.content);
      
      return {
        userId: user._id.toString(),
        content: msg.content,
        sourceType: msg.sourceType || 'text',
        tags: enrichment.tags,
        topic: enrichment.topic,
        summary: enrichment.summary,
        sentiment: enrichment.sentiment,
        status: 'indexed',
        capturedAt: msg.timestamp || new Date(),
        nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isArchived: false,
      };
    })
  );
  
  const result = await Card.insertMany(cards);
  console.log(`Inserted ${result.length} cards`);
  return result;
}

// Example batch insertion
await insertBatchCards([
  { content: 'First idea', sourceType: 'text' },
  { content: 'Second idea', sourceType: 'text' },
  { content: 'Third idea', sourceType: 'text' },
]);

export { insertCard, insertViaAPI, insertBatchCards };
