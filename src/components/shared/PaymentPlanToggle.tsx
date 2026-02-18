'use client';

import { useState } from 'react';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAndFormatCurrency, cn } from '@/lib/utils';

interface PaymentPlanToggleProps {
  totalPrice: number;
  deposit: number;
  balanceDueDate?: string;
}

export default function PaymentPlanToggle({ totalPrice, deposit, balanceDueDate }: PaymentPlanToggleProps) {
  const [showPlan, setShowPlan] = useState(false);
  const { selectedCurrency, rates } = useCurrencyStore();
  const balance = totalPrice - deposit;

  const fmt = (amount: number) => convertAndFormatCurrency(amount, selectedCurrency, rates[selectedCurrency]);

  return (
    <div className="rounded-xl border border-salty-beige overflow-hidden">
      <button
        onClick={() => setShowPlan(!showPlan)}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between transition-colors',
          showPlan ? 'bg-salty-orange-red/5' : 'bg-salty-cream hover:bg-salty-sand/30'
        )}
      >
        <div className="text-left">
          <p className="font-display text-sm text-salty-deep-teal">
            Lock it in for {fmt(deposit).converted} today
          </p>
          <p className="font-body text-xs text-salty-slate/50">
            Pay the rest before you go
          </p>
        </div>
        <svg
          className={cn('w-5 h-5 text-salty-orange-red transition-transform', showPlan && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showPlan && (
        <div className="px-4 py-4 bg-salty-cream space-y-3">
          {/* Timeline */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-salty-orange-red" />
              <div className="w-0.5 h-8 bg-salty-beige" />
              <div className="w-3 h-3 rounded-full bg-salty-deep-teal" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-display text-sm text-salty-orange-red">Today</p>
                <p className="font-body text-lg text-salty-deep-teal font-bold">
                  {fmt(deposit).converted} deposit
                </p>
                <p className="font-body text-xs text-salty-slate/40">
                  Secures your spot instantly
                </p>
              </div>
              <div>
                <p className="font-display text-sm text-salty-deep-teal">
                  {balanceDueDate || 'Before the trip'}
                </p>
                <p className="font-body text-lg text-salty-deep-teal font-bold">
                  {fmt(balance).converted} balance
                </p>
                <p className="font-body text-xs text-salty-slate/40">
                  Due before departure. No surprises.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-salty-beige/50">
            <div className="flex justify-between items-baseline">
              <span className="font-body text-xs text-salty-slate/50">Total</span>
              <span className="font-display text-lg text-salty-deep-teal">
                {fmt(totalPrice).converted}
                {fmt(totalPrice).isConverted && (
                  <span className="font-body text-xs text-salty-slate/40 ml-1">({fmt(totalPrice).original} USD)</span>
                )}
              </span>
            </div>
          </div>

          <p className="font-body text-[10px] text-salty-slate/30">
            No hidden fees. No interest. Just split your payment into two parts.
          </p>
        </div>
      )}
    </div>
  );
}
