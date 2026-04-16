import { connectDB } from '@/lib/mongodb';
import { Card } from '@/lib/models/Card';
import { User } from '@/lib/models/User';
import { enrichCard } from './enrichment';
import { sendWhatsAppText } from './whatsapp';

const DEMO_USER_PHONE = '919995554710';

export async function processIncomingMessage(payload) {
  try {
    await connectDB();

    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    if (!value) return;

    if (value.statuses?.length && !value.messages?.length) return;

    const message = value.messages?.[0];
    if (!message) return;

    if (message.from !== DEMO_USER_PHONE) {
      console.log(`[waba-agent] Ignoring message from unknown sender: ${message.from}`);
      return;
    }

    const user = await User.findOneAndUpdate(
      { whatsappNumber: DEMO_USER_PHONE },
      {
        $setOnInsert: {
          whatsappNumber: DEMO_USER_PHONE,
          name: 'Demo User',
          timezone: 'Asia/Kolkata',
          digestTime: '08:00',
        },
      },
      { upsert: true, new: true }
    );

    const { content, sourceType, mediaUrl } = extractMessageContent(message);

    if (!content.trim() && !mediaUrl) return;

    const enrichment = await enrichCard(content);

    const card = await Card.create({
      userId: user._id.toString(),
      content,
      sourceType,
      mediaUrl,
      status: 'indexed',
      tags: enrichment.tags,
      topic: enrichment.topic,
      summary: enrichment.summary,
      sentiment: enrichment.sentiment,
      nextSurfaceAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      capturedAt: new Date(parseInt(message.timestamp, 10) * 1000),
    });

    console.log(`[waba-agent] Card created: ${card._id} (${sourceType})`);

    await sendWhatsAppText(
      message.from,
      `✓ Captured: ${enrichment.summary}`
    );
  } catch (error) {
    console.error('[waba-agent] Processing error:', error);
  }
}

function extractMessageContent(message) {
  switch (message.type) {
    case 'text': {
      const body = message.text.body;
      const urlPattern = /https?:\/\/[^\s]+/;
      const sourceType = urlPattern.test(body) ? 'link' : 'text';
      return { content: body, sourceType };
    }

    case 'audio': {
      const audio = message.audio;
      return {
        content: '[voice note]',
        sourceType: 'voice',
        mediaUrl: audio.id,
      };
    }

    case 'image': {
      const img = message.image;
      return {
        content: img.caption || '[image]',
        sourceType: 'image',
        mediaUrl: img.id,
      };
    }

    case 'document': {
      const doc = message.document;
      return {
        content: doc.caption || doc.filename || '[document]',
        sourceType: 'link',
        mediaUrl: doc.id,
      };
    }

    default:
      return { content: `[${message.type} message]`, sourceType: 'text' };
  }
}
