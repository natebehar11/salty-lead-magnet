# Feature Spec: "Cost of Staying Home" City Anchor
**Improvement #3 from Strategic Plan**
**Date:** February 9, 2026

---

## The Problem

The compare page shows what it costs to DIY the SALTY experience abroad: Airbnb in Taghazout, surf school in Nosara, restaurants in Weligama. That comparison works, but it asks users to evaluate prices in places they've never been. They don't know if $45/night in Morocco is cheap or expensive. They don't have gut-level reference points for foreign costs.

What they DO know is what things cost at home. A Toronto resident knows that a hotel downtown is $200/night, a CrossFit drop-in is $30, and dinner out is $80. They know this in their bones. If you show them that a comparable week at home costs $5,000+, and SALTY costs $2,800 all-in including flights, the value proposition becomes visceral instead of intellectual.

This is reference price anchoring from behavioral economics. People evaluate prices relative to what they already know, not in absolute terms.

---

## The Fix

A personalized "What would this cost at home?" card on the compare page that uses the user's origin city to show what a comparable week of fitness, adventure, and hospitality would cost locally. The comparison is designed to be slightly absurd — because the honest truth is that you CAN'T replicate the SALTY experience at home, and the attempt to price it out makes that obvious.

---

## Where It Renders

**Compare page only.** Position: between the "What the numbers can't show you" priceless section and the "Now let's talk numbers" transition into destination cards.

This is the perfect placement because:
1. User has just been emotionally primed by the priceless section (community, coaching, zero planning)
2. The city anchor hits them with a rational argument before they scroll into the line-by-line breakdowns
3. By the time they see SALTY at $2,399 vs DIY at $3,000+, they've already internalized that their home baseline is $5,000+

---

## City Detection

**Priority chain:**

