'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFlightStore } from '@/stores/flight-store';
import Button from '@/components/shared/Button';
import LeadCaptureFields, { LeadFormData } from '@/components/shared/LeadCaptureFields';

interface FlightLeadGateProps {
  onComplete: () => void;
}

export default function FlightLeadGate({ onComplete }: FlightLeadGateProps) {
  const { setLeadData, originAirport, selectedRetreatSlug } = useFlightStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    const fullWhatsApp = `${countryCode}${data.whatsappNumber.replace(/^0+/, '')}`;

    setLeadData({
      firstName: data.firstName,
      email: data.email,
      whatsappNumber: fullWhatsApp,
    });

    // Submit to GHL
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          whatsappNumber: fullWhatsApp,
          source: 'flights',
          flightSearch: {
            originCode: originAirport?.code,
            originCity: originAirport?.city,
            retreatSlug: selectedRetreatSlug,
          },
        }),
      });
    } catch {
      console.log('Lead capture failed, continuing to results');
    }

    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="mt-8 bg-salty-cream rounded-2xl border-2 border-salty-beige p-6 sm:p-8">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl text-salty-deep-teal mb-2">
          Almost there — see your flight prices.
        </h3>
        <p className="font-body text-sm text-salty-deep-teal/60">
          Drop your details and we&apos;ll show you every option we found.
          Plus, we&apos;ll let you know if prices drop.
        </p>
      </div>

      {/* Blurred preview teaser */}
      <div className="relative mb-6 overflow-hidden rounded-xl">
        <div className="blur-md pointer-events-none">
          <div className="bg-salty-beige/50 p-4 rounded-xl space-y-3">
            <div className="h-16 bg-salty-beige/30 rounded-lg" />
            <div className="h-16 bg-salty-beige/30 rounded-lg" />
            <div className="h-16 bg-salty-beige/30 rounded-lg" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-body text-sm text-salty-deep-teal/50 bg-salty-cream/80 px-4 py-2 rounded-full">
            Flights found — enter your info below
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto space-y-4">
        <LeadCaptureFields
          register={register}
          errors={errors}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
        />

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Loading flights...' : 'Show Me Flight Prices'}
        </Button>

        <p className="font-body text-xs text-salty-deep-teal/40 text-center">
          No spam. Just flights and trip updates you actually care about.
        </p>
      </form>
    </div>
  );
}
