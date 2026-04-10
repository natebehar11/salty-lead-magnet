'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Retreat } from '@/types';
import { usePlannerStore } from '@/stores/planner-store';
import ChatRecommendationCard from './ChatRecommendationCard';
import DiscoveryOptions from './DiscoveryOptions';
import { useDiscoveryFlow } from '@/hooks/useDiscoveryFlow';
import { usePlannerChat } from '@/hooks/usePlannerChat';

/** Hide suggestion chips once the conversation has this many visible messages */
const MAX_MESSAGES_FOR_CHIPS = 8;
/** Max chips shown at once in the suggestion row */
const MAX_VISIBLE_CHIPS = 4;

interface PlannerChatPanelProps {
  retreat: Retreat;
}

export default function PlannerChatPanel({ retreat }: PlannerChatPanelProps) {
  const messages = usePlannerStore((s) => s.messages);

  const chat = usePlannerChat({ retreat });
  const discovery = useDiscoveryFlow({
    retreat,
    onDiscoveryComplete: (prompt) => chat.sendToAPI(prompt, true),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.isGenerating]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const visibleMessages = messages.filter((m) => !m.isAutoGreeting);
  const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];

  const shouldShowDiscoveryOptions =
    discovery.isDiscoveryActive &&
    lastVisibleMessage?.role === 'assistant' &&
    !chat.isGenerating;

  // Filter out used chips — only show when discovery is complete
  const availableFeelingChips =
    discovery.discoveryStage === 'complete' && chat.suggestionData.type === 'feeling'
      ? chat.suggestionData.chips.filter((c) => !chat.usedChips.current.has(c.label))
      : [];
  const availableFollowupChips =
    discovery.discoveryStage === 'complete' && chat.suggestionData.type === 'followup'
      ? chat.suggestionData.chips.filter((c) => !chat.usedChips.current.has(c))
      : [];
  const hasAvailableChips = availableFeelingChips.length > 0 || availableFollowupChips.length > 0;

  const shouldShowReengagementChips =
    discovery.showReengagement &&
    discovery.discoveryStage === 'complete' &&
    !chat.isGenerating &&
    lastVisibleMessage?.role === 'assistant' &&
    lastVisibleMessage?.recommendations &&
    lastVisibleMessage.recommendations.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Text bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-salty-deep-teal text-white rounded-br-md'
                    : 'bg-salty-cream border border-salty-beige/50 text-salty-deep-teal rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>

              {/* Recommendation cards (only for assistant messages) */}
              {msg.role === 'assistant' && msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full max-w-[85%] mt-2 space-y-1.5">
                  {msg.recommendations.map((rec) => (
                    <ChatRecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      isOnBoard={chat.isItemOnBoard(rec)}
                      onAdd={(r) => chat.handleAddToBoard(r, msg.id)}
                      messageId={msg.id}
                    />
                  ))}

                  {/* Add All button when 2+ un-added recommendations */}
                  {msg.recommendations.filter((r) => !chat.isItemOnBoard(r)).length >= 2 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => chat.handleAddAllToBoard(msg.recommendations!, msg.id)}
                      className="w-full py-2 rounded-xl border border-dashed border-salty-deep-teal/20 text-salty-deep-teal/50 font-body text-xs hover:border-salty-deep-teal/40 hover:text-salty-deep-teal hover:bg-salty-beige/10 transition-all"
                    >
                      + Add all to board
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Discovery options (rendered inline after the last assistant message) */}
        {shouldShowDiscoveryOptions && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-[85%]"
          >
            {discovery.discoveryStage === 'location' && (
              <DiscoveryOptions
                options={discovery.getLocationOptions()}
                mode="single"
                onSelect={discovery.handleDiscoveryLocationSelect}
                expandableValues={['specific-places']}
                allowCustom={false}
                disabled={chat.isGenerating}
              />
            )}
            {discovery.discoveryStage === 'vibe' && (
              <DiscoveryOptions
                options={discovery.getVibeOptions()}
                mode="single"
                onSelect={discovery.handleDiscoveryVibeSelect}
                allowCustom={false}
                disabled={chat.isGenerating}
              />
            )}
            {discovery.discoveryStage === 'types' && (
              <DiscoveryOptions
                options={discovery.getTypesOptions()}
                mode="multi"
                onSelect={() => {}}
                onSubmit={discovery.handleDiscoveryTypesSubmit}
                allowCustom={false}
                disabled={chat.isGenerating}
                showSelectAll={true}
              />
            )}
          </motion.div>
        )}

        {/* Re-engagement chips after first post-discovery response */}
        {shouldShowReengagementChips && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-[85%]"
          >
            <DiscoveryOptions
              options={discovery.REENGAGEMENT_OPTIONS}
              mode="reengagement"
              onSelect={discovery.handleReengagement}
              allowCustom={false}
              disabled={chat.isGenerating}
            />
          </motion.div>
        )}

        {/* Typing indicator */}
        {chat.isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start"
          >
            <div className="bg-salty-cream border border-salty-beige/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-salty-deep-teal/30 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-salty-deep-teal/30 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-salty-deep-teal/30 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips (only when discovery is complete) */}
      {discovery.discoveryStage === 'complete' && visibleMessages.length > 0 && visibleMessages.length < MAX_MESSAGES_FOR_CHIPS && !chat.isGenerating && hasAvailableChips && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested topics">
          {availableFeelingChips.length > 0
            ? availableFeelingChips.slice(0, MAX_VISIBLE_CHIPS).map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => chat.handleChipClick(chip.label, chip.prompt)}
                  aria-label={`I want: ${chip.label}`}
                  className="font-body text-[11px] px-2.5 py-1.5 rounded-full border border-salty-beige/60 text-salty-slate/50 hover:border-salty-deep-teal/30 hover:text-salty-deep-teal transition-all flex items-center gap-1"
                >
                  <span className="text-[10px]">{chip.icon}</span>
                  {chip.label}
                </button>
              ))
            : availableFollowupChips.slice(0, MAX_VISIBLE_CHIPS).map((chip) => (
                <button
                  key={chip}
                  onClick={() => chat.handleChipClick(chip, chip)}
                  aria-label={`Ask about: ${chip}`}
                  className="font-body text-[11px] px-2.5 py-1.5 rounded-full border border-salty-beige/60 text-salty-slate/50 hover:border-salty-deep-teal/30 hover:text-salty-deep-teal transition-all"
                >
                  {chip}
                </button>
              ))
          }
        </div>
      )}

      {/* Mobile board nudge toast */}
      <AnimatePresence>
        {chat.boardNudge && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => chat.setMobileActiveTab('board')}
            className="lg:hidden mx-4 mb-2 py-2 px-4 rounded-xl bg-salty-seafoam/20 border border-salty-seafoam/40 text-salty-deep-teal font-body text-xs text-center active:scale-[0.98] transition-transform"
          >
            Added to your board! <span className="font-bold">Tap to view →</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 border-t border-salty-beige/30">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={chat.inputValue}
            onChange={(e) => chat.setInputValue(e.target.value)}
            onKeyDown={chat.handleKeyDown}
            placeholder={
              discovery.isDiscoveryActive
                ? 'Or type anything to skip ahead...'
                : 'Ask about places, food, activities...'
            }
            disabled={chat.isGenerating}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-salty-beige bg-white text-salty-deep-teal font-body text-sm placeholder:text-salty-slate/30 focus:border-salty-deep-teal/40 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={chat.handleSend}
            disabled={!chat.inputValue.trim() || chat.isGenerating}
            className="w-10 h-10 rounded-full bg-salty-orange-red border-2 border-salty-deep-teal flex items-center justify-center text-white hover:bg-salty-burnt-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
