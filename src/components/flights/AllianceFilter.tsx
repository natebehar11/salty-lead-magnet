'use client';

import { useState } from 'react';
import { alliances, independentAirlines, Alliance } from '@/data/alliances';
import { cn } from '@/lib/utils';

interface AllianceFilterProps {
  selectedAlliances: string[];
  onChange: (alliances: string[]) => void;
}

function AllianceTooltip({ alliance, onClose }: { alliance: Alliance; onClose: () => void }) {
  return (
    <div className="absolute z-50 top-full mt-2 left-0 bg-salty-cream border-2 border-salty-beige rounded-xl shadow-lg p-4 min-w-[280px] max-w-[340px] max-h-[300px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display text-sm text-salty-deep-teal">{alliance.name}</h4>
          <p className="font-body text-xs text-salty-slate/50">Founded {alliance.founded} &middot; {alliance.airlines.length} airlines</p>
        </div>
        <button onClick={onClose} className="text-salty-slate/40 hover:text-salty-slate text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {/* Filter out duplicates and sort */}
        {[...new Set(alliance.airlines)].filter((a) => a.length > 3).sort().map((airline) => (
          <span key={airline} className="font-body text-[11px] text-salty-slate/70 bg-salty-beige/50 px-2 py-0.5 rounded-full">
            {airline}
          </span>
        ))}
      </div>
    </div>
  );
}

function IndependentTooltip({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute z-50 top-full mt-2 right-0 bg-salty-cream border-2 border-salty-beige rounded-xl shadow-lg p-4 min-w-[280px] max-w-[340px] max-h-[300px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display text-sm text-salty-deep-teal">Independent Airlines</h4>
          <p className="font-body text-xs text-salty-slate/50">Not part of any alliance</p>
        </div>
        <button onClick={onClose} className="text-salty-slate/40 hover:text-salty-slate text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="font-body text-xs text-salty-slate/50 mb-2">
        These airlines operate independently and are not members of any global alliance.
        Loyalty points from these airlines cannot be earned/redeemed across alliances.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[...new Set(independentAirlines)].filter((a) => a.length > 3).sort().map((airline) => (
          <span key={airline} className="font-body text-[11px] text-salty-slate/70 bg-salty-beige/50 px-2 py-0.5 rounded-full">
            {airline}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AllianceFilter({ selectedAlliances, onChange }: AllianceFilterProps) {
  const [tooltipAlliance, setTooltipAlliance] = useState<string | null>(null);

  const toggleAlliance = (allianceId: string) => {
    if (selectedAlliances.includes(allianceId)) {
      onChange(selectedAlliances.filter((id) => id !== allianceId));
    } else {
      onChange([...selectedAlliances, allianceId]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-body text-xs text-salty-slate/50 font-bold uppercase tracking-wider">Member Airlines:</span>
        <div className="flex flex-wrap gap-2">
          {alliances.map((alliance) => {
            const isSelected = selectedAlliances.includes(alliance.id);
            return (
              <div key={alliance.id} className="relative">
                <button
                  onClick={() => toggleAlliance(alliance.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full font-body text-xs font-bold transition-all flex items-center gap-1.5',
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-salty-beige/50 text-salty-slate/50 hover:bg-salty-beige'
                  )}
                  style={isSelected ? { backgroundColor: alliance.color } : undefined}
                >
                  <span>{alliance.name}</span>
                  {/* Info icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTooltipAlliance(tooltipAlliance === alliance.id ? null : alliance.id);
                    }}
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                      isSelected ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-salty-slate/10 text-salty-slate/40 hover:bg-salty-slate/20'
                    )}
                  >
                    i
                  </button>
                </button>

                {/* Tooltip */}
                {tooltipAlliance === alliance.id && (
                  <AllianceTooltip
                    alliance={alliance}
                    onClose={() => setTooltipAlliance(null)}
                  />
                )}
              </div>
            );
          })}

          {/* Independent info */}
          <div className="relative">
            <button
              onClick={() => setTooltipAlliance(tooltipAlliance === 'independent' ? null : 'independent')}
              className="px-2 py-1.5 rounded-full font-body text-[10px] text-salty-slate/40 hover:text-salty-slate/60 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Non-alliance airlines</span>
            </button>
            {tooltipAlliance === 'independent' && (
              <IndependentTooltip onClose={() => setTooltipAlliance(null)} />
            )}
          </div>
        </div>

        {/* Clear */}
        {selectedAlliances.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="font-body text-xs text-salty-orange-red font-bold hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {selectedAlliances.length > 0 && (
        <p className="font-body text-[10px] text-salty-slate/40">
          Showing only flights operated by {selectedAlliances.map((id) => alliances.find((a) => a.id === id)?.name).filter(Boolean).join(' & ')} member airlines
        </p>
      )}
    </div>
  );
}
