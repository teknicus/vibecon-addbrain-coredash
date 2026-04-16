'use client';

import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from './Column';
import { CardDetail } from '@/components/cards/CardDetail';
import { COLUMNS } from '@/lib/constants';
import { toast } from 'sonner';

export function Board({ initialCards }) {
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState(null);

  function groupByStatus(allCards) {
    return Object.fromEntries(
      COLUMNS.map((col) => [
        col.id,
        allCards.filter((c) => c.status === col.id),
      ])
    );
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newStatus = destination.droppableId;
    const previousCards = cards;

    setCards((prev) =>
      prev.map((c) => (c._id === draggableId ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/cards/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch {
      setCards(previousCards);
      toast.error('Failed to move card. Please try again.');
    }
  }

  function handleCardUpdate(updated) {
    setCards((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
    setSelectedCard(updated);
  }

  function handleCardArchive(id) {
    setCards((prev) => prev.filter((c) => c._id !== id));
    setSelectedCard(null);
  }

  const grouped = groupByStatus(cards);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              cards={grouped[col.id] ?? []}
              onCardClick={setSelectedCard}
            />
          ))}
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onArchive={handleCardArchive}
        />
      )}
    </>
  );
}
