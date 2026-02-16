'use client';

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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 bg-salty-cream relative overflow-hidden">
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

      <WaveDivider variant="sunset" />

      {/* ===================== HOW IT WORKS — 6 Steps ===================== */}
      <section className="py-20 px-6 bg-salty-deep-teal">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-section text-white text-center mb-16">
              How it works.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.1}>
                <div className="text-center">
                  <div className={`w-12 h-12 ${step.accent}/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className={`font-display text-2xl ${step.color}`}>
                      {step.num}
                    </span>
                  </div>
                  <h3 className={`font-display text-lg ${step.color} mb-3`}>{step.title}</h3>
                  <p className="font-body text-white/60 leading-relaxed text-sm">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider variant="ocean" flip />

      {/* ===================== STATS ===================== */}
      <section className="py-16 px-6 bg-salty-light-blue/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl text-salty-orange-red">{stat.value}</p>
                <p className="font-body text-sm text-salty-deep-teal/50 uppercase tracking-wide mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider variant="warm" />

      {/* ===================== GOOGLE REVIEWS (Elfsight) ===================== */}
      <section className="py-20 px-6 bg-salty-beige/50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-deep-teal text-center mb-12 whitespace-nowrap">
              Don&apos;t take our word for it.
            </h2>
          </ScrollReveal>

          {/* Elfsight Google Reviews Widget */}
          <div className="elfsight-app-bcb6e237-0108-4ffa-a743-3d801a3b39b2" data-elfsight-app-lazy />
        </div>
      </section>

      <WaveDivider variant="cool" flip />

      {/* ===================== DIY PRICE COMPARISON TEASER ===================== */}
      <section className="py-16 px-6 bg-salty-cream">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            {/* Stamp Badge — Scalloped postage stamp style */}
            <div className="stamp-badge mx-auto mb-6">
              <div className="stamp-badge-inner">
                <span className="stamp-amount">SAVE UP TO</span>
                <span className="stamp-amount">40%</span>
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

      <WaveDivider variant="earth" />

      {/* ===================== FLIGHT TOOL TEASER ===================== */}
      <section className="py-16 px-6 bg-salty-seafoam/20">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-deep-teal mb-4">
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

      <WaveDivider variant="sunset" flip />

      {/* ===================== FINAL CTA ===================== */}
      <section className="py-20 px-6 bg-salty-deep-teal">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-section text-salty-salmon mb-4">
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
