'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { searchAirports } from '@/data/airports';
import { Airport } from '@/types';
import { cn } from '@/lib/utils';

interface AirportAutocompleteProps {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function AirportAutocomplete({
  value,
  onChange,
  label,
  placeholder = 'Search by city or airport code (e.g., Toronto or YYZ)',
  id,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(value ? `${value.city} (${value.code})` : '');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync display text when value changes externally
  useEffect(() => {
    if (value) {
      setQuery(`${value.city} (${value.code})`);
    }
  }, [value]);

  // Close suggestions on outside click
  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  const handleInputChange = (inputValue: string) => {
    setQuery(inputValue);
    const results = searchAirports(inputValue);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setHighlightedIndex(-1);
    if (!inputValue) onChange(null);
  };

  const handleSelectAirport = useCallback((airport: Airport) => {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectAirport(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const comboboxId = id || 'airport-autocomplete';

  return (
    <div className="relative">
      {label && (
        <label htmlFor={comboboxId} className="font-body text-sm font-bold text-salty-deep-teal block mb-2">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={comboboxId}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        aria-controls={`${comboboxId}-listbox`}
        aria-activedescendant={highlightedIndex >= 0 ? `${comboboxId}-option-${highlightedIndex}` : undefined}
        className="w-full px-4 py-3 rounded-xl border-2 border-salty-beige font-body text-sm bg-salty-cream focus:outline-none focus:border-salty-orange-red transition-colors"
      />

      {showSuggestions && (
        <div
          ref={dropdownRef}
          role="listbox"
          id={`${comboboxId}-listbox`}
          className="absolute z-20 top-full mt-1 w-full bg-salty-cream border-2 border-salty-beige rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((airport, index) => (
            <button
              key={airport.code}
              id={`${comboboxId}-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelectAirport(airport)}
              className={cn(
                'w-full px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl',
                index === highlightedIndex ? 'bg-salty-beige/70' : 'hover:bg-salty-beige/50'
              )}
            >
              <span className="font-body text-sm font-bold text-salty-deep-teal">{airport.code}</span>
              <span className="font-body text-sm text-salty-deep-teal/70 ml-2">{airport.city}, {airport.country}</span>
              <span className="font-body text-xs text-salty-deep-teal/40 block">{airport.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
