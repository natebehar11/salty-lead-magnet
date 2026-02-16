# Feature Spec: Total Trip Cost Display
**Improvement #2 from Strategic Plan**
**Date:** February 9, 2026

---

## The Problem

The app shows flight prices and retreat prices in separate places. Nowhere does a user see a single combined number that answers the actual question in their head: "What will this trip cost me, total?"

This matters because the buying decision is about total cost, not component costs. A $400 flight feels cheap. A $2,399 retreat feels expensive. But "$2,800 all-in for 9 days in Panama including flights, accommodation, all meals, daily workouts, surf lessons, and a boat trip to a UNESCO site" reframes the entire value equation.

Right now, the user has to do that math themselves. Most won't.

---

## The Fix

A **Total Trip Estimate** component that appears wherever flight prices and retreat prices are both available. It combines them into one number with a value-packed breakdown line.

Three surfaces:

1. **Flight Finder (single retreat mode):** sticky summary bar
2. **Flight Finder (compare mode):** total on each retreat comparison card
3. **Trip Planner:** alongside the running flight total

---

## Surface 1: Flight Finder — Single Retreat Mode

### When It Appears

After flight results load for a specific retreat. Uses the cheapest available outbound flight as the default. Updates if user selects a specific flight.

If user has also searched return flights and selected one, use outbound + return. Otherwise, estimate return as equal to outbound (with "estimated" label).

### Component: `TripCostBar`

**Position:** Sticky bar at the bottom of the flight results area (above the page footer, below flight cards). On mobile, fixed to bottom of viewport.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Your Panama trip estimate                                  │
│                                                             │
│  Retreat from $2,399  +  Flights ~$412  =  ~$2,811 total   │
│                                                             │
│  That's 8 days of coaching, meals, surf, transfers & more   │
│                                                             │
│  [Book Your Spot →]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Visual spec:**
- Background: warm sand/cream (`bg-amber-50` or similar from existing palette)
- Left border accent: SALTY coral/orange (same accent used on testimonial cards)
- Top line: "Your [Destination] trip estimate" — semibold, dark text
- Middle line: three parts with `+` and `=` separators
  - "Retreat from $X,XXX" — regular weight
  - "Flights ~$XXX" — regular weight
  - "~$X,XXX total" — bold, slightly larger, SALTY teal or dark
- Bottom line: value summary — muted text, smaller font
- CTA button: primary style, links to retreat page on getsaltyretreats.com

**Data sources:**
- `retreat.lowestPrice` from `src/data/retreats.ts` → "Retreat from $X,XXX"
- Cheapest flight price from search results OR user's selected flight → "Flights ~$XXX"
- Sum of above → "~$X,XXX total"

**Flight price logic:**
```typescript
function getFlightEstimate(
  searchResults: FlightSearchResults | null,
  selectedOutbound: FlightOption | null,
  selectedReturn: FlightOption | null
): { amount: number; label: string; isEstimated: boolean } {
  
  // Priority 1: User selected both outbound + return
  if (selectedOutbound && selectedReturn) {
    return {
      amount: selectedOutbound.price + selectedReturn.price,
      label: `Flights $${selectedOutbound.price + selectedReturn.price}`,
      isEstimated: false,
    };
  }
  
  // Priority 2: User selected outbound only → estimate return as same
  if (selectedOutbound) {
    return {
      amount: selectedOutbound.price * 2,
      label: `Flights ~$${selectedOutbound.price * 2}`,
      isEstimated: true,
    };
  }
  
  // Priority 3: No selection → use cheapest result, estimate return
  if (searchResults?.cheapest?.[0]) {
    const cheapest = searchResults.cheapest[0].price;
    return {
      amount: cheapest * 2,
      label: `Flights ~$${cheapest * 2}`,
      isEstimated: true,
    };
  }
  
  // Priority 4: No results at all → don't show flight component
  return { amount: 0, label: '', isEstimated: true };
}
```

**Value summary line** — changes per retreat based on what's included. Pull from a static map:

