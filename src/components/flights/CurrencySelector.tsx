'use client';

import { cn } from '@/lib/utils';

const currencies = [
  { code: 'USD', label: 'USD' },
  { code: 'CAD', label: 'CAD' },
  { code: 'GBP', label: 'GBP' },
  { code: 'EUR', label: 'EUR' },
  { code: 'AUD', label: 'AUD' },
];

interface CurrencySelectorProps {
  selected: string;
  onChange: (currency: string) => void;
}

export default function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {currencies.map((c) => (
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
          {c.label}
        </button>
      ))}
    </div>
  );
}
