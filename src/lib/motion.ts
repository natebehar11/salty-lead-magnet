/**
 * Shared Framer Motion transitions aligned with design system tokens.
 * Use these for consistent animation timing across the app.
 *
 * Matches salty-website/src/lib/motion.ts for cross-product consistency.
 *
 * CSS tokens:
 *   --duration-fast: 200ms, --duration-base: 250ms, --duration-moderate: 300ms
 *   --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1.0)
 *   --ease-enter:   cubic-bezier(0.0, 0.0, 0.2, 1.0)
 *   --ease-exit:    cubic-bezier(0.4, 0.0, 1.0, 1.0)
 */

export const transitions = {
  /** 150ms - micro-interactions, hover feedback */
  fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const },
  /** 300ms - standard transitions, scroll reveals */
  base: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  /** 500ms - moderate emphasis, section entrances */
  moderate: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  /** 300ms - enter animations (ease-out) */
  enter: { duration: 0.3, ease: [0, 0, 0.2, 1] as const },
  /** 200ms - exit animations (ease-in) */
  exit: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
} as const;

export type TransitionKey = keyof typeof transitions;

/**
 * Common scroll-reveal animation props.
 * Use with <motion.div {...scrollRevealProps}> for standard entrance.
 */
export const scrollRevealProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
} as const;
