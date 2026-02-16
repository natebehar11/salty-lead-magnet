'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MinimalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-salty-cream/90 backdrop-blur-sm border-b border-salty-beige/50">
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
          <Link href="/quiz" className="font-body text-sm text-salty-slate/60 hover:text-salty-orange-red transition-colors hidden sm:block">
            Find Your Retreat
          </Link>
          <Link href="/flights" className="font-body text-sm text-salty-slate/60 hover:text-salty-orange-red transition-colors hidden sm:block">
            Flight Finder
          </Link>
          <Link href="/compare" className="font-body text-sm text-salty-slate/60 hover:text-salty-orange-red transition-colors hidden sm:block">
            Price Comparison
          </Link>
          <Link href="/planner" className="font-body text-sm text-salty-slate/60 hover:text-salty-orange-red transition-colors hidden md:block">
            Build a Trip
          </Link>
          <a
            href="https://getsaltyretreats.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-salty-orange-red font-bold hover:text-salty-burnt-red transition-colors"
          >
            getsaltyretreats.com
          </a>
        </nav>
      </div>
    </header>
  );
}
