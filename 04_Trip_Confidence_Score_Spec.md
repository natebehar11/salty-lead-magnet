# Feature Spec: Trip Confidence Score
**Improvement #4 from Strategic Plan**
**Date:** February 9, 2026

---

## The Problem

The planner helps people build an itinerary, find flights, and share plans. But it doesn't tell them how ready they are to actually go. There's no sense of momentum. The user builds a plan and then... shares it, leaves, maybe comes back. There's no psychological push from "planning" to "booking."

People who have done 80% of the research still feel like they're at 0% because nothing tells them otherwise.

---

## The Fix

A **Trip Confidence Score** — a visual progress ring on the planner page that fills as the user completes meaningful actions across the entire app. It reads from all Zustand stores (quiz, flights, planner) so that work done on other pages counts.

The ring creates two psychological effects:

1. **Endowed progress effect:** When someone arrives at the planner having already taken the quiz and searched flights, their ring is at 45% before they do anything. "I've already made progress" makes completion feel inevitable.

2. **Reframing the booking decision:** Instead of "should I do this?" the question becomes "I've already done 80% of the work, why wouldn't I finish?"

---

## Where It Renders

**Planner page only.** The ring does NOT appear on the flight finder, compare page, or quiz results. Those pages stay clean and focused on their primary task.

However, the **flight finder gets a subtle nudge** after results load:
```
✓ Flights found. Ready to plan the full trip? Build your itinerary →
```
This funnels users into the planner where they'll see their accumulated progress.

---

## Score Milestones

| Action | Points | Source Store | Detection |
|---|---|---|---|
| Selected a retreat | +15 | Planner store | `selectedRetreatSlug !== null` |
| Completed quiz (full or mini) | +10 | Quiz store or planner store | `quizStore.isComplete` or `plannerStore.miniQuizAnswers !== null` |
| Submitted lead data | +10 | Quiz store or planner store | `hasSubmittedLead === true` |
| Added at least one city | +10 | Planner store | `itinerary.length >= 1` |
| Got AI city suggestions | +5 | Planner store | Any city has `highlights !== null` |
| Searched outbound flights | +15 | Flight store or planner store | `searchResults !== null` or any leg has results |
| Searched return flights | +10 | Flight store or planner store | `returnResults !== null` or return leg has results |
| Selected specific flights | +10 | Planner store | `Object.keys(selectedFlights).length >= 1` |
| Shared plan (any method) | +10 | Planner store | `hasSharedPlan === true` (new field) |
| Viewed retreat page | +5 | New tracking | `hasViewedRetreatPage === true` (new field) |
| **Total possible** | **100** | | |

### Why These Weights

The heaviest actions (15 pts each) are the ones that require the most commitment: picking a retreat and searching flights. These are the "I'm serious" signals. The lightest (5 pts) are passive actions that happen naturally (AI suggestions, viewing the retreat page). The middle tier (10 pts each) represents meaningful engagement that takes effort but isn't the final commitment.

The score is designed so that a user who takes the quiz, picks a retreat, and searches flights is already at 50% before touching the planner. That's the endowed progress sweet spot.

---

## Score Calculation

