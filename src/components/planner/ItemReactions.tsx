'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SharedReaction } from '@/lib/shared-plans';
import { REACTION_EMOJIS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ItemReactionsProps {
  itemId: string;
  reactions: SharedReaction[];
  myReaction: string | null;
  hasJoined: boolean;
  onReact: (itemId: string, reaction: SharedReaction['reaction']) => void;
}

/** Tally reactions by type, preserving display order */
function getReactionCounts(reactions: SharedReaction[]) {
  const counts: Partial<Record<SharedReaction['reaction'], number>> = {};
  for (const r of reactions) {
    counts[r.reaction] = (counts[r.reaction] || 0) + 1;
  }
  return (['love', 'interested', 'meh'] as const)
    .filter((r) => counts[r])
    .map((r) => ({ reaction: r, count: counts[r]! }));
}

/** Friendly summary when 2+ people have reacted */
function getReactionSummary(reactions: SharedReaction[]): string | null {
  if (reactions.length < 2) return null;
  const loveCount = reactions.filter((r) => r.reaction === 'love').length;
  if (loveCount >= 2) return `${loveCount} people love this`;
  return `${reactions.length} people reacted`;
}

export default function ItemReactions({
  itemId,
  reactions,
  myReaction,
  hasJoined,
  onReact,
}: ItemReactionsProps) {
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  const counts = getReactionCounts(reactions);
  const summary = getReactionSummary(reactions);

  function handleClick(reaction: SharedReaction['reaction']) {
    setAnimatingReaction(reaction);
    onReact(itemId, reaction);
    // Clear animation flag after the spring finishes
    setTimeout(() => setAnimatingReaction(null), 400);
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex items-center gap-1">
        {hasJoined ? (
          /* Interactive reaction buttons for joined friends */
          (['love', 'interested', 'meh'] as const).map((r) => {
            const isSelected = myReaction === r;
            const count = counts.find((c) => c.reaction === r)?.count || 0;
            const isAnimating = animatingReaction === r;

            return (
              <motion.button
                key={r}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleClick(r)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg transition-colors',
                  isSelected
                    ? 'bg-salty-orange-red/10 ring-1 ring-salty-orange-red/30'
                    : 'hover:bg-salty-beige/30',
                )}
                aria-label={`React with ${r}`}
                aria-pressed={isSelected}
              >
                <AnimatePresence mode="wait">
                  {isSelected || isAnimating ? (
                    <motion.span
                      key={`${r}-pop`}
                      initial={{ scale: 0.3, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                      className="text-base leading-none"
                    >
                      {REACTION_EMOJIS[r]}
                    </motion.span>
                  ) : (
                    <span className="text-base leading-none opacity-50">
                      {REACTION_EMOJIS[r]}
                    </span>
                  )}
                </AnimatePresence>

                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-body font-bold text-salty-slate/50 min-w-[0.75rem] text-center"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>
            );
          })
        ) : (
          /* Read-only counts for visitors who haven't joined */
          counts.length > 0 && (
            counts.map(({ reaction, count }) => (
              <span
                key={reaction}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-salty-beige/20"
              >
                <span className="text-sm leading-none">{REACTION_EMOJIS[reaction]}</span>
                <span className="font-body text-[11px] text-salty-slate/40">{count}</span>
              </span>
            ))
          )
        )}
      </div>

      {/* Summary text (only shown when 2+ reactions exist) */}
      {summary && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-[10px] text-salty-slate/40 pl-0.5"
        >
          {summary}
        </motion.p>
      )}
    </div>
  );
}
