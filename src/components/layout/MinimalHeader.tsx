'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import FocusTrap from 'focus-trap-react';
import { useCurrencyStore } from '@/stores/currency-store';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/quiz', label: 'Find Your Retreat' },
  { href: '/flights', label: 'Flight Finder' },
  { href: '/compare', label: 'Price Comparison' },
  { href: '/planner', label: 'Build a Trip' },
];

export default function MinimalHeader() {
  const pathname = usePathname();
  const { selectedCurrency, setCurrency, fetchRates, isStale } = useCurrencyStore();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const currencyRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Scroll behavior: transparent→solid on scroll, hide on scroll-down, reveal on scroll-up
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrolled(currentScrollY > 10);

    if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close currency dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    if (currencyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [currencyOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-surface-base/95 backdrop-blur-sm'
            : 'bg-surface-base',
          !visible && !mobileMenuOpen && '-translate-y-full'
        )}
        style={{
          boxShadow: scrolled ? 'var(--shadow-nav)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/salty-wordmark-dark.png"
              alt="SALTY Retreats"
              width={120}
              height={30}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="flex items-center gap-6">
            {/* Desktop nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'font-body text-sm transition-colors hidden',
                  link.href === '/planner' ? 'md:block' : 'sm:block',
                  isActive(link.href)
                    ? 'text-salty-coral font-bold border-b-2 border-salty-coral pb-0.5'
                    : 'text-salty-deep-teal/60 hover:text-salty-coral'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Desktop currency selector */}
            <div ref={currencyRef} className="relative hidden sm:block">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-expanded={currencyOpen}
                aria-haspopup="listbox"
                aria-label={`Currency: ${selectedCurrency}. Change currency`}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg font-body text-xs font-bold transition-colors',
                  'border border-salty-sand/50 hover:border-salty-deep-teal/30',
                  isStale ? 'text-salty-deep-teal/50' : 'text-salty-deep-teal'
                )}
              >
                {selectedCurrency}
                <svg className={cn('w-3 h-3 transition-transform', currencyOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {currencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    role="listbox"
                    aria-label="Select currency"
                    className="absolute right-0 top-full mt-1 bg-surface-base border border-salty-sand rounded-xl p-2 flex gap-1 z-50"
                    style={{ boxShadow: 'var(--shadow-md)' }}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        role="option"
                        aria-selected={selectedCurrency === c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setCurrencyOpen(false);
                        }}
                        className={cn(
                          'px-2.5 py-1.5 rounded-lg font-body text-xs font-bold transition-colors',
                          selectedCurrency === c.code
                            ? 'bg-salty-deep-teal text-white'
                            : 'bg-salty-sand/50 text-salty-deep-teal/50 hover:bg-salty-sand hover:text-salty-deep-teal'
                        )}
                      >
                        {c.code}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* External link — desktop only */}
            <a
              href="https://getsaltyretreats.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-salty-coral font-bold hover:text-salty-rust transition-colors hidden sm:block"
            >
              getsaltyretreats.com
            </a>

            {/* Hamburger button — mobile only */}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-panel"
            >
              <svg className="w-6 h-6 text-salty-deep-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60] cursor-default"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <FocusTrap
              focusTrapOptions={{
                allowOutsideClick: true,
                initialFocus: false,
                onDeactivate: () => {
                  setMobileMenuOpen(false);
                  hamburgerRef.current?.focus();
                },
              }}
            >
            <motion.div
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-surface-base z-[70] flex flex-col"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Close button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-salty-sand/50">
                <span className="font-display text-sm text-salty-deep-teal">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-1">
                  <svg className="w-5 h-5 text-salty-deep-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'block py-3 px-3 rounded-lg font-body text-sm transition-colors',
                      isActive(link.href)
                        ? 'text-salty-coral font-bold bg-salty-coral/5'
                        : 'text-salty-deep-teal/70 hover:text-salty-coral hover:bg-salty-sand/30'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Currency selector */}
              <div className="px-6 py-4 border-t border-salty-sand/50">
                <p className="font-body text-xs text-salty-deep-teal/50 uppercase tracking-wider mb-2">Currency</p>
                <div className="flex gap-1">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={cn(
                        'flex-1 py-2 rounded-lg font-body text-xs font-bold transition-colors',
                        selectedCurrency === c.code
                          ? 'bg-salty-deep-teal text-white'
                          : 'bg-salty-sand/50 text-salty-deep-teal/50 hover:bg-salty-sand'
                      )}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
                {isStale && (
                  <p className="font-body text-[10px] text-salty-deep-teal/40 mt-1">Rates may be approximate</p>
                )}
              </div>

              {/* External link */}
              <div className="px-6 py-4 border-t border-salty-sand/50">
                <a
                  href="https://getsaltyretreats.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-salty-coral font-bold hover:text-salty-rust transition-colors"
                >
                  getsaltyretreats.com &rarr;
                </a>
              </div>
            </motion.div>
            </FocusTrap>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
