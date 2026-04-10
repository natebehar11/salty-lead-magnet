'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import HumanCTA from '@/components/shared/HumanCTA';
import SwoopDivider from '@/components/shared/SwoopDivider';
import SectionWrapper from '@/components/shared/SectionWrapper';
import BoardingPassCard from '@/components/shared/BoardingPassCard';

interface Step {
  num: string;
  title: string;
  description: string;
  headerBg: string;
  href: string;
}

const steps: Step[] = [
  {
    num: '01',
    title: 'Take the quiz',
    description: 'Tell us your vibe, budget, and dates in 2 minutes.',
    headerBg: 'var(--color-salty-salmon)',
    href: '/quiz',
  },
  {
    num: '02',
    title: 'See your matches',
    description: 'We rank our trips by how well they fit you.',
    headerBg: 'var(--color-salty-gold)',
    href: '/quiz',
  },
  {
    num: '03',
    title: 'Compare flights',
    description: 'Find real-time flight prices from your city.',
    headerBg: 'var(--color-salty-seafoam)',
    href: '/flights',
  },
  {
    num: '04',
    title: 'Plan your trip',
    description: 'Map out extra stops before or after your retreat.',
    headerBg: 'var(--color-salty-sky)',
    href: '/planner',
  },
  {
    num: '05',
    title: 'Share with friends',
    description: 'Send your plans and flights to your crew.',
    headerBg: 'var(--color-salty-mauve)',
    href: '/planner',
  },
  {
    num: '06',
    title: 'Book the damn trip!',
    description: 'Lock it in — your next adventure is waiting.',
    headerBg: 'var(--color-salty-coral)',
    href: 'https://getsaltyretreats.com',
  },
];

const stats = [
  { value: '10', label: 'Trips' },
  { value: '200+', label: 'Guests' },
  { value: '5.0', label: 'Avg Rating' },
  { value: '100%', label: 'Fun' },
];