```typescript
// src/utils/trip-confidence.ts

import { useQuizStore } from '@/stores/quiz-store';
import { useFlightStore } from '@/stores/flight-store';
import { usePlannerStore } from '@/stores/planner-store';

interface ConfidenceMilestone {
  id: string;
  label: string;
  points: number;
  achieved: boolean;
  nudgeText: string; // what to show when not yet achieved
}

export function useTripConfidence(): {
  score: number;
  milestones: ConfidenceMilestone[];
  tier: ConfidenceTier;
} {
  const quiz = useQuizStore();
  const flights = useFlightStore();
  const planner = usePlannerStore();

  const milestones: ConfidenceMilestone[] = [
    {
      id: 'retreat_selected',
      label: 'Picked a retreat',
      points: 15,
      achieved: planner.selectedRetreatSlug !== null,
      nudgeText: 'Pick a retreat to build around',
    },
    {
      id: 'quiz_completed',
      label: 'Completed the quiz',
      points: 10,
      achieved: quiz.isComplete || planner.miniQuizAnswers !== null,
      nudgeText: 'Take the quiz for personalized suggestions',
    },
    {
      id: 'lead_submitted',
      label: 'Saved your info',
      points: 10,
      achieved: quiz.hasSubmittedLead || planner.hasSubmittedLead,
      nudgeText: 'Save your details so you don\'t lose progress',
    },
    {
      id: 'city_added',
      label: 'Added a city',
      points: 10,
      achieved: planner.itinerary.length >= 1,
      nudgeText: 'Add a city before or after the retreat',
    },
    {
      id: 'ai_suggestions',
      label: 'Got city recommendations',
      points: 5,
      achieved: planner.itinerary.some(c => c.highlights !== null),
      nudgeText: 'Get AI-powered city suggestions',
    },
    {
      id: 'outbound_flights',
      label: 'Found outbound flights',
      points: 15,
      achieved: hasOutboundResults(flights, planner),
      nudgeText: 'Search flights to make it real',
    },
    {
      id: 'return_flights',
      label: 'Found return flights',
      points: 10,
      achieved: hasReturnResults(flights, planner),
      nudgeText: 'Check return flights too',
    },
    {
      id: 'flights_selected',
      label: 'Picked your flights',
      points: 10,
      achieved: Object.keys(planner.selectedFlights).length >= 1,
      nudgeText: 'Select flights you like',
    },
    {
      id: 'plan_shared',
      label: 'Saved your plan',
      points: 10,
      achieved: planner.hasSharedPlan === true,
      nudgeText: 'Send the plan to yourself',
    },
    {
      id: 'retreat_page_viewed',
      label: 'Checked out the retreat',
      points: 5,
      achieved: planner.hasViewedRetreatPage === true,
      nudgeText: 'View the full retreat details',
    },
  ];

  const score = milestones
    .filter(m => m.achieved)
    .reduce((sum, m) => sum + m.points, 0);

  const tier = getConfidenceTier(score);

  return { score, milestones, tier };
}

// Helper: check if outbound flight results exist in either store
function hasOutboundResults(
  flights: FlightStoreState,
  planner: PlannerStoreState
): boolean {
  // Check flight store (from /flights page)
  if (flights.searchResults !== null) return true;
  // Check planner store (from planner flight section)
  return Object.values(planner.flightResults).some(
    leg => leg.results.length > 0
  );
}

// Helper: check if return flight results exist in either store
function hasReturnResults(
  flights: FlightStoreState,
  planner: PlannerStoreState
): boolean {
  if (flights.returnResults !== null) return true;
  // In planner, the last leg is typically the return
  const legs = Object.values(planner.flightResults);
  return legs.length >= 2 && legs[legs.length - 1].results.length > 0;
}
```

---

## Confidence Tiers

```typescript
type ConfidenceTier = 'exploring' | 'planning' | 'almost' | 'ready';

function getConfidenceTier(score: number): ConfidenceTier {
  if (score < 25) return 'exploring';
  if (score < 55) return 'planning';
  if (score < 80) return 'almost';
  return 'ready';
}
```

### Tier Copy & Behavior

| Tier | Score | Headline | Subtext | Primary CTA |
|---|---|---|---|---|
| `exploring` | 0-24 | Just getting started | Pick a retreat and start exploring | Send My Trip Plan |
| `planning` | 25-54 | Your trip is taking shape | Find flights to make it real | Send My Trip Plan |
| `almost` | 55-79 | This is looking like a real trip | Send it to yourself so you don't lose it | Send My Trip Plan |
| `ready` | 80-100 | You've done your homework | The only thing left is booking your spot | **Book Your Spot →** |

**Key behavior change at 80%+:** The primary CTA in the planner shifts from "Send My Trip Plan" to "Book Your Spot" (linking to the retreat booking page on getsaltyretreats.com). The send/share option becomes a secondary CTA.

This is the conversion moment. Everything in the planner has been building toward this CTA swap.

---

## Component: `TripConfidenceRing`

**File:** `src/components/planner/TripConfidenceRing.tsx`

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│      ┌──────────┐                           │
│      │          │                           │
│      │   65%    │  This is looking like     │
│      │          │  a real trip.             │
│      └──────────┘                           │
│                   Send it to yourself so    │
│                   you don't lose it.        │
│                                             │
│  ✓ Picked a retreat                         │
│  ✓ Completed the quiz                       │
│  ✓ Found outbound flights                   │
│  ✓ Added a city                             │
│  ○ Check return flights                     │
│  ○ Pick your flights                        │
│  ○ Send the plan to yourself                │
│                                             │
└─────────────────────────────────────────────┘
```

**Layout:**
- Top section: SVG progress ring (circular) with score percentage in center, tier headline + subtext to the right
- Bottom section: milestone checklist showing achieved (✓) and next steps (○)
- Mobile: ring and text stack vertically, checklist below

**Ring specs:**
- Diameter: 80px desktop, 64px mobile
- Stroke width: 6px
- Track color: light gray (`#E5E7EB`)
- Progress color: transitions through tiers
  - `exploring` (0-24): muted gray-blue
  - `planning` (25-54): SALTY teal
  - `almost` (55-79): warm coral/orange
  - `ready` (80-100): green (success)
