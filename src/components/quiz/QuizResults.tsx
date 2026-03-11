'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { QuizResult } from '@/types';
import { formatDateRange } from '@/lib/utils';
import { cn } from '@/lib/utils';
import CompactSaltyMeter from './CompactSaltyMeter';
import ScrollReveal from '@/components/shared/ScrollReveal';
import Button from '@/components/shared/Button';
import ShareButton from '@/components/shared/ShareButton';
import HumanCTA from '@/components/shared/HumanCTA';
import BoardingPassCard from '@/components/shared/BoardingPassCard';
import SwoopDivider from '@/components/shared/SwoopDivider';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { motion } from 'motion/react';
import { getMatchedTestimonials } from '@/lib/testimonial-matching';
import { Testimonial } from '@/types';
import CostPerDay from '@/components/shared/CostPerDay';
import PaymentPlanToggle from '@/components/shared/PaymentPlanToggle';
import PriceDisplay from '@/components/shared/PriceDisplay';
import SharePlanButton from '@/components/shared/SharePlanButton';

function TestimonialCard({ testimonial, matchReason }: { testimonial: Testimonial; matchReason: string }) {
  return (
    <div
      className="bg-salty-sand/40 border-l-3 border-salty-coral rounded-r-xl p-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-salty-gold" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="font-body text-sm text-salty-deep-teal/80 leading-relaxed mb-2">
        {testimonial.text}
      </p>
      <p className="font-body text-xs text-salty-deep-teal/50">
        — {testimonial.name} · {testimonial.guestType === 'solo' ? 'Solo traveler' : testimonial.guestType === 'couple' ? 'Traveled as a couple' : testimonial.guestType === 'returner' ? 'Returning guest' : 'Guest'} · {testimonial.city}
      </p>
      <p className="font-body text-[10px] text-salty-coral/60 mt-1 italic">
        {matchReason}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'available') return null;

  const config: Record<string, { label: string; bg: string; text: string }> = {
    coming_soon: { label: 'Coming Soon', bg: 'bg-salty-gold/20', text: 'text-salty-deep-teal' },
    tbd: { label: 'Details TBD', bg: 'bg-salty-sand', text: 'text-salty-deep-teal/60' },
    sold_out: { label: 'Sold Out', bg: 'bg-salty-rust/10', text: 'text-salty-rust' },
  };

  const c = config[status] || config.tbd;

  return (
    <span className={cn('px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider rounded-full', c.bg, c.text)}>
      {c.label}
    </span>
  );
}

