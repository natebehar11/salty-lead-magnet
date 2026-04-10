import { FlightOption, FlightBuckets, FlightDateOption, MockFlightConfig } from '@/types';
import { addDays } from '@/lib/utils';

/**
 * Deterministic PRNG (mulberry32) seeded from route+date string.
 * Ensures consistent mock data across page loads and SSR (Issue #16).
 */
function createSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rand = Math.random;

function generateId(): string {
  return rand().toString(36).substring(2, 10);
}


function generateFlightsForRoute(config: MockFlightConfig): FlightOption[] {
  const travelDate = addDays(config.baseDate, config.dateOffset);
  const flights: FlightOption[] = [];

  // Direct flight (when available)
  if (rand() > 0.3) {
    flights.push({
      id: generateId(),
      price: 450 + Math.floor(rand() * 400),
      currency: 'USD',
      segments: [
        {
          airline: 'Air Canada',
          airlineCode: 'AC',
          flightNumber: `AC${100 + Math.floor(rand() * 900)}`,
          departure: { airport: config.origin, time: '08:30', date: travelDate },
          arrival: { airport: config.destination, time: '14:45', date: travelDate },
          duration: 375,
        },
      ],
      totalDuration: 375,
      stops: 0,
      bookingUrl: '#',
      source: 'mock',
      isSelfTransfer: false,
      isAlternateAirport: false,
      departureToken: `mock-token-${generateId()}`,
      isRoundTrip: false,
    });
  }

  // 1-stop flights
  const connectingCities = ['MIA', 'ATL', 'DFW', 'JFK', 'FRA', 'DOH', 'IST', 'AMS', 'CDG'];
  const layover = connectingCities[Math.floor(rand() * connectingCities.length)];

  flights.push({
    id: generateId(),
    price: 320 + Math.floor(rand() * 300),
    currency: 'USD',
    segments: [
      {
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: `UA${100 + Math.floor(rand() * 900)}`,
        departure: { airport: config.origin, time: '06:15', date: travelDate },
        arrival: { airport: layover, time: '10:30', date: travelDate },
        duration: 195,
      },
      {
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: `UA${100 + Math.floor(rand() * 900)}`,
        departure: { airport: layover, time: '12:45', date: travelDate },
        arrival: { airport: config.destination, time: '18:20', date: travelDate },
        duration: 275,
      },
    ],
    totalDuration: 605,
    stops: 1,
    bookingUrl: '#',
    source: 'mock',
    isSelfTransfer: false,
    isAlternateAirport: false,
    departureToken: `mock-token-${generateId()}`,
    isRoundTrip: false,
  });

  // Budget 1-stop
  flights.push({
    id: generateId(),
    price: 250 + Math.floor(rand() * 200),
    currency: 'USD',
    segments: [
      {
        airline: 'Spirit Airlines',
        airlineCode: 'NK',
        flightNumber: `NK${100 + Math.floor(rand() * 900)}`,
        departure: { airport: config.origin, time: '23:55', date: travelDate },
        arrival: { airport: 'FLL', time: '04:10', date: addDays(travelDate, 1) },
        duration: 195,
      },
      {
        airline: 'Copa Airlines',
        airlineCode: 'CM',
        flightNumber: `CM${100 + Math.floor(rand() * 900)}`,
        departure: { airport: 'FLL', time: '08:30', date: addDays(travelDate, 1) },
        arrival: { airport: config.destination, time: '13:15', date: addDays(travelDate, 1) },
        duration: 285,
      },
    ],
    totalDuration: 800,
    stops: 1,
    bookingUrl: '#',
    source: 'mock',
    isSelfTransfer: false,
    isAlternateAirport: false,
    departureToken: `mock-token-${generateId()}`,
    isRoundTrip: false,
  });

  // 2-stop budget option
  flights.push({
    id: generateId(),
    price: 200 + Math.floor(rand() * 150),
    currency: 'USD',
    segments: [
      {
        airline: 'Frontier Airlines',
        airlineCode: 'F9',
        flightNumber: `F9${100 + Math.floor(rand() * 900)}`,
        departure: { airport: config.origin, time: '05:45', date: travelDate },
        arrival: { airport: 'MCO', time: '09:30', date: travelDate },
        duration: 165,
      },
      {
        airline: 'JetBlue',
        airlineCode: 'B6',
        flightNumber: `B6${100 + Math.floor(rand() * 900)}`,
        departure: { airport: 'MCO', time: '13:00', date: travelDate },
        arrival: { airport: 'FLL', time: '14:00', date: travelDate },
        duration: 60,
      },
      {
        airline: 'Copa Airlines',
        airlineCode: 'CM',
        flightNumber: `CM${100 + Math.floor(rand() * 900)}`,
        departure: { airport: 'FLL', time: '17:30', date: travelDate },
        arrival: { airport: config.destination, time: '22:15', date: travelDate },
        duration: 285,
      },
    ],
    totalDuration: 990,
    stops: 2,
    bookingUrl: '#',
    source: 'mock',
    isSelfTransfer: false,
    isAlternateAirport: false,
    departureToken: `mock-token-${generateId()}`,
    isRoundTrip: false,
  });

  // Premium direct
  flights.push({
    id: generateId(),
    price: 700 + Math.floor(rand() * 500),
    currency: 'USD',
    segments: [
      {
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: `DL${100 + Math.floor(rand() * 900)}`,
        departure: { airport: config.origin, time: '10:00', date: travelDate },
        arrival: { airport: config.destination, time: '15:30', date: travelDate },
        duration: 330,
      },
    ],
    totalDuration: 330,
    stops: 0,
    bookingUrl: '#',
    source: 'mock',
    isSelfTransfer: false,
    isAlternateAirport: false,
    departureToken: `mock-token-${generateId()}`,
    isRoundTrip: false,
  });

  return flights;
}

