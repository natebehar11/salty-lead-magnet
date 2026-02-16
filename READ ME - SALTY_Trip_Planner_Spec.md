# SALTY Trip Planner — Complete Feature Spec
**Version:** 1.0
**Date:** February 9, 2026
**Status:** Final (ready for build)

---

## Overview

The Trip Planner turns a single retreat booking into a full multi-city trip. Users build an itinerary around their SALTY retreat, get AI-powered city and activity recommendations personalized to their quiz answers, search real flights for every leg, and share the whole plan with themselves or friends.

**Core value prop:** No other retreat company gives you a personalized travel concierge that knows how you like to travel and helps you build the week around the week.

**H1:** "Build the trip around the trip."

---

## Entry Flow

Three paths into the planner, all converging on a personalized experience.

### Path A: User has quiz data (localStorage)

Quiz store already contains answers, lead data, and results from a previous session or earlier in this visit.

**Flow:**
1. User lands on `/planner`
2. App checks `salty-quiz-state` in localStorage
3. Quiz data found — planner loads immediately
4. Top quiz match pre-selected as retreat (user can change)
5. City suggestions available from first interaction

### Path B: No quiz data, takes full quiz

**Flow:**
1. User lands on `/planner`
2. No quiz data found — prompt screen appears
3. User taps "Take the 2-Minute Quiz"
4. Navigates to `/quiz?return=planner`
5. Completes 9-question quiz + lead capture
6. Redirects to `/results` with banner: "Your trip planner is ready. Pick a retreat to start planning."
7. Each retreat card on results page gets a "Plan This Trip" button
8. Tapping "Plan This Trip" navigates to `/planner` with that retreat pre-loaded

**Technical:** Add `returnTo` query param support. Quiz store checks for `returnTo` on completion. Results page reads it and shows the planner banner + "Plan This Trip" CTAs.

### Path C: No quiz data, knows their retreat

**Flow:**
1. User lands on `/planner`
2. No quiz data — prompt screen appears
3. User taps "Already know which retreat you're heading on?"
4. Retreat selector grid slides in (future bookable retreats only)
5. User taps a retreat
6. Mini-quiz appears inline (4 questions, same page)
7. User completes mini-quiz, taps "Build My Trip"
8. Planner loads with selected retreat + partial quiz data for personalization

### Prompt Screen Copy

```
H1: Build the trip around the trip.

Subtext: We'll suggest cities, hidden gems, and the best gyms, 
restaurants, and things to do based on how you actually like to 
travel. Two minutes of questions, a whole trip's worth of answers.

[Take the 2-Minute Quiz]  ← primary CTA button

Already know which retreat you're heading on?  ← text link
```

### Retreat Selector

Grid of cards showing future bookable retreats only. Each card:
- Country flag + destination name
- Dates
- Retreat name

```
H2: Which retreat are you building around?
```

Cards: Only retreats with `status: 'open' | 'waitlist' | 'coming_soon'`

### Mini-Quiz (4 questions, inline)

Appears on the planner page after retreat selection. Not a separate route. Feels lightweight. 30 seconds to complete.

**Header:** "Quick hits so we can nail your suggestions."
**Subtext:** "4 questions. 30 seconds. Way better recommendations."

**Question 1: What's your travel vibe?** (multi-select, up to 3)
- Culture and food
- Nightlife and party
- Nature and adventure
- Beach and relaxation
- City exploring

**Question 2: Must-haves for your trip?** (multi-select, up to 3)
- Surf
- Hiking
- Great food scenes
- Historical sites
- Nightlife
- Wildlife and nature

**Question 3: Party vs. Chill?** (slider, 1-10)
- 1 = hammock and a book
- 10 = last one off the dance floor

**Question 4: Travel experience?** (single select)
- First international trip
- A few trips under my belt
- Seasoned traveler

**CTA button:** "Build My Trip"