- Score text: bold, centered in ring
- Animation: ring fills with a smooth 800ms ease-out transition on mount and on score changes

**Checklist specs:**
- Show only the most relevant milestones (not all 10):
  - All achieved milestones (✓) — collapsed to a count if more than 4: "✓ 6 steps completed"
  - Next 2-3 unachieved milestones (○) — shown with their nudge text
- Each unachieved milestone's nudge text is a subtle action hint, not a command
- Achieved items: muted text with checkmark
- Unachieved items: slightly bolder, with the nudge text as the label

**Position on planner page:**
- Desktop: right sidebar, sticky (follows scroll). Below the itinerary timeline, above the TripCostSummary (Spec #2).
- Mobile: collapsible card above the flight section. Shows ring + headline + subtext in collapsed state. Tap to expand and see checklist.

If there's no sidebar in the current planner layout (single column), place the ring as a card between the itinerary builder and the flight section.

### Animation on Score Change

When a milestone is achieved during the session (user adds a city, searches flights, etc.), the ring animates:

1. Ring stroke animates from old score to new score (400ms ease-out)
2. Score number counts up (e.g., 45 → 55)
3. Brief celebration micro-animation: ring pulses once (scale 1.0 → 1.05 → 1.0, 200ms)
4. If tier changed: headline and subtext cross-fade to new copy (300ms)

No confetti, no sound, no modal. Just a satisfying visual acknowledgment. Fits SALTY's vibe — rewarding without being obnoxious.

---

## State Changes Needed

### Planner Store — New Fields

```typescript
// Add to PlannerStore interface
hasSharedPlan: boolean;        // set true on any share action
hasViewedRetreatPage: boolean; // set true when "View Trip" clicked
```

Both are persisted (part of the 30-day expiry cycle with the rest of planner state).

### Actions

```typescript
// Add to planner store actions
markPlanShared: () => void;         // called after any share flow completes
markRetreatPageViewed: () => void;  // called when external retreat link is clicked
```

### Retreat Page View Tracking

When the user clicks any "View Trip" or "Book Your Spot" link that goes to the external retreat page, call `markRetreatPageViewed()` before opening the link. Since the link opens in a new tab (`target="_blank"`), the store update happens in the current tab.

```typescript
function handleRetreatLinkClick(url: string) {
  usePlannerStore.getState().markRetreatPageViewed();
  window.open(url, '_blank');
}
```

---

## Flight Finder Nudge

After flight results load on `/flights` (single retreat mode), show a one-line nudge below the results (above TripCostBar from Spec #2):

```
✓ Flights found for Panama. Want to plan the full trip? Build your itinerary →
```

- "Build your itinerary →" links to `/planner?retreat={slug}`
- Only shows if user has NOT already visited the planner for this retreat
- Muted text, small font, single line
- Dismiss: clicking anywhere or scrolling past it

If user is in compare mode, don't show the nudge (they're still deciding which retreat).

### Detection

```typescript
// Show nudge if:
// 1. Results have loaded
// 2. Single retreat mode (not compare)
// 3. User hasn't visited planner with this retreat selected
const showPlannerNudge = 
  searchResults !== null && 
  !compareAll && 
  plannerStore.selectedRetreatSlug !== selectedRetreatSlug;
```

---

## GHL Integration

### Tags

| Trigger | Tag | Notes |
|---|---|---|
| Score reaches 25+ | `trip_confidence_planning` | Entered "planning" tier |
| Score reaches 55+ | `trip_confidence_almost` | Entered "almost ready" tier |
| Score reaches 80+ | `trip_confidence_ready` | Entered "ready" tier — high-intent signal |
| "Book Your Spot" CTA clicked (from confidence ring context) | `confidence_book_clicked` | The conversion moment |

### Custom Fields

| Field | Value | Source |
|---|---|---|
| `trip_confidence_score` | Number (0-100) | Latest score |
| `trip_confidence_tier` | String | `exploring` / `planning` / `almost` / `ready` |

### When to Fire

Only if `hasSubmittedLead === true` in any store. Tier tags fire once per tier (don't re-fire if score dips and recovers). Track fired tiers in a local Set to prevent duplicates.

The `trip_confidence_ready` tag is a major signal for Sabhi's GHL nurture sequences. A lead at 80%+ confidence has done extensive research and is one nudge away from booking. This should trigger a high-priority follow-up sequence — personal WhatsApp from Erin or Nate, not an automated email.

---

## Edge Cases

### User arrives at planner with no prior activity
Score is 0. Ring shows empty. Headline: "Just getting started." First action (selecting a retreat) jumps to 15%, which immediately feels like progress.

### User took quiz + searched flights but never visited planner
When they first open `/planner`, score starts at 35% (quiz 10 + lead 10 + outbound flights 15). The ring is already a third full. "Your trip is taking shape" headline. This is the endowed progress moment.

### User has done everything except book
Score is 100%. Ring is full green. Headline: "You've done your homework." CTA is prominently "Book Your Spot →". The checklist is collapsed to "✓ All 10 steps completed." Nothing left to do except commit.

### User returns after 30 days
Planner store resets (30-day expiry). But quiz store persists independently. So they'd keep quiz + lead credit (20 pts) but lose planner-specific progress. Ring shows 20% with a note: "Welcome back. Your quiz results are still here. Pick a retreat to continue planning."

### Score goes backward (shouldn't happen, but defensive)
If a user removes all cities, `city_added` milestone flips from achieved to not-achieved. The ring should animate smoothly downward. No special handling needed — the calculation is always a fresh read from current state.

### Multiple retreats
If user changes their selected retreat in the planner, the score doesn't reset. Most milestones (quiz, lead, flights) are retreat-agnostic. City additions and AI suggestions are planner-specific and persist regardless of retreat change. Only `retreat_page_viewed` might be retreat-specific, but for simplicity, treat it as a global flag.

---

## Copy Reference

### Tier Headlines & Subtext

**Exploring (0-24):**
- Headline: "Just getting started"
- Subtext: "Pick a retreat and start exploring."

**Planning (25-54):**
- Headline: "Your trip is taking shape"
- Subtext: "Find flights to make it real."

**Almost (55-79):**
- Headline: "This is looking like a real trip"
- Subtext: "Send it to yourself so you don't lose it."

**Ready (80-100):**
- Headline: "You've done your homework"
- Subtext: "The only thing left is booking your spot."

### Milestone Nudge Text (unachieved)

These are written as gentle suggestions, not commands. Fits SALTY's "everything optional" ethos:

- "Pick a retreat to build around"
- "Take the quiz for personalized suggestions"
- "Save your details so you don't lose progress"
- "Add a city before or after the retreat"
- "Get AI-powered city suggestions"
- "Search flights to make it real"
- "Check return flights too"
- "Select flights you like"
- "Send the plan to yourself"
- "View the full retreat details"

---

## Implementation Notes for Claude Code

### New Files
1. **`src/utils/trip-confidence.ts`** (~100 lines) — `useTripConfidence()` hook, milestone definitions, tier logic
2. **`src/components/planner/TripConfidenceRing.tsx`** (~200 lines) — SVG ring, checklist, tier copy, animations

### Modified Files
1. **`src/stores/planner-store.ts`** — add `hasSharedPlan`, `hasViewedRetreatPage` fields + actions
2. **`src/app/planner/page.tsx`** — mount TripConfidenceRing in layout, wire up retreat link tracking
3. **`src/app/flights/page.tsx`** — add planner nudge line below results
4. **Share flow components** — call `markPlanShared()` after successful share
5. **Any "View Trip" / "Book" external links in planner** — call `markRetreatPageViewed()` before opening

### Dependencies
- Reads from quiz store, flight store, and planner store (all already exist)
- No dependency on Specs #2, #7, or #9 — this is fully independent
- GHL integration follows same pattern as existing tag firing

### Build Order
1. `trip-confidence.ts` utility hook
2. Add new planner store fields
3. Build `TripConfidenceRing` component
4. Mount in planner page
5. Wire up share tracking and retreat link tracking
6. Add flight finder nudge
7. GHL tag integration

### Testing Checklist
- [ ] Score calculates correctly from cold start (0%)
- [ ] Score reflects quiz + flight activity done before visiting planner
- [ ] Ring animates on mount with correct starting score
- [ ] Ring animates smoothly when score changes during session
- [ ] Tier headline/subtext updates on tier change
- [ ] Checklist shows achieved items + next 2-3 nudges
- [ ] CTA switches to "Book Your Spot" at 80%+
- [ ] `hasSharedPlan` persists across page navigations
- [ ] `hasViewedRetreatPage` fires correctly on external link click
- [ ] Flight finder nudge appears only in single mode, only when planner not yet visited
- [ ] 30-day expiry resets planner milestones but preserves quiz milestones
- [ ] Score doesn't fire duplicate GHL tier tags
- [ ] Mobile: ring collapses to compact card, expands on tap
- [ ] Score handles retreat change without resetting
