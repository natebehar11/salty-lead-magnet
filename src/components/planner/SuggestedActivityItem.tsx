'use client';

import { SuggestedActivity } from '@/types/planner';

const CATEGORY_ICONS: Record<string, { icon: string; label: string }> = {
  landmark: { icon: '📍', label: 'Landmark' },
  fitness: { icon: '💪', label: 'Fitness' },
  restaurant: { icon: '🍽', label: 'Restaurant' },
  neighborhood: { icon: '🏘', label: 'Neighborhood' },
  'hidden-gem': { icon: '💎', label: 'Hidden Gem' },
  outdoor: { icon: '🌿', label: 'Outdoor' },
};

interface SuggestedActivityItemProps {
  activity: SuggestedActivity;
  cityName: string;
  linkStatus?: 'valid' | 'invalid' | 'pending';
}

export default function SuggestedActivityItem({ activity, cityName, linkStatus }: SuggestedActivityItemProps) {
  const cat = CATEGORY_ICONS[activity.category] || CATEGORY_ICONS.landmark;

  const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(activity.name + ' ' + cityName)}`;
  const href = linkStatus === 'invalid' ? fallbackUrl : (activity.link || fallbackUrl);

  return (
    <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-salty-beige/30 transition-colors">
      <span className="text-sm flex-shrink-0 mt-0.5" title={cat.label}>
        {cat.icon}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-sm text-salty-deep-teal hover:text-salty-orange-red transition-colors underline underline-offset-2 decoration-salty-orange-red/30 hover:decoration-salty-orange-red"
          >
            {activity.name}
          </a>

          {activity.priceRange && (
            <span className="font-body text-[10px] text-salty-slate/50 bg-salty-beige/50 px-1.5 py-0.5 rounded">
              {activity.priceRange}
            </span>
          )}

          {/* Link status indicator */}
          {linkStatus === 'pending' && (
            <span className="w-3 h-3 rounded-full border-2 border-salty-beige border-t-salty-slate/40 animate-spin flex-shrink-0" />
          )}
          {linkStatus === 'valid' && (
            <svg className="w-3.5 h-3.5 text-salty-forest-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {linkStatus === 'invalid' && (
            <span className="font-body text-[9px] text-salty-burnt-red/60" title="Original link unavailable — opens Google search instead">
              search
            </span>
          )}
        </div>

        <p className="font-body text-xs text-salty-slate/60 mt-0.5 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
