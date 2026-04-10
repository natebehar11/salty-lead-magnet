'use client';

/**
 * Shared lead capture form fields used across quiz, flights, and planner.
 *
 * Provides consistent styling, validation, and structure for:
 * - First name (required)
 * - Email (required, pattern validated)
 * - WhatsApp number (optional or required, with country code selector)
 *
 * Each consumer wraps these fields in their own <form> and submit handler.
 * The country code is managed externally — consumers must track `countryCode`
 * state and prepend it to the WhatsApp number before submission.
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { countryCodes } from '@/data/country-codes';

export interface LeadFormData {
  firstName: string;
  email: string;
  whatsappNumber: string;
}

const INPUT_BASE = cn(
  'w-full px-4 py-3 rounded-xl border-2 font-body text-sm bg-salty-cream',
  'focus:outline-none focus:border-salty-orange-red transition-colors'
);

const ERROR_CLASS = 'font-body text-xs text-salty-burnt-red mt-1';

interface LeadCaptureFieldsProps {
  register: UseFormRegister<LeadFormData>;
  errors: FieldErrors<LeadFormData>;
  /** Whether WhatsApp field is required (quiz/flights: true, planner: false) */
  whatsappRequired?: boolean;
  /** Show labels above inputs (quiz style) vs placeholder-only (flights style) */
  showLabels?: boolean;
  /** Custom placeholder overrides */
  placeholders?: {
    firstName?: string;
    email?: string;
    whatsappNumber?: string;
  };
  /** Current country code value (e.g. '+1'). Consumer manages this state. */
  countryCode: string;
  /** Callback when country code changes. Consumer manages this state. */
  onCountryCodeChange: (code: string) => void;
}

export default function LeadCaptureFields({
  register,
  errors,
  whatsappRequired = true,
  showLabels = false,
  placeholders,
  countryCode,
  onCountryCodeChange,
}: LeadCaptureFieldsProps) {
  return (
    <>
      <div className={showLabels ? 'text-left' : undefined}>
        {showLabels && (
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            First name
          </label>
        )}
        <input
          {...register('firstName', { required: 'We need your name!' })}
          placeholder={placeholders?.firstName ?? 'First name'}
          className={cn(INPUT_BASE, errors.firstName ? 'border-salty-burnt-red' : 'border-salty-beige')}
        />
        {errors.firstName && <p className={ERROR_CLASS}>{errors.firstName.message}</p>}
      </div>

      <div className={showLabels ? 'text-left' : undefined}>
        {showLabels && (
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            Email
          </label>
        )}
        <input
          {...register('email', {
            required: 'We need your email',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "That doesn't look like an email",
            },
          })}
          type="email"
          placeholder={placeholders?.email ?? 'Email'}
          className={cn(INPUT_BASE, errors.email ? 'border-salty-burnt-red' : 'border-salty-beige')}
        />
        {errors.email && <p className={ERROR_CLASS}>{errors.email.message}</p>}
      </div>

      <div className={showLabels ? 'text-left' : undefined}>
        {showLabels && (
          <label className="font-body text-sm font-bold text-salty-deep-teal block mb-1">
            WhatsApp number
          </label>
        )}
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className={cn(
              'w-28 px-2 py-3 rounded-xl border-2 border-salty-beige bg-salty-cream font-body text-sm',
              'focus:outline-none focus:border-salty-orange-red transition-colors'
            )}
          >
            {countryCodes.map((cc) => (
              <option key={cc.code} value={cc.dialCode}>
                {cc.flag} {cc.dialCode}
              </option>
            ))}
          </select>
          <input
            {...register('whatsappNumber', {
              ...(whatsappRequired
                ? { required: 'We need your WhatsApp for trip updates', minLength: { value: 7, message: 'That seems too short' } }
                : {}),
            })}
            type="tel"
            placeholder={placeholders?.whatsappNumber ?? '(555) 123-4567'}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl border-2 font-body text-sm bg-salty-cream',
              'focus:outline-none focus:border-salty-orange-red transition-colors',
              errors.whatsappNumber ? 'border-salty-burnt-red' : 'border-salty-beige'
            )}
          />
        </div>
        {errors.whatsappNumber && <p className={ERROR_CLASS}>{errors.whatsappNumber.message}</p>}
      </div>
    </>
  );
}