```typescript
const retreatValueSummaries: Record<string, string> = {
  'sri-lanka-adventure-retreat': '9 days of coaching, surf, meals, mountain trains & more',
  'panama-city-to-sea': '8 days of coaching, meals, surf, island excursions & more',
  'morocco-surf-culture': '7 days of coaching, surf, Moroccan cuisine, cultural tours & more',
  'sicily-endless-summer': '7 days of coaching, beach clubs, Sicilian dinners & more',
  'el-salvador-mar-de-flores': '7 days of coaching, private villa, chef-made meals & more',
  'costa-rica-fitness-retreat-v4': '7 days of coaching, jungle resort, surf, spa credit & more',
  // ... add for each retreat
};
```

**Sticky behavior:**
- Desktop: fixed at bottom of the flight results section, scrolls into view when results appear, stays visible while scrolling through results
- Mobile: fixed to bottom of viewport (like a mobile app bottom bar), sits above the floating WhatsApp button
- Dismiss: none — always visible once flight results are present
- Transition: slide up from bottom with 300ms ease

### Interaction States

**No flights searched yet:** Bar doesn't render.

**Flights loading:** Bar shows with retreat price only:
```
Your Panama trip estimate
Retreat from $2,399  +  Searching flights...
```

**Flights loaded, no selection:** Uses cheapest result, shows `~` prefix:
```
Retreat from $2,399  +  Flights ~$824  =  ~$3,223 total
```

**User selected outbound only:** Uses selection, estimates return:
```
Retreat from $2,399  +  Flights ~$890 (return est.)  =  ~$3,289 total
```

**User selected outbound + return:**
```
Retreat from $2,399  +  Flights $847  =  ~$3,246 total
```
(Still `~` on total because retreat shows "from" price)

---

## Surface 2: Flight Finder — Compare Mode

### When It Appears

In compare-all mode, after results load for multiple retreats. Each retreat comparison card already shows destination, dates, route, and cheapest flight price.

### Modification to Existing Compare Cards

Add a **total estimate line** below the existing cheapest flight price on each card.

**Current card layout (bottom section):**
```
Cheapest: $412
[View Flights →]
```

**New card layout (bottom section):**
```
Cheapest flight: $412
─────────────────────
Total trip estimate: ~$3,223
(retreat from $2,399 + flights ~$824)
[View Flights →]  [Book Retreat →]
```

**Visual spec:**
- Thin divider line between flight price and total estimate
- "Total trip estimate" — semibold, slightly larger
- Parenthetical breakdown — muted, smaller text
- Add "Book Retreat" secondary CTA alongside existing "View Flights"

**Flight price logic (compare mode):**
- Uses cheapest outbound × 2 (estimate round trip)
- Always shows `~` prefix (all estimated)
- If no results for a retreat, show "Total: from $X,XXX + flights" (retreat price only)

### Sorting Enhancement

Currently compare mode can be sorted by cheapest flight. Add a sort option:

```
Sort by: [Cheapest Flight ▼] [Total Trip Cost ▼] [Best Match ▼]
```

"Total Trip Cost" sorts by `retreat.lowestPrice + (cheapestFlight.price * 2)`.

This is powerful because a retreat with a $500 flight but $1,999 dorm price might be cheaper total than a retreat with a $300 flight but $2,549 dorm price. The user can now see that instantly.

---

## Surface 3: Trip Planner

### When It Appears

The planner already shows a running flight total when users select flights per leg. Extend this to include retreat price.

### Modification to Running Total

**Current running total:**
```
Estimated flights: ~$1,223  (4 of 4 legs selected)
```

**New running total:**
```
┌────────────────────────────────────────┐
│  Your trip estimate                    │
│                                        │
│  Retreat      from $2,399              │
│  Flights      ~$1,223 (4/4 legs)      │
│  ─────────────────────────────         │
│  Total        ~$3,622                  │
│                                        │
│  [Book Your Spot →]  [Send My Plan →]  │
└────────────────────────────────────────┘
```

**Visual spec:**
- Card-style container (same warm sand background as Surface 1)
- Stacks vertically: retreat line, flights line, divider, total line
- Total line: bold, larger
- Two CTAs: primary "Book Your Spot" (external link), secondary "Send My Plan" (existing share flow)

**Position:** Replaces the current simple running total. Same position in the flight results section of the planner.

**Flight line states:**
- No flights selected: `Flights  searching...` or `Flights  select flights below`
- Partial selection: `Flights  ~$640 (2/4 legs selected)`
- All selected: `Flights  ~$1,223 (4/4 legs)`

