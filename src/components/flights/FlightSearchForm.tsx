'use client';

import { useEffect, useRef } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { getUpcomingRetreats, getRetreatBySlug } from '@/data/retreats';
import { cn, formatDateRange, addDays } from '@/lib/utils';
import Button from '@/components/shared/Button';
import AirportAutocomplete from './AirportAutocomplete';
import MultiCityLegBuilder from './MultiCityLegBuilder';

interface FlightSearchFormProps {
  onSearch: () => void;
  defaultRetreatSlug?: string;
}

export default function FlightSearchForm({ onSearch, defaultRetreatSlug }: FlightSearchFormProps) {
  const {
    originAirport, selectedRetreatSlug, setOrigin, setRetreat,
    compareAll, setCompareAll, tripType, setTripType,
    multiCityLegs, updateMultiCityLeg, addMultiCityLeg, removeMultiCityLeg,
  } = useFlightStore();
  const retreats = getUpcomingRetreats();

  useEffect(() => {
    if (defaultRetreatSlug && !selectedRetreatSlug) {
      setRetreat(defaultRetreatSlug);
    }
  }, [defaultRetreatSlug, selectedRetreatSlug, setRetreat]);

  // Pre-populate multi-city legs when origin + retreat are known
  const lastPrePopRef = useRef<string | null>(null);
  useEffect(() => {
    if (tripType !== 'multi-city' || !selectedRetreatSlug) return;

    const retreat = getRetreatBySlug(selectedRetreatSlug);
    if (!retreat) return;

    // Only re-populate when the retreat changes (or first time)
    const key = `${selectedRetreatSlug}`;
    if (lastPrePopRef.current === key) {
      // Retreat unchanged — only patch origin into existing legs if it changed
      if (originAirport && multiCityLegs.length >= 2) {
        if (!multiCityLegs[0].origin) {
          updateMultiCityLeg(multiCityLegs[0].id, { origin: originAirport });
        }
        if (!multiCityLegs[multiCityLegs.length - 1].destination) {
          updateMultiCityLeg(multiCityLegs[multiCityLegs.length - 1].id, { destination: originAirport });
        }
      }
      return;
    }
    lastPrePopRef.current = key;

    const retreatAirport = {
      code: retreat.airport.code,
      name: retreat.airport.name,
      city: retreat.destination,
      country: retreat.locations[0]?.country || retreat.destination,
    };

    if (multiCityLegs.length >= 2) {
      updateMultiCityLeg(multiCityLegs[0].id, {
        origin: originAirport || undefined,
        destination: retreatAirport,
        date: addDays(retreat.startDate, -1),
      });
      updateMultiCityLeg(multiCityLegs[1].id, {
        origin: retreatAirport,
        destination: originAirport || undefined,
        date: retreat.endDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripType, selectedRetreatSlug, originAirport]);

  const multiCityValid = tripType === 'multi-city'
    && selectedRetreatSlug
    && multiCityLegs.every((leg) => leg.origin && leg.destination && leg.date);

  const isSearchDisabled = tripType === 'multi-city'
    ? !multiCityValid
    : !originAirport || (!compareAll && !selectedRetreatSlug);

  const handleSubmit = () => {
    if (isSearchDisabled) return;
    onSearch();
  };

  return (
    <div className="bg-surface-base rounded-2xl p-6 sm:p-8" style={{ boxShadow: 'var(--shadow-card-resting)' }}>
      <h3 className="font-display text-xl text-salty-deep-teal mb-6">Where are you flying from?</h3>

      {/* Origin Airport Input */}
      <div className="mb-6">
        <AirportAutocomplete
          value={originAirport}
          onChange={setOrigin}
          label="Your departure city or airport"
          id="origin-airport"
        />
      </div>

      {/* Trip Type Toggle */}
      <div className="mb-6">
        <label className="font-body text-sm font-bold text-salty-deep-teal block mb-2">
          Trip type
        </label>
        <div className="flex items-center gap-2">
          {([
            { value: 'round-trip' as const, label: 'Round-Trip' },
            { value: 'one-way' as const, label: 'One-Way' },
            { value: 'multi-city' as const, label: 'Multi-City' },
          ]).map((option) => (
            <button
              key={option.value}
              onClick={() => setTripType(option.value)}
              className={cn(
                'px-4 py-2 rounded-full border-2 font-body text-xs font-bold transition-all',
                tripType === option.value
                  ? 'border-salty-coral bg-salty-coral/10 text-salty-deep-teal'
                  : 'border-salty-sand text-salty-deep-teal/50 hover:border-salty-deep-teal/20'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Retreat Selection */}
      <div className="mb-6">
        <label className="font-body text-sm font-bold text-salty-deep-teal block mb-2">
          Which retreat?
        </label>

        {/* Compare toggle — hidden in multi-city mode */}
        {tripType !== 'multi-city' && (
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setCompareAll(false)}
              className={cn(
                'px-4 py-2 rounded-full border-2 font-body text-xs font-bold transition-all',
                !compareAll
                  ? 'border-salty-coral bg-salty-coral/10 text-salty-deep-teal'
                  : 'border-salty-sand text-salty-deep-teal/50 hover:border-salty-deep-teal/20'
              )}
            >
              Specific Trip
            </button>
            <button
              onClick={() => { setCompareAll(true); setRetreat(null); }}
              className={cn(
                'px-4 py-2 rounded-full border-2 font-body text-xs font-bold transition-all',
                compareAll
                  ? 'border-salty-coral bg-salty-coral/10 text-salty-deep-teal'
                  : 'border-salty-sand text-salty-deep-teal/50 hover:border-salty-deep-teal/20'
              )}
            >
              Compare Trips
            </button>
          </div>
        )}

        {!compareAll && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {retreats.filter((r) => r.status !== 'sold_out').map((retreat) => (
              <button
                key={retreat.slug}
                onClick={() => setRetreat(retreat.slug)}
                className={cn(
                  'p-3 rounded-xl border-2 text-left transition-all',
                  'hover:shadow-sm active:scale-[0.99]',
                  selectedRetreatSlug === retreat.slug
                    ? 'border-salty-coral bg-salty-coral/5'
                    : 'border-salty-sand bg-surface-base hover:border-salty-deep-teal/30'
                )}
              >
                <span className="font-display text-sm text-salty-deep-teal block">{retreat.destination}</span>
                <span className="font-body text-xs text-salty-deep-teal/50">
                  {formatDateRange(retreat.startDate, retreat.endDate)}
                </span>
                {retreat.status === 'tbd' && (
                  <span className="ml-2 text-[10px] font-bold text-salty-deep-teal/40 uppercase">TBD</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Multi-City Leg Builder */}
      {tripType === 'multi-city' && (
        <div className="mb-6">
          <MultiCityLegBuilder
            legs={multiCityLegs}
            onUpdateLeg={updateMultiCityLeg}
            onAddLeg={addMultiCityLeg}
            onRemoveLeg={removeMultiCityLeg}
          />
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        disabled={isSearchDisabled}
        className="w-full"
      >
        {tripType === 'multi-city' ? 'Search Multi-City Flights' : 'Find My Flights'}
      </Button>
    </div>
  );
}
