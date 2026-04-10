'use client';

import { useFlightStore } from '@/stores/flight-store';
import { MultiCityLeg, MultiCityLegResult, FlightOption, FlightSortMode } from '@/types';
import { applyFlightFilters } from '@/lib/flight-filters';
import FlightCard from './FlightCard';
import FlightCardSkeleton from './FlightCardSkeleton';
import MultiCityLegStepper from './MultiCityLegStepper';
import AllianceFilter from './AllianceFilter';
import Button from '@/components/shared/Button';
import { cn, formatShortDate } from '@/lib/utils';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';

const sortModes: { value: FlightSortMode; label: string }[] = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'best', label: 'Best' },
  { value: 'fastest', label: 'Fastest' },
];

interface MultiCityResultsContainerProps {
  legs: MultiCityLeg[];
  legResults: MultiCityLegResult[];
  activeLeg: number;
  isLoading: boolean;
  onSearchNextLeg: (legIndex: number, departureToken: string | null) => void;
  onBackToLeg: (legIndex: number) => void;
}

export default function MultiCityResultsContainer({
  legs,
  legResults,
  activeLeg,
  isLoading,
  onSearchNextLeg,
  onBackToLeg,
}: MultiCityResultsContainerProps) {
  const {
    sortMode,
    setSortMode,
    filters,
    setFilters,
    selectMultiCityFlight,
  } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();

  // Build leg labels for stepper
  const legLabels = legs.map((leg) => {
    const from = leg.origin?.code || '?';
    const to = leg.destination?.code || '?';
    const date = leg.date ? formatShortDate(leg.date) : '';
    return `${from} → ${to}${date ? ` (${date})` : ''}`;
  });

  // Get the active leg's results
  const activeResult = legResults.find((r) => r.legIndex === activeLeg);

  // Get flights for active leg by sort mode
  const getActiveLegFlights = (): FlightOption[] => {
    if (!activeResult) return [];
    const { results } = activeResult;
    switch (sortMode) {
      case 'cheapest': return results.cheapest;
      case 'fastest': return results.fastest;
      case 'best': default: return results.best;
    }
  };

  const flights = activeResult
    ? applyFlightFilters(getActiveLegFlights(), filters)
    : [];

  const selectedFlightId = activeResult?.selectedFlightId || null;
  const isLastLeg = activeLeg === legs.length - 1;
  const allLegsComplete = legResults.length === legs.length
    && legResults.every((r) => r.selectedFlightId);

  // Handle flight selection (radio — single choice per leg)
  const handleSelectFlight = (flightId: string) => {
    // Find departure_token from the result's source data
    // The departureToken should be on the FlightOption itself
    const flight = flights.find((f) => f.id === flightId);
    selectMultiCityFlight(activeLeg, flightId, flight?.departureToken || null);
  };

  // Handle continue to next leg
  const handleContinue = () => {
    if (!activeResult?.selectedFlightId) return;
    const nextLeg = activeLeg + 1;
    if (nextLeg < legs.length) {
      onSearchNextLeg(nextLeg, activeResult.departureToken);
    }
  };

  // Handle stepper back navigation
  const handleStepperClick = (legIndex: number) => {
    if (legIndex < activeLeg) {
      onBackToLeg(legIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <MultiCityLegStepper
          totalLegs={legs.length}
          activeLeg={activeLeg}
          completedLegs={legResults.filter((r) => r.selectedFlightId).length}
          legLabels={legLabels}
          onLegClick={handleStepperClick}
        />
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 border-4 border-salty-orange-red border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-salty-deep-teal/60">
              Searching for Flight {activeLeg + 1} options...
            </p>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <FlightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Stepper */}
      <MultiCityLegStepper
        totalLegs={legs.length}
        activeLeg={activeLeg}
        completedLegs={legResults.filter((r) => r.selectedFlightId).length}
        legLabels={legLabels}
        onLegClick={handleStepperClick}
      />

      {/* Completed legs summary */}
      {legResults.filter((r) => r.legIndex < activeLeg && r.selectedFlightId).length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="font-body text-[10px] text-salty-olive font-bold uppercase tracking-wider">
            Selected Flights
          </p>
          {legResults
            .filter((r) => r.legIndex < activeLeg && r.selectedFlightId)
            .map((r) => {
              const selectedFlight = [
                ...r.results.best, ...r.results.cheapest, ...r.results.fastest,
              ].find((f) => f.id === r.selectedFlightId);
              if (!selectedFlight) return null;
              return (
                <div key={r.legIndex} className="opacity-60">
                  <p className="font-body text-[10px] text-salty-deep-teal/50 mb-1">
                    {r.legLabel}
                  </p>
                  <FlightCard
                    flight={selectedFlight}
                    originCode={legs[r.legIndex]?.origin?.code}
                    destCode={legs[r.legIndex]?.destination?.code}
                  />
                </div>
              );
            })}
        </div>
      )}

      {/* Active leg header */}
      {activeResult && (
        <div className="mb-4">
          <h4 className="font-display text-lg text-salty-deep-teal">
            {activeResult.legLabel}
          </h4>
          {flights.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="font-body text-xs text-salty-deep-teal/50">
                {flights.length} flight{flights.length !== 1 ? 's' : ''} found
              </span>
              <span className="font-body text-xs text-salty-deep-teal/50">
                From{' '}
                <span className="font-bold text-salty-orange-red">
                  {formatCurrency(
                    convertAmount(Math.min(...flights.map((f) => f.price)), rates[selectedCurrency]),
                    selectedCurrency,
                  )}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alliance Filter */}
      {activeResult && (
        <div className="mb-4">
          <AllianceFilter
            selectedAlliances={filters.alliances || []}
            onChange={(alliances) => setFilters({ alliances })}
          />
        </div>
      )}

      {/* Sort Modes */}
      {activeResult && (
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
                  : 'bg-salty-beige/50 text-salty-deep-teal/50 hover:bg-salty-beige',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* Flight list (radio selection) */}
      {activeResult && flights.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-display text-xl text-salty-deep-teal mb-2">No flights match your filters.</p>
          <p className="font-body text-sm text-salty-deep-teal/50">Try loosening your filters to see more options.</p>
        </div>
      ) : activeResult ? (
        <div className="space-y-3">
          <p className="font-body text-xs text-salty-slate/40 mb-1">
            Select one flight for this leg.
          </p>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              showCheckbox
              selectionMode="radio"
              isSelected={flight.id === selectedFlightId}
              onToggleSelection={handleSelectFlight}
              originCode={legs[activeLeg]?.origin?.code}
              destCode={legs[activeLeg]?.destination?.code}
            />
          ))}
        </div>
      ) : null}

      {/* Continue / Finish button */}
      {selectedFlightId && (
        <div className="sticky bottom-4 mt-6 z-40">
          <div className="bg-salty-deep-teal rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm text-white">
                Flight {activeLeg + 1} selected
              </p>
              <p className="font-body text-xs text-white/50">
                {isLastLeg
                  ? allLegsComplete ? 'All flights selected!' : 'Confirm your selection'
                  : `Continue to Flight ${activeLeg + 2}`}
              </p>
            </div>
            {!isLastLeg ? (
              <Button onClick={handleContinue} size="sm">
                Continue to Flight {activeLeg + 2} &rarr;
              </Button>
            ) : allLegsComplete ? (
              <p className="font-body text-xs text-white/60">
                Save & share your itinerary below
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Multi-city total summary when all legs are complete */}
      {allLegsComplete && (
        <div className="mt-8 p-4 bg-salty-olive/10 border-2 border-salty-olive/30 rounded-xl">
          <p className="font-display text-lg text-salty-deep-teal mb-2">Multi-City Itinerary Total</p>
          <div className="space-y-1">
            {legResults.map((r) => {
              const flight = [...r.results.best, ...r.results.cheapest, ...r.results.fastest]
                .find((f) => f.id === r.selectedFlightId);
              return (
                <div key={r.legIndex} className="flex items-center justify-between">
                  <span className="font-body text-sm text-salty-deep-teal/70">{r.legLabel}</span>
                  <span className="font-display text-sm text-salty-orange-red">
                    {flight ? formatCurrency(convertAmount(flight.price, rates[selectedCurrency]), selectedCurrency) : '—'}
                  </span>
                </div>
              );
            })}
            <div className="border-t border-salty-olive/20 pt-2 mt-2 flex items-center justify-between">
              <span className="font-body text-sm font-bold text-salty-deep-teal">Total</span>
              <span className="font-display text-xl text-salty-orange-red">
                {formatCurrency(
                  convertAmount(
                    legResults.reduce((sum, r) => {
                      const flight = [...r.results.best, ...r.results.cheapest, ...r.results.fastest]
                        .find((f) => f.id === r.selectedFlightId);
                      return sum + (flight?.price || 0);
                    }, 0),
                    rates[selectedCurrency],
                  ),
                  selectedCurrency,
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