**Data storage:** Mini-quiz answers stored to quiz store as partial `answers` object. Personalization engine uses whatever exists (full 9-question or partial 4-question). Claude API prompt includes `"quizDepth": "full"` or `"quizDepth": "mini"`.

**Lead capture:** Does NOT happen here. Lead capture triggers when user tries to share/save their itinerary. Keeps entry frictionless.

---

## Returning Users

If someone returns to `/planner` with an existing itinerary in localStorage (within 30-day expiry):

```
H2: Welcome back. Pick up where you left off?

[Mini itinerary summary]
  Lisbon (3 days) > Panama (retreat) > Bogota (4 days)

[Continue This Trip]    [Start Fresh]
```

"Start Fresh" clears the planner store but keeps quiz data intact.

---

## Itinerary Builder

### Visual Timeline

Horizontal scrollable timeline, same concept as current architecture but with richer city cards.

```
[+ Before] > [City Card] > [City Card] > [RETREAT] > [City Card] > [+ After]
```

**Retreat anchor card:** Visually distinct (brand color background). Shows destination, dates, duration. Not removable.

**"+ Before" button hint:** "Arriving early? Add a city or two before your retreat."
**"+ After" button hint:** "Not ready to go home? Keep the trip going."

### City Cards (with highlights)

When a city is added AND quiz data exists, a Claude API call fires to generate personalized highlights. Card displays:

```
+-----------------------------------------------+
| [flag] Medellin, Colombia · 3 days          [x] |
|                                                |
| "Your kind of city. Great food, nightlife      |
|  that goes late, and neighborhoods worth        |
|  getting lost in."                              |
|                                                |
|  Comuna 13 — Street art tour, local guides      |
|  Mercado del Rio — 40+ vendor food hall         |
|  Bodytech Poblado — Drop-in gym, full weights   |
|  Parque Lleras — Salsa bars and rooftop drinks  |
|  Jardin Botanico — Free botanical garden        |
|                                                |
|  Show details                                   |
+-----------------------------------------------+
```

**Collapsed state (default):** Flag, city name, country, days, remove button. One-line summary. Highlight names only (no descriptions).

**Expanded state (tap "Show details"):** Full card with match summary, all highlights with descriptions, match tag at bottom.

**Match tag:** "Based on your love of culture, food, and nightlife" — pulled from quiz answers that triggered these specific recommendations.

### City Cards (without quiz data)

If user manually types a city before completing quiz or mini-quiz:

```
+-----------------------------------------------+
| [flag] Medellin, Colombia · 3 days          [x] |
|                                                |
| Want personalized recommendations for           |
| gyms, restaurants, and things to do?            |
|                                                |
| [Answer 4 quick questions]                      |
+-----------------------------------------------+
```

After completing mini-quiz, ALL city cards retroactively populate with highlights via a batch Claude API call.

### City Limit

Maximum 5 cities per itinerary (before + after combined). When the user hits 5, the "+ Before" and "+ After" buttons disable with tooltip: "5 cities max. Remove one to add another."

Why 5: keeps API costs predictable, prevents abuse, and honestly if someone's adding 6+ cities they're planning a round-the-world trip, not a retreat add-on.

### City Autocomplete

Same ~80 cities from current architecture. Type-ahead filtering, keyboard navigation, click-outside dismiss.

### Trip Counter

```
Your trip: 14 days of not being at work.
```

Updates live as cities and days are added/removed.

---

## AI City Suggestions

### How It Works

When quiz data exists and a retreat is selected, the app can generate personalized city suggestions. Two trigger points:

1. **Automatic:** After planner loads with quiz data, show a "Suggested cities" section below the timeline with 3-4 recommendations based on retreat region + quiz answers.

2. **On-demand:** User types additional preferences in a text input for refined suggestions.

### Suggestion Section Copy

**With quiz data:**
```
H3: Cities that match your vibe

Subtext: Based on your love of [top 2 vibes]. 
Tap any city to add it to your trip.
```

