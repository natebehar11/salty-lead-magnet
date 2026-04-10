'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { hydrateLeadFromOtherStores } from '@/lib/lead-state';
import { getUpcomingRetreats } from '@/data/retreats';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsContainer from '@/components/flights/FlightResultsContainer';
import FlightLeadGate from '@/components/flights/FlightLeadGate';
import ScrollReveal from '@/components/shared/ScrollReveal';
import HumanCTA from '@/components/shared/HumanCTA';
import SwoopDivider from '@/components/shared/SwoopDivider';
import FlightCard from '@/components/flights/FlightCard';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import AllianceFilter from '@/components/flights/AllianceFilter';
import { applyFlightFilters } from '@/lib/flight-filters';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { FlightSortMode, FlightSearchResults } from '@/types';
import TripCostBar from '@/components/shared/TripCostBar';
import { getFlightEstimate } from '@/lib/trip-cost';
import { retreatValueSummaries } from '@/data/retreat-value-summaries';
import { getRetreatBySlug } from '@/data/retreats';
import CompareFlightSaveBar from '@/components/flights/CompareFlightSaveBar';
import MultiCityResultsContainer from '@/components/flights/MultiCityResultsContainer';

const sortModes: { value: FlightSortMode; label: string }[] = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'best', label: 'Best' },
  { value: 'fastest', label: 'Fastest' },
];

// Use shared formatShortDate from utils instead of local duplicate

