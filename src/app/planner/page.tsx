'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUpcomingRetreats, getRetreatBySlug } from '@/data/retreats';
import { formatDateRange } from '@/lib/utils';
import Button from '@/components/shared/Button';
import ScrollReveal from '@/components/shared/ScrollReveal';
import WaveDivider from '@/components/shared/WaveDivider';
import HumanCTA from '@/components/shared/HumanCTA';
import ShareButton from '@/components/shared/ShareButton';
import TripConfidenceScore from '@/components/planner/TripConfidenceScore';
import CityAutocompleteInput from '@/components/planner/CityAutocompleteInput';
import PlannerChat from '@/components/planner/PlannerChat';
import SuggestedCityCard from '@/components/planner/SuggestedCityCard';
import { useFlightStore } from '@/stores/flight-store';
import { usePlannerStore } from '@/stores/planner-store';
import { countryCodes } from '@/data/country-codes';
import { ItinerarySuggestion } from '@/types/planner';
import { Retreat } from '@/types/retreat';

function buildShareText(
  suggestion: ItinerarySuggestion,
  checkedCityIds: string[],
  retreat: Retreat
): string {
  const checkedCities = suggestion.cities.filter((c) =>
    checkedCityIds.includes(c.id)
  );
  const cityList = checkedCities
    .map((c) => `${c.name}, ${c.country} (${c.days} days)`)
    .join('\n');
  return `My trip plan around ${retreat.title} in ${retreat.destination}:\n${cityList}\n\nTotal: ${suggestion.totalDays} days`;
}

export default function PlannerPage() {
  const retreats = getUpcomingRetreats().filter((r) => r.status !== 'sold_out');

  const {
    selectedRetreatSlug,
    beforeCities,
    afterCities,
    suggestion,
    formSubmitted,
    checkedCityIds,
    setSelectedRetreatSlug,
    addCity,
    updateCity,
    removeCity,
    toggleCityChecked,
    setFormSubmitted,
  } = usePlannerStore();

  const selectedRetreat = selectedRetreatSlug ? getRetreatBySlug(selectedRetreatSlug) ?? null : null;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', email: '', whatsappNumber: '' });
  const [plannerCountryCode, setPlannerCountryCode] = useState('+1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpandedCity, setHasExpandedCity] = useState(false);

  const hasAdditionalDestinations = beforeCities.length > 0 || afterCities.length > 0;
  const { hasSubmittedLead, favouriteFlightIds, searchResults: flightSearchResults } = useFlightStore();

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
              const isSelected = selectedRetreatSlug === retreat.slug;
              return (
                <button
                  key={retreat.slug}
                  onClick={() => setSelectedRetreatSlug(retreat.slug)}
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
                  hasExpandedCity={hasExpandedCity}
                  hasSubmittedLead={hasSubmittedLead}
                  hasSearchedFlights={!!flightSearchResults}
                  hasFavouritedFlights={favouriteFlightIds.length > 0}
                  hasShared={showForm}
                />
              </div>
            </ScrollReveal>

            {/* AI Chat / Planner */}
            <ScrollReveal>
              <div className="mb-8">
                <PlannerChat
                  destination={selectedRetreat.destination}
                  retreatName={selectedRetreat.title}
                />
              </div>
            </ScrollReveal>

            {/* AI Suggestion Results — Expandable City Cards */}
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
                      Your suggested itinerary
                    </h3>
                    <p className="font-body text-sm text-salty-slate/60 mb-6">
                      {suggestion.reasoning}
                    </p>

                    <div className="space-y-3">
                      {suggestion.cities.map((city) => (
                        <SuggestedCityCard
                          key={city.id}
                          city={city}
                          isChecked={checkedCityIds.includes(city.id)}
                          onToggleChecked={toggleCityChecked}
                          onExpand={() => setHasExpandedCity(true)}
                        />
                      ))}
                    </div>

                    {/* Share + Save actions */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                      <ShareButton
                        title={`My ${selectedRetreat.destination} trip plan`}
                        text={buildShareText(suggestion, checkedCityIds, selectedRetreat)}
                      />
                      <Button
                        onClick={() => setShowForm(true)}
                        variant="primary"
                        size="md"
                      >
                        Save This Itinerary
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
                              whatsappNumber: `${plannerCountryCode}${formData.whatsappNumber.replace(/^0+/, '')}`,
                              source: 'planner',
                              retreatSlug: selectedRetreatSlug,
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
                      <div>
                        <div className="flex gap-2">
                          <select
                            value={plannerCountryCode}
                            onChange={(e) => setPlannerCountryCode(e.target.value)}
                            className="w-28 px-2 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white focus:outline-none focus:border-salty-salmon"
                          >
                            {countryCodes.map((cc) => (
                              <option key={cc.code} value={cc.dialCode} className="text-salty-deep-teal">
                                {cc.flag} {cc.dialCode}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            placeholder="(555) 123-4567"
                            required
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-salty-salmon"
                          />
                        </div>
                        <p className="font-body text-[10px] text-white/30 mt-1">
                          Include your country code for WhatsApp.
                        </p>
                      </div>
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
