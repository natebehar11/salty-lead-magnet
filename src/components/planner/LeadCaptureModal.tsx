'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Retreat } from '@/types';
import { usePlannerStore } from '@/stores/planner-store';
import { SharedBoardItemData } from '@/lib/shared-plans';
import { getBoardItemCount, getBoardCityCount } from '@/lib/board-utils';
import { formatDateRange, cn } from '@/lib/utils';
import { getExistingLead } from '@/lib/lead-state';
import { countryCodes } from '@/data/country-codes';
import ShareButton from '@/components/shared/ShareButton';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  retreat: Retreat;
  mode: 'share' | 'email';
}

export default function LeadCaptureModal({ isOpen, onClose, retreat, mode }: LeadCaptureModalProps) {
  const boardItems = usePlannerStore((s) => s.boardItems);
  const formSubmitted = usePlannerStore((s) => s.formSubmitted);
  const creatorName = usePlannerStore((s) => s.creatorName);
  const creatorEmail = usePlannerStore((s) => s.creatorEmail);
  const sharedPlanUrl = usePlannerStore((s) => s.sharedPlanUrl);
  const setCreatorName = usePlannerStore((s) => s.setCreatorName);
  const setCreatorEmail = usePlannerStore((s) => s.setCreatorEmail);
  const setFormSubmitted = usePlannerStore((s) => s.setFormSubmitted);
  const setHasShared = usePlannerStore((s) => s.setHasShared);
  const setSharedPlanUrl = usePlannerStore((s) => s.setSharedPlanUrl);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  // Local override allows switching from email→share within the modal
  const [modeOverride, setModeOverride] = useState<'share' | 'email' | null>(null);

  const itemCount = getBoardItemCount(boardItems);
  const cityCount = getBoardCityCount(boardItems);

  // Reset override when parent mode changes (modal reopened with different intent)
  useEffect(() => {
    setModeOverride(null);
  }, [mode]);

  // Hydrate from quiz/flight stores when modal opens (so returning leads don't re-enter info)
  useEffect(() => {
    if (isOpen && !creatorName && !creatorEmail) {
      const existing = getExistingLead();
      if (existing) {
        setCreatorName(existing.firstName);
        setCreatorEmail(existing.email);
      }
    }
  }, [isOpen, creatorName, creatorEmail, setCreatorName, setCreatorEmail]);

  const activeMode = modeOverride || mode;
  const isShareMode = activeMode === 'share';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorName.trim() || !creatorEmail.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const fullWhatsApp = whatsappNumber.trim()
      ? `${countryCode}${whatsappNumber.trim().replace(/^0+/, '')}`
      : '';

    try {
      // 1. Capture lead
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: creatorName.trim(),
          email: creatorEmail.trim(),
          whatsappNumber: fullWhatsApp,
          source: isShareMode ? 'planner-v2-share' : 'planner-v2-email',
          retreatSlug: retreat.slug,
          boardItemCount: itemCount,
          boardCityCount: cityCount,
          intentAction: isShareMode ? 'share_board' : 'email_board',
          intentDetails: {
            boardItemCount: String(itemCount),
            boardCityCount: String(cityCount),
          },
        }),
      });

      if (isShareMode) {
        // 2a. Create shared plan (share mode)
        const sharedBoardItems: SharedBoardItemData[] = boardItems.map((item) => ({
          id: item.id,
          type: item.type,
          cityName: item.cityName,
          country: item.country,
          name: item.name,
          description: item.description,
          activityCategory: item.activityCategory,
          days: item.days,
          priceRange: item.priceRange,
          imageUrl: item.imageUrl,
        }));

        const planRes = await fetch('/api/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: 2,
            creatorName: creatorName.trim(),
            creatorEmail: creatorEmail.trim(),
            retreatSlug: retreat.slug,
            retreatName: retreat.title,
            retreatDates: formatDateRange(retreat.startDate, retreat.endDate),
            boardItems: sharedBoardItems,
            topLevelOrder: usePlannerStore.getState().topLevelOrder,
            cityOrderByCountry: usePlannerStore.getState().cityOrderByCountry,
            boardViewMode: usePlannerStore.getState().boardViewMode,
            beforeAfterAssignment: usePlannerStore.getState().beforeAfterAssignment,
          }),
        });

        if (!planRes.ok) throw new Error('Failed to create plan');

        const planData = await planRes.json();
        const planUrl = `${window.location.origin}/plan/${planData.plan.id}`;

        setFormSubmitted(true);
        setHasShared(true);
        setSharedPlanUrl(planUrl);
      } else {
        // 2b. Email mode — just confirm the save (lead capture + board data already sent)
        setFormSubmitted(true);
        setEmailSent(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const shareText = `🌴 I'm planning a trip to ${retreat.destination || retreat.title} and I need your vote!\n\n${cityCount} ${cityCount === 1 ? 'city' : 'cities'}, ${itemCount} activities — react to the ones you love 👀❤️\n\nJoin the plan:`;
  const whatsappShareText = `Hey! I'm planning a trip to ${retreat.destination || retreat.title} with SALTY 🌊\n\nI built a trip board with ${itemCount} activities across ${cityCount} ${cityCount === 1 ? 'city' : 'cities'} — check it out and react to the ones you love!\n\n`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-salty-cream rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-salty-slate/40 hover:text-salty-deep-teal hover:bg-salty-beige/30 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {!formSubmitted ? (
              <>
                <h3 className="font-display text-lg text-salty-deep-teal tracking-wider uppercase">
                  {isShareMode ? 'Share Your Trip Board' : 'Save Your Trip Board'}
                </h3>
                <p className="font-body text-sm text-salty-slate/60 mt-2 leading-relaxed">
                  {isShareMode
                    ? 'Get a shareable link to send to friends and rally your crew.'
                    : "We'll save your board so you can come back to it anytime."
                  }
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="First name"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-salty-beige bg-white text-salty-deep-teal font-body text-sm placeholder:text-salty-slate/30 focus:border-salty-deep-teal/40 focus:outline-none transition-colors"
                  />
                  <input
                    type="email"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-salty-beige bg-white text-salty-deep-teal font-body text-sm placeholder:text-salty-slate/30 focus:border-salty-deep-teal/40 focus:outline-none transition-colors"
                  />
                  {isShareMode && (
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className={cn(
                          'w-28 px-2 py-3 rounded-xl border-2 border-salty-beige bg-white font-body text-sm',
                          'focus:border-salty-deep-teal/40 focus:outline-none transition-colors'
                        )}
                      >
                        {countryCodes.map((cc) => (
                          <option key={cc.code} value={cc.dialCode}>
                            {cc.flag} {cc.dialCode}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-salty-beige bg-white text-salty-deep-teal font-body text-sm placeholder:text-salty-slate/30 focus:border-salty-deep-teal/40 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="font-body text-xs text-salty-orange-red">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !creatorName.trim() || !creatorEmail.trim()}
                    className="w-full rounded-full bg-salty-orange-red text-white font-display text-xs tracking-wider uppercase px-6 py-3.5 hover:bg-salty-burnt-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isSubmitting
                      ? (isShareMode ? 'Creating your link...' : 'Saving...')
                      : (isShareMode ? 'Get My Shareable Link' : 'Save My Board')
                    }
                  </button>
                </form>
              </>
            ) : isShareMode ? (
              /* Share mode success */
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-display text-lg text-salty-deep-teal tracking-wider uppercase">
                  Your Board is Ready!
                </h3>
                <p className="font-body text-sm text-salty-slate/60 mt-2 leading-relaxed">
                  Send this to your crew — they can react to activities and mark themselves as &ldquo;in.&rdquo;
                </p>

                {sharedPlanUrl && (
                  <div className="mt-4 space-y-3">
                    {/* URL display + copy */}
                    <div className="bg-white rounded-xl px-4 py-3 border border-salty-beige/50 flex items-center gap-2">
                      <span className="flex-1 font-body text-xs text-salty-deep-teal truncate">
                        {sharedPlanUrl}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(sharedPlanUrl)}
                        className="flex-shrink-0 text-xs font-display tracking-wider uppercase text-salty-orange-red hover:text-salty-burnt-red transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Primary: WhatsApp deep link */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(whatsappShareText + sharedPlanUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setHasShared(true)}
                      className="flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-display text-xs tracking-wider uppercase text-white transition-colors hover:brightness-110 active:scale-[0.98]"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Send via WhatsApp
                    </a>

                    {/* Secondary: Other share options */}
                    <ShareButton
                      title={`My ${retreat.title} Trip Board`}
                      text={shareText}
                      url={sharedPlanUrl}
                      onShare={() => setHasShared(true)}
                    />
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="mt-4 font-body text-sm text-salty-slate/50 underline underline-offset-4 hover:text-salty-deep-teal transition-colors"
                >
                  Back to planning
                </button>
              </div>
            ) : (
              /* Email mode success */
              <div className="text-center">
                <div className="text-4xl mb-3">✉️</div>
                <h3 className="font-display text-lg text-salty-deep-teal tracking-wider uppercase">
                  {emailSent ? 'Board Saved!' : 'Saved!'}
                </h3>
                <p className="font-body text-sm text-salty-slate/60 mt-2 leading-relaxed">
                  Your trip board for <span className="font-bold text-salty-deep-teal">{retreat.title}</span> has been saved.
                  {cityCount > 0 && <> {cityCount} {cityCount === 1 ? 'city' : 'cities'}, {itemCount} activities — not bad!</>}
                </p>
                <p className="font-body text-xs text-salty-slate/40 mt-3">
                  Your board is saved. Want to share it with friends too?
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      // Switch to share mode within the modal
                      setModeOverride('share');
                      setFormSubmitted(false);
                      setEmailSent(false);
                    }}
                    className="w-full rounded-full bg-salty-orange-red text-white font-display text-xs tracking-wider uppercase px-6 py-3 hover:bg-salty-burnt-red transition-colors active:scale-[0.98]"
                  >
                    Share with Friends
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full font-body text-sm text-salty-slate/50 underline underline-offset-4 hover:text-salty-deep-teal transition-colors py-2"
                  >
                    Keep planning
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
