'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DiscoveryOption } from '@/lib/discovery-messages';

interface DiscoveryOptionsProps {
  options: DiscoveryOption[];
  mode: 'single' | 'multi' | 'reengagement';
  onSelect: (value: string) => void;
  onSubmit?: (values: string[]) => void;
  /** Values that expand a text input when selected (e.g. "specific-places") */
  expandableValues?: string[];
  allowCustom: boolean;
  disabled: boolean;
  showSelectAll?: boolean;
}

export default function DiscoveryOptions({
  options,
  mode,
  onSelect,
  onSubmit,
  expandableValues = [],
  allowCustom,
  disabled,
  showSelectAll = false,
}: DiscoveryOptionsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTextInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextInput]);

  if (mode === 'single') {
    return (
      <div className="space-y-2">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose an option"
        >
          {options.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={disabled}
              onClick={() => {
                if (expandableValues.includes(opt.value)) {
                  setShowTextInput(true);
                  return;
                }
                onSelect(opt.value);
              }}
              aria-label={opt.label}
              className={cn(
                'font-body text-xs px-3.5 py-2 rounded-full border transition-all',
                'flex items-center gap-1.5',
                'border-salty-beige text-salty-deep-teal',
                'hover:border-salty-deep-teal/40 hover:bg-salty-beige/20',
                'active:scale-[0.97]',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </motion.button>
          ))}

          {allowCustom && !showTextInput && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: options.length * 0.05 }}
              disabled={disabled}
              onClick={() => setShowTextInput(true)}
              aria-label="Type something else"
              className={cn(
                'font-body text-xs px-3.5 py-2 rounded-full border transition-all',
                'border-dashed border-salty-beige/60 text-salty-slate/40',
                'hover:border-salty-deep-teal/30 hover:text-salty-deep-teal',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              Something else...
            </motion.button>
          )}
        </div>

        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textValue.trim()) {
                  onSelect(textValue.trim());
                }
              }}
              placeholder="Type your answer..."
              disabled={disabled}
              className={cn(
                'flex-1 font-body text-sm px-3.5 py-2 rounded-xl border border-salty-beige',
                'text-salty-deep-teal placeholder:text-salty-slate/30',
                'focus:outline-none focus:border-salty-deep-teal/40',
                disabled && 'opacity-50',
              )}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={disabled || !textValue.trim()}
              onClick={() => {
                if (textValue.trim()) onSelect(textValue.trim());
              }}
              aria-label="Submit custom answer"
              className={cn(
                'font-body text-xs px-3.5 py-2 rounded-xl transition-all',
                'bg-salty-orange-red text-white hover:bg-salty-burnt-red',
                (!textValue.trim() || disabled) && 'opacity-40 pointer-events-none',
              )}
            >
              Go
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }

  if (mode === 'multi') {
    const allValues = options.map((o) => o.value);
    const isAllSelected = allValues.every((v) => selected.has(v));

    function toggleValue(value: string) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return next;
      });
    }

    function handleSelectAll() {
      setSelected(new Set(allValues));
      // Auto-submit after selecting all
      onSubmit?.(allValues);
    }

    return (
      <div className="space-y-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Select recommendation types"
        >
          {options.map((opt, i) => {
            const isSelected = selected.has(opt.value);
            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                disabled={disabled}
                onClick={() => toggleValue(opt.value)}
                aria-label={opt.label}
                aria-pressed={isSelected}
                className={cn(
                  'font-body text-xs px-3.5 py-2 rounded-full border transition-all',
                  'flex items-center gap-1.5',
                  'active:scale-[0.97]',
                  isSelected
                    ? 'border-salty-orange-red bg-salty-orange-red/5 text-salty-deep-teal'
                    : 'border-salty-beige text-salty-deep-teal hover:border-salty-deep-teal/40 hover:bg-salty-beige/20',
                  disabled && 'opacity-50 pointer-events-none',
                )}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="text-[10px] text-salty-slate/40 hidden sm:inline">
                    — {opt.description}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {showSelectAll && !isAllSelected && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              disabled={disabled}
              onClick={handleSelectAll}
              aria-label="Show me everything"
              className={cn(
                'font-body text-xs px-3.5 py-2 rounded-full border border-dashed transition-all',
                'border-salty-gold/50 text-salty-deep-teal/60',
                'hover:border-salty-gold hover:bg-salty-gold/10',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              ✨ Show me everything
            </motion.button>
          )}

          {selected.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              disabled={disabled}
              onClick={() => onSubmit?.(Array.from(selected))}
              aria-label="Find my spots"
              className={cn(
                'font-body text-sm font-bold px-4 py-2 rounded-full transition-all',
                'bg-salty-orange-red text-white hover:bg-salty-burnt-red',
                'active:scale-[0.97]',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              Find my spots →
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // mode === 'reengagement'
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="group"
      aria-label="Continue exploring"
    >
      {options.map((opt, i) => (
        <motion.button
          key={opt.value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          disabled={disabled}
          onClick={() => onSelect(opt.value)}
          aria-label={opt.label}
          className={cn(
            'font-body text-[11px] px-2.5 py-1.5 rounded-full border transition-all',
            'flex items-center gap-1',
            'border-salty-beige/60 text-salty-slate/50',
            'hover:border-salty-deep-teal/30 hover:text-salty-deep-teal',
            disabled && 'opacity-50 pointer-events-none',
          )}
        >
          <span className="text-[10px]">{opt.emoji}</span>
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}
