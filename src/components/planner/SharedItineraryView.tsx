'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  SharedBoardItemData,
  SharedReaction,
} from '@/lib/shared-plans';
import { CATEGORY_ICONS, CATEGORY_ICON_FALLBACK } from '@/lib/constants';
import ItemReactions from './ItemReactions';

interface SharedItineraryViewProps {
  boardItems: SharedBoardItemData[];
  retreatName: string;
  retreatDates: string;
  beforeAfterAssignment: Record<string, 'before' | 'after'>;
  /** All reactions on this plan */
  reactions: SharedReaction[];
  /** Whether the current viewer has joined */
  hasJoined: boolean;
  /** Name of the viewing friend */
  viewerName: string;
  /** Callback when a reaction is made */
  onReact: (itemId: string, reaction: 'love' | 'interested' | 'meh') => void;
}

interface CityGroup {
  cityName: string;
  country: string;
  days: number;
  imageUrl: string | null;
  items: SharedBoardItemData[];
}

function groupByCity(items: SharedBoardItemData[]): CityGroup[] {
  const order: string[] = [];
  const cityItems = new Map<string, SharedBoardItemData[]>();
  const cityMeta = new Map<string, { country: string; days: number; imageUrl: string | null }>();

  for (const item of items) {
    const key = item.cityName;
    if (!cityItems.has(key)) {
      order.push(key);
      cityItems.set(key, []);
      cityMeta.set(key, { country: item.country, days: 0, imageUrl: null });
    }
    if (item.type === 'city') {
      const meta = cityMeta.get(key)!;
      meta.days = item.days ?? meta.days;
      meta.imageUrl = item.imageUrl || meta.imageUrl;
    } else {
      cityItems.get(key)!.push(item);
    }
  }

  return order.map((cityName) => {
    const meta = cityMeta.get(cityName)!;
    return { cityName, ...meta, items: cityItems.get(cityName)! };
  });
}

function splitByPosition(
  groups: CityGroup[],
  assignment: Record<string, 'before' | 'after'>
): { before: CityGroup[]; after: CityGroup[] } {
  const before: CityGroup[] = [];
  const after: CityGroup[] = [];
  for (const g of groups) {
    if (assignment[g.cityName] === 'after') after.push(g);
    else before.push(g);
  }
  return { before, after };
}

/**
 * Read-only itinerary timeline for shared plans.
 * Shows Before → RETREAT → After with reactions.
 */
