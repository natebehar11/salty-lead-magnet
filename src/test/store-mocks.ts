import { FlightOption, FlightSegment, FlightSearchResults } from '@/types/flight';

export function createMockSegment(overrides?: Partial<FlightSegment>): FlightSegment {
  return {
    airline: 'Air Canada',
    airlineCode: 'AC',
    flightNumber: 'AC123',
    departure: { airport: 'YYZ', time: '08:30', date: '2026-01-02' },
    arrival: { airport: 'SJO', time: '14:45', date: '2026-01-02' },
    duration: 375,
    ...overrides,
  };
}

export function createMockFlight(overrides?: Partial<FlightOption>): FlightOption {
  return {
    id: `mock-${Math.random().toString(36).substring(2, 8)}`,
    price: 500,
    currency: 'USD',
    segments: [createMockSegment()],
    totalDuration: 375,
    stops: 0,
    bookingUrl: 'https://google.com/flights',
    source: 'mock',
    isSelfTransfer: false,
    isAlternateAirport: false,
    ...overrides,
  };
}

export function createMockSearchResults(overrides?: Partial<FlightSearchResults>): FlightSearchResults {
  const flight1 = createMockFlight({ id: 'f1', price: 400 });
  const flight2 = createMockFlight({ id: 'f2', price: 600 });
  const flight3 = createMockFlight({ id: 'f3', price: 500, totalDuration: 300 });

  return {
    search: {
      origin: { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      destination: { code: 'SJO', name: 'Juan Santamaria', city: 'San José', country: 'Costa Rica' },
      retreatSlug: 'costa-rica-v4',
      retreatName: 'SALTY v4 — Costa Rica',
      dates: {
        retreatStart: '2026-01-03',
        retreatEnd: '2026-01-10',
        dayOf: '2026-01-03',
        dayBefore: '2026-01-02',
        twoDaysBefore: '2026-01-01',
        returnDayOf: '2026-01-10',
        returnDayAfter: '2026-01-11',
        returnTwoDaysAfter: '2026-01-12',
      },
    },
    cheapest: [flight1, flight3, flight2],
    best: [flight3, flight1, flight2],
    fastest: [flight3, flight1, flight2],
    unlisted: [],
    lastUpdated: new Date().toISOString(),
    sourceCurrency: 'USD',
    ...overrides,
  };
}
