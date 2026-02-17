'use client';

import { useState, useMemo } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import {
  mapAirportToCity,
  getCityAnchor,
  availableCities,
  CityAnchor,
} from '@/data/city-cost-anchors';
import { cn } from '@/lib/utils';
import PriceDisplay from '@/components/shared/PriceDisplay';
import { motion, AnimatePresence } from 'framer-motion';

interface CostOfStayingHomeProps {
  retreatPrice: number;
  retreatName: string;
}

export default function CostOfStayingHome({ retreatPrice, retreatName }: CostOfStayingHomeProps) {
  const { originAirport } = useFlightStore();

  // Auto-detect city from airport, or default to Toronto
  const detectedCity = useMemo(() => {
    if (originAirport?.code) {
      return mapAirportToCity(originAirport.code);
    }
    return getCityAnchor('toronto');
  }, [originAirport]);

  const [selectedCityId, setSelectedCityId] = useState(detectedCity.cityId);
  const [isExpanded, setIsExpanded] = useState(false);

  const cityData: CityAnchor = getCityAnchor(selectedCityId);
  const savings = cityData.totalCost - retreatPrice;
  const savingsPercent = Math.round((savings / cityData.totalCost) * 100);

  return (
    <div className="bg-salty-cream rounded-2xl border-2 border-salty-beige overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center">
        <p className="font-display text-sm text-salty-orange-red uppercase tracking-widest mb-2">
          Or you could stay home...
        </p>
        <h3 className="font-display text-section text-salty-deep-teal mb-2">
          A comparable week in {cityData.cityName}
        </h3>
        <p className="font-body text-sm text-salty-slate/50">
          Same activities. Same vibes. Different weather.
        </p>
      </div>

      {/* City Selector */}
      <div className="px-6 pb-4 flex items-center justify-center gap-2 flex-wrap">
        {availableCities.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelectedCityId(city.id)}
            className={cn(
              'px-3 py-1.5 rounded-full font-body text-xs font-bold transition-all',
              selectedCityId === city.id
                ? 'bg-salty-deep-teal text-white'
                : 'bg-salty-sand text-salty-slate/50 hover:bg-salty-beige'
            )}
          >
            {city.label}
          </button>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="px-6 pb-2">
        {cityData.lineItems.slice(0, isExpanded ? undefined : 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-salty-beige/30 last:border-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <p className="font-body text-sm text-salty-deep-teal truncate">{item.category}</p>
                <p className="font-body text-xs text-salty-slate/40 truncate">{item.description}</p>
              </div>
            </div>
            <span className="font-display text-sm text-salty-deep-teal font-bold ml-3 whitespace-nowrap">
              {item.cost > 0 ? `$${item.cost.toLocaleString()}` : 'Priceless'}
            </span>
          </div>
        ))}

        {!isExpanded && cityData.lineItems.length > 4 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-2 font-body text-xs font-bold text-salty-orange-red hover:underline text-center"
          >
            Show {cityData.lineItems.length - 4} more
          </button>
        )}
      </div>

      {/* Total & Comparison */}
      <div className="bg-salty-sand/60 px-6 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-body text-sm text-salty-slate/60">Total in {cityData.cityName}</span>
          <span className="font-display text-xl text-salty-deep-teal font-bold line-through opacity-60">
            ${cityData.totalCost.toLocaleString()} {cityData.currency}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <span className="font-body text-sm text-salty-deep-teal font-semibold">{retreatName}</span>
          <PriceDisplay amountUSD={retreatPrice} label="from" size="md" />
        </div>

        <AnimatePresence>
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="stamp-badge mx-auto text-center"
            >
              <div className="font-display text-lg text-salty-sky">
                SAVE UP TO {savingsPercent}%
              </div>
              <div className="font-body text-xs text-salty-sky/70">
                vs. staying in {cityData.cityName}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="font-body text-xs text-salty-slate/40 text-center mt-3 italic">
          {cityData.funComparison}
        </p>
      </div>

      {/* Source note */}
      <div className="px-6 py-3">
        <p className="font-body text-[10px] text-salty-slate/30">
          {cityData.sourceNote}
        </p>
      </div>
    </div>
  );
}