**Text input label:** "Anything else you're into? Tell us and we'll factor it in."
**Placeholder:** "I love street food, rooftop bars, and getting lost in markets..."
**Button:** "Show Me Cities"

### Claude API Call Structure

**Prompt template:**

```
You are a travel recommendation engine for SALTY Retreats, a fitness 
and adventure travel brand for fun-loving adults.

User profile:
- Vibes: [from quiz]
- Must-haves: [from quiz]
- Party vs Chill: [X]/10
- Travel experience: [from quiz]
- Additional input: "[user typed text if any]"
- Quiz depth: [full/mini]

Retreat: [name] in [destination], [dates]

Task: Recommend [3-4] cities near [retreat destination] for a 
traveler adding days before or after their retreat.

For each city, provide [5 or 7] highlights (5 for 1-2 day stays, 
7 for 3+ day stays).

Highlight rules:
- Include a gym/fitness spot ONLY if user selected fitness-related 
  vibes or must-haves
- Always include at least 1 food/restaurant recommendation
- Remaining highlights matched to user's stated vibes and must-haves
- Include practical details: drop-in policies for gyms, best 
  days/times for nightlife, walking distances, price indicators
- Write in SALTY voice: short sentences, specific, warm, grounded. 
  No spiritual wellness language. No filler adjectives like 
  "vibrant" or "stunning" or "nestled." No "it's not just X, it's Y."
- Each highlight needs: name, type, one sentence description with 
  a real useful detail, which quiz answer it matches

Return as JSON only. No markdown. No preamble.
```

**Response structure:**

```json
{
  "cities": [
    {
      "city": "Medellin",
      "country": "Colombia",
      "countryCode": "CO",
      "recommendedDays": 3,
      "position": "after",
      "matchSummary": "Your kind of city. Great food scenes, nightlife that goes late, and neighborhoods worth getting lost in.",
      "travelNote": "Direct flights from Panama City, about 2 hours.",
      "highlights": [
        {
          "name": "Mercado del Rio",
          "type": "food",
          "description": "Food hall with 40+ vendors. Arepas, ceviche, craft beer, and a rooftop. Go hungry.",
          "matchReason": "food"
        },
        {
          "name": "Bodytech Poblado",
          "type": "gym",
          "description": "Best drop-in gym in the area. Full weights, classes, day passes available. 15 min walk from El Poblado.",
          "matchReason": "fitness"
        }
      ]
    }
  ]
}
```

### Highlight Types

Valid types for the `type` field:
- `culture` — museums, historic sites, street art, architecture
- `food` — restaurants, markets, food halls, street food
- `gym` — gyms, CrossFit boxes, climbing walls, fitness studios
- `nightlife` — bars, clubs, live music, salsa spots
- `nature` — parks, gardens, hikes, beaches, viewpoints
- `adventure` — surf, diving, zip-lining, day trips
- `wellness` — spas, hammams, yoga studios (only if user selected relaxation vibes)
- `shopping` — markets, neighborhoods, local crafts

### Highlight Count Rules

| Stay length | Highlights per city |
|-------------|-------------------|
| 1-2 days | 5 |
| 3+ days | 7 |

### Gym Inclusion Rule

Include a gym/fitness recommendation ONLY when user selected any of:
- Vibe: "Nature and adventure" (implies active)
- Must-have: "Surf" or "Hiking"
- Or any explicitly fitness-related quiz answer

Do NOT force a gym recommendation for users whose vibes are purely culture, food, nightlife, or relaxation focused.

### Fallback (Claude API unavailable)

Pre-build a static set of 5-6 generic city suggestions per retreat region. No personalization, no highlights. Just city name, country, recommended days, and a one-line description. This is the safety net, not the primary experience.

### Highlight Persistence

Claude API responses stored in the planner Zustand store alongside each city in the itinerary. Persists in localStorage with 30-day expiry. No re-fetching on return visits.

If quiz data changes after highlights were generated (user retakes quiz), show subtle prompt on city cards: "Your preferences changed. [Refresh suggestions]"

