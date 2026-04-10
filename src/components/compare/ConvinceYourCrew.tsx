'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/components/shared/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { countryCodes } from '@/data/country-codes';
import { useCurrencyStore } from '@/stores/currency-store';
import { convertAmount } from '@/lib/currency';

type CaptureMode = 'solo' | 'crew';

interface ConvinceYourCrewProps {
  isVisible: boolean;
  bestSavingsAmount: number;
  bestSavingsPercent: number;
  bestRetreatSlug: string;
}

interface SoloFormData {
  firstName: string;
  email: string;
  whatsappNumber: string;
}

interface CrewFormData {
  senderName: string;
  senderEmail: string;
  friendEmail1: string;
  friendEmail2: string;
  friendEmail3: string;
}

// Shared input styles
const inputBase = 'w-full px-4 py-3 rounded-xl border-2 font-body text-sm bg-white/10 text-white placeholder-white/30 focus:outline-none focus:border-salty-salmon transition-colors';
const inputError = 'border-salty-rust';
const inputNormal = 'border-white/20';
const errorText = 'font-body text-xs text-salty-salmon text-left';

const LEAD_STORAGE_KEY = 'salty-pending-lead';

/** Try to send a pending lead from localStorage (retry on revisit) */
function retryPendingLead() {
  try {
    const pending = localStorage.getItem(LEAD_STORAGE_KEY);
    if (!pending) return;
    const { url, body } = JSON.parse(pending);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) localStorage.removeItem(LEAD_STORAGE_KEY);
      })
      .catch(() => { /* will retry next visit */ });
  } catch {
    localStorage.removeItem(LEAD_STORAGE_KEY);
  }
}

function GroupPricingDetails() {
  return (
    <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto text-left space-y-3">
      <p className="font-display text-sm text-salty-yellow uppercase tracking-wider">
        Group Pricing Details
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-salty-salmon font-bold shrink-0">3-4</span>
          <p className="font-body text-sm text-white/70">
            Book together and get early-bird pricing locked in, even after it expires.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-salty-salmon font-bold shrink-0">5+</span>
          <p className="font-body text-sm text-white/70">
            Private group rate — message us on WhatsApp for a custom quote.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-salty-salmon font-bold shrink-0">8+</span>
          <p className="font-body text-sm text-white/70">
            One person books free. Yes, really. The group organizer gets their spot comped.
          </p>
        </div>
      </div>
      <div className="pt-3 border-t border-white/10">
        <Button
          href="https://wa.me/14318291135?text=Hey%21%20My%20group%20is%20interested%20in%20a%20SALTY%20retreat.%20Can%20we%20chat%20about%20group%20rates%3F"
          variant="secondary"
          size="sm"
          className="w-full border-white text-white hover:bg-white hover:text-salty-deep-teal"
        >
          Chat About Group Rates
        </Button>
      </div>
    </div>
  );
}