function FlightsContent() {
  const searchParams = useSearchParams();
  const defaultRetreat = searchParams.get('retreat') || undefined;

  const {
    originAirport,
    selectedRetreatSlug,
    compareAll,
    hasSubmittedLead,
    setSearchResults,
    setAllResults,
    setIsLoading,
    setSearchError,
    isLoading,
    searchResults,
    searchError,
    allResults,
    filters,
    setFilters,
    sortMode,
    setSortMode,
    clearOutboundSelection,
    clearReturnSelection,
    setReturnResults,
    setIsReturnMode,
    tripType,
    multiCityLegs,
    multiCityLegResults,
    multiCityActiveLeg,
    appendMultiCityLegResult,
    setMultiCityLegResults,
    setMultiCityActiveLeg,
    resetMultiCity,
  } = useFlightStore();

  const { selectedCurrency, rates } = useCurrencyStore();

  // Hydrate lead data from quiz/planner stores on mount so returning leads skip the gate
  useEffect(() => {
    hydrateLeadFromOtherStores('flights');
  }, []);

  const [hasSearched, setHasSearched] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  // Retreat pill toggles: all selected by default
  const [enabledRetreats, setEnabledRetreats] = useState<Set<string>>(new Set());
  // Show more per card
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  // Abort controller for cancelling in-flight searches (Issue #13)
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Abort in-flight searches on unmount
  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  // Initialize enabledRetreats when allResults change (Issue #6: useEffect, not useMemo)
  useEffect(() => {
    if (allResults.length > 0 && enabledRetreats.size === 0) {
      setEnabledRetreats(new Set(allResults.map((r) => r.search.retreatSlug)));
    }
  }, [allResults, enabledRetreats.size]);

  // Scroll to results when search starts (loading state) or first results arrive
  useEffect(() => {
    if (hasSearched && (isLoading || searchResults || allResults.length > 0)) {
      // Small delay to let DOM render
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hasSearched, isLoading]); // Only trigger on search start, not every result update

  const doSearch = useCallback(async () => {
    if (!originAirport && tripType !== 'multi-city') return;

    // Abort any previous in-flight search
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    // Clear stale selections from previous searches
    clearOutboundSelection();
    clearReturnSelection();
    setReturnResults(null);
    setIsReturnMode(false);

    // Multi-city: search the first leg
    if (tripType === 'multi-city') {
      resetMultiCity();
      try {
        const serpLegs = multiCityLegs.map((leg) => ({
          departure_id: leg.origin?.code || '',
          arrival_id: leg.destination?.code || '',
          date: leg.date,
        }));

        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            multiCityLegs: serpLegs,
            legIndex: 0,
          }),
          signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Multi-city search failed.');
        }

        const data = await res.json();
        const leg = multiCityLegs[0];
        const legLabel = `${leg.origin?.code || '?'} → ${leg.destination?.code || '?'} (${formatShortDate(leg.date)})`;

        appendMultiCityLegResult({
          legIndex: 0,
          legLabel,
          results: data as FlightSearchResults,
          selectedFlightId: null,
          departureToken: null,
        });
        setMultiCityActiveLeg(0);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Multi-city search failed:', error);
        setSearchError(error instanceof Error ? error.message : 'Multi-city search failed.');
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
      return;
    }

    try {
      if (compareAll) {
        // Sequential compare: search one retreat at a time, render progressively
        const retreats = getUpcomingRetreats().filter((r) => r.status !== 'sold_out');
        const results: FlightSearchResults[] = [];
        let failures = 0;

        // Clear previous compare results before progressive loading
        setAllResults([]);

        for (const retreat of retreats) {
          if (signal.aborted) break;

          try {
            const res = await fetch('/api/flights/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originCode: originAirport!.code,
                originName: originAirport!.name,
                originCity: originAirport!.city,
                originCountry: originAirport!.country,
                retreatSlug: retreat.slug,
                tripType,
              }),
              signal,
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              console.warn(`Search failed for ${retreat.destination}:`, errData.error);
              failures++;
              continue;
            }
            const data: FlightSearchResults = await res.json();
            results.push(data);

            // Progressive rendering: update UI after each successful result
            setAllResults([...results]);
            setEnabledRetreats(new Set(results.map((r) => r.search.retreatSlug)));
            if (results.length === 1) setSearchResults(data);
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') break;
            failures++;
            console.warn(`Search failed for ${retreat.destination}:`, error);
          }
        }

        if (!signal.aborted) {
          if (results.length === 0) {
            setSearchError('Could not find flights for any retreat. Please try again.');
          } else if (failures > 0) {
            setSearchError(`Found flights for ${results.length} of ${retreats.length} retreats. Some searches failed.`);
          }
        }
      } else if (selectedRetreatSlug) {
        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originCode: originAirport!.code,
            originName: originAirport!.name,
            originCity: originAirport!.city,
            originCountry: originAirport!.country,
            retreatSlug: selectedRetreatSlug,
            tripType,
          }),
          signal,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Flight search failed. Please try again.');
        }
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Flight search failed:', error);
      setSearchError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originAirport, selectedRetreatSlug, compareAll, tripType, multiCityLegs, setSearchResults, setAllResults, setIsLoading, setSearchError, clearOutboundSelection, clearReturnSelection, setReturnResults, setIsReturnMode, resetMultiCity, appendMultiCityLegResult, setMultiCityActiveLeg]);

  const handleSearch = () => {
    if (!hasSubmittedLead) {
      setShowLeadGate(true);
      // Don't start search yet — wait for lead gate completion
    } else {
      doSearch();
    }
  };

  const handleLeadComplete = () => {
    setShowLeadGate(false);
    // Now that we have the lead, fire the search
    doSearch();
  };

  const toggleRetreatPill = (slug: string) => {
    setEnabledRetreats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const toggleCardExpand = (slug: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Multi-city: search the next leg
  const handleSearchNextLeg = useCallback(async (legIndex: number, departureToken: string | null) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setSearchError(null);

    try {
      const serpLegs = multiCityLegs.map((leg) => ({
        departure_id: leg.origin?.code || '',
        arrival_id: leg.destination?.code || '',
        date: leg.date,
      }));

      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multiCityLegs: serpLegs,
          legIndex,
          departureToken,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Multi-city leg search failed.');
      }

      const data = await res.json();
      const leg = multiCityLegs[legIndex];
      const legLabel = `${leg.origin?.code || '?'} → ${leg.destination?.code || '?'} (${formatShortDate(leg.date)})`;

      appendMultiCityLegResult({
        legIndex,
        legLabel,
        results: data as FlightSearchResults,
        selectedFlightId: null,
        departureToken: null,
      });
      setMultiCityActiveLeg(legIndex);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Multi-city leg search failed:', error);
      setSearchError(error instanceof Error ? error.message : 'Multi-city leg search failed.');
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [multiCityLegs, setIsLoading, setSearchError, appendMultiCityLegResult, setMultiCityActiveLeg]);

  // Multi-city: go back to a previous leg (truncates subsequent results)
  const handleBackToLeg = useCallback((legIndex: number) => {
    const truncated = multiCityLegResults.filter((r) => r.legIndex < legIndex);
    setMultiCityLegResults(truncated);
    setMultiCityActiveLeg(legIndex);
    // Re-show the existing result for this leg (it should already be in legResults)
    const existing = multiCityLegResults.find((r) => r.legIndex === legIndex);
    if (existing) {
      setMultiCityLegResults([...truncated, { ...existing, selectedFlightId: null, departureToken: null }]);
    }
  }, [multiCityLegResults, setMultiCityLegResults, setMultiCityActiveLeg]);

  // Filter results based on enabled retreat pills
  const visibleResults = allResults.filter((r) => enabledRetreats.has(r.search.retreatSlug));

  return (
    <div className="min-h-dvh">
      <section className="py-12 px-6 bg-surface-base">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="font-body text-sm text-salty-coral font-bold uppercase tracking-widest mb-3">
              SALTY Flight Finder
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-4">
              Find your flights.
            </h1>
            <p className="font-body text-lg text-salty-deep-teal/60 max-w-lg mx-auto">
              We&apos;ll show you the cheapest, fastest, and best flight options
              from your city to any SALTY retreat.
            </p>
          </motion.div>

          {/* Search Form */}
          <ScrollReveal>
            <FlightSearchForm onSearch={handleSearch} defaultRetreatSlug={defaultRetreat} />
          </ScrollReveal>
        </div>
      </section>

      {/* Scroll anchor for results */}
      <div ref={resultsRef} className="scroll-mt-4" />

      {/* Error Banner */}
      {searchError && !isLoading && (
        <section className="px-6 bg-surface-base">
          <div className="max-w-3xl mx-auto">
            <div className="mt-6 p-4 bg-salty-rust/10 border-2 border-salty-rust/30 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-salty-rust flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <p className="font-body text-sm text-salty-deep-teal font-bold">{searchError}</p>
              </div>
              <button
                onClick={() => { setSearchError(null); doSearch(); }}
                className="font-body text-xs font-bold text-salty-coral hover:underline whitespace-nowrap"
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Lead Gate or Results */}
      {showLeadGate && !hasSubmittedLead ? (
        <section className="px-6 pb-12 bg-surface-base">
          <div className="max-w-3xl mx-auto">
            <FlightLeadGate onComplete={handleLeadComplete} />
          </div>
        </section>
      ) : hasSearched && (searchResults || isLoading || allResults.length > 0 || multiCityLegResults.length > 0) ? (
        <>
          {compareAll && (allResults.length > 0 || isLoading) ? (
            <>
              <SwoopDivider color="var(--color-surface-warm-light)" />
              {/* Compare Mode — Horizontal Scroll with full controls */}
              <section className="py-8 px-6 bg-surface-warm-light">
                <div className="max-w-7xl mx-auto">
                  <h2 className="font-display text-section text-salty-deep-teal text-center mb-6">
                    Compare trips
                  </h2>

                  {/* Progressive search indicator */}
                  {isLoading && compareAll && (
                    <div className="max-w-md mx-auto mb-6">
                      <div className="flex items-center gap-3 justify-center mb-2">
                        <div className="w-5 h-5 border-2 border-salty-coral border-t-transparent rounded-full animate-spin" />
                        <p className="font-body text-sm text-salty-deep-teal/60">
                          Searching retreats... {allResults.length} of {getUpcomingRetreats().filter(r => r.status !== 'sold_out').length} found
                        </p>
                      </div>
                      <div className="w-full bg-salty-sand/50 rounded-full h-1.5">
                        <div
                          className="bg-salty-coral h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(allResults.length / Math.max(getUpcomingRetreats().filter(r => r.status !== 'sold_out').length, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Retreat Pill Toggles */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-4xl mx-auto">
                    {allResults.map((result) => {
                      const isActive = enabledRetreats.has(result.search.retreatSlug);
                      return (
                        <button
                          key={result.search.retreatSlug}
                          onClick={() => toggleRetreatPill(result.search.retreatSlug)}
                          className={cn(
                            'px-4 py-2 rounded-full font-body text-xs font-bold transition-all border-2',
                            isActive
                              ? 'bg-salty-deep-teal text-white border-salty-deep-teal'
                              : 'bg-transparent text-salty-deep-teal/40 border-salty-sand hover:border-salty-deep-teal/30'
                          )}
                        >
                          {result.search.retreatName.split(' — ')[1] || result.search.retreatName}
                          <span className="ml-1.5 opacity-60">
                            {formatShortDate(result.search.dates.retreatStart)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Controls Row: Sort + Currency */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs text-salty-deep-teal/40 uppercase tracking-wide">Sort:</span>
                      {sortModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSortMode(mode.value)}
                          className={cn(
                            'px-3 py-1 rounded-full font-body text-xs font-bold transition-all',
                            sortMode === mode.value
                              ? 'bg-salty-deep-teal text-white'
                              : 'bg-salty-sand/50 text-salty-deep-teal/50 hover:bg-salty-sand'
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inline Filters — Range Sliders */}
                  <div className="flex flex-wrap items-center gap-6 mb-4 max-w-3xl mx-auto">
                    {/* Stops Slider */}
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <span className="font-body text-xs text-salty-deep-teal/50 whitespace-nowrap">Stops:</span>
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

                    {/* Duration Slider */}
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <span className="font-body text-xs text-salty-deep-teal/50 whitespace-nowrap">Duration:</span>
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

                    {/* Price Slider */}
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <span className="font-body text-xs text-salty-deep-teal/50 whitespace-nowrap">Max $:</span>
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
                        className="font-body text-xs text-salty-coral font-bold hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Member Airlines Filter */}
                  <div className="mb-6 max-w-3xl mx-auto">
                    <AllianceFilter
                      selectedAlliances={filters.alliances || []}
                      onChange={(alliances) => setFilters({ alliances })}
                    />
                  </div>

                  {/* Horizontal Scroll Cards */}
                  <div className="scroll-x-snap gap-6 pb-4">
                    {visibleResults.map((result) => {
                      const flights = sortMode === 'cheapest' ? result.cheapest : sortMode === 'fastest' ? result.fastest : result.best;
                      const filtered = applyFlightFilters(flights, filters);
                      const cheapestPrice = filtered.length > 0 ? Math.min(...filtered.map((f) => f.price)) : 0;
                      const isExpanded = expandedCards.has(result.search.retreatSlug);
                      const displayFlights = isExpanded ? filtered : filtered.slice(0, 3);

                      return (
                        <div
                          key={result.search.retreatSlug}
                          className="w-[340px] sm:w-[380px] bg-surface-base rounded-2xl overflow-hidden flex-shrink-0"
                          style={{ boxShadow: 'var(--shadow-card-resting)' }}
                        >
                          {/* Card Header */}
                          <div className="p-4 bg-salty-deep-teal">
                            <h3 className="font-display text-lg text-white leading-tight">
                              {result.search.retreatName}
                            </h3>
                            <p className="font-body text-xs text-salty-seafoam/70 mt-0.5">
                              {formatShortDate(result.search.dates.retreatStart)} &ndash; {formatShortDate(result.search.dates.retreatEnd)}
                            </p>
                            <p className="font-body text-xs text-white/50 mt-1">
                              {result.search.origin.city} &rarr; {result.search.destination.city}
                            </p>
                            {cheapestPrice > 0 && (
                              <p className="font-display text-2xl text-salty-salmon mt-1">
                                from {formatCurrency(convertAmount(cheapestPrice, rates[selectedCurrency]), selectedCurrency)}
                              </p>
                            )}
                            <a
                              href={`https://getsaltyretreats.com/retreats/${result.search.retreatSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 font-body text-xs font-bold text-salty-salmon hover:text-white hover:underline transition-colors"
                            >
                              Learn more about this trip &rarr;
                            </a>
                          </div>
                          {/* Flight List */}
                          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                            {filtered.length === 0 ? (
                              <p className="font-body text-sm text-salty-deep-teal/50 text-center py-4">No flights match filters</p>
                            ) : (
                              <>
                                {displayFlights.map((flight) => (
                                  <FlightCard key={flight.id} flight={flight} showCheckbox />
                                ))}
                                {filtered.length > 3 && (
                                  <button
                                    onClick={() => toggleCardExpand(result.search.retreatSlug)}
                                    className="w-full py-2 font-body text-xs font-bold text-salty-coral hover:underline text-center"
                                  >
                                    {isExpanded ? 'Show less' : `Show ${filtered.length - 3} more`}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          {/* Compact Trip Cost */}
                          {(() => {
                            const retreat = getRetreatBySlug(result.search.retreatSlug);
                            if (!retreat || retreat.lowestPrice === 0) return null;
                            const flightAmt = cheapestPrice;
                            return (
                              <div className="px-4 pb-4">
                                <TripCostBar
                                  destination={retreat.destination}
                                  retreatSlug={retreat.slug}
                                  retreatPrice={retreat.lowestPrice}
                                  flightLabel={flightAmt > 0 ? `~$${flightAmt.toLocaleString()}` : ''}
                                  flightAmount={flightAmt}
                                  isFlightEstimated={true}
                                  valueSummary=""
                                  variant="compact"
                                  status={retreat.status}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Compare mode floating save bar */}
                  <CompareFlightSaveBar allResults={visibleResults} />
                </div>
              </section>
            </>
          ) : tripType === 'multi-city' && (multiCityLegResults.length > 0 || isLoading) ? (
            <section className="px-6 pb-12 bg-surface-base">
              <div className="max-w-3xl mx-auto">
                <MultiCityResultsContainer
                  legs={multiCityLegs}
                  legResults={multiCityLegResults}
                  activeLeg={multiCityActiveLeg}
                  isLoading={isLoading}
                  onSearchNextLeg={handleSearchNextLeg}
                  onBackToLeg={handleBackToLeg}
                />
              </div>
            </section>
          ) : (
            <section className="px-6 pb-12 bg-surface-base">
              <div className="max-w-3xl mx-auto">
                <FlightResultsContainer />
                {/* Trip Cost Bar — single retreat mode */}
                {selectedRetreatSlug && (() => {
                  const retreat = getRetreatBySlug(selectedRetreatSlug);
                  if (!retreat || retreat.lowestPrice === 0) return null;
                  const estimate = getFlightEstimate(searchResults, isLoading);
                  return (
                    <TripCostBar
                      destination={retreat.destination}
                      retreatSlug={retreat.slug}
                      retreatPrice={retreat.lowestPrice}
                      flightLabel={estimate.label}
                      flightAmount={estimate.amount}
                      isFlightEstimated={estimate.isEstimated}
                      valueSummary={retreatValueSummaries[retreat.slug] || ''}
                      isLoading={isLoading}
                      variant="sticky"
                      status={retreat.status}
                    />
                  );
                })()}
              </div>
            </section>
          )}
        </>
      ) : null}

      {/* Bottom CTA */}
      {!hasSearched && (
        <section className="px-6 pb-12 bg-surface-base">
          <div className="max-w-3xl mx-auto mt-12">
            <HumanCTA
              message="Not sure where to go yet? Take the quiz first."
              context="Hey! I'm looking at SALTY retreats but not sure which destination is right for me."
            />
            <div className="text-center mt-4">
              <a href="/quiz" className="font-body text-sm text-salty-coral font-bold hover:underline">
                Take the Trip Matcher Quiz &rarr;
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-surface-base">
        <div className="w-12 h-12 border-4 border-salty-coral border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
