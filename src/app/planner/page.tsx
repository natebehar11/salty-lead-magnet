'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { getUpcomingRetreats, getRetreatBySlug } from '@/data/retreats';
import { usePlannerStore } from '@/stores/planner-store';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SwoopDivider from '@/components/shared/SwoopDivider';
import StarburstBadge from '@/components/shared/StarburstBadge';
import Button from '@/components/shared/Button';
import HumanCTA from '@/components/shared/HumanCTA';
import RetreatSelector from '@/components/planner/RetreatSelector';
import PlannerSplitPanel from '@/components/planner/PlannerSplitPanel';
import FlightsCTA from '@/components/planner/FlightsCTA';

export default function PlannerPage() {
  const selectedRetreatSlug = usePlannerStore((s) => s.selectedRetreatSlug);
  const setSelectedRetreatSlug = usePlannerStore((s) => s.setSelectedRetreatSlug);

  const upcomingRetreats = useMemo(() => getUpcomingRetreats(), []);
  const selectedRetreat = selectedRetreatSlug ? getRetreatBySlug(selectedRetreatSlug) : null;

  return (
    <div className="min-h-dvh bg-surface-base">
      {/* Hero */}
      <section className="pt-12 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="flex justify-center mb-4">
              <StarburstBadge size="sm" bgColor="var(--color-salty-coral)" rotation={-6}>
                AI POWERED
              </StarburstBadge>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-section text-salty-deep-teal tracking-wider uppercase text-balance"
            >
              Plan Your Dream Trip
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-body text-salty-deep-teal/60 mt-3 max-w-lg mx-auto leading-relaxed text-pretty"
            >
              Pick your retreat, then chat with our AI travel planner to discover
              amazing places before and after. Build a trip board you&apos;ll actually want to share.
            </motion.p>
          </ScrollReveal>
        </div>
      </section>

      {/* Retreat selection */}
      <section className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-sm text-salty-deep-teal tracking-wider uppercase mb-4 text-center text-balance">
              Which Retreat?
            </h2>
            <RetreatSelector
              retreats={upcomingRetreats}
              selectedSlug={selectedRetreatSlug}
              onSelect={setSelectedRetreatSlug}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Split panel (chat + vision board) */}
      {selectedRetreat && (
        <>
          <SwoopDivider color="var(--color-surface-warm-light)" />

          <section className="px-4 sm:px-6 py-8 bg-surface-base">
            <div className="max-w-6xl mx-auto">
              <PlannerSplitPanel key={selectedRetreat.slug} retreat={selectedRetreat} />
            </div>
          </section>

          {/* Flights CTA — only shows after 3+ board items */}
          <section className="px-6 pb-8">
            <div className="max-w-2xl mx-auto">
              <FlightsCTA retreat={selectedRetreat} />
            </div>
          </section>
        </>
      )}

      {/* Bottom CTA */}
      {!selectedRetreat && (
        <section className="px-6 py-12 text-center">
          <p className="font-body text-salty-deep-teal/60 text-sm mb-4 text-pretty">
            Not sure which retreat is for you?
          </p>
          <Button href="/quiz" variant="secondary" size="md">
            Take the Quiz
          </Button>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="px-6 py-8 bg-salty-deep-teal">
        <div className="max-w-2xl mx-auto text-center">
          <HumanCTA />
        </div>
      </section>
    </div>
  );
}