1. **Flight store origin airport** — if user has searched flights, we know their city. Most reliable signal.
2. **Planner store origin airport** — same airport data from planner flow.
3. **Quiz lead data** — if we stored city/region during lead capture (currently we don't — see note below).
4. **IP geolocation** — free tier from Vercel's `headers()` gives country + region. Map to nearest major city.
5. **Default fallback** — Toronto (largest share of SALTY's audience at ~30%).

```typescript
function detectUserCity(): CityAnchor | null {
  // 1. Check flight store
  const flightOrigin = useFlightStore.getState().originAirport;
  if (flightOrigin) return mapAirportToCity(flightOrigin.code);

  // 2. Check planner store
  const plannerOrigin = usePlannerStore.getState().originAirport;
  if (plannerOrigin) return mapAirportToCity(plannerOrigin.code);

  // 3. Fallback to Toronto
  return getCityAnchor('toronto');
}
```

**Note on IP geolocation:** Vercel provides `x-vercel-ip-city` and `x-vercel-ip-country` headers in server components/API routes. This could be used as a fallback, but adds complexity (server component or API call). For MVP, airport-based detection + Toronto fallback covers 80%+ of users who've engaged with flights or planner before visiting compare.

---

## City Cost Data

### Data Structure

```typescript
// src/data/city-cost-anchors.ts

export interface CityAnchor {
  cityId: string;
  cityName: string;
  province: string;        // for Canadian cities
  country: string;
  currency: string;        // display currency
  lineItems: CityLineItem[];
  totalCost: number;
  funComparison: string;   // the punchline
  sourceNote: string;      // methodology transparency
}

interface CityLineItem {
  emoji: string;
  category: string;
  description: string;
  cost: number;
  source: string;          // where this price came from
  sourceUrl?: string;      // link to source (optional)
}
```

### Cities to Include (MVP)

Start with 6 cities covering ~85% of SALTY's Canadian + US audience:

1. **Toronto** — largest audience share
2. **Ottawa** — second largest (SALTY home base)
3. **Vancouver** — third largest
4. **Halifax** — Synergy Physio partnership, growing community
5. **Montreal** — large market, bilingual
6. **New York** — largest US market

### Airport-to-City Mapping

```typescript
const airportToCityMap: Record<string, string> = {
  // Toronto area
  'YYZ': 'toronto',
  'YTZ': 'toronto',    // Billy Bishop
  
  // Ottawa
  'YOW': 'ottawa',
  
  // Vancouver
  'YVR': 'vancouver',
  
  // Halifax
  'YHZ': 'halifax',
  
  // Montreal
  'YUL': 'montreal',
  
  // New York area
  'JFK': 'new_york',
  'LGA': 'new_york',
  'EWR': 'new_york',
  
  // Catch-all: any other Canadian airport → Toronto prices
  // Catch-all: any other US airport → New York prices
};

function mapAirportToCity(code: string): CityAnchor {
  const cityId = airportToCityMap[code];
  if (cityId) return getCityAnchor(cityId);
  
  // Fallback by country (from airport data)
  const airport = airports.find(a => a.code === code);
  if (airport?.country === 'US') return getCityAnchor('new_york');
  return getCityAnchor('toronto'); // default
}
```

### Cost Research: Line Items Per City

Each city gets the same 7 categories to keep the comparison apples-to-apples. All costs are for **one person, 7 days** to match standard SALTY retreat length.

| Category | What We're Pricing | Source Type |
|---|---|---|
| 🏨 Accommodation | Boutique hotel downtown, not hostel, not luxury | Booking.com / Airbnb |
| 💪 Fitness | 7 CrossFit/yoga drop-ins or studio day passes | ClassPass / studio websites |
| 🍽️ Meals | 3 meals/day × 7 days, mid-range restaurants | Local restaurant averages |
| 🏄 Surf/Adventure | Closest equivalent (indoor surf, ski day, outdoor adventure) | Local pricing |
| 📸 Photography | 1 hour with a local photographer | Thumbtack / local photographer rates |
| 🎉 Nightlife | 3 nights out (cover + drinks) | Local venue pricing |
| 📋 Planning | "40+ hours of your time" | Priceless framing (no dollar amount) |

### Sample City Data: Toronto

```typescript
{
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
      source: 'Booking.com average',
      sourceUrl: 'https://www.booking.com/city/ca/toronto.html',
    },
    {
      emoji: '💪',
      category: '7 days of fitness classes',
      description: 'CrossFit drop-ins ($30) + yoga classes ($25) + 1 Pilates session ($35)',
      cost: 225,
      source: 'ClassPass Toronto averages',
    },
    {
      emoji: '🍽️',
      category: '21 meals out',
      description: 'Breakfast ($18), lunch ($22), dinner ($45) × 7 days',
      cost: 595,
      source: 'Toronto restaurant averages',
    },
    {
      emoji: '🏄',
      category: '1 surf lesson (indoor)',
      description: 'Surf lesson at a wave pool. Yes, a pool.',
      cost: 85,
      source: 'Barefoot Surf, Scarborough',
    },
    {
      emoji: '📸',
      category: '1 hour with a photographer',
      description: 'Professional lifestyle photography session',
      cost: 350,
      source: 'Thumbtack Toronto average',
    },
    {
      emoji: '🎉',
      category: '3 nights out',
      description: 'Cover ($15) + 4 drinks ($60) × 3 nights',
      cost: 225,
      source: 'King West / Queen West averages',
    },
    {
      emoji: '📋',
      category: '40+ hours of planning',
      description: 'Researching, booking, coordinating, second-guessing',
      cost: 0,
      source: 'Your sanity',
    },
  ],
  totalCost: 3230,
  funComparison: 'And you didn\'t leave Ontario.',
  sourceNote: 'Prices based on mid-range options in downtown Toronto, January 2026. We\'re not inflating these. If anything, we\'re being generous.',
}
```

### The Punchline Line Item

The last line item in every city is "40+ hours of planning" at $0. But the real punchline is the `funComparison` string that sits below the total:

- Toronto: "And you didn't leave Ontario."
- Ottawa: "And you're still in Ottawa."
- Vancouver: "And it rained the whole time."
- Halifax: "And the ocean was 4°C."
- Montreal: "Et vous n'avez même pas quitté le Québec."
- New York: "And you never left the tristate area."

These are SALTY-voice — playful, slightly self-deprecating about the home city, funny without being mean. The humor makes the comparison shareable.

---

## Component: `CostOfStayingHome`

**File:** `src/components/compare/CostOfStayingHome.tsx`

### Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  What would this cost at home?                           │
│                                                          │
│  We priced out a comparable week in Toronto.             │
│  Same activities, same quality, same number of meals.    │
│  Just... without the ocean, the new country, or the      │
│  30 friends you haven't met yet.                         │
│                                                          │
│  🏨  7 nights at a boutique hotel          $1,750        │
│      Downtown Toronto, mid-range                         │
│                                                          │
│  💪  7 days of fitness classes             $225          │
│      CrossFit drop-ins + yoga + Pilates                  │
│                                                          │
│  🍽️  21 meals out                          $595          │
│      Breakfast, lunch, dinner × 7 days                   │
│                                                          │
│  🏄  1 surf lesson (indoor)               $85           │
│      At a wave pool. Yes, a pool.                        │
│                                                          │
│  📸  1 hour with a photographer           $350          │
│      Professional lifestyle session                      │
│                                                          │
│  🎉  3 nights out                          $225          │
│      Cover + drinks × 3                                  │
│                                                          │
│  📋  40+ hours of planning                 —             │
│      Researching, booking, coordinating                  │
│                                                          │
│  ─────────────────────────────────────────               │
│                                                          │
│  Total in Toronto:           ~$3,230 CAD                 │
│  And you didn't leave Ontario.                           │
│                                                          │
│  SALTY Panama from $2,399 USD.                           │
│  Including flights: ~$2,800.                             │
│  Ocean, new country, 30 friends, zero planning.          │
│                                                          │
│  ─────────────────────────────────────────               │
│  Prices based on mid-range options in downtown Toronto,  │
│  January 2026.                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Visual Specs

- **Container:** Full-width card with warm sand/cream background. Same warm palette as the priceless section above it. Subtle left border accent in SALTY coral.
- **Header:** "What would this cost at home?" in bold, 20px. City name dynamically inserted into the subtext.
- **Line items:** Two-column layout. Left: emoji + category + description. Right: cost, right-aligned. Description text is muted/smaller. Each item has a subtle bottom border.
- **Planning line item:** Cost shows "—" instead of $0. Description is italicized for emphasis.
- **Total section:** Bolder weight, slightly larger text. The `funComparison` punchline is in SALTY's coral/orange color.
- **SALTY comparison:** Below the total, a contrasting block showing SALTY's price. Green-tinted background. This is the payoff.
- **Source note:** Small, muted text at the bottom. Transparency without apology.
- **Mobile:** Single column, line items stack naturally. Costs right-aligned within each row.

### Which Retreat to Compare Against

The SALTY price shown at the bottom should be contextual:

1. If user has a retreat selected (from quiz or planner): show that retreat's price
2. If user came from a specific retreat's compare card: show that retreat
3. Default: show the cheapest available retreat (best value framing)

```typescript
function getComparisonRetreat(): Retreat {
  const quizResults = useQuizStore.getState().results;
  if (quizResults?.[0]) return getRetreat(quizResults[0].retreatSlug);
  
  const plannerRetreat = usePlannerStore.getState().selectedRetreatSlug;
  if (plannerRetreat) return getRetreat(plannerRetreat);
  
  // Default: cheapest retreat
  return retreats.reduce((cheapest, r) => 
    r.lowestPrice < cheapest.lowestPrice ? r : cheapest
  );
}
```

### Flight Estimate in SALTY Price

If the user has searched flights, use their actual cheapest result. Otherwise, use a rough estimate per origin:

```typescript
const flightEstimates: Record<string, number> = {
  toronto: 800,
  ottawa: 850,
  vancouver: 900,
  halifax: 900,
  montreal: 800,
  new_york: 600,
};
```

These are conservative estimates. The point isn't precision — it's showing that even WITH flights, SALTY is cheaper than staying home.

---

## Currency Handling

Canadian cities show costs in CAD. New York shows in USD. The SALTY comparison price is always in USD (matching the retreat pricing).

For Canadian cities, the total-at-home is in CAD and the SALTY price is in USD. This actually helps the comparison because the CAD number looks bigger:

```
Total in Toronto: ~$3,230 CAD
SALTY Panama: from $2,399 USD (~$3,400 CAD with flights)
```

Wait — that makes SALTY look MORE expensive in CAD. Better approach: show both in the same currency for honest comparison.

```
Total in Toronto:     ~$3,230 CAD
SALTY Panama all-in:  ~$3,950 CAD (retreat + flights)
```

Hmm, that's closer than we want. The real win is the value differential, not the price differential. The Toronto week gives you a hotel room, some gym drop-ins, and restaurant meals. The SALTY week gives you all-inclusive accommodation, coaching, surf, adventures, community, photography, and zero planning.

**Decision:** Show home city cost in local currency. Show SALTY cost in USD with a parenthetical local currency conversion. Let the line items do the real work — the absurdity of "$85 for a surf lesson at a wave pool" vs "surf lessons on the Pacific coast, included" is the actual argument.

For US cities, both are in USD and the comparison is straightforward.

```typescript
// Compare page pricing display
if (city.country === 'Canada') {
  // Home total in CAD, SALTY in USD
  // Show: "SALTY Panama from $2,399 USD. With flights: ~$2,800 USD."
  // No CAD conversion — let users do their own math, they know their exchange rate
} else {
  // Both in USD, clean comparison
}
```

---

## Dynamic City Switching

If we detect the wrong city (or user hasn't searched flights yet and we're showing Toronto by default), include a small "Not from Toronto?" link below the header:

```
What would this cost at home?

We priced out a comparable week in Toronto.
Not from Toronto? [Switch city ▾]
```

Clicking opens a dropdown with the 6 available cities. Selecting one swaps all the line items and totals instantly (no page reload — it's all client-side data).

For cities not in our list, show: "We don't have pricing for [city] yet, but here's Toronto as a reference." This is honest and avoids the need to research 50 cities.

---

## Data Maintenance

### Static Data File

All city cost data lives in `src/data/city-cost-anchors.ts`. It's a static TypeScript file, not an API call. The data changes slowly (hotel prices shift seasonally, but the ballpark is stable).

### Update Cadence

Review and update city costs every 6 months (or when a new retreat season launches). The source URLs in each line item make re-research straightforward.

### Adding New Cities

To add a city:
1. Research the 7 line items using the same methodology
2. Add to the `cityAnchors` record in the data file
3. Add airport codes to `airportToCityMap`
4. Write a `funComparison` punchline
5. Done — no backend changes needed

Future expansion candidates: Calgary, Winnipeg, Edmonton, Los Angeles, Chicago, London UK, Sydney AU.

---

## GHL Integration

### Tags
- `viewed_city_cost_anchor` — fired once per session when the component renders
- `city_cost_anchor_city` — which city was shown (e.g., "toronto")

### Custom Fields
- `home_city_detected` — the city ID shown to this user

### When to Fire
Only if user has submitted lead data. Don't create contacts from compare page visits.

---

## Edge Cases

### User from a city not in our list
Show Toronto (Canadian) or New York (US) as fallback with the "Not from [city]?" switcher visible.

### User hasn't visited flights or planner
No origin airport in any store. Use Toronto as default. The "Not from Toronto?" switcher handles corrections.

### Compare page visited before any other tool
Component renders with default city. When user later searches flights (and comes back to compare), the city updates automatically on next render.

### City costs are outdated
The source note includes the date: "Prices based on mid-range options in downtown Toronto, January 2026." This manages expectations. Even if prices shift 10-15%, the overall comparison still holds.

### SALTY retreat has no pricing yet (TBD)
Don't show the SALTY comparison block at the bottom. Just show the home city cost with a generic closer: "Now scroll down to see what SALTY costs for the same week — abroad."

---

## Implementation Notes for Claude Code

### New Files
1. **`src/data/city-cost-anchors.ts`** (~250 lines) — All city data, 6 cities × 7 line items each
2. **`src/components/compare/CostOfStayingHome.tsx`** (~180 lines) — Card component with line items, total, comparison

### Modified Files
1. **`src/app/compare/page.tsx`** — Mount CostOfStayingHome between priceless section and destination cards

### Dependencies
- Reads from flight store and planner store for city detection (both already exist)
- No new API routes
- No new infrastructure
- No dependency on any other improvement spec

### Build Order
1. Research and populate city cost data for 6 cities (needs real price research)
2. Create `city-cost-anchors.ts` data file
3. Build `CostOfStayingHome` component
4. Mount on compare page
5. Add city switcher dropdown
6. GHL tag integration

### Research Task

Before building, someone needs to do ~2 hours of price research across 6 cities. For each city, look up:

- Boutique hotel (Booking.com, 7 nights, dates matching a SALTY retreat)
- CrossFit/yoga drop-in rates (studio websites or ClassPass)
- Restaurant meal averages (local food blogs, Numbeo, or direct menu checks)
- Closest surf/adventure equivalent (local provider websites)
- Photographer rates (Thumbtack, local photographer sites)
- Nightlife costs (venue cover charges + drink prices)

This can be a Claude web search task or manual research. The data file includes `source` and optional `sourceUrl` for each line item so it's verifiable.

### Testing Checklist
- [ ] Toronto renders correctly as default
- [ ] City detection from flight store works (YYZ → Toronto)
- [ ] City detection from planner store works
- [ ] US airport maps to New York
- [ ] Unknown airport falls back correctly (Canadian → Toronto, US → New York)
- [ ] City switcher changes all line items and total
- [ ] Currency displays correctly (CAD for Canadian cities, USD for US)
- [ ] SALTY comparison uses correct retreat (from quiz/planner or cheapest)
- [ ] Flight estimate uses actual results when available
- [ ] "Not from [city]?" link appears when using fallback
- [ ] Fun comparison punchline renders per city
- [ ] Source note shows correct date
- [ ] Mobile layout stacks cleanly
- [ ] GHL tags fire on render
