'use client';

import { useState, useRef, useEffect } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { searchAirports } from '@/data/airports';
import { getUpcomingRetreats } from '@/data/retreats';
import { Airport } from '@/types';
import { cn, formatDateRange } from '@/lib/utils';
import Button from '@/components/shared/Button';

interface FlightSearchFormProps {
  onSearch: () => void;
  defaultRetreatSlug?: string;
}

export default function FlightSearchForm({ onSearch, defaultRetreatSlug }: FlightSearchFormProps) {
  const { originAirport, selectedRetreatSlug, setOrigin, setRetreat, compareAll, setCompareAll } = useFlightStore();
  const [query, setQuery] = useState(originAirport ? `${originAirport.city} (${originAirport.code})` : '');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const retreats = getUpcomingRetreats();

  useEffect(() => {
    if (defaultRetreatSlug && !selectedRetreatSlug) {
      setRetreat(defaultRetreatSlug);
    }
  }, [defaultRetreatSlug, selectedRetreatSlug, setRetreat]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const results = searchAirports(value);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    if (!value) setOrigin(null);
  };

  const handleSelectAirport = (airport: Airport) => {
    setOrigin(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!originAirport) return;
    if (!compareAll && !selectedRetreatSlug) return;
    onSearch();
  };

  return (
    <div className="bg-salty-cream rounded-2xl border-2 border-salty-beige p-6 sm:p-8">
      <h3 className="font-display text-xl text-salty-deep-teal mb-6">Where are you flying from?</h3>

      {/* Origin Airport Input */}
      <div className="relative mb-6">
        <label className="font-body text-sm font-bold text-salty-deep-teal block mb-2">
          Your departure city or airport
        </label>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search by city or airport code (e.g., Toronto or YYZ)"
          className="w-full px-4 py-3 rounded-xl border-2 border-salty-beige font-body text-sm bg-salty-cream focus:outline-none focus:border-salty-orange-red transition-colors"
        />

        {showSuggestions && (
          <div className="absolute z-20 top-full mt-1 w-full bg-salty-cream border-2 border-salty-beige rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((airport) => (
              <button
                key={airport.code}
                onClick={() => handleSelectAirport(airport)}
                className="w-full px-4 py-3 text-left hover:bg-salty-beige/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-body text-sm font-bold text-salty-deep-teal">{airport.code}</span>
                <span className="font-body text-sm text-salty-deep-teal/70 ml-2">{airport.city}, {airport.country}</span>
                <span className="font-body text-xs text-salty-deep-teal/40 block">{airport.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Retreat Selection */}
      <div className="mb-6">
        <label className="font-body text-sm font-bold text-salty-deep-teal block mb-2">
          Which retreat?
        </label>

        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCompareAll(false)}
            className={cn(
              'px-4 py-2 rounded-full border-2 font-body text-xs font-bold transition-all',
              !compareAll
                ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-deep-teal'
                : 'border-salty-beige text-salty-deep-teal/50 hover:border-salty-deep-teal/20'
            )}
          >
            Specific Trip
          </button>
          <button
            onClick={() => { setCompareAll(true); setRetreat(null); }}
            className={cn(
              'px-4 py-2 rounded-full border-2 font-body text-xs font-bold transition-all',
              compareAll
                ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-deep-teal'
                : 'border-salty-beige text-salty-deep-teal/50 hover:border-salty-deep-teal/20'
            )}
          >
            Compare Trips
          </button>
        </div>

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
                    ? 'border-salty-orange-red bg-salty-orange-red/5'
                    : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
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

      {/* Search Button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        disabled={!originAirport || (!compareAll && !selectedRetreatSlug)}
        className="w-full"
      >
        Find My Flights
      </Button>
    </div>
  );
}
