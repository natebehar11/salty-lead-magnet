'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFlightStore } from '@/stores/flight-store';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/utils';

interface FormData {
  firstName: string;
  email: string;
  whatsappNumber: string;
}

interface FlightLeadGateProps {
  onComplete: () => void;
}

export default function FlightLeadGate({ onComplete }: FlightLeadGateProps) {
  const { setLeadData, originAirport, selectedRetreatSlug } = useFlightStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    setLeadData({
      firstName: data.firstName,
      email: data.email,
      whatsappNumber: data.whatsappNumber,
    });

    // Submit to GHL
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          whatsappNumber: data.whatsappNumber,
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
        <div>
          <input
            {...register('firstName', { required: 'We need your name' })}
            placeholder="First name"
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 font-body text-sm bg-salty-cream',
              'focus:outline-none focus:border-salty-orange-red transition-colors',
              errors.firstName ? 'border-salty-burnt-red' : 'border-salty-beige'
            )}
          />
          {errors.firstName && (
            <p className="font-body text-xs text-salty-burnt-red mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('email', {
              required: 'We need your email',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'That doesn\'t look like an email' },
            })}
            type="email"
            placeholder="Email"
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 font-body text-sm bg-salty-cream',
              'focus:outline-none focus:border-salty-orange-red transition-colors',
              errors.email ? 'border-salty-burnt-red' : 'border-salty-beige'
            )}
          />
          {errors.email && (
            <p className="font-body text-xs text-salty-burnt-red mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('whatsappNumber', {
              required: 'We need your WhatsApp',
              minLength: { value: 7, message: 'Too short' },
            })}
            type="tel"
            placeholder="WhatsApp number (with country code)"
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 font-body text-sm bg-salty-cream',
              'focus:outline-none focus:border-salty-orange-red transition-colors',
              errors.whatsappNumber ? 'border-salty-burnt-red' : 'border-salty-beige'
            )}
          />
          {errors.whatsappNumber && (
            <p className="font-body text-xs text-salty-burnt-red mt-1">{errors.whatsappNumber.message}</p>
          )}
        </div>

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
