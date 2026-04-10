'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Retreat } from '@/types';
import { BoardCityGroup, CityPosition } from '@/types/vision-board';
import { usePlannerStore } from '@/stores/planner-store';
import { splitBoardItemsByPosition } from '@/lib/board-utils';
import { CATEGORY_ICONS, CATEGORY_ICON_FALLBACK } from '@/lib/constants';

interface ItineraryViewProps {
  retreat: Retreat;
}

/**
 * Timeline view of the trip: Before → RETREAT → After.
 * Cities can be moved between before/after sections.
 * Day numbers are calculated cumulatively.
 */
export default function ItineraryView({ retreat }: ItineraryViewProps) {
  const boardItems = usePlannerStore((s) => s.boardItems);
  const beforeAfterAssignment = usePlannerStore((s) => s.beforeAfterAssignment);
  const setCityBeforeAfter = usePlannerStore((s) => s.setCityBeforeAfter);
  const removeBoardItem = usePlannerStore((s) => s.removeBoardItem);

  const { before, after } = useMemo(
    () => splitBoardItemsByPosition(boardItems, beforeAfterAssignment),
    [boardItems, beforeAfterAssignment]
  );

  // Calculate cumulative day numbers
  const beforeDays = before.reduce((sum, city) => sum + (city.days || 0), 0);
  const retreatDays = retreat.duration.days;
  const afterDays = after.reduce((sum, city) => sum + (city.days || 0), 0);
  const totalDays = beforeDays + retreatDays + afterDays;

  // Build day ranges for each section
  let currentDay = 1;

  const beforeWithDays = before.map((city) => {
    const startDay = currentDay;
    const days = city.days || 0;
    currentDay += days;
    return { ...city, startDay, endDay: days > 0 ? startDay + days - 1 : 0 };
  });

  const retreatStartDay = currentDay;
  const retreatEndDay = currentDay + retreatDays - 1;
  currentDay = retreatEndDay + 1;

  const afterWithDays = after.map((city) => {
    const startDay = currentDay;
    const days = city.days || 0;
    currentDay += days;
    return { ...city, startDay, endDay: days > 0 ? startDay + days - 1 : 0 };
  });

  function handleTogglePosition(cityName: string, currentPosition: CityPosition) {
    setCityBeforeAfter(cityName, currentPosition === 'before' ? 'after' : 'before');
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Trip duration summary */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 text-xs font-body text-salty-slate/60">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-salty-seafoam" />
            {beforeDays > 0 ? `${beforeDays}d before` : 'No days before'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-salty-deep-teal" />
            {retreatDays}d retreat
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-salty-light-blue" />
            {afterDays > 0 ? `${afterDays}d after` : 'No days after'}
          </span>
          {totalDays > 0 && (
            <span className="ml-auto font-display text-[11px] tracking-wider uppercase text-salty-deep-teal">
              ~{totalDays} days total
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative px-4 pb-4">
        {/* Vertical timeline line */}
        <div className="absolute left-[29px] top-0 bottom-0 w-px bg-salty-beige/50" />

        {/* ─── BEFORE SECTION ─── */}
        {before.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 py-2 pl-6">
              <span className="font-display text-[10px] tracking-widest uppercase text-salty-seafoam">
                Before Retreat
              </span>
              <div className="flex-1 h-px bg-salty-beige/30" />
            </div>
            <div className="space-y-1">
              {beforeWithDays.map((city) => (
                <ItineraryCityBlock
                  key={city.cityName}
                  city={city}
                  startDay={city.startDay}
                  endDay={city.endDay}
                  position="before"
                  onTogglePosition={() => handleTogglePosition(city.cityName, 'before')}
                  onRemoveItem={removeBoardItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── RETREAT ANCHOR ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative my-3"
        >
          <div className="flex items-start gap-3">
            {/* Timeline node — large, anchored */}
            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-salty-deep-teal border-[3px] border-salty-cream shadow-md mt-3" />

            {/* Retreat card */}
            <div className="flex-1 rounded-2xl bg-salty-deep-teal text-white px-4 py-3 shadow-lg">
              <div className="font-display text-[10px] tracking-widest uppercase opacity-60">
                Day {retreatStartDay}–{retreatEndDay} · Your Retreat
              </div>
              <div className="font-display text-sm tracking-wider uppercase mt-1 truncate">
                {retreat.title}
              </div>
              <div className="font-body text-xs opacity-60 mt-1">
                {retreat.destination} · {retreatDays} days · {retreat.duration.nights} nights
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── AFTER SECTION ─── */}
        {after.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 py-2 pl-6">
              <span className="font-display text-[10px] tracking-widest uppercase text-salty-light-blue">
                After Retreat
              </span>
              <div className="flex-1 h-px bg-salty-beige/30" />
            </div>
            <div className="space-y-1">
              {afterWithDays.map((city) => (
                <ItineraryCityBlock
                  key={city.cityName}
                  city={city}
                  startDay={city.startDay}
                  endDay={city.endDay}
                  position="after"
                  onTogglePosition={() => handleTogglePosition(city.cityName, 'after')}
                  onRemoveItem={removeBoardItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state nudges */}
        {before.length === 0 && after.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-body text-sm text-salty-slate/40">
              Add cities via the chat to build your itinerary
            </p>
          </div>
        )}

        {(before.length > 0 || after.length > 0) && (before.length === 0 || after.length === 0) && (
          <div className="py-3 text-center">
            <p className="font-body text-xs text-salty-slate/30 italic">
              {before.length === 0
                ? 'Tip: Move a city to "before" to explore on arrival'
                : 'Tip: Move a city to "after" to extend your trip'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Sub-component: City block within the timeline
// ─────────────────────────────────────────────────────

interface ItineraryCityBlockProps {
  city: BoardCityGroup;
  startDay: number;
  endDay: number;
  position: CityPosition;
  onTogglePosition: () => void;
  onRemoveItem: (id: string) => void;
}

function ItineraryCityBlock({
  city,
  startDay,
  endDay,
  position,
  onTogglePosition,
  onRemoveItem,
}: ItineraryCityBlockProps) {
  const dayLabel =
    endDay > 0
      ? startDay === endDay
        ? `Day ${startDay}`
        : `Day ${startDay}–${endDay}`
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-start gap-3"
    >
      {/* Timeline node */}
      <div className="relative z-10 flex-shrink-0 w-3 h-3 rounded-full bg-salty-beige border-2 border-salty-cream mt-2.5 ml-1.5" />

      {/* City content */}
      <div className="flex-1 min-w-0 rounded-xl bg-white border border-salty-beige/40 px-3 py-2.5 shadow-sm">
        {/* City header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {dayLabel && (
              <span className="font-display text-[10px] tracking-widest uppercase text-salty-slate/40 block">
                {dayLabel}
              </span>
            )}
            <h4 className="font-display text-xs tracking-wider uppercase text-salty-deep-teal truncate">
              {city.cityName}
            </h4>
            <span className="font-body text-[10px] text-salty-slate/40">
              {city.country}
              {city.days > 0 && ` · ${city.days} ${city.days === 1 ? 'day' : 'days'}`}
            </span>
          </div>

          {/* Move to before/after button */}
          <button
            onClick={onTogglePosition}
            className="flex-shrink-0 font-body text-[10px] text-salty-slate/30 hover:text-salty-deep-teal transition-colors px-2 py-1 rounded-lg hover:bg-salty-cream/60"
            aria-label={`Move ${city.cityName} to ${position === 'before' ? 'after' : 'before'} retreat`}
            title={`Move to ${position === 'before' ? 'after' : 'before'} retreat`}
          >
            {position === 'before' ? '↓ After' : '↑ Before'}
          </button>
        </div>

        {/* Activity items nested under city */}
        {city.items.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-salty-beige/20 pt-2">
            {city.items.map((item) => {
              const icon = item.activityCategory
                ? CATEGORY_ICONS[item.activityCategory] || CATEGORY_ICON_FALLBACK
                : CATEGORY_ICON_FALLBACK;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-xs flex-shrink-0">{icon}</span>
                  <span className="font-body text-xs text-salty-slate/70 truncate flex-1">
                    {item.name}
                  </span>
                  {item.priceRange && (
                    <span className="font-body text-[10px] text-salty-slate/30 flex-shrink-0">
                      {item.priceRange}
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-salty-slate/20 hover:text-salty-orange-red flex-shrink-0 px-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
