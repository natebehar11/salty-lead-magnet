'use client';

import { useState } from 'react';
import { FlightOption } from '@/types/flight';
import FlightCard from './FlightCard';
import { cn } from '@/lib/utils';

interface UnlistedPathsSectionProps {
  flights: FlightOption[];
}

export default function UnlistedPathsSection({ flights }: UnlistedPathsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (flights.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-display text-lg text-salty-deep-teal hover:text-salty-orange-red transition-colors"
      >
        <svg
          className={cn('w-5 h-5 transition-transform', isOpen && 'rotate-90')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Unlisted Paths ({flights.length})
        <span className="font-body text-xs text-salty-deep-teal/40 font-normal ml-1">
          Potentially cheaper, more effort
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Warning Banner */}
          <div className="p-4 bg-salty-gold/10 border-2 border-salty-gold/30 rounded-xl">
            <p className="font-body text-sm text-salty-deep-teal">
              <span className="font-bold">About unlisted paths: </span>
              These routes involve self-transfers or alternative airports.
              They can save you serious money, but they require extra planning.
              We can help you figure it out —{' '}
              <a
                href="https://wa.me/14318291135?text=Hey!%20I%20found%20an%20unlisted%20flight%20path%20and%20wanted%20help%20figuring%20it%20out."
                target="_blank"
                rel="noopener noreferrer"
                className="text-salty-orange-red font-bold hover:underline"
              >
                message us on WhatsApp
              </a>.
            </p>
          </div>

          {/* Flight Cards */}
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}
