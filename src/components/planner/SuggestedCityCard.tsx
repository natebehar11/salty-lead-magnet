'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuggestedCity } from '@/types/planner';
import SuggestedActivityItem from './SuggestedActivityItem';

interface SuggestedCityCardProps {
  city: SuggestedCity;
  isChecked: boolean;
  onToggleChecked: (cityId: string) => void;
  onExpand?: () => void;
}

export default function SuggestedCityCard({ city, isChecked, onToggleChecked, onExpand }: SuggestedCityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [linkStatuses, setLinkStatuses] = useState<Record<string, 'valid' | 'invalid' | 'pending'>>({});
  const hasVerified = useRef(false);
  const hasTriggeredExpand = useRef(false);

  const hasActivities = city.activities && city.activities.length > 0;

  // Verify links on first expand
  useEffect(() => {
    if (!isExpanded || hasVerified.current || !hasActivities) return;
    hasVerified.current = true;

    const urls = city.activities
      .filter((a) => a.link)
      .map((a) => a.link as string);

    if (urls.length === 0) return;

    // Set all to pending
    const pending: Record<string, 'pending'> = {};
    for (const url of urls) {
      pending[url] = 'pending';
    }
    setLinkStatuses(pending);

    fetch('/api/links/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setLinkStatuses(data.results);
        }
      })
      .catch(() => {
        // Silently fail — links just won't show status
        setLinkStatuses({});
      });
  }, [isExpanded, hasActivities, city.activities]);

  const handleToggleExpand = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    if (willExpand && !hasTriggeredExpand.current) {
      hasTriggeredExpand.current = true;
      onExpand?.();
    }
  };

  return (
    <div className="bg-salty-beige/30 rounded-xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={handleToggleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-salty-beige/50 transition-colors"
      >
        {/* Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleChecked(city.id);
          }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
            isChecked
              ? 'bg-salty-orange-red border-salty-orange-red'
              : 'border-salty-beige hover:border-salty-deep-teal/30'
          }`}
        >
          {isChecked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* City info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-lg text-salty-deep-teal">
            {city.name}, {city.country}
          </h4>
          {city.description && (
            <p className="font-body text-xs text-salty-slate/60 mt-0.5 line-clamp-1">
              {city.description}
            </p>
          )}
        </div>

        {/* Days badge */}
        <span className="font-body text-xs text-salty-orange-red font-bold bg-salty-orange-red/10 px-3 py-1 rounded-full flex-shrink-0">
          {city.days} days
        </span>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-salty-slate/40 flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {hasActivities ? (
                <div className="space-y-0.5">
                  {city.activities.map((activity, i) => (
                    <SuggestedActivityItem
                      key={`${activity.name}-${i}`}
                      activity={activity}
                      cityName={city.name}
                      linkStatus={activity.link ? linkStatuses[activity.link] : undefined}
                    />
                  ))}
                </div>
              ) : city.highlights && city.highlights.length > 0 ? (
                // Backward compat: render old highlights format
                <div className="flex flex-wrap gap-2 pt-1">
                  {city.highlights.map((h) => (
                    <span
                      key={h}
                      className="font-body text-xs text-salty-slate/60 bg-salty-cream px-2 py-1 rounded-full border border-salty-beige"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-body text-xs text-salty-slate/40 italic">
                  No activities available for this city.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
