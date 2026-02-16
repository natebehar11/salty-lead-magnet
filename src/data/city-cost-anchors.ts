// src/data/city-cost-anchors.ts
// "Cost of Staying Home" city anchor data for compare page
// Research date: February 9, 2026
// Methodology: Real prices from Booking.com, studio websites, restaurant averages, local providers
// All prices pre-tax unless noted. Source URLs provided for verification.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CityAnchor {
  cityId: string;
  cityName: string;
  province: string;
  country: string;
  currency: string;
  lineItems: CityLineItem[];
  totalCost: number;
  funComparison: string;
  sourceNote: string;
}

interface CityLineItem {
  emoji: string;
  category: string;
  description: string;
  cost: number;
  source: string;
  sourceUrl?: string;
}

// ─── City Cost Data ──────────────────────────────────────────────────────────

export const cityAnchors: Record<string, CityAnchor> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // TORONTO — Largest audience share (~30%)
  // ═══════════════════════════════════════════════════════════════════════════
  toronto: {
    cityId: 'toronto',
    cityName: 'Toronto',
    province: 'Ontario',
    country: 'Canada',
    currency: 'CAD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'Downtown Toronto, mid-range (not the Ritz, not a hostel)',
        cost: 1750,
        source: 'Booking.com — Drake Hotel, Broadview Hotel average',
        sourceUrl: 'https://www.booking.com/hotel/ca/the-drake.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit drop-ins ($30) + yoga ($25) + 1 Pilates ($35)',
        cost: 205,
        source: 'CrossFit Colosseum, Yoga Tree, Studio Lagree Toronto',
        sourceUrl: 'https://crossfitcolosseum.com/',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($18), lunch ($24), dinner ($48) × 7 days',
        cost: 630,
        source: 'Toronto restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Toronto',
      },
      {
        emoji: '🏄',
        category: '1 surf lesson (on a lake)',
        description: 'Great Lakes surf lesson. Yes, a lake.',
        cost: 99,
        source: 'Surf Ontario, Toronto Island',
        sourceUrl: 'https://www.surfontario.ca/',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle photography session',
        cost: 400,
        source: 'Thumbtack / Toronto photographer averages',
        sourceUrl: 'https://www.thumbtack.com/k/portrait-photographers/near-me/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($20) + 4 drinks ($75) × 3 nights, King West',
        cost: 285,
        source: 'King West / Queen West venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Researching, booking, coordinating, second-guessing',
        cost: 0,
        source: 'Your sanity',
      },
    ],
    totalCost: 3369,
    funComparison: "And you didn't leave Ontario.",
    sourceNote: "Prices based on mid-range options in downtown Toronto, February 2026. We're not inflating these — if anything, we're being generous.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTTAWA — Second largest (SALTY home base)
  // ═══════════════════════════════════════════════════════════════════════════
  ottawa: {
    cityId: 'ottawa',
    cityName: 'Ottawa',
    province: 'Ontario',
    country: 'Canada',
    currency: 'CAD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'ByWard Market area, mid-range (Andaz Ottawa level)',
        cost: 1295,
        source: 'Booking.com — Andaz Ottawa ByWard Market',
        sourceUrl: 'https://www.booking.com/hotel/ca/andaz-ottawa-byward-market.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit drop-ins ($30) + yoga drop-ins ($30)',
        cost: 210,
        source: 'CrossFit Bytown, Rama Lotus Yoga Centre',
        sourceUrl: 'https://crossfitbytown.com/',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($16), lunch ($22), dinner ($42) × 7 days',
        cost: 560,
        source: 'ByWard Market restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Ottawa',
      },
      {
        emoji: '🏄',
        category: '1 ski day at Camp Fortune',
        description: '23 runs, 38 minutes from downtown. Not quite Costa Rica.',
        cost: 125,
        source: 'Camp Fortune — lift ticket + rental',
        sourceUrl: 'https://campfortune.com/alpine/',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle session, Parliament Hill backdrop',
        cost: 350,
        source: 'Ottawa photographer averages',
        sourceUrl: 'https://www.thumbtack.com/on/ottawa/portrait-photographers/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($15) + 4 drinks ($50) × 3 nights, ByWard Market',
        cost: 195,
        source: 'ByWard Market / Elgin Street venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Researching, booking, coordinating, second-guessing',
        cost: 0,
        source: 'Your sanity',
      },
    ],
    totalCost: 2735,
    funComparison: "And you're still in Ottawa.",
    sourceNote: "Prices based on mid-range options in downtown Ottawa, February 2026. The Rideau Canal is nice, but it's not the Pacific.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VANCOUVER — Third largest market
  // ═══════════════════════════════════════════════════════════════════════════
  vancouver: {
    cityId: 'vancouver',
    cityName: 'Vancouver',
    province: 'British Columbia',
    country: 'Canada',
    currency: 'CAD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'Yaletown / Gastown, mid-range (Opus, Loden level)',
        cost: 1470,
        source: 'Booking.com — Opus Hotel, Loden Hotel average',
        sourceUrl: 'https://www.booking.com/hotel/ca/opus.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit drop-ins ($25) + yoga ($20)',
        cost: 160,
        source: 'CrossFit Fort Vancouver, YYoga',
        sourceUrl: 'https://www.yyoga.ca/',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($19), lunch ($26), dinner ($50) × 7 days',
        cost: 665,
        source: 'Vancouver restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Vancouver',
      },
      {
        emoji: '🏄',
        category: '1 surf lesson in Tofino',
        description: "It's only a 5-hour drive. Each way.",
        cost: 200,
        source: 'Pacific Surf Company, Tofino (lesson + wetsuit + transport estimate)',
        sourceUrl: 'https://www.pacificsurfcompany.com/',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle session, Stanley Park',
        cost: 300,
        source: 'Vancouver photographer averages',
        sourceUrl: 'https://www.thumbtack.com/bc/vancouver/portrait-photographers/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($10) + 4 drinks ($80) × 3 nights, Granville',
        cost: 270,
        source: 'Granville Street / Gastown venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Researching, booking, coordinating, second-guessing',
        cost: 0,
        source: 'Your sanity',
      },
    ],
    totalCost: 3065,
    funComparison: 'And it rained the whole time.',
    sourceNote: "Prices based on mid-range options in downtown Vancouver, February 2026. The mountains are beautiful. You can almost see them through the clouds.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HALIFAX — Synergy Physio partnership, growing community
  // ═══════════════════════════════════════════════════════════════════════════
  halifax: {
    cityId: 'halifax',
    cityName: 'Halifax',
    province: 'Nova Scotia',
    country: 'Canada',
    currency: 'CAD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'Downtown waterfront, mid-range (Muir, Halliburton level)',
        cost: 1155,
        source: 'Booking.com — Muir Hotel, Halliburton House Inn average',
        sourceUrl: 'https://www.booking.com/hotel/ca/the-halliburton.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit drop-ins ($22) + yoga ($13)',
        cost: 130,
        source: 'CrossFit Halifax, Modo Yoga Halifax',
        sourceUrl: 'https://www.crossfithalifax.com/',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($15), lunch ($20), dinner ($40) × 7 days',
        cost: 525,
        source: 'Halifax waterfront restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Halifax',
      },
      {
        emoji: '🏄',
        category: '1 surf lesson at Lawrencetown',
        description: 'The water is 4°C. The wetsuit is mandatory. The drive is 40 min.',
        cost: 95,
        source: 'East Coast Surf School, Lawrencetown Beach',
        sourceUrl: 'https://www.eastcoastsurfschool.com/',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle session, Halifax waterfront',
        cost: 350,
        source: 'Halifax photographer averages',
        sourceUrl: 'https://www.thumbtack.com/ns/halifax/portrait-photographers/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($10) + 4 drinks ($55) × 3 nights, Argyle Street',
        cost: 195,
        source: 'Argyle Street / Halifax waterfront venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Researching, booking, coordinating, second-guessing',
        cost: 0,
        source: 'Your sanity',
      },
    ],
    totalCost: 2450,
    funComparison: 'And the ocean was 4°C.',
    sourceNote: "Prices based on mid-range options in downtown Halifax, February 2026. You've got lobster, though. There's always lobster.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONTREAL — Large market, bilingual
  // ═══════════════════════════════════════════════════════════════════════════
  montreal: {
    cityId: 'montreal',
    cityName: 'Montreal',
    province: 'Quebec',
    country: 'Canada',
    currency: 'CAD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'Old Montreal / Plateau, mid-range (Nelligan, Le Petit Hotel level)',
        cost: 1575,
        source: 'Booking.com — Hotel Nelligan, Le Petit Hotel average',
        sourceUrl: 'https://www.booking.com/hotel/ca/nelligan.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit drop-ins ($30) + yoga ($22)',
        cost: 180,
        source: 'CrossFit Wonderland, Luna Yoga Montreal',
        sourceUrl: 'https://www.crossfitwonderland.com/drop-in',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($16), lunch ($22), dinner ($48) × 7 days',
        cost: 602,
        source: 'Plateau / Old Montreal restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/Montreal',
      },
      {
        emoji: '🏄',
        category: '1 ski day at Tremblant',
        description: '90 minutes in traffic each way. Bring snacks.',
        cost: 150,
        source: 'Mont-Tremblant lift ticket + rental',
        sourceUrl: 'https://www.tremblant.ca/plan/tickets-and-passes/winter-lift-tickets',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle session, cobblestone Old Montreal',
        cost: 250,
        source: 'Montreal photographer averages',
        sourceUrl: 'https://locallens.com/destinations/montreal-photographer/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($15) + 4 drinks ($50) × 3 nights, Saint-Laurent',
        cost: 195,
        source: 'Saint-Laurent / Crescent Street venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Rechercher, réserver, coordonner, douter de tout',
        cost: 0,
        source: 'Votre santé mentale',
      },
    ],
    totalCost: 2952,
    funComparison: "Et vous n'avez même pas quitté le Québec.",
    sourceNote: "Prix basés sur des options mid-range au centre-ville de Montréal, février 2026. At least the bagels are world-class.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW YORK — Largest US market
  // ═══════════════════════════════════════════════════════════════════════════
  new_york: {
    cityId: 'new_york',
    cityName: 'New York',
    province: 'New York',
    country: 'US',
    currency: 'USD',
    lineItems: [
      {
        emoji: '🏨',
        category: '7 nights at a boutique hotel',
        description: 'Lower Manhattan, mid-range (Ludlow, Moxy Chelsea level)',
        cost: 1750,
        source: 'Booking.com — The Ludlow, Moxy Chelsea average',
        sourceUrl: 'https://www.booking.com/hotel/us/the-ludlow.html',
      },
      {
        emoji: '💪',
        category: '7 days of fitness classes',
        description: 'CrossFit ($37) + SoulCycle ($36) + Y7 yoga ($32)',
        cost: 242,
        source: 'CrossFit NYC, SoulCycle, Y7 Studio',
        sourceUrl: 'https://y7-studio.com/',
      },
      {
        emoji: '🍽️',
        category: '21 meals out',
        description: 'Breakfast ($16), lunch ($31), dinner ($70) × 7 days',
        cost: 819,
        source: 'NYC restaurant averages, Numbeo',
        sourceUrl: 'https://www.numbeo.com/cost-of-living/in/New-York',
      },
      {
        emoji: '🏄',
        category: '1 surf lesson at Rockaway Beach',
        description: "An hour on the A train. Then there's the Atlantic in February.",
        cost: 100,
        source: 'Skudin Surf, Rockaway Beach',
        sourceUrl: 'https://www.skudinsurf.com/',
      },
      {
        emoji: '📸',
        category: '1 hour with a photographer',
        description: 'Professional lifestyle photography session',
        cost: 400,
        source: 'NYC photographer averages, Thumbtack',
        sourceUrl: 'https://www.thumbtack.com/ny/new-york/portrait-photographers/',
      },
      {
        emoji: '🎉',
        category: '3 nights out',
        description: 'Cover ($25) + 4 drinks ($75) × 3 nights, Lower East Side',
        cost: 300,
        source: 'LES / East Village venue averages',
      },
      {
        emoji: '📋',
        category: '40+ hours of planning',
        description: 'Researching, booking, coordinating, second-guessing',
        cost: 0,
        source: 'Your sanity',
      },
    ],
    totalCost: 3611,
    funComparison: 'And you never left the tristate area.',
    sourceNote: "Prices based on mid-range options in Manhattan, February 2026. We didn't even include the $18 cocktails.",
  },
};

