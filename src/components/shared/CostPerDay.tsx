'use client';

import { useCurrencyStore } from '@/stores/currency-store';
import { convertAndFormatCurrency } from '@/lib/utils';

interface CostPerDayProps {
  totalPrice: number;
  nights: number;
  flightEstimate?: number;
}

export default function CostPerDay({ totalPrice, nights, flightEstimate }: CostPerDayProps) {
  const { selectedCurrency, rates } = useCurrencyStore();

  const allInTotal = totalPrice + (flightEstimate || 0);
  const days = nights + 1; // Nights + 1 for days
  const perDay = Math.round(allInTotal / days);

  const { converted, original, isConverted } = convertAndFormatCurrency(
    perDay,
    selectedCurrency,
    rates[selectedCurrency]
  );

  return (
    <div className="bg-salty-sand/40 rounded-xl px-4 py-3 text-center">
      <p className="font-body text-xs text-salty-slate/50 uppercase tracking-wider mb-1">
        That&apos;s only
      </p>
      <p className="font-display text-2xl text-salty-deep-teal">
        {converted}<span className="text-sm text-salty-deep-teal/50">/day</span>
      </p>
      {isConverted && (
        <p className="font-body text-[10px] text-salty-slate/40 mt-0.5">
          {original} USD/day
        </p>
      )}
      <p className="font-body text-xs text-salty-slate/40 mt-0.5">
        all-in: accommodation, meals, coaching, activities{flightEstimate ? ' + flights' : ''}
      </p>
    </div>
  );
}
