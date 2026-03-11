'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Retreat } from '@/types';
import { usePlannerStore } from '@/stores/planner-store';
import { getBoardItemCount, getBoardCityCount } from '@/lib/board-utils';

interface FlightsCTAProps {
  retreat: Retreat;
}

export default function FlightsCTA({ retreat }: FlightsCTAProps) {
  const boardItems = usePlannerStore((s) => s.boardItems);
  const itemCount = getBoardItemCount(boardItems);
  const cityCount = getBoardCityCount(boardItems);

  if (itemCount < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-salty-deep-teal rounded-2xl px-6 py-8 text-center"
    >
      <h3 className="font-display text-xl text-white tracking-wider uppercase">
        Ready to Make It Real?
      </h3>
      <p className="font-body text-sm text-white/60 mt-2 max-w-md mx-auto leading-relaxed">
        You&apos;ve planned {itemCount} activities across {cityCount} {cityCount === 1 ? 'city' : 'cities'}.
        Search flights to {retreat.destination} and lock it in.
      </p>
      <Link
        href={`/flights?retreat=${retreat.slug}`}
        className="inline-flex items-center justify-center mt-5 px-8 py-3 rounded-full bg-salty-yellow text-salty-deep-teal font-display text-sm tracking-wider uppercase hover:bg-salty-yellow/90 transition-colors active:scale-[0.98]"
      >
        Find Flights
      </Link>
    </motion.div>
  );
}
