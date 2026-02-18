'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUpcomingRetreats } from '@/data/retreats';
import { Retreat } from '@/types';
import { formatDateRange } from '@/lib/utils';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import WaveDivider from '@/components/shared/WaveDivider';
import HumanCTA from '@/components/shared/HumanCTA';
import TripConfidenceScore from '@/components/planner/TripConfidenceScore';
import { useFlightStore } from '@/stores/flight-store';

// ~80 popular travel cities for autocomplete
const POPULAR_CITIES = [
  'Amsterdam', 'Antigua', 'Athens', 'Auckland',
  'Bali', 'Bangkok', 'Barcelona', 'Beijing', 'Berlin', 'Bogota', 'Bordeaux',
  'Boston', 'Brisbane', 'Brussels', 'Budapest', 'Buenos Aires',
  'Cairo', 'Cancun', 'Cape Town', 'Cartagena', 'Chiang Mai', 'Chicago',
  'Copenhagen', 'Cusco',
  'Dubai', 'Dublin', 'Dubrovnik',
  'Edinburgh', 'Florence', 'Havana', 'Helsinki', 'Ho Chi Minh City', 'Hong Kong',
  'Honolulu',
  'Istanbul', 'Jaipur', 'Johannesburg',
  'Kathmandu', 'Koh Samui', 'Kuala Lumpur', 'Kyoto',
  'Lima', 'Lisbon', 'London', 'Los Angeles',
  'Madrid', 'Marrakech', 'Medellín', 'Melbourne', 'Mexico City', 'Miami',
  'Milan', 'Montreal', 'Mumbai', 'Munich',
  'Nairobi', 'Naples', 'New York', 'Nice',
  'Osaka', 'Oslo',
  'Paris', 'Playa del Carmen', 'Porto', 'Prague', 'Phuket',
  'Reykjavik', 'Rio de Janeiro', 'Rome',
  'San Francisco', 'San Juan', 'Santiago', 'Santorini', 'São Paulo',
  'Seoul', 'Seville', 'Shanghai', 'Singapore', 'Split', 'Stockholm', 'Sydney',
  'Taipei', 'Tel Aviv', 'Tokyo', 'Toronto',
  'Vancouver', 'Venice', 'Vienna',
  'Zanzibar', 'Zürich',
];

interface PlannerCity {
  id: string;
  name: string;
  country: string;
  days: number;
  type: 'before' | 'after';
}

interface ItinerarySuggestion {
  cities: { name: string; country: string; days: number; highlights: string[] }[];
  totalDays: number;
  reasoning: string;
}

function CityAutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.length >= 1
    ? POPULAR_CITIES.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = isFocused && filtered.length > 0 && value.length >= 1;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [value]);

  const selectCity = (city: string) => {
    onChange(city);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selectCity(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-salty-beige overflow-hidden"
          >
            {filtered.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCity(city);
                  }}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    i === highlightIndex
                      ? 'bg-salty-orange-red/10 text-salty-deep-teal'
                      : 'text-salty-slate/80 hover:bg-salty-beige/40'
                  }`}
                >
                  {city}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlannerPage() {
  const retreats = getUpcomingRetreats().filter((r) => r.status !== 'sold_out');
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const [beforeCities, setBeforeCities] = useState<PlannerCity[]>([]);
  const [afterCities, setAfterCities] = useState<PlannerCity[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<ItinerarySuggestion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', email: '', whatsappNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const hasAdditionalDestinations = beforeCities.length > 0 || afterCities.length > 0;
  const { hasSubmittedLead, favouriteFlightIds, searchResults: flightSearchResults } = useFlightStore();

  const addCity = useCallback((type: 'before' | 'after') => {
    const newCity: PlannerCity = {
      id: `${type}-${Date.now()}`,
      name: '',
      country: '',
      days: 3,
      type,
    };
    if (type === 'before') {
      setBeforeCities((prev) => [...prev, newCity]);
    } else {
      setAfterCities((prev) => [...prev, newCity]);
    }
  }, []);

  const updateCity = useCallback((id: string, updates: Partial<PlannerCity>) => {
    const updater = (cities: PlannerCity[]) =>
      cities.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setBeforeCities(updater);
    setAfterCities(updater);
  }, []);

  const removeCity = useCallback((id: string) => {
    setBeforeCities((prev) => prev.filter((c) => c.id !== id));
    setAfterCities((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleGenerate = async () => {
    if (!selectedRetreat) return;
    setIsGenerating(true);

    try {
      const existingCities = [
        ...beforeCities.filter((c) => c.name).map((c) => c.name),
        ...afterCities.filter((c) => c.name).map((c) => c.name),
      ];

      const res = await fetch('/api/planner/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedRetreat.destination,
          retreatName: selectedRetreat.title,
          userPrompt: prompt || undefined,
          existingCities: existingCities.length > 0 ? existingCities : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestion(data);
      } else {
        console.error('Planner suggest failed:', res.status);
      }
    } catch (error) {
      console.error('Planner suggest error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalTripDays = (selectedRetreat?.duration.days || 0) +
    beforeCities.reduce((s, c) => s + c.days, 0) +
    afterCities.reduce((s, c) => s + c.days, 0) +
    (suggestion?.totalDays || 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6 bg-salty-cream">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-3">
              SALTY Trip Planner
            </p>
            <h1 className="font-display text-hero text-salty-deep-teal mb-4">
              Plan the perfect vacation
            </h1>
            <p className="font-body text-lg text-salty-slate/60 max-w-lg mx-auto">
              Our retreats are amazing. But sometimes you want even more travel
              goodness, so we&apos;re here to help you plan your vacation itinerary.
              We&apos;ll help you find cities and explore flights to get there.
            </p>
          </motion.div>
        </div>
      </section>

      <WaveDivider variant="ocean" />

      {/* Retreat Selection */}
      <section className="py-12 px-6 bg-salty-deep-teal">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-section text-white text-center mb-8">
            Plan an itinerary for which retreat?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {retreats.map((retreat) => {
              const isSelected = selectedRetreat?.slug === retreat.slug;
              return (
                <button
                  key={retreat.slug}
                  onClick={() => { setSelectedRetreat(retreat); setSuggestion(null); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-salty-salmon bg-salty-salmon/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <span className={`font-display text-lg block ${isSelected ? 'text-salty-salmon' : 'text-white'}`}>
                    {retreat.destination}
                  </span>
                  <span className="font-body text-xs text-white/50">
                    {retreat.title} &middot; {formatDateRange(retreat.startDate, retreat.endDate)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider variant="ocean" flip />

      {/* Planner Area */}
      {selectedRetreat && (
        <section className="py-12 px-6 bg-salty-cream">
          <div className="max-w-3xl mx-auto">
            {/* Timeline Visualization */}
            <ScrollReveal>
              <div className="mb-12">
                <h3 className="font-display text-xl text-salty-deep-teal text-center mb-6">
                  Your Trip Timeline
                </h3>

                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {/* Before cities */}
                  {beforeCities.map((city) => (
                    <div key={city.id} className="flex-shrink-0 p-3 bg-salty-light-blue/20 rounded-xl border border-salty-light-blue/30 min-w-[120px]">
                      <CityAutocompleteInput
                        value={city.name}
                        onChange={(val) => updateCity(city.id, { name: val })}
                        placeholder="City name"
                        className="w-full bg-transparent font-display text-sm text-salty-deep-teal outline-none placeholder:text-salty-deep-teal/30"
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={city.days}
                          onChange={(e) => updateCity(city.id, { days: parseInt(e.target.value) || 1 })}
                          className="w-10 bg-transparent font-body text-xs text-salty-slate/60 outline-none"
                          min={1}
                          max={14}
                        />
                        <span className="font-body text-xs text-salty-slate/40">days</span>
                        <button onClick={() => removeCity(city.id)} className="ml-auto text-salty-burnt-red text-xs">x</button>
                      </div>
                    </div>
                  ))}

                  {/* Add before button */}
                  <button
                    onClick={() => addCity('before')}
                    className="flex-shrink-0 p-3 border-2 border-dashed border-salty-beige rounded-xl hover:border-salty-deep-teal/30 transition-colors min-w-[100px] text-center"
                  >
                    <span className="font-body text-xs text-salty-slate/40 block">+ Before</span>
                  </button>

                  {/* Arrow */}
                  <svg className="w-6 h-6 text-salty-beige flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  {/* Retreat (anchor) */}
                  <div className="flex-shrink-0 p-3 bg-salty-orange-red/10 rounded-xl border-2 border-salty-orange-red min-w-[140px]">
                    <p className="font-display text-sm text-salty-orange-red">{selectedRetreat.destination}</p>
                    <p className="font-body text-xs text-salty-slate/50">{selectedRetreat.duration.days} days</p>
                  </div>

                  {/* Arrow */}
                  <svg className="w-6 h-6 text-salty-beige flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  {/* After cities */}
                  {afterCities.map((city) => (
                    <div key={city.id} className="flex-shrink-0 p-3 bg-salty-seafoam/20 rounded-xl border border-salty-seafoam/30 min-w-[120px]">
                      <CityAutocompleteInput
                        value={city.name}
                        onChange={(val) => updateCity(city.id, { name: val })}
                        placeholder="City name"
                        className="w-full bg-transparent font-display text-sm text-salty-deep-teal outline-none placeholder:text-salty-deep-teal/30"
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={city.days}
                          onChange={(e) => updateCity(city.id, { days: parseInt(e.target.value) || 1 })}
                          className="w-10 bg-transparent font-body text-xs text-salty-slate/60 outline-none"
                          min={1}
                          max={14}
                        />
                        <span className="font-body text-xs text-salty-slate/40">days</span>
                        <button onClick={() => removeCity(city.id)} className="ml-auto text-salty-burnt-red text-xs">x</button>
                      </div>
                    </div>
                  ))}

                  {/* Add after button */}
                  <button
                    onClick={() => addCity('after')}
                    className="flex-shrink-0 p-3 border-2 border-dashed border-salty-beige rounded-xl hover:border-salty-deep-teal/30 transition-colors min-w-[100px] text-center"
                  >
                    <span className="font-body text-xs text-salty-slate/40 block">+ After</span>
                  </button>
                </div>

                {totalTripDays > 0 && (
                  <p className="font-body text-sm text-salty-slate/50 text-center mt-4">
                    Total trip: <span className="font-bold text-salty-deep-teal">{totalTripDays} days</span>
                  </p>
                )}

                {/* Find Flights button - visible when at least 1 additional destination exists */}
                <AnimatePresence>
                  {hasAdditionalDestinations && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center mt-6"
                    >
                      <Button href="/flights" variant="yellow" size="md">
                        Find Flights
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>

            {/* Trip Confidence Score */}
            <ScrollReveal>
              <div className="mb-8">
                <TripConfidenceScore
                  selectedRetreat={selectedRetreat}
                  beforeCities={beforeCities}
                  afterCities={afterCities}
                  hasSuggestion={!!suggestion}
                  hasSubmittedLead={hasSubmittedLead}
                  hasSearchedFlights={!!flightSearchResults}
                  hasFavouritedFlights={favouriteFlightIds.length > 0}
                  hasShared={showForm}
                />
              </div>
            </ScrollReveal>

            {/* AI Suggestion */}
            <ScrollReveal>
              <div className="bg-salty-beige/30 rounded-2xl p-6 sm:p-8 mb-8">
                <h3 className="font-display text-xl text-salty-deep-teal mb-2">
                  Need inspiration?
                </h3>
                <p className="font-body text-sm text-salty-slate/60 mb-4">
                  Tell us what you&apos;re into and we&apos;ll suggest cities to explore
                  around your {selectedRetreat.destination} retreat.
                </p>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`e.g., "I love food scenes and nightlife" or "I want to see nature and wildlife" or just leave blank for our top picks`}
                  className="w-full p-4 rounded-xl border-2 border-salty-beige bg-salty-cream font-body text-sm resize-none h-24 focus:outline-none focus:border-salty-orange-red transition-colors"
                />

                <Button
                  onClick={handleGenerate}
                  variant="yellow"
                  size="md"
                  disabled={isGenerating}
                  className="mt-4"
                >
                  {isGenerating ? 'Thinking...' : 'Suggest Cities'}
                </Button>
              </div>
            </ScrollReveal>

            {/* AI Suggestions Results */}
            <AnimatePresence>
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8"
                >
                  <div className="bg-salty-cream rounded-2xl border-2 border-salty-beige p-6">
                    <h3 className="font-display text-xl text-salty-deep-teal mb-2">
                      Our suggestion
                    </h3>
                    <p className="font-body text-sm text-salty-slate/60 mb-6">
                      {suggestion.reasoning}
                    </p>

                    <div className="space-y-4">
                      {suggestion.cities.map((city, i) => (
                        <div key={i} className="p-4 bg-salty-beige/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-display text-lg text-salty-deep-teal">
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(city.name + ' travel guide')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-salty-orange-red underline underline-offset-2 decoration-salty-orange-red/30 hover:decoration-salty-orange-red transition-colors"
                              >
                                {city.name}
                              </a>
                              , {city.country}
                            </h4>
                            <span className="font-body text-xs text-salty-orange-red font-bold bg-salty-orange-red/10 px-3 py-1 rounded-full">
                              {city.days} days
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {city.highlights.map((h) => (
                              <span key={h} className="font-body text-xs text-salty-slate/60 bg-salty-cream px-2 py-1 rounded-full border border-salty-beige">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setShowForm(true)}
                        variant="primary"
                        size="md"
                        className="flex-1"
                      >
                        Save This Itinerary
                      </Button>
                      <Button
                        href="/flights"
                        variant="secondary"
                        size="md"
                        className="flex-1"
                      >
                        Check Multi-City Flights
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lead capture for saving */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-salty-deep-teal rounded-2xl p-6 sm:p-8 text-center"
                >
                  <h3 className="font-display text-xl text-white mb-2">
                    Save & share your trip plan
                  </h3>
                  <p className="font-body text-sm text-white/50 mb-6">
                    Drop your details and we&apos;ll send you the full itinerary with flight options.
                  </p>
                  {formSubmitted ? (
                    <div className="py-4">
                      <p className="font-display text-xl text-salty-salmon mb-2">You&apos;re all set!</p>
                      <p className="font-body text-sm text-white/60">
                        We&apos;ll send your trip plan to {formData.email}. Keep an eye on your inbox.
                      </p>
                    </div>
                  ) : (
                    <form
                      className="max-w-sm mx-auto space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        try {
                          const totalCities = beforeCities.filter((c) => c.name).length +
                            afterCities.filter((c) => c.name).length +
                            (suggestion?.cities.length || 0);

                          await fetch('/api/leads/capture', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              firstName: formData.firstName,
                              email: formData.email,
                              whatsappNumber: formData.whatsappNumber,
                              source: 'planner',
                              retreatSlug: selectedRetreat?.slug,
                              citiesCount: totalCities,
                            }),
                          });
                          setFormSubmitted(true);
                        } catch (error) {
                          console.error('Planner form submit failed:', error);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder="First name"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp number"
                        required
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                      />
                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Send Me My Trip Plan'}
                      </Button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {!selectedRetreat && (
        <section className="py-16 px-6 bg-salty-beige/30">
          <div className="max-w-xl mx-auto text-center">
            <HumanCTA
              message="Not sure where to start? Take the quiz first."
              context="Hey! I want to plan a bigger trip around a SALTY retreat. Can you help me figure out the best route?"
            />
            <div className="mt-4">
              <Button href="/quiz" variant="ghost">Take the Trip Quiz</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
