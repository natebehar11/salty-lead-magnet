'use client';

import { useState, useRef, useEffect } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { FlightOption, FlightSortMode } from '@/types';
import { applyFlightFilters } from '@/lib/flight-filters';
import FlightCard from './FlightCard';
import FlightCardSkeleton from './FlightCardSkeleton';
import FlightDateTabs from './FlightDateTabs';
import AllianceFilter from './AllianceFilter';
import UnlistedPathsSection from './UnlistedPathsSection';
import ShareFlightPanel from './ShareFlightPanel';
import HumanCTA from '@/components/shared/HumanCTA';
import Button from '@/components/shared/Button';
import { cn, formatShortDate } from '@/lib/utils';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
    selectedReturnIds,
    toggleReturnSelection,
    clearReturnSelection,
    returnResults,
    setReturnResults,
    isReturnMode,
    setIsReturnMode,
    originAirport,
    selectedRetreatSlug,
    tripType,
  } = useFlightStore();

  const { selectedCurrency, rates } = useCurrencyStore();
  const [isReturnLoading, setIsReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const returnAbortRef = useRef<AbortController | null>(null);

  // Abort in-flight return search on unmount
  useEffect(() => {
    return () => { returnAbortRef.current?.abort(); };
  }, []);

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

  // Get flights by sort mode, using per-date buckets when available
  const getFlights = (): FlightOption[] => {
    const source = searchResults.byDate?.[selectedDate] || searchResults;
    switch (sortMode) {
      case 'cheapest':
        return source.cheapest;
      case 'fastest':
        return source.fastest;
      case 'best':
      default:
        return source.best;
    }
  };

  const flights = applyFlightFilters(getFlights(), filters);
  const unlistedFlights = applyFlightFilters(
    searchResults.byDate?.[selectedDate]?.unlisted || searchResults.unlisted,
    filters
  );

  // Get return flights (filtered + sorted)
  const getReturnFlights = (): FlightOption[] => {
    if (!returnResults) return [];
    switch (sortMode) {
      case 'cheapest': return returnResults.cheapest;
      case 'fastest': return returnResults.fastest;
      case 'best': default: return returnResults.best;
    }
  };
  const returnFlights = returnResults ? applyFlightFilters(getReturnFlights(), filters) : [];

  // Get selected departing flights for summary display — search all date buckets too
  const getSelectedDepartingFlights = (): FlightOption[] => {
    const allDepartingFlights = [...searchResults.best, ...searchResults.cheapest, ...searchResults.fastest];
    // Also include flights from byDate buckets (user may have selected from a specific date)
    if (searchResults.byDate) {
      for (const dateBuckets of Object.values(searchResults.byDate)) {
        allDepartingFlights.push(...dateBuckets.best, ...dateBuckets.cheapest, ...dateBuckets.fastest);
      }
    }
    const uniqueById = [...new Map(allDepartingFlights.map(f => [f.id, f])).values()];
    return uniqueById.filter(f => selectedOutboundIds.includes(f.id));
  };

  // Extract departure_token from the first selected outbound flight (for round-trip chaining)
  const getSelectedDepartureToken = (): string | undefined => {
    if (selectedOutboundIds.length === 0) return undefined;
    const allFlights = [...searchResults.best, ...searchResults.cheapest, ...searchResults.fastest];
    if (searchResults.byDate) {
      for (const dateBuckets of Object.values(searchResults.byDate)) {
        allFlights.push(...dateBuckets.best, ...dateBuckets.cheapest, ...dateBuckets.fastest);
      }
    }
    const unique = [...new Map(allFlights.map(f => [f.id, f])).values()];
    const selected = unique.find(f => f.id === selectedOutboundIds[0]);
    return selected?.departureToken ?? undefined;
  };

  const handleViewReturnFlights = async () => {
    if (!originAirport || !selectedRetreatSlug) return;

    // Abort any previous return search
    returnAbortRef.current?.abort();
    const controller = new AbortController();
    returnAbortRef.current = controller;

    setIsReturnLoading(true);
    setReturnError(null);
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
          tripType,
          departureToken: tripType === 'round-trip' ? getSelectedDepartureToken() : undefined,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Return flight search failed.');
      }
      const data = await res.json();
      setReturnResults(data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Return flight search failed:', error);
      setReturnError(error instanceof Error ? error.message : 'Could not find return flights. Please try again.');
    } finally {
      setIsReturnLoading(false);
    }
  };

  const handleBackToDeparting = () => {
    setIsReturnMode(false);
    setReturnResults(null);
    clearReturnSelection();
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-body text-sm text-salty-deep-teal/50 mb-1">
          {search.retreatName}
        </p>
        <h3 className="font-display text-xl text-salty-deep-teal">
          {search.origin.city} &rarr; {search.destination.city}
        </h3>
        {/* Result summary */}
        {flights.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span className="font-body text-xs text-salty-deep-teal/50">
              {flights.length} flight{flights.length !== 1 ? 's' : ''} found
            </span>
            <span className="font-body text-xs text-salty-deep-teal/50">
              From{' '}
              <span className="font-bold text-salty-orange-red">
                {formatCurrency(
                  convertAmount(
                    Math.min(...flights.map((f) => f.price)),
                    rates[selectedCurrency]
                  ),
                  selectedCurrency
                )}
              </span>
            </span>
            <span className="font-body text-xs text-salty-deep-teal/40">
              {formatShortDate(search.dates.retreatStart)} &ndash; {formatShortDate(search.dates.retreatEnd)}
            </span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <FlightDateTabs
          selected={selectedDate}
          onChange={setSelectedDate}
          dates={search.dates}
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
            {filters.maxStops === null ? 'Any' : filters.maxStops === 0 ? 'Direct' : `\u2264${filters.maxStops}`}
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
            {filters.maxDuration === null ? 'Any' : `\u2264${Math.round(filters.maxDuration / 60)}h`}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="font-body text-xs text-salty-slate/50 whitespace-nowrap">Max $:</span>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={filters.maxPrice ?? 5000}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFilters({ maxPrice: val >= 5000 ? null : val });
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

      {/* Departing / Return Flight Views with Slide Animation */}
      <AnimatePresence mode="wait">
        {!isReturnMode ? (
          <motion.div
            key="departing"
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Departing Flight List */}
            {flights.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-display text-xl text-salty-deep-teal mb-2">No flights match your filters.</p>
                <p className="font-body text-sm text-salty-deep-teal/50">Try loosening your filters or clearing alliance selection to see more options.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-body text-xs text-salty-slate/40 mb-1">
                  {tripType === 'one-way'
                    ? 'Select flights to include in your saved plans.'
                    : 'Select flights to search for return flight options.'}
                </p>
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    showCheckbox
                    originCode={search.origin.code}
                    destCode={search.destination.code}
                    returnDate={tripType === 'round-trip' ? search.dates.returnDayOf : undefined}
                  />
                ))}
              </div>
            )}

            {/* Sticky Return Flight Button — hidden for one-way trips */}
            {tripType !== 'one-way' && selectedOutboundIds.length > 0 && (
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

            {/* Return flight loading (shows in departing view during transition) */}
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
          </motion.div>
        ) : (
          <motion.div
            key="return"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back to Departing Flights */}
            <button
              onClick={handleBackToDeparting}
              className="flex items-center gap-1 font-body text-sm text-salty-orange-red font-bold hover:underline mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Departing Flights
            </button>

            {/* Selected Departing Flights Summary */}
            {(() => {
              const selectedDeparting = getSelectedDepartingFlights();
              if (selectedDeparting.length === 0) return null;
              return (
                <div className="mb-6">
                  <p className="font-body text-xs text-salty-orange-red font-bold uppercase tracking-wider mb-2">
                    Your Selected Departing Flights
                  </p>
                  <div className="space-y-2 opacity-75">
                    {selectedDeparting.map(flight => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        originCode={search.origin.code}
                        destCode={search.destination.code}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Return Flights Header */}
            {returnResults && (
              <div className="mb-4">
                <p className="font-body text-xs text-salty-seafoam font-bold uppercase tracking-wider mb-1">Return Flights</p>
                <h4 className="font-display text-lg text-salty-deep-teal">
                  {returnResults.search.origin.city} &rarr; {returnResults.search.destination.city}
                </h4>
              </div>
            )}

            {/* Return Flight Error */}
            {returnError && !isReturnLoading && (
              <div className="p-4 mb-4 bg-salty-burnt-red/10 border-2 border-salty-burnt-red/30 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-salty-burnt-red flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="font-body text-sm text-salty-deep-teal font-bold flex-1">{returnError}</p>
                <button
                  onClick={() => { setReturnError(null); handleViewReturnFlights(); }}
                  className="font-body text-xs font-bold text-salty-orange-red hover:underline whitespace-nowrap"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Return Flight List with Checkboxes */}
            {returnResults && (
              returnFlights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-display text-lg text-salty-deep-teal mb-2">No return flights match your filters.</p>
                  <p className="font-body text-sm text-salty-deep-teal/50">Try loosening your filters to see more options.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-body text-xs text-salty-slate/40 mb-1">
                    Select return flights to include in your saved plans.
                  </p>
                  {returnFlights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      showCheckbox
                      isSelected={selectedReturnIds.includes(flight.id)}
                      onToggleSelection={toggleReturnSelection}
                      originCode={returnResults.search.origin.code}
                      destCode={returnResults.search.destination.code}
                    />
                  ))}
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlisted Paths */}
      <UnlistedPathsSection flights={unlistedFlights} />

      {/* Share Panel */}
      <ShareFlightPanel
        departingFlights={flights}
        returnFlights={returnFlights}
        retreatName={search.retreatName}
      />

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
