'use client';

import { motion } from 'motion/react';

interface VisionBoardEmptyProps {
  onSwitchToChat?: () => void;
}

export default function VisionBoardEmpty({ onSwitchToChat }: VisionBoardEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Visual grid hint — miniature Pinterest-style cards */}
      <div className="grid grid-cols-3 gap-2 mb-6 opacity-20">
        {['🏖', '🍽', '🌿', '🏛', '💎', '🌙'].map((emoji, i) => (
          <motion.div
            key={emoji}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="w-16 h-20 rounded-xl bg-salty-beige/40 border border-salty-beige/30 flex items-center justify-center text-2xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <h3 className="font-display text-lg text-salty-deep-teal tracking-wider uppercase mb-2">
        Build Your Vision Board
      </h3>
      <p className="font-body text-salty-slate/60 text-sm max-w-xs leading-relaxed">
        Ask the trip planner for places, restaurants, and hidden gems.
        Save your favorites here to create a board worth sharing.
      </p>

      {/* Mobile: actionable button to switch to chat */}
      <button
        onClick={onSwitchToChat}
        className="mt-6 lg:hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-salty-deep-teal text-white font-display text-xs tracking-wider uppercase hover:bg-salty-deep-teal/90 transition-colors active:scale-[0.98]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M12 8L8 4L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 7 7)" />
        </svg>
        Start Chatting
      </button>

      {/* Desktop: directional hint */}
      <motion.div
        whileInView={{ x: [-4, 4, -4] }}
        viewport={{ once: false }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="mt-6 text-salty-deep-teal/30 text-sm font-body hidden lg:block motion-reduce:lg:hidden"
      >
        ← Chat on the left to start building
      </motion.div>
    </motion.div>
  );
}
