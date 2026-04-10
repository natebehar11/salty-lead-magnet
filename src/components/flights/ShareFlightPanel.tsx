'use client';

import { useState, useMemo } from 'react';
import { FlightOption } from '@/types';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/shared/Button';
import ShareButton from '@/components/shared/ShareButton';

interface ShareFlightPanelProps {
  departingFlights: FlightOption[];
  returnFlights: FlightOption[];
  retreatName: string;
}

export default function ShareFlightPanel({ departingFlights, returnFlights, retreatName }: ShareFlightPanelProps) {
  const {
    hasSubmittedLead, leadData, selectedOutboundIds, selectedReturnIds,
    tripType, multiCityLegResults,
  } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [showFallbackShare, setShowFallbackShare] = useState(false);

  // Extract selected multi-city flights from leg results
  const multiCityFlights = useMemo(() => {
    if (tripType !== 'multi-city') return [];
    return multiCityLegResults
      .filter((r) => r.selectedFlightId)
      .map((r) => {
        const allFlights = [
          ...(r.results.cheapest || []),
          ...(r.results.best || []),
          ...(r.results.fastest || []),
        ];
        // Dedupe by id
        const seen = new Set<string>();
        const unique = allFlights.filter((f) => {
          if (seen.has(f.id)) return false;
          seen.add(f.id);
          return true;
        });
        const flight = unique.find((f) => f.id === r.selectedFlightId);
        return flight ? { legLabel: r.legLabel, flight } : null;
      })
      .filter((x): x is { legLabel: string; flight: FlightOption } => x !== null);
  }, [tripType, multiCityLegResults]);

  const isMultiCity = tripType === 'multi-city';
  const hasStandardFlights = departingFlights.length > 0 || returnFlights.length > 0;
  const hasMultiCityFlights = multiCityFlights.length > 0;

  if (!hasSubmittedLead || (!hasStandardFlights && !hasMultiCityFlights)) return null;

  const selectedDeparting = departingFlights.filter((f) => selectedOutboundIds.includes(f.id) && f.segments?.length > 0);
  const selectedReturn = returnFlights.filter((f) => selectedReturnIds.includes(f.id) && f.segments?.length > 0);
  const totalSelected = isMultiCity
    ? multiCityFlights.length
    : selectedDeparting.length + selectedReturn.length;

  const formatFlightPrice = (price: number) => {
    return formatCurrency(convertAmount(price, rates[selectedCurrency]), selectedCurrency);
  };

  const buildShareText = (): string => {
    const tripLabel = tripType === 'round-trip' ? 'Round-Trip' : tripType === 'one-way' ? 'One-Way' : 'Multi-City';
    const lines: string[] = [`${tripLabel} Flight Plans for SALTY ${retreatName}`, ''];

    if (isMultiCity && multiCityFlights.length > 0) {
      lines.push('MULTI-CITY ITINERARY:');
      let total = 0;
      multiCityFlights.forEach((item, i) => {
        const f = item.flight;
        const airline = [...new Set(f.segments.map(s => s.airline))].join(' + ');
        const price = formatFlightPrice(f.price);
        const stops = f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`;
        lines.push(`${i + 1}. ${item.legLabel} | ${airline} | ${price} | ${stops}`);
        total += f.price;
      });
      lines.push('');
      lines.push(`Total: ${formatFlightPrice(total)}`);
      lines.push('');
    } else {
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
          departingFlights: isMultiCity ? [] : selectedDeparting,
          returnFlights: isMultiCity ? [] : selectedReturn,
          multiCityFlights: isMultiCity ? multiCityFlights : undefined,
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

  return (
    <div className="mt-8 p-6 bg-salty-beige/50 rounded-xl">
      <h4 className="font-display text-lg text-salty-deep-teal mb-2">
        Save These Flight Plans
      </h4>
      <p className="font-body text-sm text-salty-deep-teal/60 mb-4">
        {totalSelected > 0
          ? 'Send your selected flights to yourself, or share with a friend.'
          : isMultiCity
            ? 'Complete your multi-city itinerary above, then send it to yourself or a friend.'
            : 'Select flights above using the checkboxes, then send them to yourself or a friend.'}
      </p>

      {/* Selected flights grouped by type */}
      {totalSelected > 0 ? (
        <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
          {/* Multi-city legs */}
          {isMultiCity && multiCityFlights.length > 0 && (
            <div>
              <p className="font-body text-[10px] text-salty-orange-red font-bold uppercase tracking-wider mb-2">
                Itinerary ({multiCityFlights.length} {multiCityFlights.length === 1 ? 'leg' : 'legs'})
              </p>
              <div className="space-y-1.5">
                {multiCityFlights.map((item) => (
                  <div
                    key={item.flight.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-salty-orange-red bg-salty-orange-red/5"
                  >
                    <span className="w-3 h-3 rounded-full bg-salty-orange-red border-2 border-salty-orange-red flex-shrink-0" />
                    <span className="font-body text-sm text-salty-deep-teal flex-1">
                      {item.legLabel} &middot;{' '}
                      {[...new Set(item.flight.segments.map(s => s.airline))].join(' + ')} &middot;{' '}
                      {formatFlightPrice(item.flight.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard departing flights */}
          {!isMultiCity && selectedDeparting.length > 0 && (
            <div>
              <p className="font-body text-[10px] text-salty-orange-red font-bold uppercase tracking-wider mb-2">
                Departing ({selectedDeparting.length})
              </p>
              <div className="space-y-1.5">
                {selectedDeparting.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-salty-orange-red bg-salty-orange-red/5"
                  >
                    <span className="w-3 h-3 rounded-full bg-salty-orange-red border-2 border-salty-orange-red flex-shrink-0" />
                    <span className="font-body text-sm text-salty-deep-teal flex-1">
                      {[...new Set(flight.segments.map(s => s.airline))].join(' + ')} &middot;{' '}
                      {formatFlightPrice(flight.price)} &middot;{' '}
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isMultiCity && selectedReturn.length > 0 && (
            <div>
              <p className="font-body text-[10px] text-salty-seafoam font-bold uppercase tracking-wider mb-2">
                Return ({selectedReturn.length})
              </p>
              <div className="space-y-1.5">
                {selectedReturn.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-salty-seafoam/50 bg-salty-seafoam/5"
                  >
                    <span className="w-3 h-3 rounded-full bg-salty-seafoam border-2 border-salty-seafoam flex-shrink-0" />
                    <span className="font-body text-sm text-salty-deep-teal flex-1">
                      {[...new Set(flight.segments.map(s => s.airline))].join(' + ')} &middot;{' '}
                      {formatFlightPrice(flight.price)} &middot;{' '}
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center mb-4">
          <p className="font-body text-xs text-salty-slate/40">
            {isMultiCity
              ? 'Select a flight for each leg of your itinerary above.'
              : 'Tap on flight cards above to select the ones you want to save.'}
          </p>
        </div>
      )}

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
