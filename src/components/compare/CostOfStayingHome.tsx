'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFlightStore } from '@/stores/flight-store';
import {
  mapAirportToCity,
  getCityAnchor,
  computeCityTotal,
  availableCities,
} from '@/data/city-cost-anchors';
import { CityAnchor } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { useCurrencyStore } from '@/stores/currency-store';
import { CurrencyCode, convertAmount } from '@/lib/currency';
import { motion, AnimatePresence } from 'motion/react';

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

  // Sync selectedCityId when detected city changes (e.g. user changes flight origin)
  useEffect(() => {
    setSelectedCityId(detectedCity.cityId);
  }, [detectedCity.cityId]);

  const cityData: CityAnchor = getCityAnchor(selectedCityId);
  const cityTotal = computeCityTotal(cityData);
  const { rates, isStale } = useCurrencyStore();

  // Convert retreat price (USD) to city's local currency for accurate comparison
  const cityCurrency = cityData.currency as CurrencyCode;
  const cityRate = cityCurrency === 'USD' ? 1 : (rates[cityCurrency] || 1);
  const retreatPriceInCityCurrency = convertAmount(retreatPrice, cityRate);

  const savings = cityTotal - retreatPriceInCityCurrency;
  const savingsPercent = cityTotal > 0 ? Math.round((savings / cityTotal) * 100) : 0;

  return (
    <div className="bg-surface-base rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card-resting)' }}>
      {/* Header */}
      <div className="p-6 text-center">
        <p className="font-display text-sm text-salty-coral uppercase tracking-widest mb-2">
          Or you could stay home...
        </p>
        <h3 className="font-display text-section text-salty-deep-teal mb-2">
          A comparable week in {cityData.cityName}
        </h3>
        <p className="font-body text-sm text-salty-deep-teal/50">
          Same activities. Same vibes. Different weather.
        </p>
      </div>

      {/* City Selector */}
      <div className="px-6 pb-2 flex items-center justify-center gap-2 flex-wrap">
        {availableCities.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelectedCityId(city.id)}
            className={cn(
              'px-3 py-1.5 rounded-full font-body text-xs font-bold transition-all',
              selectedCityId === city.id
                ? 'bg-salty-deep-teal text-white'
                : 'bg-salty-sand text-salty-deep-teal/50 hover:bg-surface-warm'
            )}
          >
            {city.label}
          </button>
        ))}
      </div>

      {/* City not listed note */}
      <div className="px-6 pb-4 text-center">
        <p className="font-body text-[10px] text-salty-deep-teal/30">
          Your city not listed? These are example cities — the comparison is illustrative of what a similar week costs at home.
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="px-6 pb-2">
        {cityData.lineItems.slice(0, isExpanded ? undefined : 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-salty-sand/30 last:border-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <p className="font-body text-sm text-salty-deep-teal truncate">{item.category}</p>
                <p className="font-body text-xs text-salty-deep-teal/40 truncate">{item.description}</p>
              </div>
            </div>
            <span className="font-display text-sm text-salty-deep-teal font-bold ml-3 whitespace-nowrap">
              {item.cost > 0 ? formatCurrency(item.cost, cityCurrency) : 'Priceless'}
            </span>
          </div>
        ))}

        {!isExpanded && cityData.lineItems.length > 4 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-2 font-body text-xs font-bold text-salty-coral hover:underline text-center"
          >
            Show {cityData.lineItems.length - 4} more
          </button>
        )}
      </div>

      {/* Total & Comparison */}
      <div className="bg-salty-sand/60 px-6 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-body text-sm text-salty-deep-teal/60">Total in {cityData.cityName}</span>
          <span className="font-display text-xl text-salty-deep-teal font-bold line-through opacity-60">
            ${cityTotal.toLocaleString()} {cityData.currency}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <span className="font-body text-sm text-salty-deep-teal font-semibold">{retreatName}</span>
          <span className="inline-block">
            <span className="font-display text-2xl text-salty-coral">
              from {formatCurrency(retreatPriceInCityCurrency, cityCurrency)}
            </span>
            {cityCurrency !== 'USD' && (
              <span className="font-body text-xs text-salty-deep-teal/40 block">
                {formatCurrency(retreatPrice, 'USD')} USD
              </span>
            )}
          </span>
        </div>

        <AnimatePresence>
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <p className="font-display text-lg text-salty-coral">
                SAVE UP TO {savingsPercent}%
              </p>
              <p className="font-body text-xs text-salty-deep-teal/50">
                vs. staying in {cityData.cityName}
              </p>
              {isStale && cityCurrency !== 'USD' && (
                <p className="font-body text-[10px] text-salty-deep-teal/30 mt-1">
                  (approximate — rates updating)
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="font-body text-xs text-salty-deep-teal/40 text-center mt-3 italic">
          {cityData.funComparison}
        </p>
      </div>

      {/* Source note */}
      <div className="px-6 py-3">
        <p className="font-body text-[10px] text-salty-deep-teal/30">
          {cityData.sourceNote}
        </p>
      </div>
    </div>
  );
}
