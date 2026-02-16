# SALTY Lead Magnet App — Architecture & Documentation

**URL:** `https://explore.getsaltyretreats.com`
**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand v5, Framer Motion, react-hook-form
**Repo:** `/Users/nathanielbehar/Desktop/Claude/salty-lead-magnet/`

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [User Flows](#2-user-flows)
3. [Page-by-Page Detail](#3-page-by-page-detail)
4. [Data Architecture](#4-data-architecture)
5. [State Management](#5-state-management)
6. [API Routes](#6-api-routes)
7. [Component Library](#7-component-library)
8. [External Integrations](#8-external-integrations)
9. [File Map](#9-file-map)
10. [Design System](#10-design-system)

---

## 1. Information Architecture

```
Home (/)
├── Quiz (/quiz)
│   └── Results (/quiz/results)
├── Flight Finder (/flights)
│   ├── Single Retreat Mode (default)
│   └── Compare Trips Mode (toggle)
├── Price Comparison (/compare)
└── Trip Planner (/planner)
```

### Navigation (Header)

| Nav Label | Route | Purpose |
|-----------|-------|---------|
| Find Your Retreat | `/quiz` | 10-step quiz to match users with retreats |
| Flight Finder | `/flights` | Search real flights to retreat destinations |
| Price Comparison | `/compare` | DIY vs SALTY cost breakdown |
| Build a Trip | `/planner` | Trip itinerary builder with AI suggestions |
| getsaltyretreats.com | External | Main Squarespace site |

### Global Elements (every page)

- **MinimalHeader** — Fixed top bar with SALTY wordmark logo + nav links
- **WhatsAppButton** — Fixed floating button (bottom-right) linking to +1 431-829-1135
- **Elfsight Script** — Google Reviews widget loader (lazy)

---

## 2. User Flows

### Flow A: Quiz-to-Booking (Primary Conversion Path)

```
Homepage → "Take the Trip Quiz" button
    ↓
Quiz Step 1: Pick your vibes (multi-select)
Quiz Step 2: Group style (single-select, auto-advance)
Quiz Step 3: Budget range (single-select, auto-advance)
Quiz Step 4: Availability / months (multi-select)
Quiz Step 5: Preferred regions (multi-select)
Quiz Step 6: Party vs Rest slider (1-10)
Quiz Step 7: Traveling solo? (yes/no, auto-advance)
Quiz Step 8: Experience level (single-select, auto-advance)
Quiz Step 9: Must-have activities (multi-select)
    ↓
Quiz Step 10: Lead Capture Gate
    → Collects: first name, email, WhatsApp number
    → Submits to GHL CRM via /api/leads/capture
    → Runs matching algorithm
    ↓
Results Page (/quiz/results)
    → Shows ranked retreat cards with match scores
    → Each card has: "Check Flights" → /flights?retreat={slug}
    →                 "View Trip" → getsaltyretreats.com/retreats/{slug}
    ↓
Flight Finder (/flights)
    → Pre-populated with the matched retreat
    → User enters origin airport
    → Lead gate (name/email/WhatsApp) before results shown
    → Real flight results via SerpApi (Google Flights data)
    → "View flight →" links to Google Flights for booking
    → "Send these flight plans to yourself" email feature
    → Favourite flights with heart button
```

### Flow B: Direct Flight Search

```
Homepage or Nav → "Flight Finder"
    ↓
/flights
    → User selects origin airport (autocomplete, 100+ airports)
    → User selects a retreat OR toggles "Compare Trips"
    → Lead gate collects contact info
    ↓
Single Retreat Mode:
    → Shows flights sorted by cheapest/best/fastest
    → Date tabs: 2 days before / day before / day of retreat
    → Range slider filters: max stops, duration, price
    → Alliance filter: Star Alliance / oneworld / SkyTeam
    → Checkbox select outbound flights → "View Return Flights"
    → Favourite flights with heart button
    → Share flight plans via email
    ↓
Compare Trips Mode:
    → Searches ALL upcoming retreats simultaneously
    → Retreat pill toggles to show/hide specific retreats
    → Cards show: retreat name + dates + route + cheapest price
    → 3 flights per card, expandable with "Show more"
    → Same filter controls as single mode
```

### Flow C: Price Comparison

```
Homepage or Nav → "Price Comparison"
    ↓
/compare
    → Shows 5 destination cards (Costa Rica, Sri Lanka, Morocco, Sicily, El Salvador)
    → Each card shows:
        - Retreat name + destination + nights
        - SALTY price vs DIY cost side-by-side
        - Savings percentage + dollar amount
        - Expandable line-item breakdown with real source links
        - Clickable verification links (Airbnb, TripAdvisor, Google Maps, business websites)
    → CTAs: "Check Flights" + "View Trip Details"
```

### Flow D: Trip Planner

```
Homepage or Nav → "Build a Trip"
    ↓
/planner
    → H1: "Plan the perfect vacation"
    → H2: "Plan an itinerary for which retreat?"
    → User selects a retreat from the grid
    ↓
Itinerary Builder:
    → Visual timeline: [+ Before] → [cities] → [Retreat] → [cities] → [+ After]
    → City name autocomplete with ~80 popular travel cities
    → Day count per city (adjustable)
    → Total trip days counter
    → "Find Flights" button appears when destinations are added
    ↓
AI Suggestions:
    → User describes preferences in textarea
    → "Suggest Cities" generates city recommendations
    → Each suggested city name links to Google travel guide
    → "Save This Itinerary" → lead capture form
    → "Check Multi-City Flights" → /flights
```

### Flow E: WhatsApp Contact (any page)

```
Any page → Floating WhatsApp button (bottom-right)
    OR
Any page → HumanCTA component ("Can't decide? We love this conversation.")
    ↓
Opens WhatsApp with pre-filled context message
    → Goes to +1 431-829-1135
```

---

## 3. Page-by-Page Detail

### Homepage (`/`)

**File:** `src/app/page.tsx`

**Sections (top to bottom):**

1. **Hero**
   - SALTY wordmark image (dark green, responsive: 200px → 260px → 300px)
   - Subtitle: "The SALTY Trip Toolkit"
   - H1: "Plan your next retreat."
   - Subtext explaining the 4 tools
   - CTA button: "Take the Trip Quiz" → `/quiz`

2. **How It Works** (6 steps, 2x3 grid)
   - Step 1: "Take the quiz" — Match your vibe with the right retreat
   - Step 2: "Compare prices" — See what you'd pay DIY vs SALTY
   - Step 3: "Find flights" — Real prices, real airlines, one click away
   - Step 4: "Plan your trip" — Add cities before or after your retreat
   - Step 5: "Save your plan" — We'll send everything to your inbox
   - Step 6: "Book with confidence" — We handle the rest, you just show up
   - Each step has a colored number badge (alternating salmon/yellow/seafoam)

3. **Stats Bar** (4 stats in a row)
   - 10 Trips | 200+ Guests | 5.0 Avg Rating | 100% Fun

4. **Google Reviews** (Elfsight widget)
   - Live embedded Google Reviews from `elfsight-app-bcb6e237-0108-4ffa-a743-3d801a3b39b2`

5. **DIY Comparison Teaser**
   - Stamp badge: "SAVE UP TO 40%" (scalloped postage stamp CSS)
   - H2: "Think you can do it cheaper?"
   - Subtext about the comparison tool
   - CTA: "See the Breakdown" → `/compare`

6. **Flight Tool Teaser**
   - H2: "Stop overpaying for flights."
   - Subtext about real prices and flight search
   - CTA: "Search Flights" → `/flights`

7. **Bottom CTA**
   - H2: "Ready to get SALTY?"
   - Two buttons: "Take the Trip Quiz" + "Browse All Trips"
   - WhatsApp HumanCTA

---

### Quiz (`/quiz`)

**Files:** `src/app/quiz/page.tsx`, `src/components/quiz/QuizContainer.tsx`, 9 question components, `LeadCaptureGate.tsx`

**Intro Screen:**
- Subtitle: "The SALTY Trip Matcher"
- H1: "Find your perfect trip."
- "Answer 9 quick questions..." copy
- "Let's Go" button (resets quiz state on click)
- Stats: 7 retreats | 6 countries | 65% come solo

**Quiz Container:**
- Progress bar at top (animated, shows current step / total)
- Back button (top-left) + step counter (top-right, e.g. "3 of 10")
- Animated slide transitions between steps (Framer Motion)
- Escape key navigates back

**10 Steps:**

| # | Step Name | Component | Question | UI Type | Answer Field |
|---|-----------|-----------|----------|---------|-------------|
| 1 | vibes | `VibeQuestion` | "What are you chasing?" | Multi-select cards (min 1) with emoji icons | `vibes: VibePreference[]` |
| 2 | groupStyle | `GroupStyleQuestion` | "How do you roll?" | Single-select cards, auto-advance | `groupStyle: GroupStyle` |
| 3 | budget | `BudgetQuestion` | "What's your budget?" | Single-select price range cards, auto-advance | `budget: BudgetRange` |
| 4 | availability | `AvailabilityQuestion` | "When can you travel?" | Multi-select month pills + "I'm flexible" toggle | `availability: string[]` |
| 5 | regions | `RegionQuestion` | "Where do you want to go?" | Multi-select region cards + "Surprise me" | `regions: string[]` |
| 6 | partyVsRest | `PartyRestQuestion` | "Party or chill?" | Range slider 1-10, dynamic emoji feedback | `partyVsRest: number` |
| 7 | solo | `SoloQuestion` | "Are you traveling solo?" | Yes/No cards, auto-advance | `travelingSolo: boolean` |
| 8 | experience | `ExperienceQuestion` | "How experienced a traveler are you?" | Single-select cards, auto-advance | `experienceLevel: ExperienceLevel` |
| 9 | mustHaves | `MustHavesQuestion` | "Any must-haves?" | Multi-select activity pills (surfing, yoga, nightlife, hiking, food, culture, fitness, beach, photography, wellness) | `mustHaves: string[]` |
| 10 | leadCapture | `LeadCaptureGate` | "Your matches are ready." | Form: first name, email, WhatsApp | `leadData: LeadCaptureData` |

**Lead Capture Gate (Step 10):**
- H2: "Your matches are ready."
- Subtext: "Drop your details and we'll show you the goods."
- Privacy note: "We'll only message you about trips you're actually interested in."
- Fields: First name (required), Email (required, validated), WhatsApp (required, min 7 chars)
- Submit button: "Show Me My Matches"
- On submit:
  1. Saves lead data to Zustand store
  2. Runs `calculateAllMatches()` scoring algorithm
  3. POSTs to `/api/leads/capture` (non-blocking — results show even if API fails)
  4. Navigates to `/quiz/results`

---

### Quiz Results (`/quiz/results`)

**File:** `src/app/quiz/results/page.tsx`, `src/components/quiz/QuizResults.tsx`

**Guard:** Redirects to `/quiz` if no results exist in store.

**Header:**
- H1: "We found your trips, {firstName}." (personalized with lead data)
- Subtext: "Here's what we'd book if we were you."

**Result Cards** (one per retreat, sorted by match score descending):
- **Top match** gets orange-red border + "Best Match" banner
- **Match Score Ring** — circular SVG progress ring, color-coded:
  - Green: >= 80%
  - Yellow: >= 60%
  - Orange: < 60%
- **Retreat info:** destination, title, date range, nights, price (from $X)
- **"Why this matches"** — 2-4 auto-generated reason strings:
  - e.g. "High Adventure & Culture vibes — exactly what you asked for"
  - e.g. "Fits your budget at $1,999 per person"
  - e.g. "Available when you can travel"
  - e.g. "Solo-traveler friendly (65% of guests come solo)"
- **SALTY Meter** — compact horizontal bar chart showing 5 dimensions (adventure, culture, party, sweat, rest)
- **CTAs:** "Check Flights" → `/flights?retreat={slug}` | "View Trip" → external site

**Bottom:**
- WhatsApp HumanCTA: "Can't decide? We love this conversation."
- Share button (Web Share API / fallback dropdown)
- "Retake the quiz" link

---

### Flight Finder (`/flights`)

**File:** `src/app/flights/page.tsx` (~440 lines)

**Components used:** `FlightSearchForm`, `FlightLeadGate`, `FlightResultsContainer`, `FlightCard`, `FlightCardSkeleton`, `FlightDateTabs`, `ShareFlightPanel`, `AllianceFilter`, `CurrencySelector`

**Hero:**
- Subtitle: "SALTY Flight Finder"
- H1: "Find the cheapest way there."
- Subtext about real prices and smart search

**Search Form (`FlightSearchForm`):**
- **Origin airport** — autocomplete input searching 100+ airports by name, city, or code
- **Retreat selector** — dropdown of all upcoming retreats (name + dates)
- **Compare Trips toggle** — switches between single-retreat and compare-all mode
- "Search Flights" button → triggers API call

**Lead Gate (`FlightLeadGate`):**
- Appears after first search if user hasn't submitted lead data
- Same fields as quiz: first name, email, WhatsApp
- POSTs to `/api/leads/capture` with `source: 'flights'`
- Once submitted, results are revealed

**Single Retreat Mode (`FlightResultsContainer`):**

- **Header:** Retreat name above route (e.g. "SALTY Costa Rica" / "YYZ → LIR")
- **Date tabs** with info tooltips: "Arrive 2 days before" / "Arrive day before" / "Arrive day of"
  - Tooltip text: "Guests are responsible for additional accommodation and meal costs on days before and after the retreat start/end dates."
- **Sort tabs:** Cheapest | Best | Fastest
- **Inline filter controls** (no container background):
  - Max stops: range slider 0-3 (3 = "Any")
  - Max duration: range slider 480-1440 min (1440 = "Any"), step 60, displays hours
  - Max price: range slider $100-$2000 ($2000 = "Any"), step $50
  - Member Airlines: Star Alliance / oneworld / SkyTeam checkboxes
- **Flight cards** with:
  - Checkbox for outbound selection (select multiple)
  - Airline name + flight number
  - Favourite heart button (toggle, filled when active, persisted to localStorage)
  - Route: departure time → connection line with stops → arrival time
  - Duration display
  - Date + price
  - "View flight →" text link (opens Google Flights deep link)
- **Instruction text:** "Select flights to view return options, or tap heart to save favourites"
- **Sticky bottom bar** (appears when flights are selected):
  - Shows count: "X flights selected"
  - "View Return Flights" button
- **Return flights section** (placeholder):
  - Google Flights link for return date search
  - "Back to departing flights" button
- **Share panel:** "Send these flight plans to yourself" with email preview

**Compare Trips Mode (in `flights/page.tsx`):**

- **H2:** "Compare trips"
- **Retreat pill toggles** — horizontal row of pills for each retreat:
  - Active: filled deep teal background
  - Inactive: outlined, clicking toggles visibility
- **Inline filter controls** — same range sliders as single mode
- **Alliance filter** — "Member Airlines:" with checkboxes
- **Retreat cards** — one per enabled retreat:
  - Header: retreat name, dates (formatted), route (origin → dest), cheapest price
  - 3 flights shown by default
  - "Show more" / "Show less" expand button
  - Each flight rendered as `FlightCard`

---

### Price Comparison (`/compare`)

**File:** `src/app/compare/page.tsx`

**Hero:**
- Stamp badge: "SAVE UP TO 40%" (scalloped postage stamp CSS)
- Subtitle: "DIY vs SALTY"
- H1: "Think you can do it cheaper?"
- Subtext about comparing all-inclusive vs DIY
- Share button

**Methodology Disclaimer:**
- Info box explaining how DIY prices were calculated

**Comparison Cards** (5 destinations):

Each `ComparisonCard` contains:

1. **Header** (deep teal background):
   - Retreat name (e.g. "SALTY Costa Rica Fitness Retreat")
   - Destination name
   - Nights count
   - Savings percentage badge

2. **Price Summary** (2-column):
   - Left: SALTY Price (orange-red, "from / person")
   - Right: DIY Cost (struck through with red line, "estimated / person")

3. **Savings Banner:**
   - "Save $X,XXX with SALTY" (yellow background)

4. **Expandable Line Items:**
   - Toggle: "See full breakdown (X items)"
   - Table columns: Item | DIY Cost | SALTY
   - Each item shows: emoji, category name, description, DIY price
   - Items marked as SALTY-included show green "Included" badge
   - **Clickable source links** — "Airbnb Nosara →", "TripAdvisor →", "Safari Surf School →" etc.
   - Links open to Airbnb searches, TripAdvisor pages, Google Maps, or business websites

5. **Priceless Section:**
   - Items with $0 DIY value (Community, Trip Planning)
   - "PRICELESS WITH SALTY" header

6. **CTAs:**
   - "Check Flights" → `/flights?retreat={slug}`
   - "View Trip Details" → external site

**Destinations covered:**

| Destination | Retreat Name | Nights | SALTY Price | DIY Cost | Key Sources |
|-------------|-------------|--------|------------|----------|-------------|
| Costa Rica | SALTY Costa Rica Fitness Retreat | 7 | $2,399 | ~$2,880+ | Airbnb Nosara, Safari Surf School, Bodhi Tree Yoga, TripAdvisor |
| Sri Lanka | SALTY Sri Lanka Surf & Yoga Retreat | 9 | $1,999 | ~$3,060+ | Airbnb Weligama, Sampoorna Yoga, TripAdvisor Mirissa |
| Morocco | SALTY Morocco Surf & Yoga Retreat | 7 | $1,999 | ~$2,320+ | Airbnb Taghazout, Surf Berbere, TripAdvisor |
| Sicily | SALTY Sicily Wellness Retreat | 7 | $2,099 | ~$3,605+ | Booking.com Cefalu, TripAdvisor Cefalu |
| El Salvador | SALTY El Salvador Surf Retreat | 7 | $1,949 | ~$2,025+ | Airbnb El Tunco, AST Surf School |

**Bottom CTA:**
- H2: "Ready to save?"
- Buttons: "Take the Trip Quiz" + "Search Flights"
- WhatsApp HumanCTA

---

### Trip Planner (`/planner`)

**File:** `src/app/planner/page.tsx` (~620 lines)

**Hero:**
- H1: "Plan the perfect vacation"
- Subtext: "Our retreats are amazing. But sometimes you want even more travel goodness, so we're here to help you plan your vacation itinerary."

**Section 1: Retreat Selection**
- H2: "Plan an itinerary for which retreat?"
- Grid of upcoming retreat cards (2-column on desktop)
- Each card shows: destination, dates, duration, status badge

**Section 2: Itinerary Builder** (appears after retreat selection)

- **Visual timeline** (horizontal scrollable):
  ```
  [+ Before] → [City card] → [➤] → [RETREAT (anchor)] → [➤] → [City card] → [+ After]
  ```
- **City cards:**
  - City name input with autocomplete (~80 cities: Amsterdam through Zurich)
  - Autocomplete features: type-ahead filtering, keyboard navigation (up/down/enter/escape), click-outside dismiss
  - Day count input (1-14)
  - Remove button (x)
- **Retreat anchor card:** highlighted in orange-red, shows destination + days
- **Total trip days** counter below timeline
- **"Find Flights" button** — appears (animated) when at least 1 city is added, links to `/flights`

**Section 3: AI Suggestions**
- H3: "Need inspiration?"
- Textarea for user preferences (e.g. "I love food scenes and nightlife")
- "Suggest Cities" button → generates city recommendations
- Results show:
  - City name as clickable link → Google search for "{city} travel guide"
  - Country name
  - Recommended days
  - Highlight tags (e.g. "street food", "temples", "nightlife")
- CTAs: "Save This Itinerary" (→ lead capture) | "Check Multi-City Flights" (→ `/flights`)

**Section 4: Lead Capture** (appears on "Save This Itinerary")
- Dark teal background form
- Fields: first name, email, WhatsApp
- "Send Me My Trip Plan" button
- POSTs to `/api/leads/capture`

**Bottom CTA** (when no retreat selected):
- WhatsApp HumanCTA
- "Take the Trip Quiz" link

---

## 4. Data Architecture

### Retreat Data (`src/data/retreats.ts`)

Central source of truth for all 7 retreats. Each retreat contains:

```typescript
interface Retreat {
  slug: string;              // URL-safe identifier
  title: string;             // Display title
  destination: string;       // e.g. "Nosara, Costa Rica"
  startDate: string;         // "2026-03-14"
  endDate: string;           // "2026-03-21"
  duration: { days: number; nights: number };
  status: 'open' | 'waitlist' | 'coming_soon' | 'tbd' | 'sold_out';
  lowestPrice: number;       // Starting price in USD
  spotsRemaining: number | null;
  locations: Location[];     // Array of destinations with type, region, country, features
  activities: Activity[];    // Array of included activities
  saltyMeter: SaltyMeter;    // 5-dimension personality scores (1-10 each)
  airport: { code: string; name: string };
  coach: Coach;
  testimonial: Testimonial;
  rating: { value: number; count: number };
  vibes: string[];
  groupStyle: string;
  budgetTier: string;
  region: string;
}
```

**SALTY Meter dimensions:**
- `adventure` (1-10)
- `culture` (1-10)
- `party` (1-10)
- `sweat` (1-10)
- `rest` (1-10)

### Flight Data (`src/types/flight.ts`)

```typescript
interface FlightOption {
  id: string;
  price: number;
  currency: string;
  segments: FlightSegment[];    // Array of legs
  totalDuration: number;        // Minutes
  stops: number;
  bookingUrl: string;           // Google Flights deep link
  source: 'kiwi' | 'google' | 'mock';
  isSelfTransfer: boolean;
  selfTransferWarning?: string;
  isAlternateAirport: boolean;
  alternateAirportNote?: string;
}

interface FlightSegment {
  airline: string;
  airlineCode: string;         // e.g. "UA"
  flightNumber: string;        // e.g. "UA2175"
  departure: { airport: string; time: string; date: string };
  arrival: { airport: string; time: string; date: string };
  duration: number;             // Minutes
}
```

### DIY Pricing Data (`src/data/diy-pricing.ts`)

```typescript
interface DIYLineItem {
  category: string;        // e.g. "Accommodation"
  description: string;     // Detailed description mentioning real businesses
  saltyIncluded: boolean;
  saltyPrice: number;
  diyPrice: number;
  perDay?: boolean;
  emoji: string;
  sourceUrl?: string;      // Verification link (Airbnb, TripAdvisor, etc.)
  sourceName?: string;     // Display name for the link
}

interface DIYComparison {
  retreatSlug: string;
  destination: string;
  retreatName: string;     // Full retreat title
  nights: number;
  saltyPriceFrom: number;
  items: DIYLineItem[];
}
```

---

## 5. State Management

### Quiz Store (`src/stores/quiz-store.ts`)

Zustand store with `persist` middleware (localStorage key: `salty-quiz-state`).

| State | Type | Persisted | Purpose |
|-------|------|-----------|---------|
| `currentStep` | `number` | Yes | Current quiz step (0-9) |
| `answers` | `QuizAnswers` | Yes | All 9 question answers |
| `leadData` | `LeadCaptureData \| null` | Yes | Name, email, WhatsApp |
| `results` | `QuizResult[] \| null` | Yes | Calculated match results |
| `isComplete` | `boolean` | Yes | Whether quiz has been completed |
| `hasSubmittedLead` | `boolean` | Yes | Whether lead form was submitted |

**Actions:** `setAnswer()`, `nextStep()`, `prevStep()`, `goToStep()`, `setLeadData()`, `setResults()`, `reset()`

### Flight Store (`src/stores/flight-store.ts`)

Zustand store with `persist` middleware (localStorage key: `salty-flight-state`).

| State | Type | Persisted | Purpose |
|-------|------|-----------|---------|
| `originAirport` | `Airport \| null` | No | Selected origin airport |
| `selectedRetreatSlug` | `string \| null` | No | Currently selected retreat |
| `compareAll` | `boolean` | No | Compare-all mode toggle |
| `hasSubmittedLead` | `boolean` | Yes | Lead gate status |
| `isLoading` | `boolean` | No | Search in progress |
| `searchResults` | `FlightSearchResults \| null` | No | Single-retreat results |
| `allResults` | `FlightSearchResults[]` | No | Compare-all results |
| `filters` | `FlightFilters` | No | Active filter values |
| `sortMode` | `FlightSortMode` | No | cheapest / best / fastest |
| `favouriteFlightIds` | `string[]` | Yes | Persisted favourite flight IDs |
| `selectedOutboundIds` | `string[]` | No | Selected flights for return search |
| `returnResults` | `FlightSearchResults \| null` | No | Return flight results |
| `isReturnMode` | `boolean` | No | Whether viewing return flights |

---

## 6. API Routes

### POST `/api/flights/search`

**Request body:**
```json
{
  "originCode": "YYZ",
  "originName": "Toronto Pearson",
  "originCity": "Toronto",
  "originCountry": "Canada",
  "retreatSlug": "costa-rica-fitness-retreat"
}
```

**Logic:**
1. Look up retreat by slug → get destination airport + dates
2. Calculate travel dates: 2 days before, day before, day of, return dates
3. If `SERPAPI_KEY` is set → call SerpApi for day-of date (1 API credit)
4. SerpApi returns real Google Flights data → sort into cheapest/best/fastest buckets
5. If SerpApi fails or returns 0 results → fall back to mock flight data
6. "Best" sorting uses 60% price weight + 40% duration weight

**Response:** `FlightSearchResults` object with `search` metadata + `cheapest[]`, `best[]`, `fastest[]`, `unlisted[]` arrays

### POST `/api/leads/capture`

**Request body:**
```json
{
  "firstName": "Nate",
  "email": "nate@example.com",
  "whatsappNumber": "+14165551234",
  "source": "quiz",
  "quizAnswers": { ... },
  "topMatch": "costa-rica-fitness-retreat"
}
```

**Logic:** Creates or updates contact in GoHighLevel CRM with tags and custom fields. Non-blocking — the app continues even if GHL is unreachable.

### POST `/api/leads/share-flights`

**Request body:** Flight share data + recipient info. Creates/updates GHL contact with flight-share tags.

---

## 7. Component Library

### Shared Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `Button` | `shared/Button.tsx` | `href`, `variant` (primary/secondary/ghost/yellow), `size` (sm/md/lg), `onClick`, `disabled` | Polymorphic button/link. Renders `<Link>` when `href` provided. Pill-shaped (`rounded-full`). |
| `ScrollReveal` | `shared/ScrollReveal.tsx` | `direction`, `delay`, `distance`, `children` | Scroll-triggered fade-in animation wrapper |
| `WaveDivider` | `shared/WaveDivider.tsx` | `variant` (sunset/ocean/warm/cool/earth), `flip` | SVG wave section divider with 4 layered paths |
| `HumanCTA` | `shared/HumanCTA.tsx` | `message`, `context`, `dark` | WhatsApp CTA with pre-filled message |
| `WhatsAppButton` | `shared/WhatsAppButton.tsx` | — | Fixed floating WhatsApp button |
| `ShareButton` | `shared/ShareButton.tsx` | `title`, `text`, `url` | Multi-platform share (Web Share API + fallback) |

### Flight Components

| Component | File | Purpose |
|-----------|------|---------|
| `FlightSearchForm` | `flights/FlightSearchForm.tsx` | Airport autocomplete + retreat selector + compare toggle |
| `FlightResultsContainer` | `flights/FlightResultsContainer.tsx` | Single-retreat results with sort/filter controls |
| `FlightCard` | `flights/FlightCard.tsx` | Individual flight result with checkbox, heart, booking link |
| `FlightCardSkeleton` | `flights/FlightCardSkeleton.tsx` | Loading placeholder |
| `FlightDateTabs` | `flights/FlightDateTabs.tsx` | Date selector tabs with info tooltips |
| `FlightLeadGate` | `flights/FlightLeadGate.tsx` | Lead capture before showing results |
| `ShareFlightPanel` | `flights/ShareFlightPanel.tsx` | Email sharing with preview |
| `AllianceFilter` | `flights/AllianceFilter.tsx` | Airline alliance checkbox filter |
| `CurrencySelector` | `flights/CurrencySelector.tsx` | Currency dropdown |
| `UnlistedPathsSection` | `flights/UnlistedPathsSection.tsx` | Alternative routing suggestions |

### Quiz Components

| Component | File | Purpose |
|-----------|------|---------|
| `QuizContainer` | `quiz/QuizContainer.tsx` | 10-step flow orchestrator with animated transitions |
| `QuizProgress` | `quiz/QuizProgress.tsx` | Animated horizontal progress bar |
| `LeadCaptureGate` | `quiz/LeadCaptureGate.tsx` | Step 10 lead form + matching trigger |
| `QuizResults` | `quiz/QuizResults.tsx` | Ranked result cards with match details |
| `MatchScoreRing` | `quiz/MatchScoreRing.tsx` | Circular SVG match percentage ring |
| `CompactSaltyMeter` | `quiz/CompactSaltyMeter.tsx` | 5-bar retreat personality chart |
| 9 question components | `quiz/questions/*.tsx` | Individual quiz step UIs |

---

## 8. External Integrations

| Service | Purpose | Config | Status |
|---------|---------|--------|--------|
| **SerpApi** | Real Google Flights data | `SERPAPI_KEY` in `.env.local` | Active (250 free searches/month) |
| **GoHighLevel (GHL)** | CRM for lead capture | `GHL_API_KEY`, `GHL_LOCATION_ID` in `.env.local` | Pending (managed by Sabhi) |
| **Google Flights** | Booking deep links | No API key needed | Active (URL generation) |
| **Elfsight** | Google Reviews widget | Embed code in `layout.tsx` | Active |
| **WhatsApp** | Direct contact | Hardcoded number: +1 431-829-1135 | Active |

---

## 9. File Map

```
src/
├── app/
│   ├── layout.tsx              # Root layout (header, WhatsApp, Elfsight script)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles, fonts, theme colors, custom CSS
│   ├── quiz/
│   │   ├── page.tsx            # Quiz intro + container
│   │   └── results/
│   │       └── page.tsx        # Quiz results display
│   ├── flights/
│   │   └── page.tsx            # Flight search + compare
│   ├── compare/
│   │   └── page.tsx            # DIY vs SALTY price comparison
│   ├── planner/
│   │   └── page.tsx            # Trip itinerary builder
│   └── api/
│       ├── flights/search/
│       │   └── route.ts        # Flight search API (SerpApi + mock fallback)
│       └── leads/
│           ├── capture/
│           │   └── route.ts    # Lead capture → GHL
│           └── share-flights/
│               └── route.ts    # Flight share → GHL
├── components/
│   ├── layout/
│   │   └── MinimalHeader.tsx   # Fixed header with nav
│   ├── shared/
│   │   ├── Button.tsx          # Polymorphic button/link
│   │   ├── ScrollReveal.tsx    # Scroll animation wrapper
│   │   ├── WaveDivider.tsx     # SVG wave section divider
│   │   ├── HumanCTA.tsx        # WhatsApp CTA
│   │   ├── WhatsAppButton.tsx  # Floating WhatsApp button
│   │   └── ShareButton.tsx     # Multi-platform share
│   ├── quiz/
│   │   ├── QuizContainer.tsx   # Quiz flow orchestrator
│   │   ├── QuizProgress.tsx    # Progress bar
│   │   ├── LeadCaptureGate.tsx # Step 10: lead form
│   │   ├── QuizResults.tsx     # Results display
│   │   ├── MatchScoreRing.tsx  # Score circle
│   │   ├── CompactSaltyMeter.tsx # Personality bars
│   │   └── questions/
│   │       ├── VibeQuestion.tsx
│   │       ├── GroupStyleQuestion.tsx
│   │       ├── BudgetQuestion.tsx
│   │       ├── AvailabilityQuestion.tsx
│   │       ├── RegionQuestion.tsx
│   │       ├── PartyRestQuestion.tsx
│   │       ├── SoloQuestion.tsx
│   │       ├── ExperienceQuestion.tsx
│   │       └── MustHavesQuestion.tsx
│   └── flights/
│       ├── FlightSearchForm.tsx
│       ├── FlightResultsContainer.tsx
│       ├── FlightCard.tsx
│       ├── FlightCardSkeleton.tsx
│       ├── FlightDateTabs.tsx
│       ├── FlightLeadGate.tsx
│       ├── ShareFlightPanel.tsx
│       ├── AllianceFilter.tsx
│       ├── CurrencySelector.tsx
│       └── UnlistedPathsSection.tsx
├── data/
│   ├── retreats.ts             # 7 retreats (single source of truth)
│   ├── coaches.ts              # Coach profiles
│   ├── testimonials.ts         # Guest testimonials
│   ├── region-map.ts           # Region → countries mapping
│   ├── airports.ts             # 100+ airports for autocomplete
│   ├── mock-flights.ts         # Fallback flight data generator
│   ├── alliances.ts            # Airline alliance data
│   └── diy-pricing.ts          # DIY cost breakdowns with source links
├── lib/
│   ├── utils.ts                # cn(), formatCurrency(), formatDateRange(), slugify()
│   ├── matching.ts             # Quiz matching algorithm (6-dimension scoring)
│   ├── ghl.ts                  # GoHighLevel CRM integration
│   ├── serpapi.ts              # SerpApi Google Flights integration
│   └── google-flights.ts       # Google Flights URL generator
├── stores/
│   ├── quiz-store.ts           # Quiz state (Zustand + persist)
│   └── flight-store.ts         # Flight search state (Zustand + persist)
└── types/
    ├── retreat.ts              # Retreat, SaltyMeter, Location, Activity types
    ├── quiz.ts                 # QuizAnswers, QuizResult, QUIZ_STEPS types
    └── flight.ts               # FlightOption, FlightSegment, FlightSearchResults types

public/
├── fonts/
│   ├── TanHeadline/TANHEADLINE-Regular.ttf
│   └── Roca/
│       ├── Roca Regular.ttf
│       ├── Roca Bold.ttf
│       └── Roca Italic.ttf
├── images/
│   ├── logos/
│   │   ├── salty-wordmark-dark.png
│   │   ├── salty-wordmark-white.png
│   │   └── favicon.png
│   └── link-previews/
│       └── og-image.png
```

---

## 10. Design System

### Colors (13-color SALTY palette)

| Name | Hex | Usage |
|------|-----|-------|
| Salmon | `#FF7E70` | Primary accent, CTAs, highlights |
| Yellow | `#FED260` | Secondary accent, savings badges, buttons |
| Orange-Red | `#F75A3D` | Active states, match scores, alerts |
| Burnt Red | `#C74235` | Error states, warnings |
| Mauve | `#CCB4B3` | Subtle accents |
| Light Blue | `#B6D4EA` | Info elements, stamp badge text |
| Seafoam | `#A4E5D9` | Success states, "included" badges |
| Deep Teal | `#0E3A2D` | Primary text, dark backgrounds |
| Forest Green | `#3A6B35` | Stamp badge background |
| Cream | `#F7F4ED` | Page backgrounds |
| Beige | `#E7D7C0` | Borders, dividers, subtle backgrounds |
| Slate | `#4A4E58` | Secondary text |
| Charcoal | `#383838` | Body text |

### Typography

| Use | Font | Style |
|-----|------|-------|
| All headings (H1-H4) | **TAN Headline** | Always uppercase, line-height 1.25-1.3 |
| Hero text | TAN Headline | Responsive: `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.15 |
| Section headers | TAN Headline | Responsive: `clamp(1.8rem, 4vw, 3rem)`, line-height 1.3 |
| Body text | **Roca** | Regular/Bold/Italic variants |
| Buttons & labels | TAN Headline | Uppercase, tracked wider |

### Button Variants

| Variant | Style |
|---------|-------|
| `primary` | Deep teal bg, white text |
| `secondary` | Outlined, deep teal border and text |
| `ghost` | No border, subtle text, hover underline |
| `yellow` | Yellow bg, deep teal text |

All buttons: `rounded-full` (pill shape), uppercase font-display text, active scale animation.

### Sizes: `sm` (px-4 py-2 text-xs), `md` (px-6 py-3 text-sm), `lg` (px-8 py-4 text-base)

### Custom CSS Classes

| Class | Effect |
|-------|--------|
| `.stamp-badge` | 140x140px scalloped postage stamp (radial-gradient mask) |
| `.stamp-badge-inner` | Inner circle with deep teal bg, light blue text |
| `.star-badge` | 12-point starburst shape (clip-path polygon) |
| `.stamp-frame` | Decorative postage stamp border for images |
| `.text-hero` | Responsive hero typography via clamp() |
| `.text-section` | Responsive section header typography via clamp() |

### Animation Patterns

- **ScrollReveal**: fade + slide (configurable direction/delay/distance)
- **Quiz transitions**: horizontal slide left/right with opacity
- **Button hover**: slight scale, color transition
- **Progress bars**: Framer Motion spring animations
- **Dropdowns**: Framer Motion AnimatePresence with opacity + y transform