export default function ConvinceYourCrew({
  isVisible,
  bestSavingsAmount,
  bestSavingsPercent,
  bestRetreatSlug,
}: ConvinceYourCrewProps) {
  const [mode, setMode] = useState<CaptureMode>('solo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [friendCount, setFriendCount] = useState(1);
  const [countryCode, setCountryCode] = useState('+1');

  const { selectedCurrency, rates } = useCurrencyStore();
  const rate = rates[selectedCurrency];
  const fmtSavings = bestSavingsAmount > 0
    ? formatCurrency(convertAmount(bestSavingsAmount, rate), selectedCurrency)
    : null;

  const soloForm = useForm<SoloFormData>();
  const crewForm = useForm<CrewFormData>();

  // Retry any pending lead from a previous failed attempt (on mount, client-only)
  useEffect(() => { retryPendingLead(); }, []);

  const onSoloSubmit = async (data: SoloFormData) => {
    setIsSubmitting(true);
    const fullWhatsApp = `${countryCode}${data.whatsappNumber.replace(/^0+/, '')}`;

    const url = '/api/leads/capture';
    const body = {
      firstName: data.firstName,
      email: data.email,
      whatsappNumber: fullWhatsApp,
      source: 'compare',
      intentAction: 'view_compare',
      intentDetails: {
        savingsAmount: String(bestSavingsAmount),
        savingsPercent: String(bestSavingsPercent),
        retreatSlug: bestRetreatSlug,
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API returned non-OK');
    } catch {
      // Store for retry on next visit
      try { localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify({ url, body })); } catch { /* storage full */ }
      // Also try sendBeacon as a last-ditch effort
      try { navigator.sendBeacon(url, JSON.stringify(body)); } catch { /* unsupported */ }
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const onCrewSubmit = async (data: CrewFormData) => {
    setIsSubmitting(true);
    const friendEmails = [data.friendEmail1, data.friendEmail2, data.friendEmail3].filter(Boolean);

    const url = '/api/leads/share-comparison';
    const body = {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      friendEmails,
      retreatSlug: bestRetreatSlug,
      savingsAmount: bestSavingsAmount,
      savingsPercent: bestSavingsPercent,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API returned non-OK');
    } catch {
      try { localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify({ url, body })); } catch { /* storage full */ }
      try { navigator.sendBeacon(url, JSON.stringify(body)); } catch { /* unsupported */ }
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <div className="bg-salty-deep-teal rounded-2xl p-8 text-center">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="font-display text-sm text-salty-salmon uppercase tracking-widest mb-2">
                    Like what you see?
                  </p>
                  <h3 className="font-display text-section text-white mb-3">
                    Unlock group pricing details
                  </h3>
                  <p className="font-body text-sm text-white/50 mb-6 max-w-md mx-auto">
                    Drop your details or share the savings with your crew — either way, you&apos;ll get the inside scoop on group rates.
                    {fmtSavings && (
                      <span className="block mt-1 text-salty-yellow font-bold">
                        Up to {fmtSavings} ({bestSavingsPercent}%) in savings found.
                      </span>
                    )}
                  </p>

                  {/* Mode Toggle */}
                  <div className="flex justify-center gap-1 mb-6 bg-white/5 rounded-full p-1 max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => setMode('solo')}
                      className={cn(
                        'flex-1 px-4 py-2 rounded-full font-display text-xs uppercase tracking-wider transition-all',
                        mode === 'solo'
                          ? 'bg-salty-salmon text-white'
                          : 'text-white/40 hover:text-white/60'
                      )}
                    >
                      Save for Me
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('crew')}
                      className={cn(
                        'flex-1 px-4 py-2 rounded-full font-display text-xs uppercase tracking-wider transition-all',
                        mode === 'crew'
                          ? 'bg-salty-salmon text-white'
                          : 'text-white/40 hover:text-white/60'
                      )}
                    >
                      Rally My Crew
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {mode === 'solo' ? (
                      <motion.form
                        key="solo-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={soloForm.handleSubmit(onSoloSubmit)}
                        className="max-w-sm mx-auto space-y-3"
                      >
                        <input
                          {...soloForm.register('firstName', { required: 'We need your name' })}
                          placeholder="First name"
                          className={cn(inputBase, soloForm.formState.errors.firstName ? inputError : inputNormal)}
                        />
                        {soloForm.formState.errors.firstName && (
                          <p className={errorText}>{soloForm.formState.errors.firstName.message}</p>
                        )}

                        <input
                          {...soloForm.register('email', {
                            required: 'We need your email',
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That doesn't look like an email" },
                          })}
                          type="email"
                          placeholder="Email"
                          className={cn(inputBase, soloForm.formState.errors.email ? inputError : inputNormal)}
                        />
                        {soloForm.formState.errors.email && (
                          <p className={errorText}>{soloForm.formState.errors.email.message}</p>
                        )}

                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className={cn(inputBase, inputNormal, 'w-28')}
                          >
                            {countryCodes.map((cc) => (
                              <option key={cc.code} value={cc.dialCode} className="bg-salty-deep-teal text-white">
                                {cc.flag} {cc.dialCode}
                              </option>
                            ))}
                          </select>
                          <input
                            {...soloForm.register('whatsappNumber', {
                              required: 'WhatsApp for trip updates',
                              minLength: { value: 7, message: 'Too short' },
                            })}
                            type="tel"
                            placeholder="WhatsApp number"
                            className={cn(inputBase, 'flex-1', soloForm.formState.errors.whatsappNumber ? inputError : inputNormal)}
                          />
                        </div>
                        {soloForm.formState.errors.whatsappNumber && (
                          <p className={errorText}>{soloForm.formState.errors.whatsappNumber.message}</p>
                        )}

                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full mt-2">
                          {isSubmitting ? 'Saving...' : 'Get the Inside Scoop'}
                        </Button>

                        <p className="font-body text-[10px] text-white/20">
                          We&apos;ll only message you about trips you&apos;re interested in. No spam. Pinky promise.
                        </p>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="crew-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={crewForm.handleSubmit(onCrewSubmit)}
                        className="max-w-sm mx-auto space-y-3"
                      >
                        <input
                          {...crewForm.register('senderName', { required: 'We need your name' })}
                          placeholder="Your first name"
                          className={cn(inputBase, crewForm.formState.errors.senderName ? inputError : inputNormal)}
                        />
                        {crewForm.formState.errors.senderName && (
                          <p className={errorText}>{crewForm.formState.errors.senderName.message}</p>
                        )}

                        <input
                          {...crewForm.register('senderEmail', {
                            required: 'We need your email',
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That doesn't look like an email" },
                          })}
                          type="email"
                          placeholder="Your email"
                          className={cn(inputBase, crewForm.formState.errors.senderEmail ? inputError : inputNormal)}
                        />
                        {crewForm.formState.errors.senderEmail && (
                          <p className={errorText}>{crewForm.formState.errors.senderEmail.message}</p>
                        )}

                        {/* Divider */}
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-white/10" />
                          <span className="font-body text-xs text-white/30 uppercase tracking-wider">Your crew</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <input
                          {...crewForm.register('friendEmail1', {
                            required: 'Add at least one friend',
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That doesn't look like an email" },
                          })}
                          type="email"
                          placeholder="Friend's email"
                          className={cn(inputBase, crewForm.formState.errors.friendEmail1 ? inputError : inputNormal)}
                        />
                        {crewForm.formState.errors.friendEmail1 && (
                          <p className={errorText}>{crewForm.formState.errors.friendEmail1.message}</p>
                        )}

                        {friendCount >= 2 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <input
                              {...crewForm.register('friendEmail2', {
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That doesn't look like an email" },
                              })}
                              type="email"
                              placeholder="Another friend's email"
                              className={cn(inputBase, crewForm.formState.errors.friendEmail2 ? inputError : inputNormal)}
                            />
                          </motion.div>
                        )}

                        {friendCount >= 3 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <input
                              {...crewForm.register('friendEmail3', {
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That doesn't look like an email" },
                              })}
                              type="email"
                              placeholder="One more friend"
                              className={cn(inputBase, crewForm.formState.errors.friendEmail3 ? inputError : inputNormal)}
                            />
                          </motion.div>
                        )}

                        {friendCount < 3 && (
                          <button
                            type="button"
                            onClick={() => setFriendCount((c) => Math.min(c + 1, 3))}
                            className="font-body text-xs text-salty-salmon font-bold hover:underline"
                          >
                            + Add another friend
                          </button>
                        )}

                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full mt-2">
                          {isSubmitting ? 'Sending...' : 'Send & Unlock Group Rates'}
                        </Button>

                        <p className="font-body text-[10px] text-white/20">
                          We&apos;ll send them the comparison. No spam, ever.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4"
                >
                  <div className="stamp-badge mx-auto mb-4">
                    <div className="stamp-badge-inner">
                      <span className="stamp-amount text-sm">YOU&apos;RE</span>
                      <span className="stamp-amount">IN</span>
                    </div>
                  </div>

                  <h3 className="font-display text-section text-white mb-3">
                    {mode === 'crew' ? "Your crew's been sent the goods." : "You're on the list."}
                  </h3>
                  <p className="font-body text-sm text-white/50 mb-6 max-w-md mx-auto">
                    {mode === 'crew'
                      ? "They'll get the full savings breakdown. Now here's the inside scoop on group pricing:"
                      : "Here's the inside scoop on group pricing — bring friends for even better rates:"}
                  </p>

                  <GroupPricingDetails />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
