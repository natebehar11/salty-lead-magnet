'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CITIES } from '@/data/cities';

interface CityAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className: string;
}

export default function CityAutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
}: CityAutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.length >= 2
    ? CITIES.filter((city) =>
        city.name.toLowerCase().startsWith(value.toLowerCase())
      )
      .slice(0, 8)
      .map((city) => `${city.name}, ${city.country}`)
    : [];

  const showDropdown = isFocused && filtered.length > 0 && value.length >= 2;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [value]);

  const selectCity = (displayText: string) => {
    // Extract city name (strip country suffix)
    const cityName = displayText.includes(', ') ? displayText.split(', ')[0] : displayText;
    onChange(cityName);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selectCity(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-salty-beige overflow-hidden"
          >
            {filtered.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCity(city);
                  }}
                  className={`w-full text-left px-3 py-2 font-body text-sm transition-colors ${
                    i === highlightIndex
                      ? 'bg-salty-orange-red/10 text-salty-deep-teal'
                      : 'text-salty-slate/80 hover:bg-salty-beige/40'
                  }`}
                >
                  {city}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
