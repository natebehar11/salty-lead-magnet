'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllDIYComparisons } from '@/data/diy-pricing';
import { DIYComparison, DIYLineItem } from '@/types';
import { getRetreatBySlug } from '@/data/retreats';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SwoopDivider from '@/components/shared/SwoopDivider';
import StarburstBadge from '@/components/shared/StarburstBadge';
import HumanCTA from '@/components/shared/HumanCTA';
import ShareButton from '@/components/shared/ShareButton';
import PriceDisplay from '@/components/shared/PriceDisplay';
import CostOfStayingHome from '@/components/compare/CostOfStayingHome';
import ConvinceYourCrew from '@/components/compare/ConvinceYourCrew';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';

interface LinkStatus {
  valid: boolean;
  checkedAt: string;
}

interface LinkStatusData {
  results: Record<string, LinkStatus>;
  lastRun: string | null;
}

/** Methodology tooltip — shows how a price was researched */
function MethodologyTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-salty-deep-teal/10 text-salty-deep-teal/40 text-[10px] font-bold hover:bg-salty-deep-teal/20 transition-colors ml-1"
        aria-label="How we calculated this price"
      >
        ?
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-20 left-0 top-full mt-1 w-64 p-3 bg-white rounded-lg shadow-lg border border-salty-sand text-left"
          >
            <p className="font-body text-[11px] text-salty-deep-teal/70 leading-relaxed">{text}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 font-body text-[10px] text-salty-coral font-bold hover:underline"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function ComparisonCard({ comparison, linkStatus, linkStatusLoaded }: { comparison: DIYComparison; linkStatus: LinkStatusData; linkStatusLoaded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { selectedCurrency, rates } = useCurrencyStore();
  const rate = rates[selectedCurrency];
  const fmtConverted = useCallback((usd: number) => formatCurrency(convertAmount(usd, rate), selectedCurrency), [rate, selectedCurrency]);

  // Derive SALTY price from retreat data, fall back to stored value
  const retreat = getRetreatBySlug(comparison.retreatSlug);
  const saltyPrice = retreat?.lowestPrice || comparison.saltyPriceFrom;

  const diyTotal = comparison.items.reduce((sum, item) => sum + item.diyPrice, 0);
  const savings = diyTotal - saltyPrice;
  const savingsPercent = diyTotal > 0 ? Math.round((savings / diyTotal) * 100) : 0;

  const includedItems = comparison.items.filter((item) => item.saltyIncluded && item.diyPrice > 0);
  const pricelessItems = comparison.items.filter((item) => item.diyPrice === 0);

  return (
    <motion.div
      id={comparison.retreatSlug}
      layout
      className="bg-surface-base rounded-2xl overflow-hidden transition-shadow"
      style={{ boxShadow: 'var(--shadow-card-resting)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-resting)'; }}
    >
      {/* Header */}
      <div className="p-6 bg-salty-deep-teal text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm text-salty-salmon mb-1">{comparison.retreatName}</p>
            <h3 className="font-display text-2xl">{comparison.destination}</h3>
            <p className="font-body text-sm text-white/60">{comparison.nights} nights</p>
          </div>
          <div className="text-right">
            {savings > 0 ? (
              <>
                <p className="font-body text-xs text-salty-seafoam uppercase tracking-wider">You save</p>
                <p className="font-display text-3xl text-salty-yellow">{savingsPercent}%</p>
              </>
            ) : (
              <>
                <p className="font-body text-xs text-salty-seafoam uppercase tracking-wider">Similar price</p>
                <p className="font-display text-lg text-salty-yellow">Zero planning</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Room tier note */}
      {comparison.roomTierNote && (
        <div className="px-6 pt-3">
          <p className="font-body text-[11px] text-salty-deep-teal/50 text-center italic">
            {comparison.roomTierNote}
          </p>
        </div>
      )}

      {/* Price Comparison Summary */}
      <div className="grid grid-cols-2 divide-x divide-salty-sand">
        <div className="p-6 text-center">
          <p className="font-body text-xs text-salty-deep-teal/50 uppercase tracking-wider mb-1">SALTY Price</p>
          <PriceDisplay amountUSD={saltyPrice} size="lg" />
          <p className="font-body text-xs text-salty-deep-teal/40 mt-1">from / person</p>
        </div>
        <div className="p-6 text-center">
          <p className="font-body text-xs text-salty-deep-teal/50 uppercase tracking-wider mb-1">DIY Cost</p>
          <p className="font-display text-3xl text-salty-deep-teal line-through decoration-salty-rust">
            {fmtConverted(diyTotal)}
          </p>
          <p className="font-body text-xs text-salty-deep-teal/40 mt-1">estimated / person</p>
        </div>
      </div>

      {/* Savings Banner */}
      <div className="mx-6 mb-4 p-3 bg-salty-yellow/20 rounded-xl text-center">
        {savings > 0 ? (
          <p className="font-display text-lg text-salty-deep-teal">
            Save {fmtConverted(savings)} and {comparison.estimatedPlanningHours}+ hours of planning with SALTY
          </p>
        ) : (
          <p className="font-display text-lg text-salty-deep-teal">
            Similar price, but with SALTY you get {includedItems.length}+ experiences included and {comparison.estimatedPlanningHours}+ hours of planning handled for you
          </p>
        )}
      </div>

      {/* Line Items */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-3 flex items-center justify-between font-body text-sm font-bold text-salty-deep-teal hover:text-salty-coral transition-colors"
      >
        <span>See full breakdown ({comparison.items.length} items)</span>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-2 border-b border-salty-sand text-xs font-bold text-salty-deep-teal/50 uppercase tracking-wider">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-right">DIY Cost</div>
                <div className="col-span-3 text-right">SALTY</div>
              </div>

              {/* Line Items */}
              {includedItems.map((item: DIYLineItem) => (
                <div key={item.category} className="grid grid-cols-12 gap-2 py-3 border-b border-salty-sand/50 items-center">
                  <div className="col-span-6">
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="font-body text-sm text-salty-charcoal">
                          {item.category}
                          {item.methodology && <MethodologyTooltip text={item.methodology} />}
                        </p>
                        <p className="font-body text-xs text-salty-deep-teal/40">{item.description}</p>
                        {item.sourceUrl && linkStatusLoaded && (() => {
                          const status = linkStatus.results[item.sourceUrl!];
                          const isBroken = status?.valid === false;

                          if (isBroken) {
                            return (
                              <span className="font-body text-[11px] text-salty-deep-teal/30 mt-0.5">
                                Source unavailable
                              </span>
                            );
                          }

                          return (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-body text-[11px] text-salty-coral font-bold hover:underline mt-0.5"
                            >
                              {item.sourceName || 'Verify'} &rarr;
                            </a>
                          );
                        })()}
                        {item.sourceUrl && !linkStatusLoaded && (
                          <span className="font-body text-[11px] text-salty-deep-teal/20 mt-0.5">
                            Loading source...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-body text-sm text-salty-deep-teal">{fmtConverted(item.diyPrice)}</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-body text-xs text-salty-forest-green font-bold bg-salty-seafoam/20 px-2 py-0.5 rounded-full">
                      Included
                    </span>
                  </div>
                </div>
              ))}

              {/* Priceless items */}
              {pricelessItems.length > 0 && (
                <div className="mt-4 p-4 bg-salty-salmon/10 rounded-xl">
                  <p className="font-display text-sm text-salty-deep-teal mb-2">PRICELESS WITH SALTY</p>
                  {pricelessItems.map((item: DIYLineItem) => (
                    <div key={item.category} className="flex items-center gap-2 py-1">
                      <span className="font-body text-sm text-salty-deep-teal/70">{item.category}: {item.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimated date & staleness warning */}
      <div className="px-6 pb-3">
        {(() => {
          const estimatedDate = new Date(comparison.estimatedDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const isStale = estimatedDate < threeMonthsAgo;
          const displayDate = estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return isStale ? (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
              <p className="font-body text-[11px] text-amber-700 text-center">
                These prices were estimated in {displayDate}. Click source links to verify current rates.
              </p>
            </div>
          ) : (
            <p className="font-body text-[11px] text-salty-deep-teal/40 text-center">
              DIY prices estimated as of {displayDate}. Click source links to verify current rates.
            </p>
          );
        })()}
      </div>

      {/* CTA */}
      <div className="px-6 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button href={`/flights?retreat=${comparison.retreatSlug}`} variant="primary" size="sm" className="flex-1">
            Check Flights
          </Button>
          <Button href={`https://getsaltyretreats.com/retreats/${comparison.retreatSlug}`} variant="secondary" size="sm" className="flex-1">
            View Trip Details
          </Button>
        </div>
      </div>

      {/* Per-card Share */}
      <div className="px-6 pb-6 text-center">
        <ShareButton
          title={`${comparison.destination} — DIY vs SALTY Price Comparison`}
          text={savings > 0
            ? `Check this out: a SALTY ${comparison.destination} retreat saves you ${fmtConverted(savings)} (${savingsPercent}%) compared to booking it yourself. Plus ${comparison.estimatedPlanningHours}+ hours of planning time.`
            : `Check this out: a SALTY ${comparison.destination} retreat includes ${includedItems.length}+ experiences and saves you ${comparison.estimatedPlanningHours}+ hours of planning.`
          }
          url={`https://explore.getsaltyretreats.com/compare#${comparison.retreatSlug}`}
        />
      </div>
    </motion.div>
  );
}

export default function ComparePage() {
  const now = new Date();
  const comparisons = getAllDIYComparisons().filter((c) => {
    const retreat = getRetreatBySlug(c.retreatSlug);
    // Don't show comparisons for unknown retreats (bad slug = broken CTAs)
    if (!retreat) return false;
    return new Date(retreat.endDate + 'T23:59:59') >= now;
  });

  const [linkStatus, setLinkStatus] = useState<LinkStatusData>({ results: {}, lastRun: null });
  const [linkStatusLoaded, setLinkStatusLoaded] = useState(false);
  const [deepLinkNotFound, setDeepLinkNotFound] = useState(false);

  // Compute best savings across all comparisons for the ConvinceYourCrew CTA
  const bestComparison = comparisons.reduce<{ savings: number; percent: number; slug: string }>(
    (best, c) => {
      const retreat = getRetreatBySlug(c.retreatSlug);
      const saltyPrice = retreat?.lowestPrice || c.saltyPriceFrom;
      const diyTotal = c.items.reduce((sum, item) => sum + item.diyPrice, 0);
      const savings = diyTotal - saltyPrice;
      const percent = diyTotal > 0 ? Math.round((savings / diyTotal) * 100) : 0;
      return savings > best.savings ? { savings, percent, slug: c.retreatSlug } : best;
    },
    { savings: 0, percent: 0, slug: '' }
  );

  useEffect(() => {
    // Handle deep link scrolling
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Deep link target not found (past retreat or bad link)
          setDeepLinkNotFound(true);
        }
      }, 500);
    }

    // Fetch link verification status
    fetch('/api/diy-link-status')
      .then((res) => res.json())
      .then((data) => {
        setLinkStatus(data);
        setLinkStatusLoaded(true);
      })
      .catch(() => {
        setLinkStatusLoaded(true); // Show links normally even if fetch fails
      });
  }, []);

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section className="py-20 px-6 bg-surface-base">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {bestComparison.percent > 0 && (
              <div className="flex justify-center mb-6">
                <StarburstBadge size="lg" bgColor="var(--color-salty-coral)" rotation={-8}>
                  SAVE {bestComparison.percent}%
                </StarburstBadge>
              </div>
            )}
            <p className="font-body text-sm text-salty-coral font-bold uppercase tracking-widest mb-3">
              DIY vs SALTY
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-4 text-balance">
              Think you can do it cheaper?
            </h1>
            <p className="font-body text-sm text-salty-deep-teal/40 italic mb-3">
              (Spoiler: probably not — and definitely not faster.)
            </p>
            <p className="font-body text-lg text-salty-deep-teal/60 max-w-lg mx-auto">
              We compared the cost AND the time of building the same quality trip yourself.
              Between research, booking, coordination, and logistics, our retreats save you
              weeks of planning and hundreds of dollars. The numbers don&apos;t lie.
            </p>
            <div className="mt-6">
              <ShareButton
                title="DIY vs SALTY Retreat Price Comparison"
                text="Check out how much you can save with a SALTY retreat vs booking it yourself. The savings are real."
                url="https://explore.getsaltyretreats.com/compare"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <SwoopDivider color="var(--color-surface-warm-light)" />

      {/* Disclaimer */}
      <section className="py-8 px-6 bg-surface-warm-light">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 bg-salty-light-blue/20 rounded-xl border border-salty-light-blue/30 space-y-2">
            <p className="font-body text-sm text-salty-deep-teal/70 text-center">
              <span className="font-bold">How we calculated: </span>
              DIY prices are based on comparable quality boutique accommodations,
              guided activities with certified instructors, and average meal costs
              at quality restaurants in each destination. Time estimates are based on
              average booking and research hours for similar trips. Your actual costs
              and time may vary.
            </p>
            <p className="font-body text-xs text-salty-deep-teal/50 text-center">
              Estimated as of February 2026. Prices fluctuate — click source links to verify current rates.
            </p>
          </div>
        </div>
      </section>

      {/* Deep link not found banner */}
      <AnimatePresence>
        {deepLinkNotFound && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 bg-surface-warm-light"
          >
            <div className="max-w-3xl mx-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="font-body text-sm text-amber-700">
                  This comparison is no longer available. See current retreats below.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Comparisons */}
      <section className="py-12 px-6 bg-surface-warm-light">
        <div className="max-w-3xl mx-auto space-y-8">
          {comparisons.length > 0 ? (
            comparisons.map((comparison, i) => (
              <ScrollReveal key={comparison.retreatSlug} delay={i * 0.1}>
                <ComparisonCard
                  comparison={comparison}
                  linkStatus={linkStatus}
                  linkStatusLoaded={linkStatusLoaded}
                />
              </ScrollReveal>
            ))
          ) : (
            /* Empty state — all retreats past */
            <div className="bg-surface-base rounded-2xl p-12 text-center" style={{ boxShadow: 'var(--shadow-card-resting)' }}>
              <p className="font-display text-sm text-salty-coral uppercase tracking-widest mb-3">
                Stay tuned
              </p>
              <h3 className="font-display text-section text-salty-deep-teal mb-4">
                New retreats coming soon
              </h3>
              <p className="font-body text-salty-deep-teal/60 mb-6 max-w-md mx-auto">
                We&apos;re cooking up the next round of adventures. Take the quiz to find your perfect match, and we&apos;ll let you know when comparisons are ready.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button href="/quiz" size="lg">
                  Take the Quiz
                </Button>
                <Button href="https://getsaltyretreats.com" variant="secondary" size="lg">
                  Visit SALTY
                </Button>
              </div>
            </div>
          )}

          {linkStatus.lastRun && (
            <p className="font-body text-[11px] text-salty-deep-teal/30 text-center">
              Source links last verified: {new Date(linkStatus.lastRun).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      {/* Convince Your Crew CTA — always visible */}
      <section className="py-8 px-6 bg-surface-warm-light">
        <div className="max-w-3xl mx-auto">
          <ConvinceYourCrew
            isVisible={true}
            bestSavingsAmount={bestComparison.savings}
            bestSavingsPercent={bestComparison.percent}
            bestRetreatSlug={bestComparison.slug}
          />
        </div>
      </section>

      {/* Cost of Staying Home */}
      <section className="py-12 px-6 bg-surface-warm-light">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <CostOfStayingHome
              retreatPrice={comparisons.length > 0
                ? Math.min(...comparisons.map(c => {
                    const retreat = getRetreatBySlug(c.retreatSlug);
                    return retreat?.lowestPrice || c.saltyPriceFrom;
                  }))
                : 1999}
              retreatName="a SALTY Retreat"
            />
          </ScrollReveal>
        </div>
      </section>

      <SwoopDivider color="var(--color-salty-deep-teal)" />

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-salty-deep-teal">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-salmon mb-4 text-balance">
              Ready to save?
            </h2>
            <p className="font-body text-white/60 mb-8 leading-relaxed">
              Take the quiz to find your perfect match, or search flights to start planning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/planner" size="lg">
                Plan Your Full Trip
              </Button>
              <Button href="/flights" variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-salty-deep-teal">
                Search Flights
              </Button>
            </div>
          </ScrollReveal>
          <HumanCTA
            message="Want to talk numbers? We love transparency."
            context="Hey! I was comparing SALTY prices vs DIY and had some questions about what's included."
            dark
          />
        </div>
      </section>
    </div>
  );
}
