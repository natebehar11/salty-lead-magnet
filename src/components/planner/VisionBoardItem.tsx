'use client';

import { motion } from 'motion/react';
import { BoardItem } from '@/types/vision-board';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_ACCENT_COLORS, CATEGORY_ACCENT_FALLBACK } from '@/lib/constants';

interface VisionBoardItemProps {
  item: BoardItem;
  onRemove: (itemId: string) => void;
}

export default function VisionBoardItem({ item, onRemove }: VisionBoardItemProps) {
  const categoryIcon = item.activityCategory ? CATEGORY_ICONS[item.activityCategory] : null;
  const categoryLabel = item.activityCategory ? CATEGORY_LABELS[item.activityCategory] : null;
  const accentClass = item.activityCategory
    ? CATEGORY_ACCENT_COLORS[item.activityCategory]
    : CATEGORY_ACCENT_FALLBACK;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group flex items-start gap-2.5 py-2.5 px-3 rounded-xl border transition-colors hover:shadow-sm ${accentClass}`}
    >
      {/* Category icon */}
      {categoryIcon && (
        <span className="text-base flex-shrink-0 mt-0.5" title={categoryLabel || undefined}>
          {categoryIcon}
        </span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-bold text-salty-deep-teal hover:text-salty-orange-red transition-colors truncate"
            >
              {item.name}
            </a>
          ) : (
            <span className="font-body text-sm font-bold text-salty-deep-teal truncate">
              {item.name}
            </span>
          )}
          {item.priceRange && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 text-salty-slate/60 flex-shrink-0 font-body font-medium">
              {item.priceRange}
            </span>
          )}
        </div>
        {item.description && (
          <p className="font-body text-xs text-salty-slate/50 line-clamp-2 mt-0.5 leading-relaxed">
            {item.description}
          </p>
        )}
        {/* Category label pill */}
        {categoryLabel && (
          <span className="inline-block font-body text-[9px] uppercase text-salty-slate/40 mt-1">
            {categoryLabel}
          </span>
        )}
      </div>

      {/* Remove button — always visible on touch devices, hover on desktop */}
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 size-6 rounded-full flex items-center justify-center text-salty-slate/30 hover:text-salty-orange-red hover:bg-salty-orange-red/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        aria-label={`Remove ${item.name} from board`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