function generateUnlistedFlights(config: MockFlightConfig): FlightOption[] {
  const travelDate = addDays(config.baseDate, config.dateOffset);

  return [
    // Self-transfer option
    {
      id: generateId(),
      price: 180 + Math.floor(rand() * 100),
      currency: 'USD',
      segments: [
        {
          airline: 'Ryanair',
          airlineCode: 'FR',
          flightNumber: `FR${100 + Math.floor(rand() * 900)}`,
          departure: { airport: config.origin, time: '06:00', date: travelDate },
          arrival: { airport: 'MIA', time: '10:15', date: travelDate },
          duration: 195,
        },
        {
          airline: 'Avianca',
          airlineCode: 'AV',
          flightNumber: `AV${100 + Math.floor(rand() * 900)}`,
          departure: { airport: 'MIA', time: '14:30', date: travelDate },
          arrival: { airport: config.destination, time: '18:45', date: travelDate },
          duration: 255,
        },
      ],
      totalDuration: 765,
      stops: 1,
      bookingUrl: '#',
      source: 'mock',
      isSelfTransfer: true,
      selfTransferWarning: 'Self-transfer in Miami: You must collect your bags, re-check in, and clear security for your next flight. Allow at least 3 hours between flights.',
      isAlternateAirport: false,
      departureToken: `mock-token-${generateId()}`,
      isRoundTrip: false,
    },
    // Alternate airport option
    {
      id: generateId(),
      price: 160 + Math.floor(rand() * 80),
      currency: 'USD',
      segments: [
        {
          airline: 'Southwest',
          airlineCode: 'WN',
          flightNumber: `WN${100 + Math.floor(rand() * 900)}`,
          departure: { airport: config.origin, time: '07:30', date: travelDate },
          arrival: { airport: 'SJO', time: '13:00', date: travelDate },
          duration: 330,
        },
      ],
      totalDuration: 330,
      stops: 0,
      bookingUrl: '#',
      source: 'mock',
      isSelfTransfer: false,
      isAlternateAirport: true,
      alternateAirportNote: `Arrives at SJO (San Jose) instead of ${config.destination}. About 4-5 hours by ground transport. Significantly cheaper but requires additional transfer arrangements.`,
      departureToken: `mock-token-${generateId()}`,
      isRoundTrip: false,
    },
  ];
}

/**
 * Sort flights into buckets using the same normalized algorithm as the API route.
 * "Best" = 60% normalized price + 40% normalized duration (Issue #8: unified scoring).
 */
function sortIntoMockBuckets(flights: FlightOption[], unlisted: FlightOption[]): FlightBuckets {
  if (flights.length === 0) {
    return { cheapest: [], best: [], fastest: [], unlisted: unlisted.slice(0, 3) };
  }

  const cheapest = [...flights].sort((a, b) => a.price - b.price);
  const fastest = [...flights].sort((a, b) => a.totalDuration - b.totalDuration);

  // Normalized best score — matches sortIntoBuckets in route.ts
  const minPrice = cheapest[0].price;
  const maxPrice = cheapest[cheapest.length - 1].price;
  const minDuration = fastest[0].totalDuration;
  const maxDuration = fastest[fastest.length - 1].totalDuration;
  const priceRange = maxPrice - minPrice || 1;
  const durationRange = maxDuration - minDuration || 1;

  const best = [...flights].sort((a, b) => {
    const scoreA = ((a.price - minPrice) / priceRange) * 0.6 + ((a.totalDuration - minDuration) / durationRange) * 0.4;
    const scoreB = ((b.price - minPrice) / priceRange) * 0.6 + ((b.totalDuration - minDuration) / durationRange) * 0.4;
    return scoreA - scoreB;
  });

  return {
    cheapest: cheapest.slice(0, 5),
    best: best.slice(0, 5),
    fastest: fastest.slice(0, 5),
    unlisted: unlisted.slice(0, 3),
  };
}

export function getMockFlights(
  originCode: string,
  destinationCode: string,
  retreatStartDate: string
): FlightBuckets & { byDate: Record<FlightDateOption, FlightBuckets> } {
  // Seed PRNG for deterministic output per route (Issue #16)
  rand = createSeededRandom(`${originCode}-${destinationCode}-${retreatStartDate}`);

  const dateOffsets: { offset: number; key: FlightDateOption }[] = [
    { offset: 0, key: 'day-of' },
    { offset: -1, key: 'day-before' },
    { offset: -2, key: 'two-days-before' },
  ];

  const byDate = {} as Record<FlightDateOption, FlightBuckets>;
  const allFlights: FlightOption[] = [];
  const allUnlisted: FlightOption[] = [];

  for (const { offset, key } of dateOffsets) {
    const config: MockFlightConfig = {
      origin: originCode,
      destination: destinationCode,
      dateOffset: offset,
      baseDate: retreatStartDate,
    };
    const flights = generateFlightsForRoute(config);
    const unlisted = generateUnlistedFlights(config);

    byDate[key] = sortIntoMockBuckets(flights, unlisted);
    allFlights.push(...flights);
    allUnlisted.push(...unlisted);
  }

  return {
    ...sortIntoMockBuckets(allFlights, allUnlisted),
    byDate,
  };
}