**When retreat not yet selected** (early planner state): Don't show this component. Show it only after retreat is selected and flights section is active.

---

## Data Architecture

### New Data Needed

**Retreat value summaries** — add to existing `src/data/retreats.ts`:

```typescript
// Add to Retreat interface
interface Retreat {
  // ... existing fields
  valueSummary: string;  // One-line description of what's included
}
```

Or keep as a separate lightweight map if you don't want to modify the retreat interface:

```typescript
// src/data/retreat-value-summaries.ts
export const retreatValueSummaries: Record<string, string> = {
  'sri-lanka-adventure-retreat': '9 days of coaching, surf lessons, cultural tours, mountain trains, meals & transfers across two locations',
  'panama-city-to-sea': '8 days of coaching, surf lessons, meals, island excursions, city nights & all transfers',
  'morocco-surf-culture': '7 days of coaching, surf sessions, Paradise Valley adventure, Moroccan cuisine, souk tours & transfers',
  'sicily-endless-summer': '7 days of coaching, beach club lunches, Sicilian group dinners, bike access, cocktail nights & cultural excursions',
  'el-salvador-mar-de-flores': '7 days of coaching, private villa complex, rotating chef-made meals, waterfall hike & pool access',
  'costa-rica-fitness-retreat-v4': '7 days of coaching, jungle beachfront resort, all meals, surf lesson at Pan Dulce, waterfall hike & $50 spa credit',
  'costa-rica-fitness-retreat': '7 days of coaching, jungle beachfront resort, all meals, surf lessons, waterfall hike & group transfers',
};
```

### No New API Calls

Everything is computed client-side from data already available:
- Retreat price: `retreat.lowestPrice` (already in retreats.ts)
- Flight price: from search results or user selection (already in flight store)
- Value summary: static data file

### Currency Handling

Both retreat prices and flight prices are in USD in the data layer. If the app supports a currency selector (it does on flights), apply the same conversion to the total:

```typescript
const totalInSelectedCurrency = (retreatPrice + flightEstimate) * currencyRate;
```

Display currency symbol from user's selection.

---

## Components to Build

### `TripCostBar` (new)
**File:** `src/components/shared/TripCostBar.tsx`

**Props:**
```typescript
interface TripCostBarProps {
  retreatSlug: string;
  retreatPrice: number;        // lowestPrice from retreat data
  flightEstimate: number;      // calculated from search/selection
  flightLabel: string;         // "~$824" or "$847"
  isFlightEstimated: boolean;  // controls ~ prefix
  valueSummary: string;        // one-line value description
  bookingUrl: string;          // external retreat page URL
  variant: 'sticky' | 'inline' | 'compact';
}
```

**Variants:**
- `sticky`: Full-width bottom bar for flight finder single mode
- `inline`: Card-style for trip planner
- `compact`: Minimal line for compare mode cards

### `TripCostSummary` (new)
**File:** `src/components/planner/TripCostSummary.tsx`

Planner-specific wrapper that reads from planner state and passes computed values to `TripCostBar` with `variant="inline"`.

### Modifications to Existing Components

1. **`FlightResultsContainer`** — render `TripCostBar` variant="sticky" below results
2. **Compare mode cards** (in flights page) — render `TripCostBar` variant="compact" in each card
3. **Trip planner flight section** — replace running total with `TripCostSummary`

---

## GHL Integration

### Tags
- `viewed_trip_cost` — fired once per session when TripCostBar first renders with a complete total (retreat + flights)
- `trip_cost_cta_clicked` — fired when user clicks "Book Your Spot" from any TripCostBar surface

### Custom Fields
- `trip_cost_estimate` — the total dollar amount shown (e.g., `3223`)
- `trip_cost_retreat` — the retreat slug shown in the cost bar

### When to Fire

Only fire GHL events if user has already submitted lead data (has contact in GHL). Don't create new contacts from cost bar interactions.

Check `hasSubmittedLead` from quiz store or flight store before firing.

---

## Shared Itinerary Integration

When the user shares their trip plan (email to self, email to friend, WhatsApp), the total trip estimate should be included in the shared content.

