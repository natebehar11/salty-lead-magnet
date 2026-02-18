'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useCallback, useMemo } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { getUpcomingRetreats } from '@/data/retreats';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsContainer from '@/components/flights/FlightResultsContainer';
import FlightLeadGate from '@/components/flights/FlightLeadGate';
import ScrollReveal from '@/components/shared/ScrollReveal';
import HumanCTA from '@/components/shared/HumanCTA';
import WaveDivider from '@/components/shared/WaveDivider';
import FlightCard from '@/components/flights/FlightCard';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import AllianceFilter from '@/components/flights/AllianceFilter';
import { flightMatchesAlliances } from '@/data/alliances';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FlightSortMode } from '@/types';
import TripCostBar from '@/components/shared/TripCostBar';
import { getFlightEstimate } from '@/lib/trip-cost';
import { retreatValueSummaries } from '@/data/retreat-value-summaries';
import { getRetreatBySlug } from '@/data/retreats';

const sortModes: { value: FlightSortMode; label: string }[] = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'best', label: 'Best' },
  { value: 'fastest', label: 'Fastest' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
    isLoading,
    searchResults,
    allResults,
    filters,
    setFilters,
    sortMode,
    setSortMode,
  } = useFlightStore();

  const { selectedCurrency, rates } = useCurrencyStore();

  const [hasSearched, setHasSearched] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  // Retreat pill toggles: all selected by default
  const [enabledRetreats, setEnabledRetreats] = useState<Set<string>>(new Set());
  // Show more per card
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Initialize enabledRetreats when allResults change
  useMemo(() => {
    if (allResults.length > 0 && enabledRetreats.size === 0) {
      setEnabledRetreats(new Set(allResults.map((r) => r.search.retreatSlug)));
    }
  }, [allResults, enabledRetreats.size]);

  const doSearch = useCallback(async () => {
    if (!originAirport) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      if (compareAll) {
        const retreats = getUpcomingRetreats().filter((r) => r.status !== 'sold_out');
        const results = await Promise.all(
          retreats.map(async (retreat) => {
            const res = await fetch('/api/flights/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originCode: originAirport.code,
                originName: originAirport.name,
                originCity: originAirport.city,
                originCountry: originAirport.country,
                retreatSlug: retreat.slug,
              }),
            });
            return res.json();
          })
        );
        setAllResults(results);
        setEnabledRetreats(new Set(results.map((r) => r.search.retreatSlug)));
        if (results.length > 0) setSearchResults(results[0]);
      } else if (selectedRetreatSlug) {
        const res = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originCode: originAirport.code,
            originName: originAirport.name,
            originCity: originAirport.city,
            originCountry: originAirport.country,
            retreatSlug: selectedRetreatSlug,
          }),
        });
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Flight search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [originAirport, selectedRetreatSlug, compareAll, setSearchResults, setAllResults, setIsLoading]);

  const handleSearch = () => {
    if (!hasSubmittedLead) {
      setShowLeadGate(true);
      doSearch();
    } else {
      doSearch();
    }
  };

  const handleLeadComplete = () => {
    setShowLeadGate(false);
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

  // Filter results based on enabled retreat pills
  const visibleResults = allResults.filter((r) => enabledRetreats.has(r.search.retreatSlug));

  return (
    <div className="min-h-screen">
      <section className="py-12 px-6 bg-salty-cream">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-3">
              SALTY Flight Finder
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-4">
              Find your flights.
            </h1>
            <p className="font-body text-lg text-salty-slate/60 max-w-lg mx-auto">
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

      {/* Lead Gate or Results */}
      {showLeadGate && !hasSubmittedLead ? (
        <section className="px-6 pb-12 bg-salty-cream">
          <div className="max-w-3xl mx-auto">
            <FlightLeadGate onComplete={handleLeadComplete} />
          </div>
        </section>
      ) : hasSearched && (searchResults || isLoading) ? (
        <>
          {compareAll && allResults.length > 1 ? (
            <>
              <WaveDivider variant="ocean" />
              {/* Compare Mode — Horizontal Scroll with full controls */}
              <section className="py-8 px-6 bg-salty-deep-teal/5">
                <div className="max-w-7xl mx-auto">
                  <h2 className="font-display text-section text-salty-deep-teal text-center mb-6">
                    Compare trips
                  </h2>

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
                              : 'bg-transparent text-salty-slate/40 border-salty-beige hover:border-salty-slate/30'
                          )}
                        >
                          {result.search.retreatName.split(' — ')[1] || result.search.retreatName}
                          <span className="ml-1.5 opacity-60">
                            {formatDate(result.search.dates.retreatStart)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Controls Row: Sort + Currency */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs text-salty-slate/40 uppercase tracking-wide">Sort:</span>
                      {sortModes.map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setSortMode(mode.value)}
                          className={cn(
                            'px-3 py-1 rounded-full font-body text-xs font-bold transition-all',
                            sortMode === mode.value
                              ? 'bg-salty-deep-teal text-white'
                              : 'bg-salty-beige/50 text-salty-slate/50 hover:bg-salty-beige'
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

                    {/* Duration Slider */}
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

                    {/* Price Slider */}
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
                      const filtered = flights.filter((f) => {
                        if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
                        if (filters.maxDuration !== null && f.totalDuration > filters.maxDuration) return false;
                        if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
                        if (filters.alliances && filters.alliances.length > 0) {
                          const airlines = [...new Set(f.segments.map((s) => s.airline))];
                          if (!flightMatchesAlliances(airlines, filters.alliances)) return false;
                        }
                        return true;
                      });
                      const cheapestPrice = filtered.length > 0 ? Math.min(...filtered.map((f) => f.price)) : 0;
                      const isExpanded = expandedCards.has(result.search.retreatSlug);
                      const displayFlights = isExpanded ? filtered : filtered.slice(0, 3);

                      return (
                        <div
                          key={result.search.retreatSlug}
                          className="w-[340px] sm:w-[380px] bg-salty-cream rounded-2xl border-2 border-salty-beige overflow-hidden flex-shrink-0"
                        >
                          {/* Card Header */}
                          <div className="p-4 bg-salty-deep-teal">
                            <h3 className="font-display text-lg text-white leading-tight">
                              {result.search.retreatName}
                            </h3>
                            <p className="font-body text-xs text-salty-seafoam/70 mt-0.5">
                              {formatDate(result.search.dates.retreatStart)} &ndash; {formatDate(result.search.dates.retreatEnd)}
                            </p>
                            <p className="font-body text-xs text-white/50 mt-1">
                              {result.search.origin.city} &rarr; {result.search.destination.city}
                            </p>
                            {cheapestPrice > 0 && (
                              <p className="font-display text-2xl text-salty-salmon mt-1">
                                from {formatCurrency(convertAmount(cheapestPrice, rates[selectedCurrency]), selectedCurrency)}
                              </p>
                            )}
                          </div>
                          {/* Flight List */}
                          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                            {filtered.length === 0 ? (
                              <p className="font-body text-sm text-salty-slate/50 text-center py-4">No flights match filters</p>
                            ) : (
                              <>
                                {displayFlights.map((flight) => (
                                  <FlightCard key={flight.id} flight={flight} />
                                ))}
                                {filtered.length > 3 && (
                                  <button
                                    onClick={() => toggleCardExpand(result.search.retreatSlug)}
                                    className="w-full py-2 font-body text-xs font-bold text-salty-orange-red hover:underline text-center"
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
                            const flightAmt = cheapestPrice > 0 ? cheapestPrice * 2 : 0;
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
                </div>
              </section>
            </>
          ) : (
            <section className="px-6 pb-12 bg-salty-cream">
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
        <section className="px-6 pb-12 bg-salty-cream">
          <div className="max-w-3xl mx-auto mt-12">
            <HumanCTA
              message="Not sure where to go yet? Take the quiz first."
              context="Hey! I'm looking at SALTY retreats but not sure which destination is right for me."
            />
            <div className="text-center mt-4">
              <a href="/quiz" className="font-body text-sm text-salty-orange-red font-bold hover:underline">
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
      <div className="min-h-screen flex items-center justify-center bg-salty-cream">
        <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
