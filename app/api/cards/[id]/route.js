import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Card } from '@/lib/models/Card';

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await request.json();

    if (updates.status === 'done') {
      const card = await Card.findById(id);
      if (!card) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
      }

      const reviewCount = (card.reviewCount ?? 0) + 1;
      const intervalDays =
        REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
      const nextSurfaceAt = new Date(
        Date.now() + intervalDays * 24 * 60 * 60 * 1000
      );

      const updated = await Card.findByIdAndUpdate(
        id,
        {
          ...updates,
          reviewCount,
          lastReviewedAt: new Date(),
          nextSurfaceAt,
        },
        { new: true }
      );

      const serialized = JSON.parse(JSON.stringify(updated));
      return NextResponse.json(serialized);
    }

    const updated = await Card.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const serialized = JSON.parse(JSON.stringify(updated));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[PATCH /api/cards/:id]', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await Card.findByIdAndUpdate(id, { isArchived: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/cards/:id]', error);
    return NextResponse.json({ error: 'Failed to archive card' }, { status: 500 });
  }
}