function HeroMatchCard({ result, answers }: { result: QuizResult; answers: import('@/types/quiz').QuizAnswers }) {
  const { retreat, whyMatch } = result;
  const isBookable = retreat.status === 'available';
  const matchedTestimonials = getMatchedTestimonials(retreat.slug, answers, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <BoardingPassCard
        headerLabel="Your Best Match"
        headerBg="var(--color-salty-coral)"
        headerTextColor="var(--color-surface-base)"
        className="border-2 border-salty-coral"
      >
        {/* Retreat header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="font-display text-hero text-salty-deep-teal">
              {retreat.destination}
            </h2>
            <StatusBadge status={retreat.status} />
          </div>
          <p className="font-display text-lg text-salty-deep-teal/70 mb-1">
            {retreat.title}
          </p>
          <p className="font-body text-salty-deep-teal/50">
            {formatDateRange(retreat.startDate, retreat.endDate)} &middot; {retreat.duration.nights} nights
          </p>
          {retreat.lowestPrice > 0 && (
            <div className="mt-2">
              <PriceDisplay amountUSD={retreat.lowestPrice} label="From" size="md" />
            </div>
          )}
        </div>

        {/* Tagline */}
        {retreat.tagline && (
          <p className="font-body text-center text-salty-deep-teal/60 italic mb-6">
            &ldquo;{retreat.tagline}&rdquo;
          </p>
        )}

        {/* Why this matches */}
        <div className="bg-salty-sand/50 rounded-xl p-5 mb-6">
          <p className="font-display text-sm text-salty-deep-teal/80 uppercase tracking-wider mb-3">
            Why this is your match
          </p>
          <div className="space-y-2">
            {whyMatch.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-salty-coral flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-body text-salty-deep-teal/70">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SALTY Meter */}
        <div className="mb-6">
          <p className="font-body text-[10px] font-bold text-salty-deep-teal/40 uppercase tracking-wider mb-2">
            Trip Personality
          </p>
          <CompactSaltyMeter meter={retreat.saltyMeter} />
        </div>

        {/* Contextual Testimonials */}
        {matchedTestimonials.length > 0 && (
          <div className="mb-6 space-y-3">
            {matchedTestimonials.map(({ testimonial, matchReason }) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} matchReason={matchReason} />
            ))}
          </div>
        )}

        {/* Pricing Psychology */}
        {retreat.lowestPrice > 0 && (
          <div className="mb-6 space-y-3">
            <CostPerDay totalPrice={retreat.lowestPrice} nights={retreat.duration.nights} />
            {retreat.deposit > 0 && (
              <>
                <PaymentPlanToggle
                  totalPrice={retreat.lowestPrice}
                  deposit={retreat.deposit}
                  balanceDueDate={retreat.balanceDueDate}
                />
                <p className="font-body text-xs text-salty-deep-teal/50">
                  Payment plans are available. Pay in 3 installments: deposit + 50% + 50% remaining. Final payment due 1 month before departure.
                </p>
              </>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isBookable ? (
            <>
              <Button
                href={`/flights?retreat=${retreat.slug}`}
                variant="primary"
                className="flex-1"
              >
                Check Flights
              </Button>
              <Button
                href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
                variant="secondary"
                className="flex-1"
              >
                View Trip Details
              </Button>
            </>
          ) : retreat.status === 'coming_soon' ? (
            <>
              <Button
                href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
                variant="primary"
                className="flex-1"
              >
                Get Notified When It Opens
              </Button>
              <Button
                href={`/flights?retreat=${retreat.slug}`}
                variant="secondary"
                className="flex-1"
              >
                Preview Flights
              </Button>
            </>
          ) : (
            <Button
              href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
              variant="secondary"
              className="flex-1"
            >
              Learn More
            </Button>
          )}
        </div>

        {/* Share with friends */}
        <div className="mt-4">
          <SharePlanButton
            retreatSlug={retreat.slug}
            retreatName={retreat.title}
            retreatDates={formatDateRange(retreat.startDate, retreat.endDate)}
          />
        </div>
      </BoardingPassCard>
    </motion.div>
  );
}

function AlsoConsiderCard({ result, answers }: { result: QuizResult; answers: import('@/types/quiz').QuizAnswers }) {
  const { retreat, whyMatch } = result;
  const isBookable = retreat.status === 'available';
  const matchedTestimonials = getMatchedTestimonials(retreat.slug, answers, 1);

  return (
    <ScrollReveal>
      <BoardingPassCard
        headerLabel="Also Consider"
        headerBg="var(--color-salty-deep-teal)"
        headerTextColor="var(--color-salty-cream)"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-xl text-salty-deep-teal truncate">
                {retreat.destination}
              </h3>
              <StatusBadge status={retreat.status} />
            </div>
            <p className="font-display text-sm text-salty-deep-teal/70 mb-1">
              {retreat.title}
            </p>
            <p className="font-body text-sm text-salty-deep-teal/50">
              {formatDateRange(retreat.startDate, retreat.endDate)} &middot; {retreat.duration.nights} nights
            </p>
            {retreat.lowestPrice > 0 && (
              <div className="mt-1">
                <PriceDisplay amountUSD={retreat.lowestPrice} label="From" size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Top 2 why reasons */}
        {whyMatch.length > 0 && (
          <div className="mt-3 space-y-1">
            {whyMatch.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-salty-coral flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-body text-sm text-salty-deep-teal/70">{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Compact SALTY Meter */}
        <div className="mt-3 pt-3 border-t border-salty-sand/50">
          <CompactSaltyMeter meter={retreat.saltyMeter} />
        </div>

        {/* Testimonial */}
        {matchedTestimonials.length > 0 && (
          <div className="mt-3">
            <TestimonialCard
              testimonial={matchedTestimonials[0].testimonial}
              matchReason={matchedTestimonials[0].matchReason}
            />
          </div>
        )}

        {/* CTAs */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {isBookable ? (
            <>
              <Button
                href={`/flights?retreat=${retreat.slug}`}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Check Flights
              </Button>
              <Button
                href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                View Trip
              </Button>
            </>
          ) : retreat.status === 'coming_soon' ? (
            <Button
              href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Get Notified
            </Button>
          ) : (
            <Button
              href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              Learn More
            </Button>
          )}
        </div>
      </BoardingPassCard>
    </ScrollReveal>
  );
}

export default function QuizResults() {
  const { results, leadData, answers } = useQuizStore();

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-section text-salty-deep-teal mb-4">
          Hmm, no matches yet.
        </h2>
        <p className="font-body text-salty-deep-teal/60 mb-8">
          Try the quiz again with different preferences.
        </p>
        <Button href="/quiz">Retake Quiz</Button>
      </div>
    );
  }

  const bestMatch = results[0];
  const alsoConsider = results.slice(1);

  return (
    <div className="min-h-dvh">
      {/* Results header + hero match */}
      <SectionWrapper surface="base" className="pb-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-hero text-salty-deep-teal mb-3">
              We found your trip{leadData?.firstName ? `, ${leadData.firstName}` : ''}.
            </h1>
            <p className="font-body text-lg text-salty-deep-teal/60">
              Based on everything you told us, this is what we&apos;d book if we were you.
            </p>
          </motion.div>

          <HeroMatchCard result={bestMatch} answers={answers} />
        </div>
      </SectionWrapper>

      {/* Also Consider */}
      {alsoConsider.length > 0 && (
        <>
          <SwoopDivider color="var(--color-surface-warm-light)" />
          <SectionWrapper surface="warm-light" className="pt-8">
            <div className="max-w-2xl mx-auto">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="font-display text-section text-salty-deep-teal mb-6 text-center"
              >
                Also Consider
              </motion.h2>
              <div className="space-y-4">
                {alsoConsider.map((result) => (
                  <AlsoConsiderCard key={result.retreat.slug} result={result} answers={answers} />
                ))}
              </div>
            </div>
          </SectionWrapper>
        </>
      )}

      {/* Bottom CTA */}
      <SwoopDivider color="var(--color-surface-dark)" />
      <SectionWrapper surface="dark">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button href="/compare" variant="secondary" className="flex-1 border-salty-cream text-salty-cream hover:bg-salty-cream hover:text-salty-deep-teal">
              Compare SALTY vs DIY Prices
            </Button>
            <Button href="/planner" variant="secondary" className="flex-1 border-salty-cream text-salty-cream hover:bg-salty-cream hover:text-salty-deep-teal">
              Plan Your Full Trip
            </Button>
          </div>

          <HumanCTA
            message="Can't decide? We love this conversation."
            context={`Hey! I just took the trip matcher quiz and my top match was ${bestMatch.retreat.destination}. I'd love to chat about it!`}
            dark
          />

          <div className="flex flex-col items-center gap-4 mt-8">
            <ShareButton
              title={`My SALTY Retreat Match: ${bestMatch.retreat.destination}`}
              text={`I just took the SALTY trip matcher quiz and my top match is ${bestMatch.retreat.destination}! Check it out and find your perfect retreat too.`}
              url="https://explore.getsaltyretreats.com/quiz"
            />
            <Button href="/quiz" variant="ghost" size="sm" className="text-salty-cream/60 hover:text-salty-cream">
              Retake the quiz
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