// ─── Airport-to-City Mapping ─────────────────────────────────────────────────

const airportToCityMap: Record<string, string> = {
  // Toronto area
  YYZ: 'toronto',
  YTZ: 'toronto', // Billy Bishop

  // Ottawa
  YOW: 'ottawa',

  // Vancouver
  YVR: 'vancouver',

  // Halifax
  YHZ: 'halifax',

  // Montreal
  YUL: 'montreal',

  // New York area
  JFK: 'new_york',
  LGA: 'new_york',
  EWR: 'new_york',
};

// ─── Flight Estimates (USD, conservative) ────────────────────────────────────
// Used when user hasn't searched flights yet.
// These are intentionally conservative — we'd rather under-promise.

export const flightEstimates: Record<string, number> = {
  toronto: 800,
  ottawa: 850,
  vancouver: 900,
  halifax: 900,
  montreal: 800,
  new_york: 600,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getCityAnchor(cityId: string): CityAnchor {
  return cityAnchors[cityId] || cityAnchors['toronto'];
}

export function mapAirportToCity(code: string): CityAnchor {
  const cityId = airportToCityMap[code];
  if (cityId) return getCityAnchor(cityId);

  // Fallback: any unknown airport code starting with 'Y' is likely Canadian
  // US airports use 3-letter codes not starting with Y (mostly)
  if (code.startsWith('Y')) return getCityAnchor('toronto');

  // Default for US/international
  return getCityAnchor('new_york');
}

export function getCityFlightEstimate(cityId: string): number {
  return flightEstimates[cityId] || 800; // $800 USD conservative default
}

// ─── All Available City IDs (for city switcher dropdown) ─────────────────────

export const availableCities = [
  { id: 'toronto', label: 'Toronto' },
  { id: 'ottawa', label: 'Ottawa' },
  { id: 'vancouver', label: 'Vancouver' },
  { id: 'halifax', label: 'Halifax' },
  { id: 'montreal', label: 'Montréal' },
  { id: 'new_york', label: 'New York' },
];
