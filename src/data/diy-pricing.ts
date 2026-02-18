/**
 * DIY Pricing Data
 *
 * Estimated costs for booking the same caliber trip as a SALTY retreat,
 * but doing it yourself. Based on research of boutique accommodations,
 * high-quality meals, guided activities, etc. in each destination.
 */

import { DIYComparison } from '@/types';

export const diyComparisons: DIYComparison[] = [
  {
    retreatSlug: 'costa-rica-fitness-retreat',
    destination: 'Costa Rica',
    retreatName: 'SALTY Costa Rica Fitness Retreat',
    nights: 7,
    saltyPriceFrom: 2399,
    estimatedDate: 'February 2026',
    estimatedPlanningHours: 25,
    items: [
      {
        category: 'Accommodation',
        description: 'Boutique beachfront hotel in Nosara, Guanacaste (7 nights). Think private rooms, pool, steps from Playa Guiones.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1680, emoji: '🏨',
        sourceUrl: 'https://www.airbnb.com/s/Nosara--Guanacaste--Costa-Rica/homes?adults=1',
        sourceName: 'Airbnb Nosara',
      },
      {
        category: 'Full Board',
        description: 'All meals — breakfast, lunch, and dinner daily (7 days). Quality restaurants, local cuisine, and group dining experiences.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 560, emoji: '🍽',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g644053-Nosara_Province_of_Guanacaste.html',
        sourceName: 'TripAdvisor Nosara',
      },
      {
        category: 'Surf Lesson',
        description: '1 group surf lesson at Safari Surf School, Playa Guiones (~$60, 1.5-2hr session incl. board)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 60, emoji: '🏄',
        sourceUrl: 'https://www.safarisurfschool.com',
        sourceName: 'Safari Surf School',
      },
      {
        category: 'Yoga',
        description: 'Daily drop-in yoga at Bodhi Tree Yoga Resort (7 sessions, ~$20/class)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 140, emoji: '🧘',
        sourceUrl: 'https://www.bodhitreeyogaresort.com',
        sourceName: 'Bodhi Tree Yoga',
      },
      {
        category: 'Fitness Classes',
        description: 'Daily guided workouts with a personal trainer (7 sessions, ~$30/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 210, emoji: '🏋',
      },
      {
        category: 'Airport Transfer',
        description: 'Round-trip private transfer from LIR airport to Nosara (~2.5hr drive each way)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 120, emoji: '🚐',
        sourceUrl: 'https://www.google.com/maps/search/airport+transfer+Nosara+Costa+Rica',
        sourceName: 'Google Maps',
      },
      { category: 'Welcome Event', description: 'Welcome dinner with drinks and team introductions', saltyIncluded: true, saltyPrice: 0, diyPrice: 85, emoji: '🥂' },
      { category: 'Excursions', description: 'Cultural excursions, waterfall hikes, and day trips', saltyIncluded: true, saltyPrice: 0, diyPrice: 200, emoji: '🌋' },
      { category: 'Community', description: '30+ like-minded travelers, instant crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👫' },
      { category: 'Trip Planning', description: 'All logistics, reservations, and coordination handled for you', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },
  {
    retreatSlug: 'sri-lanka-surf-yoga-retreat',
    destination: 'Sri Lanka',
    retreatName: 'SALTY Sri Lanka Surf & Yoga Retreat',
    nights: 9,
    saltyPriceFrom: 1999,
    estimatedDate: 'February 2026',
    estimatedPlanningHours: 30,
    items: [
      {
        category: 'Accommodation',
        description: 'Beachfront property in Weligama (6N) + mountain eco lodge near Ella (3N)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1620, emoji: '🏨',
        sourceUrl: 'https://www.airbnb.com/s/Weligama--Sri-Lanka/homes?adults=1',
        sourceName: 'Airbnb Weligama',
      },
      {
        category: 'Full Board',
        description: 'All meals — breakfast, lunch, and dinner daily (9 days). Local cuisine, beachside seafood, and quality restaurants.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 495, emoji: '🍽',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1581498-Weligama_Southern_Province.html',
        sourceName: 'TripAdvisor Weligama',
      },
      {
        category: 'Surf Lesson',
        description: '1 group surf lesson at Weligama Bay surf schools (~$30, board + instructor)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 30, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/surf+school+Weligama+Sri+Lanka',
        sourceName: 'Surf Schools Weligama',
      },
      {
        category: 'Yoga',
        description: 'Daily drop-in yoga at Sampoorna Yoga, Weligama (9 sessions, ~$10/class)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 90, emoji: '🧘',
        sourceUrl: 'https://www.sampoornayoga.com',
        sourceName: 'Sampoorna Yoga',
      },
      {
        category: 'Fitness',
        description: 'Daily SALTY-style workouts (9 sessions, ~$30/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 270, emoji: '🏋',
      },
      {
        category: 'Scenic Train',
        description: 'Famous Kandy-to-Ella scenic train ride + logistics and coordination',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 45, emoji: '🚂',
        sourceUrl: 'https://www.google.com/search?q=Kandy+to+Ella+train+Sri+Lanka+tickets',
        sourceName: 'Train info',
      },
      {
        category: 'Cultural Tours',
        description: 'Galle Fort walking tour, Buddhist temples, local market visits',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 150, emoji: '🏛',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g297896-Activities-Galle_Galle_District_Southern_Province.html',
        sourceName: 'TripAdvisor Galle',
      },
      { category: 'Ground Transport', description: 'All inland travel between coast and mountains (9 days of tuk-tuks, vans, buses)', saltyIncluded: true, saltyPrice: 0, diyPrice: 280, emoji: '🚐' },
      { category: 'Airport Transfer', description: 'Round-trip airport transfer from CMB (~3hr drive to south coast)', saltyIncluded: true, saltyPrice: 0, diyPrice: 80, emoji: '✈' },
      { category: 'Welcome Events', description: 'Welcome drinks + 2 hosted cocktail nights', saltyIncluded: true, saltyPrice: 0, diyPrice: 120, emoji: '🥂' },
      { category: 'Community', description: '30+ like-minded travelers, instant crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👫' },
    ],
  },
  {
    retreatSlug: 'morocco-surf-yoga-retreat',
    destination: 'Morocco',
    retreatName: 'SALTY Morocco Surf & Yoga Retreat',
    nights: 7,
    saltyPriceFrom: 1999,
    estimatedDate: 'February 2026',
    estimatedPlanningHours: 25,
    items: [
      {
        category: 'Accommodation',
        description: 'Boutique surf camp or riad in Taghazout village (7 nights, ocean views)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1260, emoji: '🏨',
        sourceUrl: 'https://www.airbnb.com/s/Taghazout--Morocco/homes?adults=1',
        sourceName: 'Airbnb Taghazout',
      },
      {
        category: 'Full Board',
        description: 'All meals — breakfast, lunch, and dinner daily (7 days). Moroccan cuisine, beachside cafes, and local tagine restaurants.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 455, emoji: '🍽',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g304016-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
      },
      {
        category: 'Surf Lesson',
        description: '1 group surf lesson at Surf Berbere, Taghazout (~$45, equipment included)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 45, emoji: '🏄',
        sourceUrl: 'https://www.surfberbere.com',
        sourceName: 'Surf Berbere',
      },
      {
        category: 'Yoga',
        description: 'Daily yoga classes at local studios (7 sessions, ~$12/class)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 84, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+studio+Taghazout+Morocco',
        sourceName: 'Yoga Taghazout',
      },
      {
        category: 'Fitness',
        description: 'Daily guided workouts (7 sessions, ~$30/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 210, emoji: '🏋',
      },
      {
        category: 'Cultural Tours',
        description: 'Agadir medina tour, Taghazout souk visit, traditional cooking class',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 200, emoji: '🐪',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g304016-Activities-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
      },
      { category: 'Airport Transfer', description: 'Round-trip airport transfer from AGA airport to Taghazout (~40 min)', saltyIncluded: true, saltyPrice: 0, diyPrice: 90, emoji: '🚐' },
      { category: 'Welcome Event', description: 'Welcome dinner with traditional Moroccan feast + drinks', saltyIncluded: true, saltyPrice: 0, diyPrice: 75, emoji: '🥂' },
      { category: 'Community', description: '25+ like-minded travelers', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👫' },
    ],
  },
  {
    retreatSlug: 'sicily-wellness-retreat',
    destination: 'Sicily',
    retreatName: 'SALTY Sicily Wellness Retreat',
    nights: 7,
    saltyPriceFrom: 2099,
    estimatedDate: 'February 2026',
    estimatedPlanningHours: 25,
    items: [
      {
        category: 'Accommodation',
        description: 'Boutique coastal hotel near Cefalu, East Sicily (7 nights, sea views)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1890, emoji: '🏨',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Cefal%C3%B9%2C+Sicily%2C+Italy&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com Cefalu',
      },
      {
        category: 'Full Board',
        description: 'All meals — breakfast, lunch, and dinner daily (7 days). Italian trattorias, fresh seafood, and Sicilian specialties.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 665, emoji: '🍽',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g187888-Cefalu_Province_of_Palermo_Sicily.html',
        sourceName: 'TripAdvisor Cefalu',
      },
      {
        category: 'Yoga',
        description: 'Daily yoga sessions with private instructor (7 sessions, ~$25/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 175, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+class+Cefalu+Sicily+Italy',
        sourceName: 'Yoga Cefalu',
      },
      {
        category: 'Fitness',
        description: 'Daily guided workouts (7 sessions, ~$30/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 210, emoji: '🏋',
      },
      {
        category: 'Cultural Tours',
        description: 'Mt Etna guided hike, Sicilian wine tasting, and Taormina walking tour',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 350, emoji: '🏛',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g187888-Activities-Cefalu_Province_of_Palermo_Sicily.html',
        sourceName: 'TripAdvisor Cefalu',
      },
      { category: 'Airport Transfer', description: 'Round-trip private transfer from CTA Catania airport', saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🚐' },
      { category: 'Welcome Event', description: 'Welcome dinner at a seaside restaurant + drinks', saltyIncluded: true, saltyPrice: 0, diyPrice: 95, emoji: '🥂' },
      {
        category: 'Cooking Class',
        description: 'Traditional Sicilian cooking class (pasta, arancini, cannoli)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 120, emoji: '👨‍🍳',
        sourceUrl: 'https://www.google.com/maps/search/cooking+class+Sicily+Italy',
        sourceName: 'Cooking classes Sicily',
      },
      { category: 'Community', description: '25+ like-minded travelers', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👫' },
    ],
  },
  {
    retreatSlug: 'el-salvador-surf-retreat',
    destination: 'El Salvador',
    retreatName: 'SALTY El Salvador Surf Retreat',
    nights: 7,
    saltyPriceFrom: 1949,
    estimatedDate: 'February 2026',
    estimatedPlanningHours: 20,
    items: [
      {
        category: 'Accommodation',
        description: 'Beachfront property in El Tunco on La Libertad coast (7 nights)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1190, emoji: '🏨',
        sourceUrl: 'https://www.airbnb.com/s/El-Tunco--El-Salvador/homes?adults=1',
        sourceName: 'Airbnb El Tunco',
      },
      {
        category: 'Full Board',
        description: 'All meals — breakfast, lunch, and dinner daily (7 days). Beachside restaurants, local pupusas, and quality seafood spots.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 385, emoji: '🍽',
        sourceUrl: 'https://www.google.com/maps/search/restaurants+El+Tunco+El+Salvador',
        sourceName: 'El Tunco restaurants',
      },
      {
        category: 'Surf Lesson',
        description: '1 group surf lesson at AST Surf School, El Sunzal (~$45, board + instructor)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 45, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/AST+Surf+El+Tunco+El+Salvador',
        sourceName: 'AST Surf School',
      },
      {
        category: 'Yoga',
        description: 'Daily drop-in yoga in El Zonte or El Tunco (7 sessions, ~$12/class)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 84, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+El+Zonte+El+Salvador',
        sourceName: 'Yoga El Zonte',
      },
      {
        category: 'Fitness',
        description: 'Daily guided workouts (7 sessions, ~$25/session)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 175, emoji: '🏋',
      },
      {
        category: 'Excursions',
        description: 'Cultural day trips, volcano hikes, and local tours',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 180, emoji: '🌋',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g946436-Activities-El_Tunco_La_Libertad_Department.html',
        sourceName: 'TripAdvisor El Tunco',
      },
      { category: 'Airport Transfer', description: 'Round-trip airport transfer from SAL airport (~45 min to coast)', saltyIncluded: true, saltyPrice: 0, diyPrice: 80, emoji: '🚐' },
      { category: 'Welcome Event', description: 'Welcome dinner on the beach + drinks', saltyIncluded: true, saltyPrice: 0, diyPrice: 65, emoji: '🥂' },
      { category: 'Community', description: '30+ like-minded travelers', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👫' },
    ],
  },
];

export function getDIYComparison(retreatSlug: string): DIYComparison | undefined {
  return diyComparisons.find((c) => c.retreatSlug === retreatSlug);
}

export function getAllDIYComparisons(): DIYComparison[] {
  return diyComparisons;
}
