'use client';

import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './Card';
import * as Icons from 'lucide-react';

export function Column({ column, cards, onCardClick }) {
  const Icon = Icons[column.icon];

  return (
    <div className="flex flex-col flex-1 min-w-[260px] max-w-[320px]">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
        {Icon && <Icon size={14} className="text-slate-500 dark:text-slate-400" />}
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {column.title}
        </span>
        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5 font-medium">
          {cards.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 rounded-lg p-2 overflow-y-auto
              min-h-[400px] max-h-[calc(100vh-200px)]
              transition-colors
              ${
                snapshot.isDraggingOver
                  ? 'bg-slate-100 dark:bg-slate-700/50'
                  : 'bg-slate-50 dark:bg-slate-800/30'
              }
            `}
          >
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Drop cards here
                </span>
              </div>
            )}

            {cards.map((card, index) => (
              <KanbanCard
                key={card._id}
                card={card}
                index={index}
                onClick={() => onCardClick(card)}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
