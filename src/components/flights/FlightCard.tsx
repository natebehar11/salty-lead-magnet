'use client';

import { FlightOption } from '@/types';
import { formatCurrency, formatDuration, cn } from '@/lib/utils';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { generateGoogleFlightsUrl } from '@/lib/google-flights';

interface FlightCardProps {
  flight: FlightOption;
  showCheckbox?: boolean;
  originCode?: string;
  destCode?: string;
}

export default function FlightCard({ flight, showCheckbox = false, originCode, destCode }: FlightCardProps) {
  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];
  const { favouriteFlightIds, toggleFavourite, selectedOutboundIds, toggleOutboundSelection } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();
  const isFavourited = favouriteFlightIds.includes(flight.id);
  const isSelected = selectedOutboundIds.includes(flight.id);

  // Build booking URL: use flight's bookingUrl if available, otherwise Google Flights
  const bookingUrl =
    flight.bookingUrl && flight.bookingUrl.startsWith('http')
      ? flight.bookingUrl
      : generateGoogleFlightsUrl(
          originCode || firstSegment.departure.airport,
          destCode || lastSegment.arrival.airport,
          firstSegment.departure.date
        );

  return (
    <div
      className={cn(
        'bg-salty-cream rounded-xl border-2 p-4 transition-shadow hover:shadow-md',
        isSelected && showCheckbox && 'ring-2 ring-salty-orange-red/50',
        flight.isSelfTransfer
          ? 'border-salty-gold/50'
          : flight.isAlternateAirport
          ? 'border-salty-sky/50'
          : 'border-salty-beige'
      )}
    >
      {/* Top Row: Checkbox + Airlines + Favourite */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleOutboundSelection(flight.id)}
              className="w-4 h-4 rounded border-salty-beige text-salty-orange-red focus:ring-salty-orange-red accent-salty-orange-red"
            />
          )}
          <span className="font-body text-xs font-bold text-salty-deep-teal/60 uppercase truncate">
            {[...new Set(flight.segments.map((s) => s.airline))].join(' + ')}
          </span>
        </div>
        {/* Favourite Heart */}
        <button
          onClick={() => toggleFavourite(flight.id)}
          className={cn(
            'p-1.5 rounded-full transition-all',
            isFavourited
              ? 'text-salty-orange-red bg-salty-orange-red/10'
              : 'text-salty-slate/30 hover:text-salty-orange-red/60 hover:bg-salty-beige/50'
          )}
          title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavourited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
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
              <span className="text-salty-orange-red ml-0.5">+1</span>
            )}
          </p>
        </div>
      </div>

      {/* Bottom Row: Date + Price + View Flight */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-salty-beige/50">
        <p className="font-body text-xs text-salty-deep-teal/40">
          {firstSegment.departure.date}
        </p>
        <div className="flex items-center gap-3">
          <p className="font-display text-xl text-salty-orange-red leading-none">
            {formatCurrency(convertAmount(flight.price, rates[selectedCurrency]), selectedCurrency)}
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs font-bold text-salty-deep-teal/60 hover:text-salty-orange-red transition-colors underline underline-offset-2"
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
