'use client';

import { useState } from 'react';
import { FlightDateOption } from '@/types/flight';
import { cn } from '@/lib/utils';

interface FlightDateTabsProps {
  selected: FlightDateOption;
  onChange: (date: FlightDateOption) => void;
  dates: {
    dayOf: string;
    dayBefore: string;
    twoDaysBefore: string;
    returnDayOf?: string;
    returnDayAfter?: string;
    returnTwoDaysAfter?: string;
  };
}

const arrivalTabs: { value: FlightDateOption; label: string }[] = [
  { value: 'two-days-before', label: '2 Days Before' },
  { value: 'day-before', label: 'Day Before' },
  { value: 'day-of', label: 'Day of Retreat' },
];

const EXTRA_DAYS_TOOLTIP = 'Guests are responsible for additional accommodation and meal costs on days before and after the retreat start/end dates.';

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="w-3.5 h-3.5 rounded-full bg-salty-slate/10 text-salty-slate/40 hover:bg-salty-slate/20 text-[9px] font-bold inline-flex items-center justify-center"
      >
        i
      </button>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-salty-deep-teal text-white font-body text-[11px] leading-relaxed rounded-lg shadow-lg">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-salty-deep-teal" />
        </span>
      )}
    </span>
  );
}

export default function FlightDateTabs({ selected, onChange, dates }: FlightDateTabsProps) {
  const dateMap: Record<FlightDateOption, string> = {
    'day-of': dates.dayOf,
    'day-before': dates.dayBefore,
    'two-days-before': dates.twoDaysBefore,
  };

  return (
    <div className="space-y-3">
      {/* Arrival dates */}
      <div>
        <p className="font-body text-[10px] text-salty-slate/40 uppercase tracking-wider mb-1">
          Arrive
          <InfoTooltip text={EXTRA_DAYS_TOOLTIP} />
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {arrivalTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'px-4 py-2 rounded-full border-2 font-body text-xs font-bold whitespace-nowrap transition-all',
                selected === tab.value
                  ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-deep-teal'
                  : 'border-salty-beige text-salty-slate/50 hover:border-salty-deep-teal/20'
              )}
            >
              {tab.label}
              <span className="block text-[10px] font-normal mt-0.5">{dateMap[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Return dates */}
      {dates.returnDayOf && (
        <div>
          <p className="font-body text-[10px] text-salty-slate/40 uppercase tracking-wider mb-1">
            Depart
            <InfoTooltip text={EXTRA_DAYS_TOOLTIP} />
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { label: 'Last Day', date: dates.returnDayOf },
              { label: 'Day After', date: dates.returnDayAfter },
              { label: '2 Days After', date: dates.returnTwoDaysAfter },
            ].map((tab) => (
              <div
                key={tab.label}
                className="px-4 py-2 rounded-full border-2 border-salty-beige font-body text-xs text-salty-slate/50 whitespace-nowrap"
              >
                {tab.label}
                <span className="block text-[10px] font-normal mt-0.5">{tab.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
