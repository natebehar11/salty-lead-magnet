import { Airport } from '@/types';

export const popularAirports: Airport[] = [
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montreal-Trudeau International', city: 'Montreal', country: 'Canada' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier', city: 'Ottawa', country: 'Canada' },
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada' },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'Canada' },
  { code: 'YWG', name: 'Winnipeg James Armstrong Richardson', city: 'Winnipeg', country: 'Canada' },
  { code: 'YHZ', name: 'Halifax Stanfield International', city: 'Halifax', country: 'Canada' },

  // USA — Major Hubs
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington DC', country: 'USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', country: 'USA' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul', city: 'Minneapolis', country: 'USA' },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA' },

  // Europe
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy' },

  // Other
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'Australia' },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return popularAirports
    .filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
    .slice(0, 8);
}
