'use client';

import { cn } from '@/lib/utils';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface CurrencySelectorProps {
  selected: string;
  onChange: (currency: string) => void;
}

export default function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {SUPPORTED_CURRENCIES.map((c) => (
        <button
          key={c.code}
          onClick={() => onChange(c.code)}
          className={cn(
            'px-2 py-1 rounded-lg font-body text-xs font-bold transition-all',
            selected === c.code
              ? 'bg-salty-deep-teal text-white'
              : 'bg-salty-beige/50 text-salty-deep-teal/50 hover:bg-salty-beige'
          )}
        >
          {c.code}
        </button>
      ))}
    </div>
  );
}
