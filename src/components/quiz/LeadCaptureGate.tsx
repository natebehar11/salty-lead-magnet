'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuizStore } from '@/stores/quiz-store';
import { useRouter } from 'next/navigation';
import { retreats } from '@/data/retreats';
import { calculateAllMatches } from '@/lib/matching';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/utils';

interface FormData {
  firstName: string;
  email: string;
  whatsappNumber: string;
}

export default function LeadCaptureGate() {
  const { answers, setLeadData, setResults } = useQuizStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Save lead data
    setLeadData({
      firstName: data.firstName,
      email: data.email,
      whatsappNumber: data.whatsappNumber,
    });

    // Calculate matches
    const results = calculateAllMatches(retreats, answers);
    setResults(results);

    // Submit to GHL (API route)
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          whatsappNumber: data.whatsappNumber,
          source: 'quiz',
          quizAnswers: answers,
          topMatch: results[0]?.retreat.slug,
        }),
      });
    } catch {
      // Non-blocking — we still show results even if GHL fails
      console.log('Lead capture API call failed, continuing to results');
    }

    // Navigate to results
    router.push('/quiz/results');
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        Your matches are ready.
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-2">
        Drop your details and we&apos;ll show you the goods.
      </p>
      <p className="font-body text-xs text-salty-deep-teal/40 mb-8">
        We&apos;ll only message you about trips you&apos;re actually interested in. No spam. Pinky promise.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto space-y-4">
        <div className="text-left">
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            First name
          </label>
          <input
            {...register('firstName', { required: 'We need your name!' })}
            placeholder="What should we call you?"
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

        <div className="text-left">
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            Email
          </label>
          <input
            {...register('email', {
              required: 'We need your email to send results',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'That doesn\'t look like an email',
              },
            })}
            type="email"
            placeholder="you@example.com"
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

        <div className="text-left">
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            WhatsApp number
          </label>
          <input
            {...register('whatsappNumber', {
              required: 'We need your WhatsApp for trip updates',
              minLength: { value: 7, message: 'That seems too short' },
            })}
            type="tel"
            placeholder="+1 (555) 123-4567"
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
          {isSubmitting ? 'Finding your matches...' : 'Show Me My Matches'}
        </Button>
      </form>
    </div>
  );
}