---

## Flight Integration

### The Rule

Every leg of the itinerary gets full in-app flight search via SerpAPI.

### How It Works

Once a user has built an itinerary with at least one city, the flight section appears. Each leg is derived automatically from the itinerary order.

**Example itinerary:**
Toronto (home) > Lisbon (3 days) > Panama City [RETREAT 8 days] > Bogota (4 days) > Toronto (home)

**Generated legs:**
1. Toronto to Lisbon — Mar 11
2. Lisbon to Panama City — Mar 14
3. Panama City to Bogota — Mar 22
4. Bogota to Toronto — Mar 26

**Departure dates calculated from:**
- Leg 1: Retreat start date minus total pre-retreat days
- Subsequent legs: Previous city departure + days in that city
- Post-retreat legs: Retreat end date + accumulated post-retreat days
- Final leg: Last city departure + days in last city

### Multi-City Booking Disclaimer

The planner searches each leg as a separate one-way flight. Multi-city tickets booked as a single itinerary through an airline or Google Flights are often cheaper than the sum of separate legs.

**Disclaimer copy (shown above flight results, always visible):**

"Heads up: we search each leg separately, so the prices you see are one-way fares. If you're flying to multiple cities, booking them as a single multi-city ticket on Google Flights or through an airline is usually cheaper. Use these results to get a sense of routes and pricing, then book smart."

**Google Flights multi-city link:**

Below the disclaimer, generate a single link that opens Google Flights with all legs pre-filled:

"[Search all legs as one trip on Google Flights]"

This constructs a Google Flights multi-city URL encoding all origins, destinations, and dates. Zero API cost, gives the user the best possible booking experience for complex itineraries.

### Flight Results UI

Each leg gets its own collapsible section, stacked vertically in timeline order.

```
YOUR FLIGHTS

Leg 1: Toronto to Lisbon · Mar 11
  [Day of]  [Day before]               ← date tabs
  +------------------------------------------+
  | TAP Air Portugal · $412 · 7h direct   [ ]|
  | Air Canada · $389 · 9h 1 stop        [ ]|
  | Lufthansa · $445 · 10h via Frankfurt  [ ]|
  +------------------------------------------+
  Filters: stops, airlines, time
  Sort: cheapest | best | fastest

Leg 2: Lisbon to Panama City · Mar 14
  [Day of]  [Day before]
  ...

Leg 3: Panama City to Bogota · Mar 22
  [Day of]  [Day after]  [+2 days]
  ...

Leg 4: Bogota to Toronto · Mar 26
  [Day of]  [Day after]
  ...

ESTIMATED TOTAL: ~$1,223  (sum of selected flights)
```

### Date Tabs Per Leg

Each leg shows:
- **Day of** (auto-loads on section expand)
- **Day before** (lazy load — API call on tap)
- For return/post-retreat legs: **Day after** and **+2 days** also available (lazy load)

### API Budget

- **Plan:** SerpAPI Developer tier, $75/month, 5,000 searches
- **Per user (simple trip, no extra cities):** 2 calls
- **Per user (1 extra city pre or post):** 3 calls
- **Per user (cities on both sides):** 4 calls
- **Per user with date tab exploration:** 6-8 calls
- **Blended average:** ~4 calls per planner user
- **Monthly capacity at 4 calls/user:** ~1,250 planner users
- **Shared budget with flight finder + compare mode**

### Flight Card Features

Same as the standalone flight finder:
- Airline, price, duration, stops
- Google Flights deep link per flight
- Checkbox for selection (not hearts/favorites)
- Filters: stops, departure time, airlines
- Sort tabs: cheapest, best, fastest

### Running Total

When user selects one flight per leg, a running total appears:

```
Estimated flights: ~$1,223  (4 of 4 legs selected)
```

This total is included in the shared itinerary.

### Origin Airport

If user came from the flight finder, origin airport carries over from flight store.

