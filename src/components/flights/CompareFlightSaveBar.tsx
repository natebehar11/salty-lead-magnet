'use client';

import { useState } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';
import { FlightSearchResults, FlightOption } from '@/types/flight';
import Button from '@/components/shared/Button';
import ShareButton from '@/components/shared/ShareButton';
import { motion, AnimatePresence } from 'framer-motion';

interface CompareFlightSaveBarProps {
  allResults: FlightSearchResults[];
}

export default function CompareFlightSaveBar({ allResults }: CompareFlightSaveBarProps) {
  const { selectedOutboundIds, clearOutboundSelection, hasSubmittedLead, leadData } = useFlightStore();
  const { selectedCurrency, rates } = useCurrencyStore();
  const [showPanel, setShowPanel] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [showFallbackShare, setShowFallbackShare] = useState(false);

  if (selectedOutboundIds.length === 0) return null;

  // Group selected flights by retreat
  const retreatsWithFlights: { retreatName: string; retreatSlug: string; flights: FlightOption[] }[] = [];
  const retreatsWithSelections = new Set<string>();

  allResults.forEach(result => {
    const allFlights = [...result.best, ...result.cheapest, ...result.fastest];
    const uniqueById = [...new Map(allFlights.map(f => [f.id, f])).values()];
    const selected = uniqueById.filter(f => selectedOutboundIds.includes(f.id));
    if (selected.length > 0) {
      retreatsWithSelections.add(result.search.retreatSlug);
      retreatsWithFlights.push({
        retreatName: result.search.retreatName,
        retreatSlug: result.search.retreatSlug,
        flights: selected,
      });
    }
  });

  const formatFlightPrice = (price: number) => {
    return formatCurrency(convertAmount(price, rates[selectedCurrency]), selectedCurrency);
  };

  const buildShareText = (): string => {
    const lines: string[] = ['Flight plans from SALTY', ''];
    retreatsWithFlights.forEach(({ retreatName, flights }) => {
      lines.push(`${retreatName.toUpperCase()}:`);
      flights.forEach((f, i) => {
        const airline = [...new Set(f.segments.map(s => s.airline))].join(' + ');
        const price = formatFlightPrice(f.price);
        const stops = f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`;
        lines.push(`${i + 1}. ${airline} | ${price} | ${stops} | ${f.segments[0].departure.date}`);
      });
      lines.push('');
    });
    lines.push('Found on explore.getsaltyretreats.com/flights');
    return lines.join('\n');
  };

  const openMailtoFallback = () => {
    const subject = encodeURIComponent('Your SALTY flight plans');
    const body = encodeURIComponent(buildShareText());
    window.open(`mailto:${leadData?.email || ''}?subject=${subject}&body=${body}`, '_self');
  };

  const handleEmailMe = async () => {
    if (!hasSubmittedLead) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/leads/send-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadData,
          departingFlights: retreatsWithFlights.flatMap(r => r.flights),
          returnFlights: [],
          retreatName: retreatsWithFlights.map(r => r.retreatName).join(', '),
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
          title: 'SALTY flight plans',
          text,
          url: 'https://explore.getsaltyretreats.com/flights',
        });
      } catch {
        // User cancelled
      }
    } else {
      setShowFallbackShare(true);
    }
  };

  return (
    <>
      {/* Floating notification bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md"
      >
        <div className="bg-salty-deep-teal rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm text-white">
              {selectedOutboundIds.length} flight{selectedOutboundIds.length > 1 ? 's' : ''} selected
            </p>
            <p className="font-body text-xs text-white/50">
              across {retreatsWithSelections.size} retreat{retreatsWithSelections.size > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearOutboundSelection}
              className="font-body text-xs text-white/50 hover:text-white underline"
            >
              Clear
            </button>
            <button
              onClick={() => setShowPanel(true)}
              className="px-5 py-2 bg-salty-orange-red text-white rounded-full font-display text-xs uppercase tracking-wider hover:bg-salty-burnt-red transition-all"
            >
              Save Plans
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save panel overlay */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center p-4"
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-salty-cream rounded-t-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {sent ? (
                <div className="text-center py-6">
                  <p className="font-display text-lg text-salty-deep-teal mb-1">
                    Sent! Check your {sent === 'email' ? 'inbox' : 'WhatsApp'}.
                  </p>
                  <p className="font-body text-sm text-salty-deep-teal/60 mb-4">
                    Come back anytime to search again.
                  </p>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="font-body text-sm text-salty-orange-red font-bold hover:underline"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="font-display text-lg text-salty-deep-teal mb-2">
                    Save These Flight Plans
                  </h4>
                  <p className="font-body text-sm text-salty-deep-teal/60 mb-4">
                    Send your top options to yourself, or a friend. Track them and save.
                  </p>

                  {/* Flights grouped by retreat */}
                  <div className="space-y-4 mb-6">
                    {retreatsWithFlights.map(({ retreatName, retreatSlug, flights }) => (
                      <div key={retreatSlug}>
                        <p className="font-body text-xs text-salty-orange-red font-bold uppercase tracking-wider mb-2">
                          {retreatName}
                        </p>
                        <div className="space-y-1.5">
                          {flights.map((flight) => (
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
                    ))}
                  </div>

                  {/* Send buttons */}
                  {hasSubmittedLead ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleEmailMe}
                        variant="primary"
                        size="sm"
                        disabled={isSending}
                        className="flex-1"
                      >
                        {isSending ? 'Sending...' : 'Email Me'}
                      </Button>
                      <Button
                        onClick={handleWhatsApp}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        WhatsApp Me
                      </Button>
                    </div>
                  ) : (
                    <p className="font-body text-xs text-salty-slate/50 text-center">
                      Search for a specific trip first to save flight plans via email.
                    </p>
                  )}

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
                          title="SALTY flight plans"
                          text={buildShareText()}
                          url="https://explore.getsaltyretreats.com/flights"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
