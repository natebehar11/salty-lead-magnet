'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import Button from './Button';

interface TripCostBarProps {
  destination: string;
  retreatSlug: string;
  retreatPrice: number;
  flightLabel: string;
  flightAmount: number;
  isFlightEstimated: boolean;
  valueSummary: string;
  isLoading?: boolean;
  variant: 'sticky' | 'inline' | 'compact';
  status?: 'available' | 'sold_out' | 'coming_soon' | 'tbd';
}

export default function TripCostBar({
  destination,
  retreatSlug,
  retreatPrice,
  flightLabel: _flightLabel,
  flightAmount,
  isFlightEstimated: _isFlightEstimated,
  valueSummary,
  isLoading,
  variant,
  status = 'available',
}: TripCostBarProps) {
  void _isFlightEstimated;
  void _flightLabel;

  const { selectedCurrency, rates } = useCurrencyStore();
  const rate = rates[selectedCurrency];

  if (retreatPrice === 0) return null;
  const fmtConverted = (usd: number) => formatCurrency(convertAmount(usd, rate), selectedCurrency);

  const total = retreatPrice + flightAmount;
  const totalLabel = flightAmount > 0
    ? `~${fmtConverted(total)}`
    : fmtConverted(retreatPrice);

  const flightDisplay = flightAmount > 0 ? `~${fmtConverted(flightAmount)}` : '';

  const bookingUrl = `https://getsaltyretreats.com/retreats/${retreatSlug}`;
  const ctaLabel = status === 'available' ? 'Book Your Spot' : status === 'coming_soon' ? 'Get Notified' : 'Learn More';

  if (variant === 'compact') {
    return (
      <div className="pt-3 mt-3 border-t border-salty-beige/50">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-sm text-salty-deep-teal/70">Total trip:</span>
          <span className="font-display text-lg text-salty-deep-teal font-bold">{totalLabel}</span>
        </div>
        {flightAmount > 0 && (
          <p className="font-body text-xs text-salty-slate/50 mt-0.5">
            (retreat from {fmtConverted(retreatPrice)} + flights {flightDisplay})
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-salty-sand/60 rounded-xl p-5 border border-salty-beige/50">
        <p className="font-display text-sm text-salty-deep-teal/80 uppercase tracking-wider mb-3">
          Your trip estimate
        </p>
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between font-body text-sm text-salty-deep-teal/70">
            <span>Retreat</span>
            <span>from {fmtConverted(retreatPrice)}</span>
          </div>
          <div className="flex justify-between font-body text-sm text-salty-deep-teal/70">
            <span>Flights</span>
            <span>{isLoading ? 'Searching...' : flightAmount > 0 ? flightDisplay : 'Select flights below'}</span>
          </div>
          <div className="border-t border-salty-deep-teal/10 pt-1.5 flex justify-between">
            <span className="font-display text-salty-deep-teal">Total</span>
            <span className="font-display text-lg text-salty-deep-teal font-bold">{totalLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button href={bookingUrl} variant="primary" size="sm" className="flex-1">
            {ctaLabel}
          </Button>
        </div>
      </div>
    );
  }

  // variant === 'sticky'
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky bottom-0 z-30 bg-salty-sand border-t-2 border-salty-orange-red/30 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-4xl mx-auto">
        <p className="font-display text-sm text-salty-deep-teal/70 mb-1">
          Your {destination} trip estimate
        </p>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-body text-salty-deep-teal">
            Retreat from {fmtConverted(retreatPrice)}
          </span>
          <span className="text-salty-deep-teal/40">+</span>
          <span className="font-body text-salty-deep-teal">
            {isLoading ? 'Searching flights...' : flightAmount > 0 ? `Flights ${flightDisplay}` : 'No flights found'}
          </span>
          {flightAmount > 0 && (
            <>
              <span className="text-salty-deep-teal/40">=</span>
              <span className="font-display text-xl text-salty-deep-teal font-bold">
                {totalLabel} total
              </span>
            </>
          )}
        </div>

        {valueSummary && (
          <p className="font-body text-xs text-salty-deep-teal/50 mt-1">
            That&apos;s {valueSummary}
          </p>
        )}

        <div className="mt-3 flex gap-3">
          <Button href={bookingUrl} variant="primary" size="sm">
            {ctaLabel}
          </Button>
          <Button href={`/flights?retreat=${retreatSlug}`} variant="ghost" size="sm">
            View Flights
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
