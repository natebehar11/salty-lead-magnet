'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import HumanCTA from '@/components/shared/HumanCTA';
import WaveDivider from '@/components/shared/WaveDivider';

const steps = [
  {
    num: '01',
    title: 'Take the quiz',
    description:
      'Tell us the vibe you want in a vacation. Budget, dates, must-haves. 2 minutes well spent.',
    color: 'text-salty-salmon',
    accent: 'bg-salty-salmon',
  },
  {
    num: '02',
    title: 'See your matches',
    description:
      'We rank our upcoming trips by how well they fit your tastes.',
    color: 'text-salty-yellow',
    accent: 'bg-salty-yellow',
  },
  {
    num: '03',
    title: 'Compare flights',
    description:
      'Explore real-time flight prices from your city. Compare flight costs for different retreats.',
    color: 'text-salty-seafoam',
    accent: 'bg-salty-seafoam',
  },
  {
    num: '04',
    title: 'Plan your trip',
    description:
      'Planning a longer getaway? Use our Trip Planner to map out additional legs to your retreat. Multi-city flight planner for before and/or after your retreat.',
    color: 'text-salty-light-blue',
    accent: 'bg-salty-light-blue',
  },
  {
    num: '05',
    title: 'Share with friends',
    description:
      'Send your favourite flights and plans to yourself or share it with your friends. Either to make them jealous or to ask them to join, your choice.',
    color: 'text-salty-mauve',
    accent: 'bg-salty-mauve',
  },
  {
    num: '06',
    title: 'Book the damn trip!',
    description:
      'Lock it in. Your next adventure is waiting.',
    color: 'text-salty-orange-red',
    accent: 'bg-salty-orange-red',
  },
];

const stats = [
  { value: '10', label: 'Trips' },
  { value: '200+', label: 'Guests' },
  { value: '5.0', label: 'Avg Rating' },
  { value: '100%', label: 'Fun' },
];

function HowItWorksSteps({ steps }: { steps: typeof steps }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('[data-step-card]')?.getBoundingClientRect().width ?? 320;
    const gap = 32;
    const step = cardWidth + gap;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-6 bg-salty-deep-teal">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-display text-section text-white text-center mb-10">
            How it works.
          </h2>
        </ScrollReveal>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous step"
            className="flex-shrink-0 w-[52px] min-w-[52px] flex items-center justify-center text-[#b6d4ea] hover:opacity-80 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>

          <div
            ref={scrollRef}
            className="flex-1 min-w-0 flex gap-8 overflow-x-auto snap-x snap-mandatory py-2 hide-scrollbar scroll-smooth"
          >
            {steps.map((step) => (
              <div
                key={step.num}
                data-step-card
                className="flex-shrink-0 w-[300px] snap-center text-center"
              >
                <span className={`font-display text-2xl ${step.color} block mb-4`}>
                  {step.num}
                </span>
                <h3 className="font-display text-lg text-salty-cream mb-3">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#f7f4ed' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next step"
            className="flex-shrink-0 w-[52px] min-w-[52px] flex items-center justify-center text-[#b6d4ea] hover:opacity-80 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen h-[4000px]"
      style={{
        backgroundClip: 'unset',
        WebkitBackgroundClip: 'unset',
        color: 'rgba(1, 2, 4, 1)',
      }}
    >
      {/* ===================== HERO ===================== */}
      <section className="min-h-[90vh] h-[800px] flex flex-row flex-wrap items-center justify-center px-6 bg-salty-cream relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl static z-10"
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
          <h1 className="font-display text-hero text-salty-deep-teal mb-6">
            Find your next adventure.
          </h1>
          <p className="font-body text-xl text-salty-slate/70 mb-8 leading-relaxed">
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

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-10 w-16 h-16 bg-salty-salmon/20 rounded-full blur-xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-16 w-24 h-24 bg-salty-yellow/20 rounded-full blur-xl"
          animate={{ y: [0, 15, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 left-8 w-12 h-12 bg-salty-seafoam/20 rounded-full blur-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </section>

      <WaveDivider variant="lines" />

      {/* ===================== HOW IT WORKS — 6 Steps ===================== */}
      <HowItWorksSteps steps={steps} />

      <WaveDivider variant="linesSun" />

      {/* ===================== STATS ===================== */}
      <section className="min-h-[180px] px-6 py-0 flex flex-col justify-center bg-[#e7d7c0]">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl text-salty-orange-red">{stat.value}</p>
                <p className="font-body text-sm text-salty-deep-teal uppercase tracking-wide mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider variant="linesBlueWhite" />

      {/* ===================== GOOGLE REVIEWS (Elfsight) ===================== */}
      <section className="px-6 pt-2 pb-8 bg-[#b6d4ea]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-deep-teal text-center mb-0 whitespace-nowrap mt-0 pt-10 pb-4">
              Don&apos;t take our word for it.
            </h2>
          </ScrollReveal>

          {/* Elfsight Google Reviews Widget */}
          <div className="elfsight-app-bcb6e237-0108-4ffa-a743-3d801a3b39b2" data-elfsight-app-lazy />
        </div>
      </section>

      <WaveDivider variant="linesCoralSun" />

      {/* ===================== DIY PRICE COMPARISON TEASER ===================== */}
      <section className="py-16 px-6 bg-salty-cream">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            {/* Stamp Badge — SVG from brand assets */}
            <div className="relative w-[140px] h-[140px] mx-auto pt-2 pb-0 mt-8 mb-8 flex items-center justify-center">
              <img
                src="/images/brand-elements/stamp-badge.svg"
                alt="Save up to 40%"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="relative z-10 text-center text-salty-light-blue font-display font-bold text-sm uppercase tracking-wider leading-tight">
                <span className="block text-xs">SAVE UP TO</span>
                <span className="block text-2xl">40%</span>
              </div>
            </div>
            <h2 className="font-display text-section text-salty-deep-teal mb-4">
              Think you can do it cheaper?
            </h2>
            <p className="font-body text-salty-slate/60 mb-8 leading-relaxed">
              See how our all-inclusive retreat prices stack up against booking
              the same trip yourself. Spoiler: we&apos;re a steal.
            </p>
            <Button href="/compare" variant="yellow" size="lg">
              Compare Prices
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider variant="linesTealOrange" />

      {/* ===================== FLIGHT TOOL TEASER ===================== */}
      <section className="py-16 px-6 bg-salty-seafoam/20">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
<h2 className="font-display text-section text-salty-deep-teal mb-4 pt-6 pb-6">
            Already know where you&apos;re going?
            </h2>
            <p className="font-body text-salty-slate/60 mb-8 leading-relaxed">
              Skip the quiz and go straight to flight prices. We&apos;ll find the cheapest,
              fastest, and best options from your city to any SALTY retreat.
            </p>
            <Button href="/flights" variant="secondary" size="lg">
              Search Flights
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider variant="linesGoldSand" />

      {/* ===================== FINAL CTA ===================== */}
      <section className="py-20 px-6 bg-salty-deep-teal">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-light-blue mb-0">
              Your next trip is closer than you think.
            </h2>
            <p className="font-body text-white/60 mb-8 leading-relaxed">
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
      </section>
    </div>
  );
}