If user enters planner fresh, prompt for home airport before showing flights:
```
Where are you flying from?
[Airport search input]
```

Stored in planner store and reused across all legs.

---

## Sharing

Same share tray pattern as flights and compare page. Triggered from a sticky bottom bar.

### Trigger

Sticky bottom bar appears when itinerary has 1+ cities:

```
[Send My Trip Plan]  (X cities · Y flights selected)
```

Tapping triggers lead capture if not already captured. After capture, share tray opens.

### Lead Capture (if needed)

```
H3: Almost there. Where should we send this?

Subtext: Your full trip plan with cities, recommendations, 
flights, and everything in between.

[First name]
[Email]
[WhatsApp number]

[Send My Trip Plan]
```

### Share Tray Options

**1. WhatsApp to self**

Pre-filled message with full itinerary. Highlights truncated to top 3 per city (name only, no descriptions) to keep the message scannable on mobile. Full highlights are in the email version.

```
[flag] Your SALTY Trip Plan

[flag] Lisbon, Portugal (3 days)
  Top picks: Time Out Market, Bodytech Gym, Bairro Alto nightlife

[flag] SALTY Panama — City to Sea (8 days)
  Mar 14-22 · saltyretreats.com/retreats/panama

[flag] Bogota, Colombia (4 days)
  Top picks: La Candelaria, Andres Carne de Res, specialty coffee scene

Your flights:
  YYZ to LIS: $412 (TAP, 7h direct)
  LIS to PTY: $287 (Iberia, 11h via Madrid)
  PTY to BOG: $148 (Copa, 1h 20m)
  BOG to YYZ: $376 (Avianca, 7h 1 stop)

Estimated total flights: ~$1,223

Plan your trip: explore.getsaltyretreats.com/planner
```

Each flight line includes a Google Flights deep link.

**2. Email to self (branded SALTY email via GHL)**

Full visual email with sections:

Section 1 — Trip overview
  Visual itinerary bar showing the flow of cities and retreat.
  Total days, estimated flight cost.

Section 2 — City cards with full highlights
  Each city gets its own block with all highlights, full descriptions.
  Flag + city name as header. Highlights listed with name and description.
  No emojis except country/city flags.

Section 3 — Flight selections
  Each leg with airline, price, duration. 
  Google Flights button per leg (deep link).

Section 4 — Retreat CTA
  "Ready to lock in [Panama]?"
  [Book Your Spot] button linking to retreat page
  [Chat with us on WhatsApp] secondary CTA

Section 5 — Footer
  "Come back anytime: explore.getsaltyretreats.com/planner"
  Pre-filled origin airport in URL for frictionless re-entry.

**3. Email to friend**

Same city highlights, flights, and itinerary content. Different framing:

- Subject: "[Name] built a trip and thinks you should come"
- Opening: "Your friend [Name] is heading to Panama with SALTY and put together a trip plan. They thought you'd want to see it."
- Same city cards with highlights
- Same flights section
- CTA: "Want to find your perfect retreat?" linking to quiz
- Secondary CTA: WhatsApp link
- Creates new GHL contact with tags (see below)

---

## GHL Integration

### Tags from Planner Actions

| Action | Tags applied | Notes |
|--------|-------------|-------|
| Completed mini-quiz | `planner_user`, `interested_[retreat_slug]` | On "Build My Trip" tap |
| Generated city suggestions | `ai_suggestions_used` | On first Claude API call |
| Built itinerary (1+ cities) | `planner_active` | On first city add |
| Searched flights in planner | `planner_flights_searched` | On first flight search |
| Shared via WhatsApp to self | `itinerary_saved`, `interested_[retreat_slug]` | Nurture trigger in 5 days |
| Shared via email to self | `itinerary_saved`, `interested_[retreat_slug]` | Nurture trigger in 5 days |
| Shared via email to friend | `itinerary_shared`, `referral_sent` | Thank-sender email |
| Friend received email | `referral`, `referred_by_[sender_name]`, `interested_[retreat_slug]` | New contact, soft intro sequence |
| Lead captured from planner | `lead`, `planner_lead`, `origin_[airport_code]` | Welcome email with re-entry link |

