'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlannerStore } from '@/stores/planner-store';
import { ChatMessage } from '@/types/planner';
import Button from '@/components/shared/Button';

interface PlannerChatProps {
  destination: string;
  retreatName: string;
}

const SUGGESTION_CHIPS = [
  'Best food scenes',
  'Nightlife spots',
  'Nature and hiking',
  'Hidden gems',
  'Beach towns nearby',
  'Cultural experiences',
];

export default function PlannerChat({ destination, retreatName }: PlannerChatProps) {
  const {
    conversationHistory,
    addMessage,
    setSuggestion,
    setAllCitiesChecked,
  } = usePlannerStore();

  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const createMessage = (role: 'user' | 'assistant', content: string): ChatMessage => ({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: Date.now(),
  });

  const getExistingCities = () => {
    const { beforeCities, afterCities } = usePlannerStore.getState();
    return [
      ...beforeCities.filter((c) => c.name).map((c) => c.name),
      ...afterCities.filter((c) => c.name).map((c) => c.name),
    ];
  };

  const handleSuggest = async (userText?: string) => {
    setIsGenerating(true);

    // Add user message if there's text
    if (userText) {
      addMessage(createMessage('user', userText));
    }

    try {
      const { conversationHistory: history } = usePlannerStore.getState();
      const existingCities = getExistingCities();

      const res = await fetch('/api/planner/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          retreatName,
          mode: 'suggest',
          userPrompt: userText || usePlannerStore.getState().prompt || undefined,
          existingCities: existingCities.length > 0 ? existingCities : undefined,
          conversationHistory: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestion(data);
        setAllCitiesChecked(data.cities.map((c: { id: string }) => c.id));

        // Add AI summary message
        const cityNames = data.cities.map((c: { name: string }) => c.name).join(', ');
        addMessage(
          createMessage(
            'assistant',
            `Here's your plan! I've suggested ${data.cities.length} cities (${cityNames}) for ${data.totalDays} total days. ${data.reasoning} Check out the itinerary below!`
          )
        );
      } else {
        addMessage(createMessage('assistant', 'Sorry, I had trouble generating suggestions. Try again in a moment!'));
      }
    } catch {
      addMessage(createMessage('assistant', 'Something went wrong. Please try again!'));
    } finally {
      setIsGenerating(false);
      setInputValue('');
    }
  };

  const handleBrainstorm = async (userText?: string) => {
    setIsGenerating(true);

    const messageText = userText || inputValue || '';

    if (messageText) {
      addMessage(createMessage('user', messageText));
    }

    try {
      const { conversationHistory: history } = usePlannerStore.getState();

      const res = await fetch('/api/planner/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          retreatName,
          mode: 'brainstorm',
          userPrompt: messageText || undefined,
          conversationHistory: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addMessage(createMessage('assistant', data.message));
      } else {
        addMessage(createMessage('assistant', 'Sorry, I had trouble responding. Try again!'));
      }
    } catch {
      addMessage(createMessage('assistant', 'Something went wrong. Please try again!'));
    } finally {
      setIsGenerating(false);
      setInputValue('');
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    // If there's already a conversation, continue brainstorming
    if (conversationHistory.length > 0) {
      handleBrainstorm(text);
    } else {
      // First message defaults to brainstorm
      handleBrainstorm(text);
    }
  };

  const handleChipClick = (chipText: string) => {
    if (isGenerating) return;
    handleBrainstorm(chipText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showChips = conversationHistory.length === 0;

  return (
    <div className="bg-salty-beige/30 rounded-2xl p-6 sm:p-8">
      {/* Messages area */}
      {conversationHistory.length > 0 && (
        <div className="max-h-80 overflow-y-auto mb-4 space-y-3 scroll-smooth">
          <AnimatePresence initial={false}>
            {conversationHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-salty-deep-teal/10 text-salty-deep-teal'
                      : 'bg-salty-cream text-salty-deep-teal border border-salty-beige'
                  }`}
                >
                  <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-salty-cream rounded-xl px-4 py-3 border border-salty-beige">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-salty-slate/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-salty-slate/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-salty-slate/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Suggestion chips */}
      {showChips && (
        <div className="mb-4">
          <p className="font-body text-xs text-salty-slate/50 mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                disabled={isGenerating}
                className="font-body text-xs text-salty-deep-teal bg-salty-cream border border-salty-beige px-3 py-1.5 rounded-full hover:border-salty-deep-teal/30 hover:bg-salty-beige/50 transition-all disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your trip..."
          disabled={isGenerating}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-salty-beige bg-salty-cream font-body text-sm focus:outline-none focus:border-salty-orange-red transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isGenerating}
          className="w-10 h-10 rounded-full bg-salty-orange-red text-white flex items-center justify-center hover:bg-salty-burnt-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          onClick={() => handleSuggest(inputValue.trim() || undefined)}
          variant="yellow"
          size="md"
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? 'Thinking...' : 'Suggest Plans'}
        </Button>
        <Button
          onClick={() => handleBrainstorm()}
          variant="secondary"
          size="md"
          disabled={isGenerating}
          className="flex-1"
        >
          Help me brainstorm
        </Button>
      </div>
    </div>
  );
}