function HowItWorksSteps({ steps }: { steps: Step[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('[data-step-card]')?.getBoundingClientRect().width ?? 280;
    const gap = 24;
    const step = cardWidth + gap;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <h2 className="font-display text-section text-salty-cream text-center mb-10 text-balance">
          How it works.
        </h2>
      </ScrollReveal>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Previous step"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-salty-cream/20 text-salty-sky hover:bg-salty-cream/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>

        <div
          ref={scrollRef}
          className="flex-1 min-w-0 flex gap-6 overflow-x-auto snap-x snap-mandatory py-2 hide-scrollbar scroll-smooth"
        >
          {steps.map((step) => {
            const isExternal = step.href.startsWith('http');
            const linkProps = isExternal
              ? { target: '_blank' as const, rel: 'noopener noreferrer' }
              : {};
            return (
              <Link
                key={step.num}
                href={step.href}
                data-step-card
                className="flex-shrink-0 w-[260px] sm:w-[280px] snap-center block hover:scale-[1.03] transition-transform"
                {...linkProps}
              >
                <BoardingPassCard
                  headerLabel={`Step ${step.num}`}
                  headerBg={step.headerBg}
                  headerTextColor="var(--color-salty-deep-teal)"
                  notchBg="var(--color-surface-dark)"
                >
                  <div className="h-[72px] flex flex-col justify-start">
                    <h3 className="font-display text-base text-salty-deep-teal mb-2">{step.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-salty-deep-teal/60">
                      {step.description}
                    </p>
                  </div>
                </BoardingPassCard>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Next step"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-salty-cream/20 text-salty-sky hover:bg-salty-cream/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* ===================== HERO ===================== */}
      <section className="min-h-[90vh] h-[800px] flex items-center justify-center px-6 bg-surface-base relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl relative z-10"
        >
          {/* Wordmark */}
          <Image
            src="/images/logos/salty-wordmark-dark.png"
            alt="SALTY"
            width={280}
            height={70}
            className="mx-auto mb-6 h-auto w-[200px] sm:w-[260px] md:w-[300px]"
            priority
          />
          <h1 className="font-display text-hero text-salty-deep-teal mb-6 text-balance">
            Find your next adventure.
          </h1>
          <p className="font-body text-xl text-salty-deep-teal/60 mb-8 leading-relaxed text-pretty">
            Take our 2-minute quiz to find your perfect retreat match,
            then discover the cheapest flights to get there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/quiz" size="lg">
              Take the Trip Quiz
            </Button>
            <Button href="/flights" variant="secondary" size="lg">
              Search Flights
            </Button>
          </div>
        </motion.div>

      </section>

      <SwoopDivider color="var(--color-surface-dark)" />

      {/* ===================== HOW IT WORKS — 6 Steps ===================== */}
      <SectionWrapper surface="dark">
        <HowItWorksSteps steps={steps} />
      </SectionWrapper>

      <SwoopDivider color="var(--color-surface-warm)" flip />

      {/* ===================== STATS ===================== */}
      <SectionWrapper surface="warm" className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl text-salty-coral">{stat.value}</p>
                <p className="font-body text-sm text-salty-deep-teal/70 uppercase tracking-wide mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SwoopDivider color="var(--color-surface-warm-light)" />

      {/* ===================== GOOGLE REVIEWS (Elfsight) ===================== */}
      <SectionWrapper surface="warm-light">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-deep-teal text-center mb-6 text-balance">
              Don&apos;t take our word for it.
            </h2>
          </ScrollReveal>
          <div className="elfsight-app-bcb6e237-0108-4ffa-a743-3d801a3b39b2" data-elfsight-app-lazy />
        </div>
      </SectionWrapper>

      <SwoopDivider color="var(--color-surface-base)" flip />

      {/* ===================== DIY PRICE COMPARISON TEASER ===================== */}
      <SectionWrapper surface="base">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <div className="relative w-[140px] h-[140px] mx-auto mb-8 flex items-center justify-center">
              <Image
                src="/images/brand-elements/stamp-badge.svg"
                alt="Save up to 40%"
                width={140}
                height={140}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="relative z-10 text-center text-salty-sky font-display font-bold text-sm uppercase tracking-wider leading-tight">
                <span className="block text-xs">SAVE UP TO</span>
                <span className="block text-2xl">40%</span>
              </div>
            </div>
            <h2 className="font-display text-section text-salty-deep-teal mb-4 text-balance">
              Think you can do it cheaper?
            </h2>
            <p className="font-body text-salty-deep-teal/60 mb-8 leading-relaxed text-pretty">
              See how our all-inclusive retreat prices stack up against booking
              the same trip yourself. Spoiler: we&apos;re a steal.
            </p>
            <Button href="/compare" variant="yellow" size="lg">
              Compare Prices
            </Button>
          </ScrollReveal>
        </div>
      </SectionWrapper>

      <SwoopDivider color="var(--color-surface-warm-light)" />

      {/* ===================== FLIGHT TOOL TEASER ===================== */}
      <SectionWrapper surface="warm-light">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-deep-teal mb-4 text-balance">
              Already know where you&apos;re going?
            </h2>
            <p className="font-body text-salty-deep-teal/60 mb-8 leading-relaxed text-pretty">
              Skip the quiz and go straight to flight prices. We&apos;ll find the cheapest,
              fastest, and best options from your city to any SALTY retreat.
            </p>
            <Button href="/flights" variant="secondary" size="lg">
              Search Flights
            </Button>
          </ScrollReveal>
        </div>
      </SectionWrapper>

      <SwoopDivider color="var(--color-surface-dark)" />

      {/* ===================== FINAL CTA ===================== */}
      <SectionWrapper surface="dark">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-sky mb-4 text-balance">
              Your next trip is closer than you think.
            </h2>
            <p className="font-body text-salty-cream/60 mb-8 leading-relaxed text-pretty">
              Two minutes. Nine questions. A trip that changes everything.
            </p>
            <Button href="/quiz" size="lg">
              Take the Trip Quiz
            </Button>
          </ScrollReveal>
          <div className="mt-8">
            <HumanCTA
              message="Or just talk to us. We're nice, we promise."
              context="Hey! I was on the SALTY explorer tool and wanted to chat about upcoming trips!"
              dark
            />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