### Custom Fields

| Field | Value | Source |
|-------|-------|--------|
| `planner_retreat` | Retreat slug | Selected retreat |
| `planner_cities` | Comma-separated city list | Itinerary |
| `planner_total_days` | Number | Calculated |
| `planner_flight_estimate` | Dollar amount | Sum of selected flights |
| `quiz_depth` | "full" or "mini" | Which quiz path they took |
| `origin_airport` | IATA code | Airport search input |

---

## Data Architecture

### Planner Store (`src/stores/planner-store.ts`)

Zustand store with `persist` middleware. localStorage key: `salty-planner-state`. 30-day expiry.

```typescript
interface PlannerStore {
  // Core state
  selectedRetreatSlug: string | null;
  originAirport: Airport | null;
  itinerary: ItineraryCity[];
  
  // Mini-quiz (Path C)
  miniQuizAnswers: MiniQuizAnswers | null;
  
  // Flight state
  flightResults: Record<string, FlightLegResults>; // keyed by leg ID
  selectedFlights: Record<string, string>; // leg ID -> flight ID
  
  // UI state (not persisted)
  isLoading: boolean;
  activeLegId: string | null;
  
  // Lead state
  hasSubmittedLead: boolean;
  
  // Metadata
  createdAt: string; // ISO date for 30-day expiry
  lastUpdatedAt: string;
}

interface ItineraryCity {
  id: string; // unique ID
  city: string;
  country: string;
  countryCode: string; // for flag rendering
  days: number;
  position: 'before' | 'after';
  order: number; // sort order within position
  highlights: CityHighlight[] | null; // null = not yet fetched
  highlightsLoading: boolean;
  highlightsQuizHash: string | null; // hash of quiz answers when highlights were generated
}

interface CityHighlight {
  name: string;
  type: 'culture' | 'food' | 'gym' | 'nightlife' | 'nature' | 'adventure' | 'wellness' | 'shopping';
  description: string;
  matchReason: string; // which quiz answer triggered this
}

interface MiniQuizAnswers {
  vibes: string[]; // up to 3
  mustHaves: string[]; // up to 3
  partyVsChill: number; // 1-10
  travelExperience: 'first' | 'some' | 'seasoned';
}

interface FlightLegResults {
  legId: string;
  origin: string; // IATA code
  destination: string; // IATA code
  date: string; // YYYY-MM-DD
  results: FlightResult[];
  dateTabResults: Record<string, FlightResult[]>; // keyed by date offset
}
```

### 30-Day Expiry Logic

On store hydration (app load), check `createdAt`:
```typescript
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
if (Date.now() - new Date(state.createdAt).getTime() > THIRTY_DAYS_MS) {
  // Clear planner store, keep quiz store
  return initialState;
}
```

### Quiz Data Access

Planner reads quiz data from the existing quiz store (`salty-quiz-state`). Two sources of personalization data:

1. **Full quiz answers** (from quiz store) — used when `quizDepth === 'full'`
2. **Mini-quiz answers** (from planner store) — used when `quizDepth === 'mini'`

Personalization engine checks quiz store first, falls back to planner store mini-quiz answers.

---

## Flight Leg Calculation

### Algorithm

Given an itinerary and retreat dates, derive all flight legs:

