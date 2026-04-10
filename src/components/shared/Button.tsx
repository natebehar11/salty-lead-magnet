import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'yellow' | 'retreat';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-body font-bold rounded-full transition-all duration-200 active:scale-[0.98]';

  const variants = {
    primary:
      'bg-salty-coral text-salty-deep-teal hover:bg-salty-deep-teal hover:text-surface-base shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card-hover)]',
    secondary:
      'bg-transparent border-2 border-salty-deep-teal text-salty-deep-teal hover:bg-salty-deep-teal hover:text-surface-base',
    ghost:
      'bg-transparent text-salty-deep-teal hover:text-salty-coral underline underline-offset-4',
    yellow:
      'bg-salty-gold text-salty-deep-teal hover:bg-salty-gold/80 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card-hover)]',
    retreat:
      'bg-retreat-accent text-retreat-text-on-primary hover:opacity-90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card-hover)]',
  };

  const sizes = {
    sm: 'h-9 px-5 text-xs',
    md: 'h-11 px-8 text-sm',
    lg: 'h-13 px-10 text-base',
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className);

  if (href) {
    if (disabled) {
      return (
        <span role="link" aria-disabled="true" tabIndex={-1} className={classes}>
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
