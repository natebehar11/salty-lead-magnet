'use client';

import { useMemo } from 'react';
import { MultiCityLeg } from '@/types';
import AirportAutocomplete from './AirportAutocomplete';

interface MultiCityLegBuilderProps {
  legs: MultiCityLeg[];
  onUpdateLeg: (legId: string, updates: Partial<Omit<MultiCityLeg, 'id'>>) => void;
  onAddLeg: () => void;
  onRemoveLeg: (legId: string) => void;
}

export default function MultiCityLegBuilder({
  legs,
  onUpdateLeg,
  onAddLeg,
  onRemoveLeg,
}: MultiCityLegBuilderProps) {
  const canRemove = legs.length > 2;
  const canAdd = legs.length < 6;

  // Check for non-chronological dates
  const dateWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (let i = 1; i < legs.length; i++) {
      if (legs[i].date && legs[i - 1].date && legs[i].date < legs[i - 1].date) {
        warnings.push(`Flight ${i + 1} departs before Flight ${i} — is this intentional?`);
      }
    }
    return warnings;
  }, [legs]);

  return (
    <div className="space-y-4">
      <label className="font-body text-sm font-bold text-salty-deep-teal block">
        Build your itinerary
      </label>

      {legs.map((leg, index) => {
        const minDate = index > 0 && legs[index - 1].date ? legs[index - 1].date : undefined;

        return (
          <div
            key={leg.id}
            className="relative bg-salty-cream border-2 border-salty-beige rounded-xl p-4"
          >
            {/* Leg number badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-salty-deep-teal text-salty-cream font-body text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-body text-xs font-bold text-salty-deep-teal/60 uppercase">
                  Flight {index + 1}
                </span>
              </div>
              {canRemove && (
                <button
                  onClick={() => onRemoveLeg(leg.id)}
                  className="font-body text-xs text-salty-deep-teal/40 hover:text-salty-orange-red transition-colors"
                  aria-label={`Remove flight ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Origin + Destination side by side on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <AirportAutocomplete
                value={leg.origin}
                onChange={(airport) => onUpdateLeg(leg.id, { origin: airport })}
                label="From"
                placeholder="Origin airport"
                id={`mc-origin-${leg.id}`}
              />
              <AirportAutocomplete
                value={leg.destination}
                onChange={(airport) => onUpdateLeg(leg.id, { destination: airport })}
                label="To"
                placeholder="Destination airport"
                id={`mc-dest-${leg.id}`}
              />
            </div>

            {/* Date picker */}
            <div>
              <label
                htmlFor={`mc-date-${leg.id}`}
                className="font-body text-sm font-bold text-salty-deep-teal block mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id={`mc-date-${leg.id}`}
                value={leg.date}
                min={minDate}
                onChange={(e) => onUpdateLeg(leg.id, { date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-salty-beige font-body text-sm bg-salty-cream focus:outline-none focus:border-salty-orange-red transition-colors"
              />
            </div>
          </div>
        );
      })}

      {/* Date chronology warnings */}
      {dateWarnings.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-salty-orange-red/10 border border-salty-orange-red/30">
          {dateWarnings.map((warning) => (
            <p key={warning} className="font-body text-xs text-salty-orange-red">
              {warning}
            </p>
          ))}
        </div>
      )}

      {/* Add leg button */}
      {canAdd && (
        <button
          onClick={onAddLeg}
          className="w-full py-3 rounded-xl border-2 border-dashed border-salty-beige text-salty-deep-teal/50 font-body text-sm font-bold hover:border-salty-deep-teal/30 hover:text-salty-deep-teal/70 transition-colors"
        >
          + Add another flight
        </button>
      )}

      {!canAdd && (
        <p className="font-body text-xs text-salty-deep-teal/40 text-center">
          Maximum 6 flights reached
        </p>
      )}
    </div>
  );
}
