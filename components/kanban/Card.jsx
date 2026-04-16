'use client';

import { Draggable } from '@hello-pangea/dnd';
import { formatDistanceToNow } from 'date-fns';
import * as Icons from 'lucide-react';
import { SOURCE_ICONS } from '@/lib/constants';

export function KanbanCard({ card, index, onClick }) {
  const IconName = SOURCE_ICONS[card.sourceType] || 'Type';
  const Icon = Icons[IconName];
  const visibleTags = card.tags.slice(0, 2);
  const extraTagCount = card.tags.length - visibleTags.length;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            bg-white dark:bg-slate-800 rounded-lg p-3 mb-2 cursor-pointer
            border border-slate-100 dark:border-slate-700
            transition-shadow select-none
            ${
              snapshot.isDragging
                ? 'shadow-lg rotate-1 ring-2 ring-blue-400'
                : 'shadow-sm hover:shadow-md'
            }
          `}
        >
          <p className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 font-medium">
            {card.summary || card.content}
          </p>

          {card.topic && (
            <span className="inline-block text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded px-1.5 py-0.5 mb-2">
              {card.topic}
            </span>
          )}

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{extraTagCount}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-1">
            {Icon && <Icon size={12} className="text-slate-400 dark:text-slate-500" />}
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(new Date(card.capturedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
