'use client';

import { useState } from 'react';
import { FlightOption } from '@/types/flight';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/shared/Button';
import ShareButton from '@/components/shared/ShareButton';
import { cn } from '@/lib/utils';

interface ShareFlightPanelProps {
  departingFlights: FlightOption[];
  returnFlights: FlightOption[];
  retreatName: string;
}

export default function ShareFlightPanel({ departingFlights, returnFlights, retreatName }: ShareFlightPanelProps) {
  const { hasSubmittedLead, leadData, selectedOutboundIds, selectedReturnIds } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'departing' | 'return'>('departing');
  const [showFallbackShare, setShowFallbackShare] = useState(false);

  if (!hasSubmittedLead || (departingFlights.length === 0 && returnFlights.length === 0)) return null;

  const selectedDeparting = departingFlights.filter((f) => selectedOutboundIds.includes(f.id));
  const selectedReturn = returnFlights.filter((f) => selectedReturnIds.includes(f.id));
  const totalSelected = selectedDeparting.length + selectedReturn.length;

  const formatFlightPrice = (price: number) => {
    return formatCurrency(convertAmount(price, rates[selectedCurrency]), selectedCurrency);
  };

  const buildShareText = (): string => {
    const lines: string[] = [`Flight plans for SALTY ${retreatName}`, ''];

    if (selectedDeparting.length > 0) {
      lines.push('DEPARTING FLIGHTS:');
      selectedDeparting.forEach((f, i) => {
        const airline = [...new Set(f.segments.map(s => s.airline))].join(' + ');
        const price = formatFlightPrice(f.price);
        const stops = f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`;
        lines.push(`${i + 1}. ${airline} | ${price} | ${stops} | ${f.segments[0].departure.date}`);
      });
      lines.push('');
    }

    if (selectedReturn.length > 0) {
      lines.push('RETURN FLIGHTS:');
      selectedReturn.forEach((f, i) => {
        const airline = [...new Set(f.segments.map(s => s.airline))].join(' + ');
        const price = formatFlightPrice(f.price);
        const stops = f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`;
        lines.push(`${i + 1}. ${airline} | ${price} | ${stops} | ${f.segments[0].departure.date}`);
      });
      lines.push('');
    }

    lines.push('Found on explore.getsaltyretreats.com/flights');
    return lines.join('\n');
  };

  const openMailtoFallback = () => {
    const subject = encodeURIComponent(`Your flight plans for ${retreatName}`);
    const body = encodeURIComponent(buildShareText());
    window.open(`mailto:${leadData?.email || ''}?subject=${subject}&body=${body}`, '_self');
  };

  const handleEmailMe = async () => {
    if (totalSelected === 0) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/leads/send-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadData,
          departingFlights: selectedDeparting,
          returnFlights: selectedReturn,
          retreatName,
          currency: selectedCurrency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent('email');
      } else {
        openMailtoFallback();
        setSent('email');
      }
    } catch {
      openMailtoFallback();
      setSent('email');
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setSent('whatsapp');
  };

  const handleShareWithFriends = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Flight options for SALTY ${retreatName}`,
          text,
          url: 'https://explore.getsaltyretreats.com/flights',
        });
      } catch {
        // User cancelled share — no-op
      }
    } else {
      setShowFallbackShare(true);
    }
  };

  if (sent) {
    return (
      <div className="mt-8 p-6 bg-salty-olive/10 border-2 border-salty-olive/30 rounded-xl text-center">
        <p className="font-display text-lg text-salty-deep-teal mb-1">
          Sent! Check your {sent === 'email' ? 'inbox' : 'WhatsApp'}.
        </p>
        <p className="font-body text-sm text-salty-deep-teal/60">
          Come back anytime to search again. These prices update regularly.
        </p>
      </div>
    );
  }

  const currentFlights = activeTab === 'departing' ? departingFlights : returnFlights;
  const currentSelectedIds = activeTab === 'departing' ? selectedOutboundIds : selectedReturnIds;

  return (
    <div className="mt-8 p-6 bg-salty-beige/50 rounded-xl">
      <h4 className="font-display text-lg text-salty-deep-teal mb-2">
        Save These Flight Plans
      </h4>
      <p className="font-body text-sm text-salty-deep-teal/60 mb-4">
        Send your top options to yourself, or a friend. Track them and save.
      </p>

      {/* Departing / Return Tabs */}
      <div className="flex gap-1 mb-3 bg-salty-beige/30 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('departing')}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg font-body text-xs font-bold transition-all',
            activeTab === 'departing'
              ? 'bg-salty-cream text-salty-deep-teal shadow-sm'
              : 'text-salty-slate/50 hover:text-salty-deep-teal'
          )}
        >
          Departing ({selectedDeparting.length})
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg font-body text-xs font-bold transition-all',
            activeTab === 'return'
              ? 'bg-salty-cream text-salty-deep-teal shadow-sm'
              : 'text-salty-slate/50 hover:text-salty-deep-teal'
          )}
        >
          Return ({selectedReturn.length})
        </button>
      </div>

      {/* Selection count */}
      <p className="font-body text-xs text-salty-slate/50 mb-4">
        {selectedDeparting.length} departing, {selectedReturn.length} return selected
      </p>

      {/* Flight list for active tab */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {currentFlights.length === 0 ? (
          <p className="font-body text-xs text-salty-slate/40 text-center py-4">
            {activeTab === 'return' ? 'Search return flights to see options here.' : 'No flights available.'}
          </p>
        ) : (
          currentFlights.slice(0, 8).map((flight) => {
            const isChecked = currentSelectedIds.includes(flight.id);
            return (
              <div
                key={flight.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  isChecked
                    ? 'border-salty-orange-red bg-salty-orange-red/5'
                    : 'border-salty-beige bg-salty-cream'
                )}
              >
                <span
                  className={cn(
                    'w-3 h-3 rounded-full border-2 flex-shrink-0',
                    isChecked ? 'bg-salty-orange-red border-salty-orange-red' : 'border-salty-beige'
                  )}
                />
                <span className="font-body text-sm text-salty-deep-teal flex-1">
                  {[...new Set(flight.segments.map(s => s.airline))].join(' + ')} &middot;{' '}
                  {formatFlightPrice(flight.price)} &middot;{' '}
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Send buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleEmailMe}
          variant="primary"
          size="sm"
          disabled={isSending || totalSelected === 0}
          className="flex-1"
        >
          {isSending ? 'Sending...' : 'Email Me'}
        </Button>
        <Button
          onClick={handleWhatsApp}
          variant="secondary"
          size="sm"
          disabled={totalSelected === 0}
          className="flex-1"
        >
          WhatsApp Me
        </Button>
      </div>

      {/* Share with friends */}
      <div className="mt-4 pt-4 border-t border-salty-beige/50 text-center">
        <button
          onClick={handleShareWithFriends}
          className="font-body text-sm font-bold text-salty-orange-red hover:underline"
        >
          Share with Friends
        </button>
        {showFallbackShare && (
          <div className="mt-2">
            <ShareButton
              title={`Flight options for SALTY ${retreatName}`}
              text={buildShareText()}
              url="https://explore.getsaltyretreats.com/flights"
            />
          </div>
        )}
      </div>
    </div>
  );
}