export default function SharedItineraryView({
  boardItems,
  retreatName,
  retreatDates,
  beforeAfterAssignment,
  reactions,
  hasJoined,
  viewerName,
  onReact,
}: SharedItineraryViewProps) {
  const groups = useMemo(() => groupByCity(boardItems), [boardItems]);
  const { before, after } = useMemo(
    () => splitByPosition(groups, beforeAfterAssignment),
    [groups, beforeAfterAssignment]
  );

  // Day calculation
  let currentDay = 1;
  const beforeWithDays = before.map((city) => {
    const startDay = currentDay;
    const days = city.days || 0;
    currentDay += days;
    return { ...city, startDay, endDay: days > 0 ? startDay + days - 1 : 0 };
  });

  // Retreat days — estimate from dates or default to 7
  const retreatDayCount = 7; // TODO: pass actual duration
  const retreatStartDay = currentDay;
  const retreatEndDay = currentDay + retreatDayCount - 1;
  currentDay = retreatEndDay + 1;

  const afterWithDays = after.map((city) => {
    const startDay = currentDay;
    const days = city.days || 0;
    currentDay += days;
    return { ...city, startDay, endDay: days > 0 ? startDay + days - 1 : 0 };
  });

  function getReactionsForItem(itemId: string): SharedReaction[] {
    return reactions.filter((r) => r.itemId === itemId);
  }

  function getMyReaction(itemId: string): string | null {
    const r = reactions.find(
      (r) => r.itemId === itemId && r.friendName.toLowerCase() === viewerName.toLowerCase()
    );
    return r?.reaction || null;
  }

  return (
    <div className="space-y-4">
      {/* Before */}
      {before.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-salty-seafoam" />
            <span className="font-display text-[11px] tracking-widest uppercase text-salty-seafoam">
              Before Retreat
            </span>
            <div className="flex-1 h-px bg-salty-beige/30" />
          </div>
          <div className="space-y-3">
            {beforeWithDays.map((city) => (
              <TimelineCity
                key={city.cityName}
                city={city}
                startDay={city.startDay}
                endDay={city.endDay}
                reactions={reactions}
                hasJoined={hasJoined}
                viewerName={viewerName}
                onReact={onReact}
                getReactionsForItem={getReactionsForItem}
                getMyReaction={getMyReaction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Retreat anchor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-salty-deep-teal text-white px-5 py-4 shadow-lg"
      >
        <div className="font-display text-[10px] tracking-widest uppercase opacity-60">
          Day {retreatStartDay}–{retreatEndDay} · The Retreat
        </div>
        <div className="font-display text-lg tracking-wider uppercase mt-1">
          {retreatName}
        </div>
        {retreatDates && (
          <div className="font-body text-xs opacity-50 mt-1">{retreatDates}</div>
        )}
      </motion.div>

      {/* After */}
      {after.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-salty-light-blue" />
            <span className="font-display text-[11px] tracking-widest uppercase text-salty-light-blue">
              After Retreat
            </span>
            <div className="flex-1 h-px bg-salty-beige/30" />
          </div>
          <div className="space-y-3">
            {afterWithDays.map((city) => (
              <TimelineCity
                key={city.cityName}
                city={city}
                startDay={city.startDay}
                endDay={city.endDay}
                reactions={reactions}
                hasJoined={hasJoined}
                viewerName={viewerName}
                onReact={onReact}
                getReactionsForItem={getReactionsForItem}
                getMyReaction={getMyReaction}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── City block in timeline ──────────────────────────
interface TimelineCityProps {
  city: CityGroup & { startDay: number; endDay: number };
  startDay: number;
  endDay: number;
  reactions: SharedReaction[];
  hasJoined: boolean;
  viewerName: string;
  onReact: (itemId: string, reaction: 'love' | 'interested' | 'meh') => void;
  getReactionsForItem: (itemId: string) => SharedReaction[];
  getMyReaction: (itemId: string) => string | null;
}

function TimelineCity({
  city,
  startDay,
  endDay,
  hasJoined,
  onReact,
  getReactionsForItem,
  getMyReaction,
}: TimelineCityProps) {
  const dayLabel =
    endDay > 0
      ? startDay === endDay
        ? `Day ${startDay}`
        : `Day ${startDay}–${endDay}`
      : null;

  return (
    <div className="rounded-xl bg-white border border-salty-beige/40 px-4 py-3 shadow-sm">
      <div className="mb-1">
        {dayLabel && (
          <span className="font-display text-[10px] tracking-widest uppercase text-salty-slate/40 block">
            {dayLabel}
          </span>
        )}
        <h4 className="font-display text-sm tracking-wider uppercase text-salty-deep-teal">
          {city.cityName}
        </h4>
        <span className="font-body text-[11px] text-salty-slate/40">
          {city.country}
          {city.days > 0 && ` · ${city.days} ${city.days === 1 ? 'day' : 'days'}`}
        </span>
      </div>

      {city.items.length > 0 && (
        <div className="mt-2 space-y-2 border-t border-salty-beige/20 pt-2">
          {city.items.map((item) => {
            const icon = item.activityCategory
              ? CATEGORY_ICONS[item.activityCategory as keyof typeof CATEGORY_ICONS] || CATEGORY_ICON_FALLBACK
              : CATEGORY_ICON_FALLBACK;

            return (
              <div key={item.id} className="flex items-start gap-2.5 py-1">
                <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm font-bold text-salty-deep-teal">{item.name}</span>
                    {item.priceRange && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-salty-beige/50 text-salty-slate/60">
                        {item.priceRange}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="font-body text-xs text-salty-slate/50 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <ItemReactions
                    itemId={item.id}
                    reactions={getReactionsForItem(item.id)}
                    myReaction={getMyReaction(item.id)}
                    hasJoined={hasJoined}
                    onReact={onReact}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
