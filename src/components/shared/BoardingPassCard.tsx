'use client';

import { cn } from '@/lib/utils';

interface BoardingPassCardProps {
  children: React.ReactNode;
  headerLabel?: string;
  headerBg?: string;
  headerTextColor?: string;
  className?: string;
  notchBg?: string;
}

export default function BoardingPassCard({
  children,
  headerLabel,
  headerBg = 'var(--color-salty-coral)',
  headerTextColor = 'var(--color-surface-base)',
  className = '',
  notchBg,
}: BoardingPassCardProps) {
  return (
    <div
      className={cn(
        'ticket-notch relative rounded-2xl overflow-hidden bg-surface-base',
        className
      )}
      style={{
        boxShadow: 'var(--shadow-card-resting)',
        ...(notchBg ? { '--notch-bg': notchBg } as React.CSSProperties : {}),
      }}
    >
      {headerLabel && (
        <div
          className="px-6 py-2.5 font-display text-xs uppercase tracking-widest"
          style={{ backgroundColor: headerBg, color: headerTextColor }}
        >
          {headerLabel}
        </div>
      )}

      {headerLabel && (
        <div className="mx-6 border-t-2 border-dashed border-salty-sand/60" />
      )}

      <div className="p-6">{children}</div>
    </div>
  );
}
