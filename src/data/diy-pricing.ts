/**
 * DIY Pricing Data
 *
 * Source of truth: Research for Cost comparison/salty_diy_price_comparison_data.json
 * Research date: February 9, 2026
 *
 * All prices are research-verified with methodology documented per line item.
 * Source URLs use durable search/category pages (Airbnb search, TripAdvisor categories,
 * Booking.com search, Google Maps) that structurally cannot break, rather than
 * specific business pages that may go down.
 */

import { DIYComparison } from '@/types';

export const diyComparisons: DIYComparison[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // COSTA RICA v4 — STRONGEST comparison (57% savings)
  // Lead with this one. Osa Peninsula is remote and premium.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'costa-rica-fitness-retreat-v4',
    destination: 'Costa Rica',
    retreatName: 'SALTY Costa Rica: Surf Sweat Flow v4',
    nights: 7,
    saltyPriceFrom: 1949,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 30,
    items: [
      {
        category: 'Accommodation',
        description: 'Premium eco-lodge near Puerto Jimenez, 7 nights (Lapa Rios / El Remanso level)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 2800, emoji: '🏠',
        sourceUrl: 'https://www.kayak.com/Puerto-Jimenez-Hotels.29818.hotel.ksp',
        sourceName: 'KAYAK Osa Peninsula',
        methodology: 'Osa eco-lodges: Lapa Rios $594-1,711/night, El Remanso $185-285/night, Crocodile Bay $372+. Used $400/night (mid-premium eco-lodge, single occupancy, January high season) × 7 = $2,800.',
      },
      {
        category: 'Meals',
        description: 'All meals — breakfast, lunch, dinner daily (7 days). Chef-prepared multi-course at quality Osa restaurants.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 735, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g309279-Osa_Peninsula_Province_of_Puntarenas.html',
        sourceName: 'TripAdvisor Osa Peninsula',
        methodology: 'Osa is remote — restaurants are premium-priced. Breakfast $20, lunch $32, dinner $38. Daily $90 + ~15% tax/service = $105/day × 7 = $735.',
      },
      {
        category: 'Fitness & Yoga',
        description: 'Daily yoga/fitness classes, 7 days (private instruction — no public studios in Osa)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 400, emoji: '🧘',
        sourceUrl: 'https://www.google.com/search?q=yoga+classes+Osa+Peninsula+Costa+Rica+drop-in',
        sourceName: 'Google Search',
        methodology: 'Osa Peninsula has NO standalone yoga studios with drop-in. Blue Osa and Luna Lodge offer yoga only for retreat guests. Private instruction: $50-80/session. Used $57/session × 7 = $400. This is a MAJOR SALTY differentiator.',
      },
      {
        category: 'Surf Lesson',
        description: '1 group surf lesson at Pan Dulce (2.5 hrs + board + transport)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/surf+school+Puerto+Jimenez+Costa+Rica',
        sourceName: 'Google Maps',
        methodology: 'Pollo Surf School group lesson $65/person for 2hrs + board. Transport to Pan Dulce $20 round-trip. Plus 13% IVA ≈ $100 total.',
      },
      {
        category: 'Waterfall Hike',
        description: 'Guided Matapalo Waterfall hike (professional guide + transport + snacks)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🌊',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g309279-Activities-c61-Osa_Peninsula_Province_of_Puntarenas.html',
        sourceName: 'TripAdvisor Osa Tours',
        methodology: 'Comparable Osa guided nature tours: $80-150/person. Used $100 conservative estimate.',
      },
      {
        category: 'Spa Treatment',
        description: '60-minute therapeutic massage at premium Osa spa',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 120, emoji: '💆',
        sourceUrl: 'https://www.google.com/search?q=spa+massage+Osa+Peninsula+Costa+Rica+price',
        sourceName: 'Google Search',
        methodology: 'Premium Osa spas (Luna Lodge, Blue Osa, Botanika): $100-150 for 60-min. Used $120. SALTY includes $50 spa credit.',
      },
      {
        category: 'Airport Transfer',
        description: 'Local taxi from Puerto Jimenez airport (round-trip)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 80, emoji: '✈️',
        sourceUrl: 'https://www.google.com/search?q=Puerto+Jimenez+airport+taxi+transfer+price',
        sourceName: 'Google Search',
        methodology: 'Round-trip local taxi: $70 + 13% IVA ≈ $80. Taxis unmetered in Osa.',
      },
      {
        category: 'Ground Transport',
        description: 'Daily taxis in remote Osa (restaurants, beaches, activities), 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 150, emoji: '🚕',
        sourceUrl: 'https://www.tripadvisor.com/ShowTopic-g309279-i4523-k10567329-Transportation_sanity_check-Osa_Peninsula_Province_of_Puntarenas.html',
        sourceName: 'TripAdvisor Osa Transport',
        methodology: 'Osa is remote with no public transit. Taxis unmetered. ~5 days at $20-30/day + activity days. Total $150.',
      },
      { category: 'Community', description: '30+ like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SICILY — STRONG comparison (49% savings)
  // August peak season drives accommodation + private instruction costs.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'sicily-wellness-retreat',
    destination: 'Sicily',
    retreatName: 'SALTY Sicily: Endless Summer Round Due',
    nights: 7,
    saltyPriceFrom: 2099,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 25,
    items: [
      {
        category: 'Accommodation',
        description: 'Premium boutique beachside hotel, 7 nights (La Moresca-level, 4-star)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1678, emoji: '🏠',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Marina+di+Ragusa%2C+Sicily%2C+Italy&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com Marina di Ragusa',
        methodology: 'La Moresca 4-star boutique: base rate €189/night, August peak surcharge ~16%. Used €220/night × 7 = €1,540 ≈ $1,678 USD.',
      },
      {
        category: 'Meals — Breakfast',
        description: 'Full hotel/café breakfast (pastry, eggs, juice, coffee), 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 76, emoji: '☕',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g670523-Marina_di_Ragusa_Ragusa_Province_of_Ragusa_Sicily.html',
        sourceName: 'TripAdvisor Marina di Ragusa',
        methodology: 'Premium property breakfast €8-12/day. Used €10/day × 7 = €70 ≈ $76 USD.',
      },
      {
        category: 'Meals — Lunch',
        description: 'Multi-course lunch at Zuma Beach Club or equivalent, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 305, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g670523-Marina_di_Ragusa_Ragusa_Province_of_Ragusa_Sicily.html',
        sourceName: 'TripAdvisor Marina di Ragusa',
        methodology: 'Beach club lunch in August: antipasto + primo/secondo + beverage = €35-45/person. Used €40/day × 7 = €280 ≈ $305 USD.',
      },
      {
        category: 'Meals — Dinner',
        description: 'Multi-course dinner at quality trattoria, 5 nights (SALTY-covered group dinners)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 207, emoji: '🍷',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g194872-Ragusa_Province_of_Ragusa_Sicily.html',
        sourceName: 'TripAdvisor Ragusa',
        methodology: 'Quality trattoria: antipasto + primo/secondo + wine = €30-45. Used €38/dinner × 5 SALTY-covered dinners = €190 ≈ $207 USD.',
      },
      {
        category: 'Fitness & Yoga',
        description: 'Daily private instruction, 7 days (no public studios in rural Ragusa)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 458, emoji: '💪',
        sourceUrl: 'https://www.google.com/search?q=yoga+classes+Marina+di+Ragusa+Sicily+drop-in',
        sourceName: 'Google Search',
        methodology: 'Rural southeastern Sicily has NO documented daily group yoga studios. Private yoga/fitness instruction in Italy: €40-80/session. Used €60/session × 7 = €420 ≈ $458 USD.',
      },
      {
        category: 'Beach Club Access',
        description: 'Daily sunbed + umbrella at quality lido, 7 days (August peak pricing)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 168, emoji: '🏖️',
        sourceUrl: 'https://www.google.com/maps/search/beach+club+lido+Marina+di+Ragusa+Sicily',
        sourceName: 'Google Maps',
        methodology: 'Zuma Beach Club pricing: €18-25/day for sunbed + umbrella in August. Used €22/day × 7 = €154 ≈ $168 USD.',
      },
      {
        category: 'Bike Rental',
        description: 'Quality touring bicycle, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 164, emoji: '🚲',
        sourceUrl: 'https://www.google.com/maps/search/bike+rental+Marina+di+Ragusa+Sicily',
        sourceName: 'Google Maps',
        methodology: 'Trekking bike rentals: €20-25/day. Used €21.50/day × 7 = €150 ≈ $164 USD.',
      },
      {
        category: 'Cultural Excursions',
        description: '2 major guided day trips covering Noto, Modica, Syracuse (UNESCO baroque towns)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 436, emoji: '🏛️',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g187888-Activities-c42-Cefalu_Province_of_Palermo_Sicily.html',
        sourceName: 'TripAdvisor Sicily Tours',
        methodology: 'Private guided Val di Noto tour: €963 for up to 7 people. Shared small-group: €80-120/person/day. Used €200/day × 2 trips = €400 ≈ $436 USD.',
      },
      {
        category: 'Car Rental + Fuel',
        description: 'Mid-range car, 7 days + fuel (~450km). Essential in rural Sicily — no viable public transit.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 320, emoji: '🚗',
        sourceUrl: 'https://www.kayak.com/Sicily-Italy-Car-Rentals.1674.crr.html',
        sourceName: 'KAYAK Car Rentals Sicily',
        methodology: 'August peak: €35-50/day for mid-range car. Used €35/day × 7 = €245 + €45 fuel = €290 ≈ $320 USD.',
      },
      {
        category: 'Hosted Cocktail Evenings',
        description: '2 curated cocktail bar nights (premium cocktails + appetizers)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 98, emoji: '🍸',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g194872-c20-Ragusa_Province_of_Ragusa_Sicily.html',
        sourceName: 'TripAdvisor Ragusa Bars',
        methodology: 'Premium cocktails €12-18/drink. Per evening: 2 cocktails + appetizers = €45/person. Used €45 × 2 evenings = €90 ≈ $98 USD.',
      },
      {
        category: 'Airport Transfer',
        description: 'Private transfer Catania CTA → Ragusa (one-way, ~2 hrs)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 174, emoji: '✈️',
        sourceUrl: 'https://www.google.com/search?q=private+transfer+Catania+airport+to+Ragusa+price',
        sourceName: 'Google Search',
        methodology: 'Private transfer (1-4 people): €160 per vehicle. Solo traveler pays full rate. €160 ≈ $174 USD. Note: SALTY covers both directions.',
      },
      { category: 'Community', description: '25-30 like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PANAMA — STRONG comparison (38% savings)
  // Two-location logistics (Panama City + Santa Catalina) are a massive value-add.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'panama-surf-retreat',
    destination: 'Panama',
    retreatName: 'SALTY Panama: City to Sea',
    nights: 8,
    saltyPriceFrom: 2249,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 30,
    items: [
      {
        category: 'Accommodation — Panama City',
        description: 'Premium boutique hotel in Casco Viejo (American Trade Hotel level), 4 nights',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1280, emoji: '🏨',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Casco+Viejo%2C+Panama+City&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com Casco Viejo',
        methodology: 'American Trade Hotel 4-star heritage boutique: $264-359/night in March peak. Mid-point $320/night × 4 = $1,280.',
      },
      {
        category: 'Accommodation — Santa Catalina',
        description: 'Best available boutique resort in Santa Catalina, 5 nights',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 475, emoji: '🏠',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Santa+Catalina%2C+Panama&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com Santa Catalina',
        methodology: 'Santa Catalina is remote — limited premium options. Bambuda is the only true oceanfront boutique with pool. $95/night × 5 = $475.',
      },
      {
        category: 'Meals — Panama City',
        description: 'Multi-course meals in Casco Viejo (appetizer + main + drink), 4 days × 3 meals',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 340, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/RestaurantsNear-g294480-d317494-Casco_Viejo-Panama_City_Panama_Province.html',
        sourceName: 'TripAdvisor Casco Viejo',
        methodology: 'Quality Casco Viejo dining: breakfast $13, lunch $22, dinner (Tantalo, Fonda Lo Que Hay) $50. Daily $85 × 4 = $340.',
      },
      {
        category: 'Meals — Santa Catalina',
        description: 'Multi-course meals at best restaurants (fresh seafood), 5 days × 3 meals',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 305, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1091103-Santa_Catalina_Veraguas_Province.html',
        sourceName: 'TripAdvisor Santa Catalina',
        methodology: 'Premium seafood restaurants (Pescao, Chano\'s). Breakfast $9, lunch $22, dinner $30. Daily $61 × 5 = $305.',
      },
      {
        category: 'Surf Lessons',
        description: '3 group surf sessions in Santa Catalina, 2 hrs each',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 270, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/surf+school+Santa+Catalina+Panama',
        sourceName: 'Google Maps',
        methodology: 'Waluaa group lessons: $45/person/hour including board, leash, rash guard, GoPro. 3 sessions × 2 hours × $45 = $270.',
      },
      {
        category: 'Coiba National Park',
        description: 'Full-day boat trip to Coiba UNESCO site — snorkeling + lunch + guide',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🏝️',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g1091103-Activities-c61-Santa_Catalina_Veraguas_Province.html',
        sourceName: 'TripAdvisor Santa Catalina Tours',
        methodology: 'Shared boat tour $60-90/person + $20 national park entrance fee. $80 tour + $20 fee = $100.',
      },
      {
        category: 'Fitness & Yoga',
        description: 'Daily class drop-in, 9 days (Panama City studios + Santa Catalina)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 180, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+studio+Casco+Viejo+Panama+City',
        sourceName: 'Google Maps',
        methodology: 'Casco Yoga Panama $15-25/class. Santa Catalina options scarce. Used $20/class × 9 = $180.',
      },
      {
        category: 'Transfer — Panama City to Santa Catalina',
        description: 'PRIVATE transfer (~5.5 hrs). SALTY provides private group transport.',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 530, emoji: '🚐',
        sourceUrl: 'https://www.google.com/search?q=private+transfer+Panama+City+to+Santa+Catalina+price',
        sourceName: 'Google Search',
        methodology: 'Private transfer (solo traveler pays full vehicle rate): $500-553. Used $530. SALTY splits this across 20-30 guests. A public bus is $14.65 but takes 8-9 hours.',
      },
      {
        category: 'Airport Transfer',
        description: 'Private transfer Tocumen → Casco Viejo',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 35, emoji: '✈️',
        sourceUrl: 'https://www.google.com/search?q=Tocumen+airport+to+Casco+Viejo+private+transfer+price',
        sourceName: 'Google Search',
        methodology: 'Private transfer from Tocumen International: $30-40. Used $35.',
      },
      {
        category: 'Hosted Cocktail Evenings',
        description: '2 quality cocktail bar experiences (cocktails + appetizers)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 130, emoji: '🍸',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g294480-c20-Panama_City_Panama_Province.html',
        sourceName: 'TripAdvisor Panama City Bars',
        methodology: 'Premium cocktail bars (Element Bar, Tantalo Rooftop): 2-3 cocktails $10-12 each + appetizers $20-25 = ~$65/night × 2 = $130.',
      },
      { category: 'Community', description: '25-30 like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EL SALVADOR — MODERATE comparison (23% savings)
  // Private chef meals + luxury villa with 4 pools are the key differentiators.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'el-salvador-surf-retreat',
    destination: 'El Salvador',
    retreatName: 'SALTY El Salvador: Mar de Flores',
    nights: 7,
    saltyPriceFrom: 1949,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 20,
    items: [
      {
        category: 'Accommodation',
        description: 'Premium beachfront resort in El Tunco with pools (Boca Olas level), 7 nights',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1610, emoji: '🏠',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=El+Tunco%2C+La+Libertad%2C+El+Salvador&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com El Tunco',
        methodology: 'Boca Olas Resort Villas ($187-286/night, 3.5-star, beachfront). Used $230/night × 7 = $1,610. Still only 2 pools vs. SALTY\'s 4 private pools.',
      },
      {
        category: 'Meals',
        description: 'Multi-course restaurant meals (16 SALTY-covered + 5 on own)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 348, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g946436-El_Tunco_La_Libertad_Department.html',
        sourceName: 'TripAdvisor El Tunco',
        methodology: 'SALTY includes ~16 rotating-chef multi-course meals. DIY equivalent: appetizer + main + drink = $18/meal × 16 = $288. Remaining 5 meals at $12 = $60. Total $348.',
      },
      {
        category: 'Gym Access',
        description: 'Daily gym passes, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 70, emoji: '🏋️',
        sourceUrl: 'https://www.google.com/maps/search/gym+fitness+El+Tunco+El+Salvador',
        sourceName: 'Google Maps',
        methodology: 'El Tunco has limited dedicated gyms. Resort/hotel gym day passes: $10/day × 7 = $70.',
      },
      {
        category: 'Yoga Classes',
        description: 'Daily quality yoga class, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 105, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+class+El+Tunco+El+Salvador',
        sourceName: 'Google Maps',
        methodology: 'Balancé Yoga & Surf Retreat: $15/class for general public (includes mat, towel, tax). $15 × 7 = $105.',
      },
      {
        category: 'Tamanique Waterfall',
        description: 'Organized guided day trip (transport, guide, fees)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 40, emoji: '🌊',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g946436-Activities-El_Tunco_La_Libertad_Department.html',
        sourceName: 'TripAdvisor El Tunco',
        methodology: 'Organized half-day tour from El Tunco: $40/person including transport, mandatory guide, and entrance.',
      },
      {
        category: 'Airport Transfer',
        description: 'Private transfer SAL → El Tunco (round-trip)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 240, emoji: '✈️',
        sourceUrl: 'https://www.google.com/search?q=San+Salvador+airport+to+El+Tunco+private+transfer+price',
        sourceName: 'Google Search',
        methodology: 'Private transfer: $85-160 one-way. Used $120/direction × 2 (round-trip) = $240.',
      },
      {
        category: 'Hosted Cocktail Nights',
        description: '2 curated cocktail bar evenings (premium drinks + appetizers)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 102, emoji: '🍸',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g946436-c20-El_Tunco_La_Libertad_Department.html',
        sourceName: 'TripAdvisor El Tunco Nightlife',
        methodology: 'La Bonita Beach Club: $20 entry + 2 premium cocktails ($8 each) + appetizers ($15) = $51/night × 2 = $102.',
      },
      { category: 'Community', description: '30+ like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SRI LANKA — Comparison shown against TRIPLE tier ($2,249)
  // DIY is cheap in Sri Lanka. Value prop = hassle-free multi-location logistics.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'sri-lanka-surf-yoga-retreat',
    destination: 'Sri Lanka',
    retreatName: 'SALTY Sri Lanka: Island Tides',
    nights: 9,
    saltyPriceFrom: 2249,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 35,
    roomTierNote: 'Comparison shown for triple room ($2,249). Dorm pricing starts at $1,999.',
    items: [
      {
        category: 'Accommodation — Coast',
        description: 'Premium boutique hotel near Ahangama/Weligama, 6 nights (The Kip / Abode level)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 750, emoji: '🏠',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Ahangama%2C+Sri+Lanka&group_adults=1&no_rooms=1&nflt=class%3D4',
        sourceName: 'Booking.com Ahangama 4-Star',
        methodology: '4-star boutique average $99-249/night. The Kip $249/night, Abode from $117/night. Used $125/night (mid-premium with beach access) × 6 = $750.',
      },
      {
        category: 'Accommodation — Mountains',
        description: 'Premium boutique resort in Ella, 3 nights (98 Acres / Ella Flower Garden level)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 450, emoji: '🏔️',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Ella%2C+Sri+Lanka&group_adults=1&no_rooms=1&nflt=class%3D4',
        sourceName: 'Booking.com Ella 4-Star',
        methodology: 'Ella Flower Garden $76-207/night, 98 Acres $251+/night. Used $150/night (mid-premium with scenic views) × 3 = $450.',
      },
      {
        category: 'Meals — Breakfast',
        description: 'Quality restaurant breakfast (eggs, fruit, juice, coffee), 9 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 73, emoji: '☕',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1581498-Weligama_Southern_Province.html',
        sourceName: 'TripAdvisor Weligama',
        methodology: 'Full quality breakfast: 2,500 LKR (~$8.10). $8.10 × 9 = $73.',
      },
      {
        category: 'Meals — Lunch',
        description: 'Multi-course lunch (soup/appetizer + main + drink), ~7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 79, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1581498-Weligama_Southern_Province.html',
        sourceName: 'TripAdvisor Weligama',
        methodology: 'Quality multi-course lunch: 3,500 LKR (~$11.33). $11.33 × 7 = $79.',
      },
      {
        category: 'Meals — Dinner',
        description: 'Multi-course dinner (starter + main + drink), ~7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 102, emoji: '🍷',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1581498-Weligama_Southern_Province.html',
        sourceName: 'TripAdvisor Weligama',
        methodology: 'Quality multi-course dinner: 4,500 LKR (~$14.57). $14.57 × 7 = $102.',
      },
      {
        category: 'Surf Lessons',
        description: '4 premium surf sessions with video analysis coaching',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 220, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/surf+school+Weligama+Sri+Lanka',
        sourceName: 'Google Maps Weligama',
        methodology: 'Premium coaching with video: group $25-60/session, video analysis premium +$15. Used $55/session × 4 = $220.',
      },
      {
        category: 'Yoga Classes',
        description: 'Daily drop-in yoga, 9 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 38, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+class+Weligama+Sri+Lanka',
        sourceName: 'Google Maps Weligama',
        methodology: 'Drop-in yoga: 1,300 LKR (~$4.21). Sri Lanka yoga is genuinely affordable. $4.21 × 9 = $38.',
      },
      {
        category: 'Galle Fort Tour',
        description: 'Guided half-day walking tour of Galle Fort',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 15, emoji: '🏛️',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g297896-Activities-Galle_Galle_District_Southern_Province.html',
        sourceName: 'TripAdvisor Galle',
        methodology: 'Guided walking tour including entrance and refreshments: $15/person.',
      },
      {
        category: 'Train — Kandy to Ella',
        description: 'Scenic train ride Kandy → Ella (1st class reserved)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 15, emoji: '🚂',
        sourceUrl: 'https://www.google.com/search?q=Kandy+to+Ella+train+1st+class+ticket+price',
        sourceName: 'Google Search',
        methodology: 'Official 1st class: 3,000 LKR (~$10). With booking platform fee: $15. Famously cheap.',
      },
      {
        category: 'Little Adam\'s Peak + Nine Arches',
        description: 'Self-guided hikes + tuk-tuk transport in Ella',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 11, emoji: '🥾',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g1580896-Activities-Ella_Badulla_District_Uva_Province.html',
        sourceName: 'TripAdvisor Ella',
        methodology: 'No entrance fees. Tuk-tuk roundtrips: Little Adam\'s Peak $5 + Nine Arches $6 = $11.',
      },
      {
        category: 'Inland Transfers',
        description: '3 private car transfers: CMB→Ahangama + Ahangama→Ella + Ella→CMB',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 295, emoji: '🚗',
        sourceUrl: 'https://www.google.com/search?q=private+car+transfer+Colombo+to+Ahangama+Sri+Lanka+price',
        sourceName: 'Google Search',
        methodology: '3 legs, solo traveler pays full vehicle rate: CMB→Ahangama $110 + Ahangama→Ella $85 + Ella→CMB $100 = $295. SALTY splits this across the group.',
      },
      {
        category: 'Welcome Drinks + Cocktail Nights',
        description: '3 quality drinks events (welcome drinks + 2 hosted cocktail nights)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 36, emoji: '🍸',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g1581498-c20-Weligama_Southern_Province.html',
        sourceName: 'TripAdvisor Weligama Bars',
        methodology: 'Quality cocktails in Weligama/Ella: $5-7/drink. 2 drinks × 3 events = 6 drinks × $6 = $36.',
      },
      { category: 'Community', description: '30+ like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOROCCO — Comparison shown against DOUBLE tier ($2,399)
  // Morocco is cheap. Higher tier makes the comparison meaningful.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    retreatSlug: 'morocco-surf-yoga-retreat',
    destination: 'Morocco',
    retreatName: 'SALTY Morocco: Beyond the Dunes Part Two',
    nights: 7,
    saltyPriceFrom: 2399,
    estimatedDate: '2026-02-09',
    estimatedPlanningHours: 25,
    roomTierNote: 'Comparison shown for double room ($2,399). Dorm pricing starts at $1,999.',
    items: [
      {
        category: 'Accommodation',
        description: 'Premium boutique riad or surf villa in Taghazout (Munga Guesthouse / Hyatt Place level), 7 nights',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 1190, emoji: '🏠',
        sourceUrl: 'https://www.booking.com/searchresults.html?ss=Taghazout%2C+Morocco&group_adults=1&no_rooms=1',
        sourceName: 'Booking.com Taghazout',
        methodology: 'Premium boutique (NOT budget surf camp dorms). Munga Guesthouse €103-216/night, Hyatt Place $134-237/night. Used $170/night (mid-premium, solo double room) × 7 = $1,190.',
      },
      {
        category: 'Meals — Breakfast',
        description: 'Quality café breakfast (eggs/omelette + bread + juice + coffee), 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 42, emoji: '☕',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g304016-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
        methodology: 'Quality cafés (Red Clay, Teapot, Windy Bay): omelette + pastries + juice + coffee = 40-60 MAD. Used $6/day × 7 = $42.',
      },
      {
        category: 'Meals — Lunch',
        description: 'Multi-course lunch (starter + main + drink), 5 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 90, emoji: '🍽️',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g304016-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
        methodology: 'Quality restaurants: salad/starter + main + drink = 130-230 MAD. Used $18/day × 5 = $90.',
      },
      {
        category: 'Meals — Dinner',
        description: 'Multi-course dinner (starter + tagine/main + drink), 5 nights',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🍷',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g304016-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
        methodology: 'Quality restaurants (The Favela rooftop): starter + tagine/seafood + cocktail = 150-200 MAD. Used $20/dinner × 5 = $100.',
      },
      {
        category: 'Surf Lessons',
        description: '3 premium surf sessions (private or semi-private + board + wetsuit)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 327, emoji: '🏄',
        sourceUrl: 'https://www.google.com/maps/search/surf+school+Taghazout+Morocco',
        sourceName: 'Google Maps Taghazout',
        methodology: 'Premium instruction (not group camp): €70-100/private session. Used €100/session × 3 = €300 ≈ $327 USD.',
      },
      {
        category: 'Imsouane Day Trip',
        description: 'Full-day organized surf trip to Imsouane (transport + session + lunch)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 100, emoji: '🚌',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g304016-Activities-c61-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout Tours',
        methodology: 'Fully organized package: transport (~1.5 hrs each way) + surf session + board + lunch. Estimated $100.',
      },
      {
        category: 'Paradise Valley Excursion',
        description: 'Guided day trip to Paradise Valley (natural pools, cliff jumping)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 18, emoji: '🏊',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g304016-Activities-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout',
        methodology: 'Established guided tour: 200 MAD/person ($18 USD). 5-hour trip includes transport, guide, lunch.',
      },
      {
        category: 'Souk Tour',
        description: 'Guided souk exploration (Souk El Had) with local guide',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 33, emoji: '🛍️',
        sourceUrl: 'https://www.tripadvisor.com/Attractions-g293733-Activities-c42-Agadir_Souss_Massa.html',
        sourceName: 'TripAdvisor Agadir Tours',
        methodology: 'Professional guided tour: €30/adult including hotel pickup, multilingual guide. €30 ≈ $33 USD.',
      },
      {
        category: 'Yoga & Fitness',
        description: 'Daily premium yoga drop-in, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 105, emoji: '🧘',
        sourceUrl: 'https://www.google.com/maps/search/yoga+studio+Taghazout+Morocco',
        sourceName: 'Google Maps Taghazout',
        methodology: 'Premium studio drop-ins: DFrost €10, Blue Mind €15, Yozi €20-22/day. Used $15/class × 7 = $105.',
      },
      {
        category: 'Welcome Drinks + Hosted Nights',
        description: '2-3 quality cocktail/drinks evenings',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 60, emoji: '🍸',
        sourceUrl: 'https://www.tripadvisor.com/Restaurants-g304016-c20-Taghazout_Souss_Massa.html',
        sourceName: 'TripAdvisor Taghazout Bars',
        methodology: 'Premium venues (Seaven Bar, Bohemian Berber Bar): 2 drinks × 3 events = 6 drinks × $10 = $60.',
      },
      {
        category: 'Airport Transfer',
        description: 'Private transfer Agadir → Taghazout (round-trip)',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 60, emoji: '✈️',
        sourceUrl: 'https://www.google.com/search?q=Agadir+airport+to+Taghazout+private+transfer+price',
        sourceName: 'Google Search',
        methodology: 'Private transfer: 300 MAD (~$30) one-way. Round-trip = $60.',
      },
      {
        category: 'Local Transport',
        description: 'Daily taxis/shared transport to surf spots, restaurants, 7 days',
        saltyIncluded: true, saltyPrice: 0, diyPrice: 56, emoji: '🚕',
        sourceUrl: 'https://www.google.com/maps/search/taxi+Taghazout+Morocco',
        sourceName: 'Google Maps',
        methodology: 'Mix of shared taxis (15 MAD/trip) and short rides. ~4 trips/day × 7 days × $2/trip = $56.',
      },
      { category: 'Community', description: '25+ like-minded travelers who become your crew', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '👥' },
      { category: 'Trip Planning', description: 'Every detail handled — you just show up', saltyIncluded: true, saltyPrice: 0, diyPrice: 0, emoji: '📋' },
    ],
  },
];

export function getDIYComparison(retreatSlug: string): DIYComparison | undefined {
  return diyComparisons.find((c) => c.retreatSlug === retreatSlug);
}

export function getAllDIYComparisons(): DIYComparison[] {
  return diyComparisons;
}
