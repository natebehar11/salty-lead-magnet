'use client';

import { cn } from '@/lib/utils';

interface MultiCityLegStepperProps {
  totalLegs: number;
  activeLeg: number;
  completedLegs: number;
  legLabels: string[];
  onLegClick: (legIndex: number) => void;
}

export default function MultiCityLegStepper({
  totalLegs,
  activeLeg,
  completedLegs,
  legLabels,
  onLegClick,
}: MultiCityLegStepperProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1">
        {Array.from({ length: totalLegs }).map((_, i) => {
          const isCompleted = i < completedLegs;
          const isActive = i === activeLeg;
          const isPending = i > completedLegs;

          return (
            <div key={i} className="flex items-center flex-1">
              {/* Step circle + label */}
              <button
                onClick={() => isCompleted && onLegClick(i)}
                disabled={!isCompleted}
                className={cn(
                  'flex flex-col items-center gap-1 w-full',
                  isCompleted && 'cursor-pointer',
                  isPending && 'opacity-40',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-body text-xs font-bold transition-all',
                    isCompleted && 'bg-salty-olive text-white',
                    isActive && 'bg-salty-orange-red text-white ring-4 ring-salty-orange-red/20',
                    isPending && 'bg-salty-beige text-salty-deep-teal/40',
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="font-body text-[10px] text-salty-deep-teal/60 text-center leading-tight max-w-[100px] truncate">
                  {legLabels[i] || `Flight ${i + 1}`}
                </span>
              </button>

              {/* Connector line */}
              {i < totalLegs - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 mt-[-16px]',
                    i < completedLegs ? 'bg-salty-olive' : 'bg-salty-beige',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
