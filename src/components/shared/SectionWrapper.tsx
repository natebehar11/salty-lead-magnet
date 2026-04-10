import { cn } from '@/lib/utils';

type SurfaceVariant =
  | 'base'
  | 'warm-light'
  | 'warm'
  | 'dark'
  | 'dark-raised'
  | 'dark-deep';

interface SectionWrapperProps {
  children: React.ReactNode;
  surface?: SurfaceVariant;
  className?: string;
  id?: string;
}

const surfaceStyles: Record<SurfaceVariant, string> = {
  base: 'bg-surface-base text-salty-deep-teal',
  'warm-light': 'bg-surface-warm-light text-salty-deep-teal',
  warm: 'bg-surface-warm text-salty-deep-teal',
  dark: 'bg-surface-dark text-salty-cream',
  'dark-raised': 'bg-surface-dark-raised text-salty-cream',
  'dark-deep': 'bg-surface-dark-deep text-salty-cream',
};

export default function SectionWrapper({
  children,
  surface = 'base',
  className = '',
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 sm:py-20 md:py-24 px-6',
        surfaceStyles[surface],
        className
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
