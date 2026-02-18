'use client';

import { useState } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { FlightOption, FlightSortMode } from '@/types';
import { flightMatchesAlliances } from '@/data/alliances';
import FlightCard from './FlightCard';
import FlightCardSkeleton from './FlightCardSkeleton';
import FlightDateTabs from './FlightDateTabs';
import CurrencySelector from './CurrencySelector';
import AllianceFilter from './AllianceFilter';
import UnlistedPathsSection from './UnlistedPathsSection';
import ShareFlightPanel from './ShareFlightPanel';
import HumanCTA from '@/components/shared/HumanCTA';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/utils';

const sortModes: { value: FlightSortMode; label: string }[] = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'best', label: 'Best' },
  { value: 'fastest', label: 'Fastest' },
];

export default function FlightResultsContainer() {
  const {
    searchResults,
    sortMode,
    setSortMode,
    selectedDate,
    setSelectedDate,
    filters,
    setFilters,
    isLoading,
    selectedOutboundIds,
    clearOutboundSelection,
  } = useFlightStore();

  const [isReturnLoading, setIsReturnLoading] = useState(false);

  const {
    returnResults,
    setReturnResults,
    isReturnMode,
    setIsReturnMode,
    originAirport,
    selectedRetreatSlug,
  } = useFlightStore();

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-salty-deep-teal/60">Searching for the best flights...</p>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!searchResults) return null;

  const { search } = searchResults;

  // Get flights by sort mode
  const getFlights = (): FlightOption[] => {
    switch (sortMode) {
      case 'cheapest':
        return searchResults.cheapest;
      case 'fastest':
        return searchResults.fastest;
      case 'best':
      default:
        return searchResults.best;
    }
  };

  // Apply filters including alliance filter
  const applyFilters = (flights: FlightOption[]): FlightOption[] => {
    return flights.filter((f) => {
      if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
      if (filters.maxDuration !== null && f.totalDuration > filters.maxDuration) return false;
      if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
      if (filters.alliances && filters.alliances.length > 0) {
        const airlines = [...new Set(f.segments.map((s) => s.airline))];
        if (!flightMatchesAlliances(airlines, filters.alliances)) return false;
      }
      return true;
    });
  };

  const flights = applyFilters(getFlights());
  const unlistedFlights = applyFilters(searchResults.unlisted);

  const handleViewReturnFlights = async () => {
    if (!originAirport || !selectedRetreatSlug) return;
    setIsReturnLoading(true);
    setIsReturnMode(true);

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originCode: originAirport.code,
          originName: originAirport.name,
          originCity: originAirport.city,
          originCountry: originAirport.country,
          retreatSlug: selectedRetreatSlug,
          direction: 'return',
        }),
      });
      const data = await res.json();
      setReturnResults(data);
    } catch (error) {
      console.error('Return flight search failed:', error);
    } finally {
      setIsReturnLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-body text-sm text-salty-deep-teal/50 mb-1">
          {search.retreatName}
        </p>
        <h3 className="font-display text-xl text-salty-deep-teal">
          {search.origin.city} → {search.destination.city}
        </h3>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <FlightDateTabs
          selected={selectedDate}
          onChange={setSelectedDate}
          dates={search.dates}
        />
        <CurrencySelector
          selected={filters.currency}
          onChange={(currency) => setFilters({ currency })}
        />
      </div>

      {/* Alliance Filter */}
      <div className="mb-4">
        <AllianceFilter
          selectedAlliances={filters.alliances || []}
          onChange={(alliances) => setFilters({ alliances })}
        />
      </div>

      {/* Sort Modes */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-body text-xs text-salty-deep-teal/40 uppercase tracking-wide">Sort:</span>
        {sortModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setSortMode(mode.value)}
            className={cn(
              'px-3 py-1 rounded-full font-body text-xs font-bold transition-all',
              sortMode === mode.value
                ? 'bg-salty-deep-teal text-white'
                : 'bg-salty-beige/50 text-salty-deep-teal/50 hover:bg-salty-beige'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Inline Filters — Range Sliders */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2 min-w-[160px]">
          <span className="font-body text-xs text-salty-slate/50 whitespace-nowrap">Stops:</span>
          <input
            type="range"
            min={0}
            max={3}
            value={filters.maxStops ?? 3}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFilters({ maxStops: val >= 3 ? null : val });
            }}
            className="flex-1"
          />
          <span className="font-body text-xs text-salty-deep-teal font-bold w-12 text-right">
            {filters.maxStops === null ? 'Any' : filters.maxStops === 0 ? 'Direct' : `≤${filters.maxStops}`}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="font-body text-xs text-salty-slate/50 whitespace-nowrap">Duration:</span>
          <input
            type="range"
            min={480}
            max={1440}
            step={60}
            value={filters.maxDuration ?? 1440}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFilters({ maxDuration: val >= 1440 ? null : val });
            }}
            className="flex-1"
          />
          <span className="font-body text-xs text-salty-deep-teal font-bold w-12 text-right">
            {filters.maxDuration === null ? 'Any' : `≤${Math.round(filters.maxDuration / 60)}h`}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="font-body text-xs text-salty-slate/50 whitespace-nowrap">Max $:</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={filters.maxPrice ?? 2000}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFilters({ maxPrice: val >= 2000 ? null : val });
            }}
            className="flex-1"
          />
          <span className="font-body text-xs text-salty-deep-teal font-bold w-16 text-right">
            {filters.maxPrice === null ? 'Any' : `$${filters.maxPrice}`}
          </span>
        </div>

        {(filters.maxStops !== null || filters.maxDuration !== null || filters.maxPrice !== null || (filters.alliances && filters.alliances.length > 0)) && (
          <button
            onClick={() => setFilters({ maxStops: null, maxDuration: null, maxPrice: null, alliances: [] })}
            className="font-body text-xs text-salty-orange-red font-bold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Flight List with Checkboxes */}
      {flights.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-display text-xl text-salty-deep-teal mb-2">No flights match your filters.</p>
          <p className="font-body text-sm text-salty-deep-teal/50">Try loosening your filters or clearing alliance selection to see more options.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-body text-xs text-salty-slate/40 mb-1">
            Select flights to view return options, or tap ♡ to save favourites.
          </p>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              currency={filters.currency}
              showCheckbox
              originCode={search.origin.code}
              destCode={search.destination.code}
            />
          ))}
        </div>
      )}

      {/* Sticky Return Flight Button */}
      {selectedOutboundIds.length > 0 && !isReturnMode && (
        <div className="sticky bottom-4 mt-6 z-40">
          <div className="bg-salty-deep-teal rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm text-white">
                {selectedOutboundIds.length} flight{selectedOutboundIds.length > 1 ? 's' : ''} selected
              </p>
              <p className="font-body text-xs text-white/50">Search return flights</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearOutboundSelection}
                className="font-body text-xs text-white/50 hover:text-white underline"
              >
                Clear
              </button>
              <Button onClick={handleViewReturnFlights} size="sm">
                Search Return Flights
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return flight loading */}
      {isReturnLoading && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 border-4 border-salty-seafoam border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-salty-deep-teal/60">Searching for return flights...</p>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <FlightCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Return flight results */}
      {isReturnMode && !isReturnLoading && returnResults && (() => {
        const getReturnFlights = (): FlightOption[] => {
          switch (sortMode) {
            case 'cheapest': return returnResults.cheapest;
            case 'fastest': return returnResults.fastest;
            case 'best': default: return returnResults.best;
          }
        };
        const returnFlights = applyFilters(getReturnFlights());

        return (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-xs text-salty-seafoam font-bold uppercase tracking-wider mb-1">Return Flights</p>
                <h4 className="font-display text-lg text-salty-deep-teal">
                  {returnResults.search.origin.city} → {returnResults.search.destination.city}
                </h4>
              </div>
              <button
                onClick={() => { setIsReturnMode(false); setReturnResults(null); clearOutboundSelection(); }}
                className="font-body text-xs text-salty-slate/50 hover:text-salty-slate underline"
              >
                Back to departing flights
              </button>
            </div>

            {returnFlights.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-display text-lg text-salty-deep-teal mb-2">No return flights match your filters.</p>
                <p className="font-body text-sm text-salty-deep-teal/50">Try loosening your filters to see more options.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {returnFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    currency={filters.currency}
                    originCode={returnResults.search.origin.code}
                    destCode={returnResults.search.destination.code}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Unlisted Paths */}
      <UnlistedPathsSection flights={unlistedFlights} currency={filters.currency} />

      {/* Share Panel */}
      <ShareFlightPanel flights={flights} retreatName={search.retreatName} />

      {/* Next Steps CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button href={`/compare`} variant="secondary" size="sm" className="flex-1">
          Compare SALTY vs DIY Prices
        </Button>
        <Button href={`/planner?retreat=${search.retreatSlug}`} variant="secondary" size="sm" className="flex-1">
          Plan Your Full Trip
        </Button>
      </div>

      {/* Human CTA */}
      <HumanCTA
        message="Need help choosing? We're basically travel agents at this point."
        context={`Hey! I'm looking at flights from ${search.origin.city} to ${search.destination.city} for the ${search.retreatName} retreat. Can you help me pick the best option?`}
      />
    </div>
  );
}
