'use client';

import { cn } from '@/lib/utils';

interface SwoopDividerProps {
  flip?: boolean;
  className?: string;
  color?: string;
}

export default function SwoopDivider({
  flip = false,
  className = '',
  color = 'var(--color-surface-base)',
}: SwoopDividerProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-[0]',
        flip && 'rotate-180',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 64"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-[48px] sm:h-[56px] md:h-[64px]"
      >
        <path
          d="M0,32 C320,56 640,8 960,32 C1120,44 1280,52 1440,40 L1440,64 L0,64 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
