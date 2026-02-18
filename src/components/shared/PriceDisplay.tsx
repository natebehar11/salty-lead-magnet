'use client';

import { useCurrencyStore } from '@/stores/currency-store';
import { convertAndFormatCurrency, cn } from '@/lib/utils';

interface PriceDisplayProps {
  amountUSD: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  lg: {
    primary: 'font-display text-3xl text-salty-orange-red',
    secondary: 'font-body text-xs text-salty-slate/40',
  },
  md: {
    primary: 'font-display text-2xl text-salty-orange-red',
    secondary: 'font-body text-xs text-salty-slate/40',
  },
  sm: {
    primary: 'font-display text-lg text-salty-orange-red',
    secondary: 'font-body text-[10px] text-salty-slate/40',
  },
};

export default function PriceDisplay({ amountUSD, label, className, size = 'md' }: PriceDisplayProps) {
  const { selectedCurrency, rates } = useCurrencyStore();

  if (amountUSD === 0) return null;

  const { converted, original, isConverted } = convertAndFormatCurrency(
    amountUSD,
    selectedCurrency,
    rates[selectedCurrency]
  );

  const styles = sizeStyles[size];

  return (
    <span className={cn('inline-block', className)}>
      <span className={styles.primary}>
        {label && `${label} `}{converted}
      </span>
      {isConverted && (
        <span className={cn(styles.secondary, 'block')}>
          {original} USD
        </span>
      )}
    </span>
  );
}
