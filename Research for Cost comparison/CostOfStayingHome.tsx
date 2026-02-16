// src/components/compare/CostOfStayingHome.tsx
// "What would this cost at home?" card for the compare page
// Position: between priceless section and destination cards

'use client';

import { useState, useMemo } from 'react';
import {
  getCityAnchor,
  mapAirportToCity,
  getFlightEstimate,
  availableCities,
  type CityAnchor,
} from '@/data/city-cost-anchors';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CostOfStayingHomeProps {
  /** Override city detection — useful for testing or direct linking */
  forceCityId?: string;
  /** The SALTY retreat to compare against. Falls back to cheapest. */
  comparisonRetreat?: {
    name: string;
    destination: string;
    lowestPrice: number; // USD
    slug: string;
  };
  /** User's actual cheapest flight result, if they've searched */
  actualFlightPrice?: number;
  /** User's detected origin airport code */
  originAirportCode?: string;
  /** Callback when GHL tags should fire */
  onView?: (cityId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CostOfStayingHome({
  forceCityId,
  comparisonRetreat,
  actualFlightPrice,
  originAirportCode,
  onView,
}: CostOfStayingHomeProps) {
  // ── City Detection ──
  const detectedCity = useMemo(() => {
    if (forceCityId) return getCityAnchor(forceCityId);
    if (originAirportCode) return mapAirportToCity(originAirportCode);
    return getCityAnchor('toronto'); // default fallback
  }, [forceCityId, originAirportCode]);

  const [selectedCity, setSelectedCity] = useState<CityAnchor>(detectedCity);
  const [showCitySwitcher, setShowCitySwitcher] = useState(false);

  // ── Flight + SALTY pricing ──
  const flightEstimate = actualFlightPrice || getFlightEstimate(selectedCity.cityId);
  const saltyPrice = comparisonRetreat?.lowestPrice ?? 1949; // cheapest retreat fallback
  const saltyWithFlights = saltyPrice + flightEstimate;
  const retreatName = comparisonRetreat?.destination ?? 'Costa Rica';

  // ── Format currency ──
  const fmt = (amount: number) => {
    if (amount === 0) return '—';
    return `$${amount.toLocaleString()}`;
  };

  const currencyLabel = selectedCity.currency;

  // ── GHL tag on first render ──
  // Fire once per session — parent should handle deduplication
  useMemo(() => {
    onView?.(selectedCity.cityId);
  }, [selectedCity.cityId, onView]);

  // ── City switch handler ──
  const handleCitySwitch = (cityId: string) => {
    setSelectedCity(getCityAnchor(cityId));
    setShowCitySwitcher(false);
  };

  return (
    <section
      className="w-full max-w-3xl mx-auto my-12 rounded-2xl border-l-4 border-[#E8734A] bg-[#FDF6F0] px-6 py-8 md:px-10 md:py-10"
      aria-label="Cost of staying home comparison"
    >
      {/* ── Header ── */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
        What would this cost at home?
      </h2>
      <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
        We priced out a comparable week in {selectedCity.cityName}.{' '}
        Same activities, same quality, same number of meals.{' '}
        Just… without the ocean, the new country, or the 30 friends you haven't met yet.
      </p>

      {/* ── City Switcher ── */}
      <div className="mb-6 text-sm">
        <button
          onClick={() => setShowCitySwitcher(!showCitySwitcher)}
          className="text-[#E8734A] hover:text-[#D4623C] underline underline-offset-2 transition-colors"
        >
          Not from {selectedCity.cityName}? Switch city ▾
        </button>
        {showCitySwitcher && (
          <div className="mt-2 flex flex-wrap gap-2">
            {availableCities
              .filter((c) => c.id !== selectedCity.cityId)
              .map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySwitch(city.id)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:border-[#E8734A] hover:text-[#E8734A] transition-colors"
                >
                  {city.label}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ── Line Items ── */}
      <div className="space-y-0">
        {selectedCity.lineItems.map((item, i) => (
          <div
            key={`${selectedCity.cityId}-${i}`}
            className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0"
          >
            {/* Left: emoji + category + description */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="font-medium text-gray-900 text-sm md:text-base">
                  {item.category}
                </span>
              </div>
              <p
                className={`ml-8 text-xs md:text-sm text-gray-500 mt-0.5 ${
                  item.cost === 0 ? 'italic' : ''
                }`}
              >
                {item.description}
              </p>
            </div>

            {/* Right: cost */}
            <div className="text-right shrink-0">
              <span
                className={`font-semibold text-sm md:text-base ${
                  item.cost === 0 ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                {fmt(item.cost)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Total + Punchline ── */}
      <div className="mt-6 pt-4 border-t-2 border-gray-300">
        <div className="flex items-baseline justify-between">
          <span className="text-base md:text-lg font-bold text-gray-900">
            Total in {selectedCity.cityName}:
          </span>
          <span className="text-lg md:text-xl font-bold text-gray-900">
            ~{fmt(selectedCity.totalCost)} {currencyLabel}
          </span>
        </div>
        <p className="text-[#E8734A] font-semibold text-sm md:text-base mt-1">
          {selectedCity.funComparison}
        </p>
      </div>

      {/* ── SALTY Comparison Block ── */}
      {saltyPrice > 0 && (
        <div className="mt-6 bg-emerald-50 rounded-xl px-5 py-4 border border-emerald-200">
          <p className="text-emerald-900 font-bold text-base md:text-lg">
            SALTY {retreatName} from {fmt(saltyPrice)} USD.
          </p>
          <p className="text-emerald-800 text-sm mt-1">
            Including flights: ~{fmt(saltyWithFlights)} USD.
          </p>
          <p className="text-emerald-700 text-xs md:text-sm mt-1">
            Ocean, new country, 30 friends, zero planning.
          </p>
        </div>
      )}

      {/* ── Source Note ── */}
      <p className="mt-6 text-xs text-gray-400 leading-relaxed">
        {selectedCity.sourceNote}
      </p>
    </section>
  );
}
