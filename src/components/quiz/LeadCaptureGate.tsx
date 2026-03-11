'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuizStore } from '@/stores/quiz-store';
import { useRouter } from 'next/navigation';
import { retreats } from '@/data/retreats';
import { calculateAllMatches } from '@/lib/matching';
import Button from '@/components/shared/Button';
import LeadCaptureFields, { LeadFormData } from '@/components/shared/LeadCaptureFields';

export default function LeadCaptureGate() {
  const { answers, setLeadData, setResults } = useQuizStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    const fullWhatsApp = `${countryCode}${data.whatsappNumber.replace(/^0+/, '')}`;

    // Save lead data
    setLeadData({
      firstName: data.firstName,
      email: data.email,
      whatsappNumber: fullWhatsApp,
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
          whatsappNumber: fullWhatsApp,
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
        <LeadCaptureFields
          register={register}
          errors={errors}
          showLabels
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          placeholders={{
            firstName: 'What should we call you?',
            email: 'you@example.com',
          }}
        />

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Finding your matches...' : 'Show Me My Matches'}
        </Button>
      </form>
    </div>
  );
}
