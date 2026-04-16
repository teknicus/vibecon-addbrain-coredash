import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Card } from '@/lib/models/Card';
import { User } from '@/lib/models/User';
import { enrichCard } from '@/lib/agent/enrichment';

const DEMO_USER_PHONE = '919995554710';

async function getDemoUserId() {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { whatsappNumber: DEMO_USER_PHONE },
    { $setOnInsert: { whatsappNumber: DEMO_USER_PHONE } },
    { upsert: true, new: true }
  );
  return user._id.toString();
}

export async function GET(request) {
  try {
    const userId = await getDemoUserId();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    const query = {
      userId,
      isArchived: false,
    };

    if (status) query.status = status;
    if (projectId) query.projectId = projectId;
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sort =
      status === 'inspect'
        ? { nextSurfaceAt: 1 }
        : { capturedAt: -1 };

    const cards = await Card.find(query).sort(sort).limit(100).lean();
    
    const serialized = JSON.parse(JSON.stringify(cards));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[GET /api/cards]', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getDemoUserId();
    const body = await request.json();
    const { content, sourceType = 'manual', projectId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const enrichment = await enrichCard(content);

    const card = await Card.create({
      userId,
      content,
      sourceType,
      projectId: projectId || undefined,
      status: 'indexed',
      tags: enrichment.tags,
      topic: enrichment.topic,
      summary: enrichment.summary,
      sentiment: enrichment.sentiment,
    });

    const serialized = JSON.parse(JSON.stringify(card));
    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cards]', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