### Email Share (existing `ShareFlightPanel` or planner share)

Add to the email template:

```
Your Trip Estimate
──────────────────
Retreat (from):  $2,399
Flights:         ~$824
──────────────────
Estimated total: ~$3,223

That's [7/8/9] days of coaching, meals, surf, transfers & more.
```

### WhatsApp Share

Append to existing WhatsApp message:

```
💰 Trip estimate: ~$3,223 (retreat from $2,399 + flights ~$824)
```

---

## Edge Cases

### Retreat is sold out or waitlist
Still show the cost bar. Change CTA from "Book Your Spot" to "Join Waitlist". Price framing still helps the user feel the value even if they can't book immediately.

### Retreat status is "coming_soon" or "tbd"
If `retreat.lowestPrice` is 0 or undefined, don't render the cost bar. Nothing to calculate.

### Flight search returns no results
Show retreat price only with flight placeholder:
```
Retreat from $2,399  +  No flights found
Try a different airport or date
```

### User hasn't searched flights yet (planner)
Don't show TripCostBar until flights section is active and at least one search has run.

### Multi-city planner with many legs
The total can get high (4+ legs). This is fine — the value framing still works. But if total exceeds retreat price × 2, add a note:
```
💡 Multi-city flights add up. Consider booking a single multi-city ticket on Google Flights for a better deal.
```
(This note already exists in the planner spec as the multi-city disclaimer. Just reference it near the total.)

### Currency mismatch
All prices are stored in USD. If user selects CAD display, apply conversion uniformly to both retreat and flight prices so the total is consistent.

---

## Copy Variations

### Flight Finder (single mode)
```
Your [Destination] trip estimate
Retreat from $X,XXX  +  Flights ~$XXX  =  ~$X,XXX total
[Value summary line]
```

### Compare Mode Cards
```
Total trip: ~$X,XXX
(retreat from $X,XXX + flights ~$XXX)
```

### Trip Planner
```
Your trip estimate
Retreat      from $X,XXX
Flights      ~$X,XXX (X/X legs)
─────────────────────
Total        ~$X,XXX
```

### WhatsApp Share Append
```
💰 Trip estimate: ~$X,XXX (retreat from $X,XXX + flights ~$XXX)
```

### Email Share Section
```
YOUR TRIP ESTIMATE
Retreat (from):  $X,XXX
Flights:         ~$XXX
Estimated total: ~$X,XXX
[Duration] days of [value summary]
```

---

## Implementation Notes for Claude Code

### File changes (estimated):
1. **New:** `src/components/shared/TripCostBar.tsx` (~120 lines)
2. **New:** `src/components/planner/TripCostSummary.tsx` (~60 lines)
3. **New:** `src/data/retreat-value-summaries.ts` (~15 lines)
4. **New:** `src/utils/trip-cost.ts` (~40 lines) — `getFlightEstimate()` and `formatTripCost()` helpers
5. **Modify:** `src/app/flights/page.tsx` — add TripCostBar to single mode results
6. **Modify:** Compare mode card component — add compact total line
7. **Modify:** `src/app/planner/page.tsx` — replace running total with TripCostSummary
8. **Modify:** Share flow components — append total to email/WhatsApp templates

### Dependencies:
- Retreat data (`src/data/retreats.ts`) — already exists, uses `lowestPrice`
- Flight store (`src/stores/flight-store.ts`) — already has search results and selections
- Share components — already exist, just need template additions

### No new API routes needed.

### Testing checklist:
- [ ] Single mode: bar appears after search, updates on flight selection
- [ ] Single mode: bar shows loading state during search
- [ ] Single mode: bar handles no-results gracefully
- [ ] Compare mode: total appears on each card
- [ ] Compare mode: "Total Trip Cost" sort works correctly
- [ ] Planner: summary replaces running total, shows retreat + flights
- [ ] Planner: partial selection shows correct leg count
- [ ] Share: email includes trip estimate section
- [ ] Share: WhatsApp includes cost line
- [ ] Currency: total converts correctly when currency changed
- [ ] Mobile: sticky bar doesn't overlap WhatsApp button
- [ ] Sold out retreat: CTA changes to "Join Waitlist"
- [ ] Coming soon retreat (no price): bar doesn't render
