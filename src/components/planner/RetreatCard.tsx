'use client';

import { Retreat } from '@/types';
import DragHandle from './DragHandle';

interface RetreatCardProps {
  retreat: Retreat;
}

/** The retreat as a draggable card in the itinerary board. */
export default function RetreatCard({ retreat }: RetreatCardProps) {
  return (
    <div className="rounded-2xl bg-salty-deep-teal text-white px-4 py-3 flex items-center gap-3">
      <DragHandle className="text-white/30 hover:text-white/50" />
      <div className="flex-1 min-w-0">
        <div className="font-display text-xs tracking-wider uppercase opacity-70">Your Retreat</div>
        <div className="font-display text-sm tracking-wider uppercase mt-1 truncate">{retreat.title}</div>
        <div className="font-body text-xs opacity-60 mt-1">
          {retreat.destination} &middot; {retreat.duration.days} days
        </div>
      </div>
    </div>
  );
}
