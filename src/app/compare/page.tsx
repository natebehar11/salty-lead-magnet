'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllDIYComparisons, DIYComparison, DIYLineItem } from '@/data/diy-pricing';
import { getRetreatBySlug } from '@/data/retreats';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import WaveDivider from '@/components/shared/WaveDivider';
import HumanCTA from '@/components/shared/HumanCTA';
import ShareButton from '@/components/shared/ShareButton';
import PriceDisplay from '@/components/shared/PriceDisplay';
import CostOfStayingHome from '@/components/compare/CostOfStayingHome';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';
import { formatCurrency } from '@/lib/utils';

function ComparisonCard({ comparison }: { comparison: DIYComparison }) {
  const [expanded, setExpanded] = useState(false);
  const { selectedCurrency, rates } = useCurrencyStore();
  const rate = rates[selectedCurrency];
  const fmtConverted = (usd: number) => formatCurrency(convertAmount(usd, rate), selectedCurrency);

  const diyTotal = comparison.items.reduce((sum, item) => sum + item.diyPrice, 0);
  const savings = diyTotal - comparison.saltyPriceFrom;
  const savingsPercent = Math.round((savings / diyTotal) * 100);

  const includedItems = comparison.items.filter((item) => item.saltyIncluded && item.diyPrice > 0);
  const pricelessItems = comparison.items.filter((item) => item.diyPrice === 0);

  return (
    <motion.div
      layout
      className="bg-salty-cream rounded-2xl border-2 border-salty-beige overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
            <p className="font-body text-xs text-salty-seafoam uppercase tracking-wider">You save</p>
            <p className="font-display text-3xl text-salty-yellow">{savingsPercent}%</p>
          </div>
        </div>
      </div>

      {/* Price Comparison Summary */}
      <div className="grid grid-cols-2 divide-x divide-salty-beige">
        <div className="p-6 text-center">
          <p className="font-body text-xs text-salty-slate/50 uppercase tracking-wider mb-1">SALTY Price</p>
          <PriceDisplay amountUSD={comparison.saltyPriceFrom} size="lg" />
          <p className="font-body text-xs text-salty-slate/40 mt-1">from / person</p>
        </div>
        <div className="p-6 text-center">
          <p className="font-body text-xs text-salty-slate/50 uppercase tracking-wider mb-1">DIY Cost</p>
          <p className="font-display text-3xl text-salty-slate line-through decoration-salty-burnt-red">
            {fmtConverted(diyTotal)}
          </p>
          <p className="font-body text-xs text-salty-slate/40 mt-1">estimated / person</p>
        </div>
      </div>

      {/* Savings Banner */}
      <div className="mx-6 mb-4 p-3 bg-salty-yellow/20 rounded-xl text-center">
        <p className="font-display text-lg text-salty-deep-teal">
          Save {fmtConverted(savings)} with SALTY
        </p>
      </div>

      {/* Line Items */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-3 flex items-center justify-between font-body text-sm font-bold text-salty-deep-teal hover:text-salty-orange-red transition-colors"
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-2 border-b border-salty-beige text-xs font-bold text-salty-slate/50 uppercase tracking-wider">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-right">DIY Cost</div>
                <div className="col-span-3 text-right">SALTY</div>
              </div>

              {/* Line Items */}
              {includedItems.map((item: DIYLineItem) => (
                <div key={item.category} className="grid grid-cols-12 gap-2 py-3 border-b border-salty-beige/50 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-body text-sm text-salty-charcoal">{item.category}</p>
                        <p className="font-body text-xs text-salty-slate/40">{item.description}</p>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-body text-[11px] text-salty-orange-red font-bold hover:underline mt-0.5"
                          >
                            {item.sourceName || 'Verify'} &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-body text-sm text-salty-slate">{fmtConverted(item.diyPrice)}</span>
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
                      <span className="font-body text-sm text-salty-slate/70">{item.category}: {item.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimated date */}
      <div className="px-6 pb-3">
        <p className="font-body text-[11px] text-salty-slate/40 text-center">
          DIY prices estimated as of {comparison.estimatedDate}. Click source links to verify current rates.
        </p>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button href={`/flights?retreat=${comparison.retreatSlug}`} variant="primary" size="sm" className="flex-1">
            Check Flights
          </Button>
          <Button href={`https://getsaltyretreats.com/retreats/${comparison.retreatSlug}`} variant="secondary" size="sm" className="flex-1">
            View Trip Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ComparePage() {
  const now = new Date();
  const comparisons = getAllDIYComparisons().filter((c) => {
    const retreat = getRetreatBySlug(c.retreatSlug);
    if (!retreat) return true;
    return new Date(retreat.endDate + 'T23:59:59') >= now;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6 bg-salty-cream">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="stamp-badge mx-auto mb-6">
              <div className="stamp-badge-inner">
                <span className="stamp-amount">SAVE UP TO</span>
                <span className="stamp-amount">40%</span>
              </div>
            </div>
            <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-3">
              DIY vs SALTY
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-4">
              Think you can do it cheaper?
            </h1>
            <p className="font-body text-lg text-salty-slate/60 max-w-lg mx-auto">
              We compared the cost of our all-inclusive retreats against booking
              the same quality trip yourself. The numbers don&apos;t lie.
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

      <WaveDivider variant="warm" />

      {/* Disclaimer */}
      <section className="py-8 px-6 bg-salty-beige/30">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 bg-salty-light-blue/20 rounded-xl border border-salty-light-blue/30 space-y-2">
            <p className="font-body text-sm text-salty-deep-teal/70 text-center">
              <span className="font-bold">How we calculated: </span>
              DIY prices are based on comparable quality boutique accommodations,
              guided activities with certified instructors, and average meal costs
              at quality restaurants in each destination. Your actual costs may vary.
            </p>
            <p className="font-body text-xs text-salty-deep-teal/50 text-center">
              Estimated as of February 2026. Prices fluctuate — click source links to verify current rates.
            </p>
          </div>
        </div>
      </section>

      {/* Comparisons */}
      <section className="py-12 px-6 bg-salty-beige/30">
        <div className="max-w-3xl mx-auto space-y-8">
          {comparisons.map((comparison, i) => (
            <ScrollReveal key={comparison.retreatSlug} delay={i * 0.1}>
              <ComparisonCard comparison={comparison} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Cost of Staying Home */}
      <section className="py-12 px-6 bg-salty-beige/30">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <CostOfStayingHome
              retreatPrice={comparisons[0]?.saltyPriceFrom || 1999}
              retreatName={comparisons[0]?.retreatName || 'SALTY Retreat'}
            />
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider variant="cool" flip />

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-salty-deep-teal">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-salmon mb-4">
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
