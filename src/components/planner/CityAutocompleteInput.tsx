'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_CITIES = [
  'Amsterdam', 'Antigua', 'Athens', 'Auckland',
  'Bali', 'Bangkok', 'Barcelona', 'Beijing', 'Berlin', 'Bogota', 'Bordeaux',
  'Boston', 'Brisbane', 'Brussels', 'Budapest', 'Buenos Aires',
  'Cairo', 'Cancun', 'Cape Town', 'Cartagena', 'Chiang Mai', 'Chicago',
  'Copenhagen', 'Cusco',
  'Dubai', 'Dublin', 'Dubrovnik',
  'Edinburgh', 'Florence', 'Havana', 'Helsinki', 'Ho Chi Minh City', 'Hong Kong',
  'Honolulu',
  'Istanbul', 'Jaipur', 'Johannesburg',
  'Kathmandu', 'Koh Samui', 'Kuala Lumpur', 'Kyoto',
  'Lima', 'Lisbon', 'London', 'Los Angeles',
  'Madrid', 'Marrakech', 'Medellín', 'Melbourne', 'Mexico City', 'Miami',
  'Milan', 'Montreal', 'Mumbai', 'Munich',
  'Nairobi', 'Naples', 'New York', 'Nice',
  'Osaka', 'Oslo',
  'Paris', 'Playa del Carmen', 'Porto', 'Prague', 'Phuket',
  'Reykjavik', 'Rio de Janeiro', 'Rome',
  'San Francisco', 'San Juan', 'Santiago', 'Santorini', 'São Paulo',
  'Seoul', 'Seville', 'Shanghai', 'Singapore', 'Split', 'Stockholm', 'Sydney',
  'Taipei', 'Tel Aviv', 'Tokyo', 'Toronto',
  'Vancouver', 'Venice', 'Vienna',
  'Zanzibar', 'Zürich',
];

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

  const filtered = value.length >= 1
    ? POPULAR_CITIES.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = isFocused && filtered.length > 0 && value.length >= 1;

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

  const selectCity = (city: string) => {
    onChange(city);
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
