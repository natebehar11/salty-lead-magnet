'use client';

import { cn } from '@/lib/utils';

type BadgeSize = 'sm' | 'md' | 'lg';

interface StarburstBadgeProps {
  children: React.ReactNode;
  size?: BadgeSize;
  bgColor?: string;
  textColor?: string;
  rotation?: number;
  className?: string;
}

const sizeMap: Record<BadgeSize, { container: string; text: string }> = {
  sm: { container: 'w-16 h-16', text: 'text-[10px]' },
  md: { container: 'w-24 h-24', text: 'text-xs' },
  lg: { container: 'w-32 h-32', text: 'text-sm' },
};

export default function StarburstBadge({
  children,
  size = 'md',
  bgColor = 'var(--color-salty-coral)',
  textColor = 'var(--color-surface-base)',
  rotation = -12,
  className = '',
}: StarburstBadgeProps) {
  const { container, text } = sizeMap[size];

  return (
    <div
      className={cn('star-badge relative flex items-center justify-center', container, className)}
      style={{
        backgroundColor: bgColor,
        transform: `rotate(${rotation}deg)`,
      }}
      aria-hidden="true"
    >
      <span
        className={cn('font-display uppercase tracking-wider text-center leading-tight', text)}
        style={{ color: textColor }}
      >
        {children}
      </span>
    </div>
  );
}
