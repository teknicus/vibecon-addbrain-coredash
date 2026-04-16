'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Rocket, Clock, Archive, Tag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SENTIMENT_CONFIG, SOURCE_LABELS } from '@/lib/constants';

export function CardDetail({ card, onClose, onUpdate, onArchive }) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState(card.tags.join(', '));
  const [isLoading, setIsLoading] = useState(false);

  async function patchCard(updates) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cards/${card._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      onUpdate(updated);
      toast.success('Card updated');
    } catch {
      toast.error('Failed to update card');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleArchive() {
    setIsLoading(true);
    try {
      await fetch(`/api/cards/${card._id}`, { method: 'DELETE' });
      onArchive(card._id);
      toast.success('Card archived');
    } catch {
      toast.error('Failed to archive');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTags() {
    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    await patchCard({ tags });
    setIsEditingTags(false);
  }

  const sentiment = SENTIMENT_CONFIG[card.sentiment];

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">Card Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Summary
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {card.summary || '—'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Full Content
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 rounded p-3">
              {card.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{SOURCE_LABELS[card.sourceType]}</Badge>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${sentiment.color}`}>
              {sentiment.label}
            </span>
            {card.topic && <Badge variant="secondary">{card.topic}</Badge>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Tags
              </p>
              <button
                onClick={() => setIsEditingTags((v) => !v)}
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                <Tag size={10} /> Edit
              </button>
            </div>

            {isEditingTags ? (
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="text-sm h-8"
                  onKeyDown={(e) => e.key === 'Enter' && saveTags()}
                />
                <Button size="sm" onClick={saveTags} disabled={isLoading}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {card.tags.length === 0 ? (
                  <span className="text-xs text-slate-400">No tags</span>
                ) : (
                  card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>Captured: {format(new Date(card.capturedAt), 'PPp')}</p>
            {card.lastReviewedAt && (
              <p>Last reviewed: {format(new Date(card.lastReviewedAt), 'PPp')}</p>
            )}
            <p>Reviews: {card.reviewCount}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => patchCard({ status: 'done' })}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle size={14} className="mr-1" /> Mark Done
            </Button>
            <Button
              onClick={() => patchCard({ status: 'implement' })}
              disabled={isLoading}
              variant="outline"
            >
              <Rocket size={14} className="mr-1" /> Implement
            </Button>
            <Button
              onClick={() =>
                patchCard({
                  snoozedUntil: new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                })
              }
              disabled={isLoading}
              variant="outline"
            >
              <Clock size={14} className="mr-1" /> Snooze 3d
            </Button>
            <Button
              onClick={handleArchive}
              disabled={isLoading}
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <Archive size={14} className="mr-1" /> Archive
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
