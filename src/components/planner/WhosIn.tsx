'use client';

import { motion } from 'motion/react';
import { SharedPlanFriend } from '@/lib/shared-plans';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Display order for statuses — most committed first */
const STATUS_ORDER: SharedPlanFriend['status'][] = ['in', 'interested', 'maybe', 'out'];

/** Progress bar segment colors (Tailwind bg classes) */
const PROGRESS_COLORS: Record<SharedPlanFriend['status'], string> = {
  in: 'bg-salty-seafoam',
  interested: 'bg-salty-light-blue',
  maybe: 'bg-salty-yellow',
  out: 'bg-salty-beige',
};

interface WhosInProps {
  creatorName: string;
  friends: SharedPlanFriend[];
}

/** Extract up to 2 initials from a name */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

/** Sort friends by status priority (in → interested → maybe → out), then by join date */
function sortFriends(friends: SharedPlanFriend[]): SharedPlanFriend[] {
  return [...friends].sort((a, b) => {
    const aIdx = STATUS_ORDER.indexOf(a.status);
    const bIdx = STATUS_ORDER.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });
}

/** Count friends by status */
function getStatusCounts(friends: SharedPlanFriend[]): Record<SharedPlanFriend['status'], number> {
  const counts: Record<SharedPlanFriend['status'], number> = { in: 0, interested: 0, maybe: 0, out: 0 };
  for (const f of friends) {
    counts[f.status]++;
  }
  return counts;
}

export default function WhosIn({ creatorName, friends }: WhosInProps) {
  const sorted = sortFriends(friends);
  const counts = getStatusCounts(friends);
  // Total includes creator (always "in")
  const total = friends.length + 1;
  const inCount = counts.in + 1; // +1 for creator

  return (
    <div className="bg-white rounded-2xl border border-salty-beige/50 p-6 mb-6">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-salty-deep-teal tracking-wider uppercase">
          Who&apos;s In?
        </h2>
        <span className="font-body text-xs text-salty-slate/50">
          {inCount} of {total} confirmed
        </span>
      </div>

      {/* Progress bar */}
      {friends.length > 0 && (
        <div
          className="flex h-2 rounded-full overflow-hidden mb-5 bg-salty-beige/30"
          role="progressbar"
          aria-label="Trip commitment breakdown"
          aria-valuenow={inCount}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          {STATUS_ORDER.map((status) => {
            const count = status === 'in' ? inCount : counts[status];
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <motion.div
                key={status}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={cn('h-full', PROGRESS_COLORS[status])}
                title={`${STATUS_LABELS[status]}: ${count}`}
              />
            );
          })}
        </div>
      )}

      {/* Organizer (always first) */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-3 p-3 bg-salty-orange-red/5 rounded-xl"
      >
        <span
          className="w-9 h-9 flex items-center justify-center rounded-full bg-salty-orange-red text-white font-display text-xs shrink-0"
          aria-hidden="true"
        >
          {getInitials(creatorName)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-salty-deep-teal font-bold truncate">
            {creatorName}
          </p>
          <p className="font-body text-[11px] text-salty-slate/40">Organizer</p>
        </div>
        <span className="font-body text-[10px] font-bold text-salty-orange-red bg-salty-orange-red/10 px-2 py-0.5 rounded-full shrink-0">
          {STATUS_LABELS.in}
        </span>
      </motion.div>

      {/* Friends list — sorted by status, staggered entrance */}
      {sorted.map((friend, i) => (
        <motion.div
          key={friend.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 * (i + 1) }}
          className="flex items-center gap-3 mb-2 p-3 bg-salty-beige/20 rounded-xl"
        >
          <span
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-full font-display text-xs shrink-0',
              STATUS_COLORS[friend.status],
            )}
            aria-hidden="true"
          >
            {getInitials(friend.name)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-salty-deep-teal font-bold truncate">
              {friend.name}
            </p>
            {friend.originCity && (
              <p className="font-body text-[11px] text-salty-slate/40 truncate">
                {friend.originCity}
              </p>
            )}
          </div>
          <span className="font-body text-xs text-salty-slate/50 shrink-0">
            {STATUS_LABELS[friend.status]}
          </span>
        </motion.div>
      ))}

      {/* Empty state */}
      {friends.length === 0 && (
        <p className="font-body text-sm text-salty-slate/40 text-center py-4">
          No one else has joined yet. Be the first!
        </p>
      )}

      {/* Legend (only when friends exist) */}
      {friends.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-salty-beige/30">
          {STATUS_ORDER.map((status) => {
            const count = status === 'in' ? inCount : counts[status];
            if (count === 0) return null;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span className={cn('w-2.5 h-2.5 rounded-full', PROGRESS_COLORS[status])} />
                <span className="font-body text-[10px] text-salty-slate/40">
                  {STATUS_LABELS[status]} ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
