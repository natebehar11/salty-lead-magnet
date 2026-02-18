import { FlightOption, MockFlightConfig } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function generateFlightsForRoute(config: MockFlightConfig): FlightOption[] {
  const travelDate = addDays(config.baseDate, config.dateOffset);
  const flights: FlightOption[] = [];

  // Direct flight (when available)
  if (Math.random() > 0.3) {
    flights.push({
      id: generateId(),
      price: 450 + Math.floor(Math.random() * 400),
      currency: 'USD',
      segments: [
        {
          airline: 'Air Canada',
          airlineCode: 'AC',
          flightNumber: `AC${100 + Math.floor(Math.random() * 900)}`,
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
    });
  }

  // 1-stop flights
  const connectingCities = ['MIA', 'ATL', 'DFW', 'JFK', 'FRA', 'DOH', 'IST', 'AMS', 'CDG'];
  const layover = connectingCities[Math.floor(Math.random() * connectingCities.length)];

  flights.push({
    id: generateId(),
    price: 320 + Math.floor(Math.random() * 300),
    currency: 'USD',
    segments: [
      {
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: `UA${100 + Math.floor(Math.random() * 900)}`,
        departure: { airport: config.origin, time: '06:15', date: travelDate },
        arrival: { airport: layover, time: '10:30', date: travelDate },
        duration: 195,
      },
      {
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: `UA${100 + Math.floor(Math.random() * 900)}`,
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
  });

  // Budget 1-stop
  flights.push({
    id: generateId(),
    price: 250 + Math.floor(Math.random() * 200),
    currency: 'USD',
    segments: [
      {
        airline: 'Spirit Airlines',
        airlineCode: 'NK',
        flightNumber: `NK${100 + Math.floor(Math.random() * 900)}`,
        departure: { airport: config.origin, time: '23:55', date: travelDate },
        arrival: { airport: 'FLL', time: '04:10', date: addDays(travelDate, 1) },
        duration: 195,
      },
      {
        airline: 'Copa Airlines',
        airlineCode: 'CM',
        flightNumber: `CM${100 + Math.floor(Math.random() * 900)}`,
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
  });

  // 2-stop budget option
  flights.push({
    id: generateId(),
    price: 200 + Math.floor(Math.random() * 150),
    currency: 'USD',
    segments: [
      {
        airline: 'Frontier Airlines',
        airlineCode: 'F9',
        flightNumber: `F9${100 + Math.floor(Math.random() * 900)}`,
        departure: { airport: config.origin, time: '05:45', date: travelDate },
        arrival: { airport: 'MCO', time: '09:30', date: travelDate },
        duration: 165,
      },
      {
        airline: 'JetBlue',
        airlineCode: 'B6',
        flightNumber: `B6${100 + Math.floor(Math.random() * 900)}`,
        departure: { airport: 'MCO', time: '13:00', date: travelDate },
        arrival: { airport: 'FLL', time: '14:00', date: travelDate },
        duration: 60,
      },
      {
        airline: 'Copa Airlines',
        airlineCode: 'CM',
        flightNumber: `CM${100 + Math.floor(Math.random() * 900)}`,
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
  });

  // Premium direct
  flights.push({
    id: generateId(),
    price: 700 + Math.floor(Math.random() * 500),
    currency: 'USD',
    segments: [
      {
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: `DL${100 + Math.floor(Math.random() * 900)}`,
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
  });

  return flights;
}

function generateUnlistedFlights(config: MockFlightConfig): FlightOption[] {
  const travelDate = addDays(config.baseDate, config.dateOffset);

  return [
    // Self-transfer option
    {
      id: generateId(),
      price: 180 + Math.floor(Math.random() * 100),
      currency: 'USD',
      segments: [
        {
          airline: 'Ryanair',
          airlineCode: 'FR',
          flightNumber: `FR${100 + Math.floor(Math.random() * 900)}`,
          departure: { airport: config.origin, time: '06:00', date: travelDate },
          arrival: { airport: 'MIA', time: '10:15', date: travelDate },
          duration: 195,
        },
        {
          airline: 'Avianca',
          airlineCode: 'AV',
          flightNumber: `AV${100 + Math.floor(Math.random() * 900)}`,
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
    },
    // Alternate airport option
    {
      id: generateId(),
      price: 160 + Math.floor(Math.random() * 80),
      currency: 'USD',
      segments: [
        {
          airline: 'Southwest',
          airlineCode: 'WN',
          flightNumber: `WN${100 + Math.floor(Math.random() * 900)}`,
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
    },
  ];
}

export function getMockFlights(
  originCode: string,
  destinationCode: string,
  retreatStartDate: string
): { cheapest: FlightOption[]; best: FlightOption[]; fastest: FlightOption[]; unlisted: FlightOption[] } {
  const allFlights: FlightOption[] = [];
  const allUnlisted: FlightOption[] = [];

  for (const offset of [0, -1, -2]) {
    const config: MockFlightConfig = {
      origin: originCode,
      destination: destinationCode,
      dateOffset: offset,
      baseDate: retreatStartDate,
    };
    allFlights.push(...generateFlightsForRoute(config));
    allUnlisted.push(...generateUnlistedFlights(config));
  }

  const cheapest = [...allFlights].sort((a, b) => a.price - b.price);
  const fastest = [...allFlights].sort((a, b) => a.totalDuration - b.totalDuration);

  // "Best" = balanced score of price, duration, and stops
  const best = [...allFlights].sort((a, b) => {
    const scoreA = a.price * 0.4 + a.totalDuration * 0.4 + a.stops * 200 * 0.2;
    const scoreB = b.price * 0.4 + b.totalDuration * 0.4 + b.stops * 200 * 0.2;
    return scoreA - scoreB;
  });

  return {
    cheapest: cheapest.slice(0, 5),
    best: best.slice(0, 5),
    fastest: fastest.slice(0, 5),
    unlisted: allUnlisted.slice(0, 3),
  };
}
