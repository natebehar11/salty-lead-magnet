'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { RecommendationCard } from '@/types/vision-board';
import { CATEGORY_ICONS, CATEGORY_ICON_FALLBACK, CITY_ICON, CATEGORY_LABELS } from '@/lib/constants';

interface ChatRecommendationCardProps {
  recommendation: RecommendationCard;
  isOnBoard: boolean;
  onAdd: (rec: RecommendationCard) => void;
  messageId: string;
}

export default function ChatRecommendationCard({
  recommendation,
  isOnBoard,
  onAdd,
}: ChatRecommendationCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const isCity = recommendation.type === 'city';
  const icon = recommendation.activityCategory
    ? CATEGORY_ICONS[recommendation.activityCategory] || CATEGORY_ICON_FALLBACK
    : isCity ? CITY_ICON : CATEGORY_ICON_FALLBACK;

  const categoryLabel = recommendation.activityCategory
    ? CATEGORY_LABELS[recommendation.activityCategory]
    : null;

  const saved = isOnBoard || justAdded;

  function handleAdd() {
    if (saved) return;
    onAdd(recommendation);
    setJustAdded(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 px-3 py-3 rounded-xl border transition-colors ${
        saved
          ? 'bg-salty-seafoam/10 border-salty-seafoam/30'
          : isCity
            ? 'bg-salty-deep-teal/[0.03] border-salty-deep-teal/15 hover:border-salty-deep-teal/30'
            : 'bg-white border-salty-beige/50 hover:border-salty-deep-teal/20'
      }`}
    >
      {/* Icon — larger for city cards */}
      <span className={`flex-shrink-0 mt-0.5 ${isCity ? 'text-xl' : 'text-base'}`}>{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-body font-bold text-salty-deep-teal truncate ${isCity ? 'text-[15px]' : 'text-sm'}`}>
            {recommendation.name}
          </span>
          {recommendation.priceRange && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-salty-beige/50 text-salty-slate/60 flex-shrink-0 font-body">
              {recommendation.priceRange}
            </span>
          )}
          {/* Category label for non-city items */}
          {!isCity && categoryLabel && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-salty-beige/30 text-salty-slate/40 flex-shrink-0 font-body uppercase">
              {categoryLabel}
            </span>
          )}
        </div>
        <p className="font-body text-xs text-salty-slate/50 line-clamp-2 mt-0.5 leading-relaxed">
          {recommendation.description}
        </p>
        {/* Days badge for city cards */}
        {isCity && recommendation.days && (
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-salty-light-blue/30 text-salty-deep-teal mt-1.5 font-body font-medium">
            {recommendation.days} {recommendation.days === 1 ? 'day' : 'days'} suggested
          </span>
        )}
        {/* Location context for non-city items */}
        {!isCity && recommendation.cityName && (
          <span className="inline-block text-[10px] text-salty-slate/30 mt-0.5 font-body">
            in {recommendation.cityName}{recommendation.country ? `, ${recommendation.country}` : ''}
          </span>
        )}
      </div>

      {/* Add / Saved button */}
      <motion.button
        whileTap={saved ? {} : { scale: 0.85 }}
        onClick={handleAdd}
        disabled={saved}
        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors ${
          saved
            ? 'bg-salty-seafoam text-salty-deep-teal'
            : 'bg-salty-orange-red text-white hover:bg-salty-burnt-red active:bg-salty-burnt-red'
        }`}
        aria-label={saved ? 'Saved to board' : 'Add to board'}
      >
        {saved ? (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </motion.button>
    </motion.div>
  );
}