```typescript
function calculateLegs(
  origin: Airport,
  beforeCities: ItineraryCity[],
  retreat: Retreat,
  afterCities: ItineraryCity[]
): FlightLeg[] {
  const legs: FlightLeg[] = [];
  
  // Calculate departure date for first leg
  const totalPreDays = beforeCities.reduce((sum, c) => sum + c.days, 0);
  const tripStartDate = subtractDays(retreat.startDate, totalPreDays);
  
  // Before-retreat legs
  let currentDate = tripStartDate;
  let currentOrigin = origin.code;
  
  for (const city of beforeCities) {
    legs.push({
      origin: currentOrigin,
      destination: cityToAirport(city), // maps city to nearest major airport
      date: currentDate,
    });
    currentDate = addDays(currentDate, city.days);
    currentOrigin = cityToAirport(city);
  }
  
  // Leg to retreat destination (if pre-cities exist, or from home)
  legs.push({
    origin: currentOrigin,
    destination: retreat.arrivalAirport,
    date: currentDate, // should equal retreat.startDate
  });
  
  // After-retreat legs
  currentDate = retreat.endDate;
  currentOrigin = retreat.departureAirport;
  
  for (const city of afterCities) {
    legs.push({
      origin: currentOrigin,
      destination: cityToAirport(city),
      date: currentDate,
    });
    currentDate = addDays(currentDate, city.days);
    currentOrigin = cityToAirport(city);
  }
  
  // Final leg home (if post-cities exist, or from retreat)
  legs.push({
    origin: currentOrigin,
    destination: origin.code,
    date: currentDate,
  });
  
  return legs;
}
```

### Edge Cases

- **No extra cities:** 2 legs (home to retreat, retreat to home). Same as standalone flight finder.
- **Only pre-cities:** 3+ legs. Last leg is retreat destination to home.
- **Only post-cities:** 3+ legs. First leg is home to retreat destination.
- **Both sides:** 4+ legs.
- **City near retreat destination:** Still generates a leg. Short/cheap flights or ground transport are the user's call. We search it, they decide.

### City-to-Airport Mapping

Maintain a lookup table mapping city names to nearest major IATA airport codes. For the ~80 cities in autocomplete, this is a static map. If a city maps to multiple airports (London: LHR/LGW/STN), use the primary international airport.

---

## Copy Reference

All copy below has been written following humanizer principles: VIKING words preferred, no AI patterns, no filler adjectives, SALTY voice throughout.

### Hero
- **H1:** "Build the trip around the trip."
- **Subtext:** "Your retreat is the main event. But the best weeks have a prologue and an epilogue. Add cities before or after, and we'll suggest the ones that match how you travel."

### Prompt Screen (no quiz data)
- **H1:** "Build the trip around the trip."
- **Subtext:** "We'll suggest cities, hidden gems, and the best gyms, restaurants, and things to do based on how you actually like to travel. Two minutes of questions, a whole trip's worth of answers."
- **Primary CTA:** "Take the 2-Minute Quiz"
- **Secondary:** "Already know which retreat you're heading on?"

### Retreat Selector
- **H2:** "Which retreat are you building around?"

### Mini-Quiz
- **Header:** "Quick hits so we can nail your suggestions."
- **Subtext:** "4 questions. 30 seconds. Way better recommendations."
- **CTA:** "Build My Trip"

### AI Suggestions (with quiz data)
- **H3:** "Cities that match your vibe"
- **Subtext:** "Based on your love of [top 2 vibes]. Tap any city to add it to your trip."
- **Input label:** "Anything else you're into? Tell us and we'll factor it in."
- **Input placeholder:** "I love street food, rooftop bars, and getting lost in markets..."
- **Button:** "Show Me Cities"

### Timeline Hints
- **Before button:** "Arriving early? Add a city or two before your retreat."
- **After button:** "Not ready to go home? Keep the trip going."
- **First city added toast:** "Now we're talking. Your [X]-day trip is taking shape."
- **Trip counter:** "Your trip: [X] days of not being at work."

### City Card (no quiz data)
- "Want personalized recommendations for gyms, restaurants, and things to do?"
- [Answer 4 quick questions]

### Flight Section
- **H3:** "Your flights"
- **Subtext:** "Real prices for every leg of your trip. Pick the ones you like, then send the whole plan to yourself."

### Lead Capture
- **H3:** "Almost there. Where should we send this?"
- **Subtext:** "Your full trip plan with cities, recommendations, flights, and everything in between."
- **Button:** "Send My Trip Plan"

