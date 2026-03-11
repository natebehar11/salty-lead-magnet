'use client';

import { FlightOption } from '@/types';
import { convertAndFormatCurrency, formatDuration, formatShortDate, cn } from '@/lib/utils';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { generateGoogleFlightsUrl } from '@/lib/google-flights';

interface FlightCardProps {
  flight: FlightOption;
  showCheckbox?: boolean;
  originCode?: string;
  destCode?: string;
  returnDate?: string;
  selectionMode?: 'checkbox' | 'radio';
  onToggleSelection?: (flightId: string) => void;
  isSelected?: boolean;
}

export default function FlightCard({ flight, showCheckbox = false, originCode, destCode, returnDate, selectionMode = 'checkbox', onToggleSelection, isSelected: isSelectedProp }: FlightCardProps) {
  const { selectedOutboundIds, toggleOutboundSelection } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();

  // Guard against malformed flights with empty segments array
  if (!flight.segments || flight.segments.length === 0) return null;

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];
  const isSelected = isSelectedProp !== undefined ? isSelectedProp : selectedOutboundIds.includes(flight.id);
  const handleToggle = onToggleSelection || toggleOutboundSelection;

  // Build booking URL: use flight's bookingUrl if available, otherwise Google Flights
  const bookingUrl =
    flight.bookingUrl && flight.bookingUrl.startsWith('http')
      ? flight.bookingUrl
      : generateGoogleFlightsUrl(
          originCode || firstSegment.departure.airport,
          destCode || lastSegment.arrival.airport,
          firstSegment.departure.date,
          returnDate,
        );

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if user clicked the "View flight" link or the checkbox itself
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('input[type="checkbox"]')) return;
    if (showCheckbox) {
      handleToggle(flight.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-surface-base rounded-xl p-4 transition-all',
        showCheckbox && 'cursor-pointer',
        isSelected && showCheckbox && 'ring-2 ring-salty-coral/50 bg-salty-coral/[0.02]',
        flight.isSelfTransfer && 'ring-1 ring-salty-gold/50',
        flight.isAlternateAirport && 'ring-1 ring-salty-sky/50',
      )}
      style={{ boxShadow: 'var(--shadow-card-resting)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-resting)'; }}
    >
      {/* Top Row: Checkbox + Airlines */}
      <div className="flex items-center mb-2">
        <div className="flex items-center gap-2">
          {showCheckbox && selectionMode === 'checkbox' && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(flight.id)}
              className="w-4 h-4 rounded border-salty-sand text-salty-coral focus:ring-salty-coral accent-salty-coral"
            />
          )}
          {showCheckbox && selectionMode === 'radio' && (
            <input
              type="radio"
              checked={isSelected}
              onChange={() => handleToggle(flight.id)}
              className="w-4 h-4 border-salty-sand text-salty-coral focus:ring-salty-coral accent-salty-coral"
            />
          )}
          <span className="font-body text-xs font-bold text-salty-deep-teal/60 uppercase truncate">
            {[...new Set(flight.segments.map((s) => s.airline))].join(' + ')}
          </span>
        </div>
      </div>

      {/* Route: Time → Connection → Time */}
      <div className="flex items-center gap-3">
        <div className="text-left flex-shrink-0">
          <p className="font-display text-lg text-salty-deep-teal leading-none">{firstSegment.departure.time}</p>
          <p className="font-body text-[11px] text-salty-deep-teal/50 mt-0.5">{firstSegment.departure.airport}</p>
        </div>

        {/* Connection line */}
        <div className="flex-1 flex flex-col items-center min-w-[80px]">
          <span className="font-body text-[10px] text-salty-deep-teal/40">
            {formatDuration(flight.totalDuration)}
          </span>
          <div className="w-full flex items-center gap-1 my-0.5">
            <div className="flex-1 h-px bg-salty-deep-teal/20" />
            {flight.stops > 0 &&
              Array.from({ length: flight.stops }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-salty-deep-teal/30 flex-shrink-0" />
              ))}
            {flight.stops > 0 && <div className="flex-1 h-px bg-salty-deep-teal/20" />}
            <svg className="w-3 h-3 text-salty-deep-teal/30 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <span className="font-body text-[10px] text-salty-deep-teal/40">
            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-display text-lg text-salty-deep-teal leading-none">{lastSegment.arrival.time}</p>
          <p className="font-body text-[11px] text-salty-deep-teal/50 mt-0.5">
            {lastSegment.arrival.airport}
            {lastSegment.arrival.date !== firstSegment.departure.date && (
              <span className="text-salty-coral ml-0.5">+1</span>
            )}
          </p>
        </div>
      </div>

      {/* Bottom Row: Date + Price + View Flight */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-salty-sand/50">
        <p className="font-body text-xs text-salty-deep-teal/40">
          {formatShortDate(firstSegment.departure.date)}
        </p>
        <div className="flex items-center gap-3">
          {(() => {
            const priceFmt = convertAndFormatCurrency(flight.price, selectedCurrency, rates[selectedCurrency]);
            return (
              <div className="text-right">
                <p className="font-display text-xl text-salty-coral leading-none">
                  {priceFmt.converted}
                </p>
                {priceFmt.isConverted && (
                  <p className="font-body text-[10px] text-salty-deep-teal/40 mt-0.5">{priceFmt.original} USD</p>
                )}
                {flight.isRoundTrip && (
                  <p className="font-body text-[10px] text-salty-deep-teal/40 mt-0.5">round-trip</p>
                )}
              </div>
            );
          })()}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs font-bold text-salty-deep-teal/60 hover:text-salty-coral transition-colors underline underline-offset-2"
          >
            View flight &rarr;
          </a>
        </div>
      </div>

      {/* Badges */}
      {(flight.stops === 0 || flight.isSelfTransfer || flight.isAlternateAirport) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {flight.stops === 0 && (
            <span className="px-2 py-0.5 bg-salty-olive/10 text-salty-olive font-body text-[10px] font-bold uppercase rounded-full">
              Direct
            </span>
          )}
          {flight.isSelfTransfer && (
            <span className="px-2 py-0.5 bg-salty-gold/20 text-salty-deep-teal font-body text-[10px] font-bold uppercase rounded-full">
              Self-Transfer
            </span>
          )}
          {flight.isAlternateAirport && (
            <span className="px-2 py-0.5 bg-salty-sky/30 text-salty-deep-teal font-body text-[10px] font-bold uppercase rounded-full">
              Alt Airport
            </span>
          )}
        </div>
      )}

      {/* Warnings */}
      {flight.isSelfTransfer && flight.selfTransferWarning && (
        <div className="mt-2 p-2.5 bg-salty-gold/10 rounded-lg">
          <p className="font-body text-[11px] text-salty-deep-teal/70">
            <span className="font-bold">Heads up: </span>
            {flight.selfTransferWarning}
          </p>
        </div>
      )}
      {flight.isAlternateAirport && flight.alternateAirportNote && (
        <div className="mt-2 p-2.5 bg-salty-sky/10 rounded-lg">
          <p className="font-body text-[11px] text-salty-deep-teal/70">
            <span className="font-bold">Note: </span>
            {flight.alternateAirportNote}
          </p>
        </div>
      )}
    </div>
  );
}
