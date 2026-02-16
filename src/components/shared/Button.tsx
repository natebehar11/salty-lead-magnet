import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'yellow';
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
    'inline-flex items-center justify-center font-display uppercase tracking-wider rounded-full transition-all duration-200 active:scale-[0.98]';

  const variants = {
    primary: 'bg-salty-orange-red text-white hover:bg-salty-burnt-red shadow-md hover:shadow-lg',
    secondary:
      'bg-transparent border-2 border-salty-deep-teal text-salty-deep-teal hover:bg-salty-deep-teal hover:text-white',
    ghost: 'bg-transparent text-salty-deep-teal hover:text-salty-orange-red underline underline-offset-4',
    yellow: 'bg-salty-yellow text-salty-deep-teal hover:bg-salty-yellow/80 shadow-md hover:shadow-lg font-bold',
  };

  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className);

  if (href) {
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