### Returning User
- **H2:** "Welcome back. Pick up where you left off?"
- **[Continue This Trip]** / **[Start Fresh]**

### Empty State (bottom, no retreat selected)
- "Not sure which retreat yet? The quiz takes 2 minutes and we'll match you."
- [Take the Quiz]
- "Questions? We're real humans." [Chat with us on WhatsApp]

### Homepage Step 4 (updated)
- "Build your trip — Add cities, find flights, get suggestions that match your vibe"

---

## Technical Summary

| Component | Technology | Notes |
|-----------|-----------|-------|
| State management | Zustand + persist middleware | localStorage, 30-day expiry |
| City suggestions | Claude API (Haiku) | ~$0.01-0.03 per call |
| Flight search | SerpAPI | Developer tier, $75/mo, 5,000 searches |
| Email delivery | GHL (GoHighLevel) | Branded SALTY templates |
| WhatsApp sharing | Web share API / deep link | Pre-filled message |
| Lead capture | GHL API | Same endpoint as quiz + flights |
| Quiz data | Existing quiz store | Read-only from planner |

### API Costs Per User

| User type | Claude API calls | SerpAPI calls | Est. cost |
|-----------|-----------------|---------------|-----------|
| Simple trip (no extra cities) | 0 | 2 | $0.05 |
| 1 extra city, uses suggestions | 1-2 | 3 | $0.10 |
| 2 extra cities, full exploration | 2-3 | 5-6 | $0.18 |
| Power user (date tabs, multiple searches) | 2-3 | 8-10 | $0.28 |

**ROI:** One retreat booking ($2,500+) covers 10,000+ planner sessions at average cost.

### Rate Limiting

Prevent spam, scraping, and runaway API costs.

**Per-session limits (tracked in localStorage + server-side):**

| Action | Limit | Window | What happens at limit |
|--------|-------|--------|----------------------|
| Flight searches (SerpAPI) | 20 calls | 24 hours | "You've searched a lot of flights today. Come back tomorrow or send what you have now." |
| City suggestion requests (Claude API) | 8 calls | 24 hours | "That's a lot of cities. Save your plan and come back if you want to explore more." |
| Lead capture submissions | 3 attempts | 1 hour | Silent block (prevents form spam) |
| Share actions | 10 sends | 1 hour | Silent block (prevents email spam) |

**Server-side enforcement:**
- Rate limit by IP + fingerprint (not just localStorage, which can be cleared)
- API routes (`/api/flights/search`, `/api/planner/suggestions`) check rate before forwarding to SerpAPI/Claude
- Return 429 with friendly message, not a raw error
- Log excessive usage for review (potential scraping)

**Friendly limit messages (shown in-app, not error codes):**
- Flights: "You've been busy. We cap flight searches at 20 per day so we can keep this tool free. Your plan is looking great though. Send it to yourself and pick up tomorrow."
- Suggestions: "8 rounds of city suggestions is the daily max. You've got plenty to work with. Build your trip and we'll be here tomorrow if you want more."

**Why these numbers:**
- 20 flight searches = 5 cities x 2 legs x 2 date tabs. Covers a full power-user session with room to spare.
- 8 suggestion requests = initial load + a few "show me more" or preference changes. More than enough for genuine use.
- Scrapers and bots hit these walls fast. Real users almost never will.

---

## Build Priority

### Phase 1 (MVP)
- Entry flow (all 3 paths)
- Itinerary builder (timeline, city cards, retreat anchor)
- Claude API city suggestions with highlights
- Share via email to self
- Lead capture
- GHL integration (tags + custom fields)

### Phase 2
- Full flight integration (all legs, date tabs, selection, running total)
- WhatsApp to self sharing
- Email to friend sharing (referral flow)
- Returning user experience

### Phase 3
- Flight filters and sort within planner
- Highlight refresh on quiz data change
- Enhanced city-to-airport mapping
- Analytics and conversion tracking
