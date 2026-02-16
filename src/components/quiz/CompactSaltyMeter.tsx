'use client';

import { SaltyMeter } from '@/types/retreat';
import { motion } from 'framer-motion';

const categories = [
  { key: 'adventure' as const, label: 'ADV', color: 'bg-salty-orange-red' },
  { key: 'culture' as const, label: 'CUL', color: 'bg-salty-yellow' },
  { key: 'party' as const, label: 'PTY', color: 'bg-salty-salmon' },
  { key: 'sweat' as const, label: 'SWT', color: 'bg-salty-deep-teal' },
  { key: 'rest' as const, label: 'RST', color: 'bg-salty-light-blue' },
];

interface CompactSaltyMeterProps {
  meter: SaltyMeter;
}

export default function CompactSaltyMeter({ meter }: CompactSaltyMeterProps) {
  return (
    <div className="space-y-1.5">
      {categories.map((cat, i) => (
        <div key={cat.key} className="flex items-center gap-2">
          <span className="font-body text-[10px] font-bold text-salty-slate/50 uppercase w-7 text-right">
            {cat.label}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-salty-beige/70 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${cat.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${meter[cat.key] * 10}%` }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
            />
          </div>
          <span className="font-body text-[10px] text-salty-slate/40 w-4">{meter[cat.key]}</span>
        </div>
      ))}
    </div>
  );
}
