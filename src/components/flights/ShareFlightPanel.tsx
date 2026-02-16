'use client';

import { useState } from 'react';
import { FlightOption } from '@/types/flight';
import { useFlightStore } from '@/stores/flight-store';
import Button from '@/components/shared/Button';
import ShareButton from '@/components/shared/ShareButton';
import { cn } from '@/lib/utils';

interface ShareFlightPanelProps {
  flights: FlightOption[];
  retreatName: string;
}

export default function ShareFlightPanel({ flights, retreatName }: ShareFlightPanelProps) {
  const { hasSubmittedLead, leadData } = useFlightStore();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<'email' | 'whatsapp' | 'both' | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<Set<string>>(
    new Set(flights.slice(0, 3).map((f) => f.id))
  );

  if (!hasSubmittedLead || flights.length === 0) return null;

  const toggleFlight = (id: string) => {
    const next = new Set(selectedFlights);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedFlights(next);
  };

  const selectedFlightDetails = flights.filter((f) => selectedFlights.has(f.id));

  const handleShare = async (method: 'email' | 'whatsapp' | 'both') => {
    setIsSending(true);
    try {
      const selected = flights.filter((f) => selectedFlights.has(f.id));
      await fetch('/api/leads/share-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadData,
          flightOptions: selected,
          retreatName,
          deliveryMethod: method,
        }),
      });
      setSent(method);
    } catch {
      console.log('Share failed, but non-blocking');
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-8 p-6 bg-salty-olive/10 border-2 border-salty-olive/30 rounded-xl text-center">
        <p className="font-display text-lg text-salty-deep-teal mb-1">
          Sent! Check your {sent === 'email' ? 'inbox' : sent === 'whatsapp' ? 'WhatsApp' : 'inbox and WhatsApp'}.
        </p>
        <p className="font-body text-sm text-salty-deep-teal/60">
          Come back anytime to search again. These prices update regularly.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-salty-beige/50 rounded-xl">
      <h4 className="font-display text-lg text-salty-deep-teal mb-2">
        Send these flight plans to yourself
      </h4>
      <p className="font-body text-sm text-salty-deep-teal/60 mb-4">
        Save your top options so you can compare later. We&apos;ll send them from SALTY.
      </p>

      {/* Flight selection */}
      <div className="space-y-2 mb-4">
        {flights.slice(0, 5).map((flight) => (
          <label
            key={flight.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              selectedFlights.has(flight.id)
                ? 'border-salty-orange-red bg-salty-orange-red/5'
                : 'border-salty-beige bg-salty-cream'
            )}
          >
            <input
              type="checkbox"
              checked={selectedFlights.has(flight.id)}
              onChange={() => toggleFlight(flight.id)}
              className="w-4 h-4 accent-salty-orange-red"
            />
            <span className="font-body text-sm text-salty-deep-teal flex-1">
              {flight.segments[0].airline} &middot; ${flight.price} &middot;{' '}
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
            </span>
          </label>
        ))}
      </div>

      {/* Preview email button */}
      <button
        onClick={() => setShowEmailPreview(!showEmailPreview)}
        className="font-body text-xs text-salty-deep-teal/50 hover:text-salty-deep-teal underline underline-offset-2 mb-4 block"
      >
        {showEmailPreview ? 'Hide email preview' : 'Preview what we\'ll send'}
      </button>

      {/* Email Preview */}
      {showEmailPreview && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-salty-beige text-sm">
          <div className="border-b border-salty-beige/50 pb-3 mb-3">
            <p className="font-body text-xs text-salty-slate/40">From: SALTY Retreats &lt;hello@getsaltyretreats.com&gt;</p>
            <p className="font-body text-xs text-salty-slate/40">To: {leadData?.email || 'you'}</p>
            <p className="font-body text-xs text-salty-slate/40 font-bold">Subject: Your flight plans for {retreatName}</p>
          </div>
          <div className="font-body text-salty-charcoal space-y-3">
            <p>Hey {leadData?.firstName || 'there'}!</p>
            <p>Here are the flight options you saved for the <strong>{retreatName}</strong> retreat:</p>

            {selectedFlightDetails.map((f, i) => (
              <div key={f.id} className="p-3 bg-salty-cream rounded-lg">
                <p className="font-bold text-salty-deep-teal">Option {i + 1}: {f.segments[0].airline} — ${f.price}</p>
                <p className="text-xs text-salty-slate/70">
                  {f.segments[0].departure.time} {f.segments[0].departure.airport} → {f.segments[f.segments.length - 1].arrival.time} {f.segments[f.segments.length - 1].arrival.airport}
                  {' · '}{f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`}
                  {' · '}{f.segments[0].departure.date}
                </p>
              </div>
            ))}

            <div className="p-3 bg-salty-deep-teal/5 rounded-lg">
              <p className="font-bold text-salty-deep-teal text-xs">About {retreatName}</p>
              <p className="text-xs text-salty-slate/70 mt-1">7 days of surf, yoga, adventure, and unforgettable experiences. All-inclusive pricing covers accommodation, meals, activities, and airport transfers.</p>
            </div>

            <div className="p-3 bg-salty-yellow/10 rounded-lg">
              <p className="text-xs text-salty-slate/70">&quot;Best week of my life. The people, the waves, the food — everything was perfect.&quot; — Past SALTY Guest</p>
            </div>

            <p className="text-xs text-salty-slate/50 mt-2">Ready to book? Reply to this email or reach out on WhatsApp and we&apos;ll help you lock it in.</p>
          </div>
        </div>
      )}

      {/* Send buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleShare('email')}
          variant="primary"
          size="sm"
          disabled={isSending || selectedFlights.size === 0}
          className="flex-1"
        >
          {isSending ? 'Sending...' : 'Email Me'}
        </Button>
        <Button
          onClick={() => handleShare('whatsapp')}
          variant="secondary"
          size="sm"
          disabled={isSending || selectedFlights.size === 0}
          className="flex-1"
        >
          {isSending ? 'Sending...' : 'WhatsApp Me'}
        </Button>
      </div>

      {/* Share with friends */}
      <div className="mt-4 pt-4 border-t border-salty-beige/50 text-center">
        <ShareButton
          title={`Flight options for SALTY ${retreatName}`}
          text={`Check out these flight options for the SALTY ${retreatName} retreat! Found some great deals.`}
          url="https://explore.getsaltyretreats.com/flights"
        />
      </div>
    </div>
  );
}
