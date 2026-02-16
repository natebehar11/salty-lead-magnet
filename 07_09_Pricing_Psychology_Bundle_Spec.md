# Feature Spec: Pricing Psychology Bundle
**Improvements #7 (Cost Per Day) and #9 (Split the Cost) from Strategic Plan**
**Date:** February 9, 2026

---

## Overview

Two pricing reframe components that work together to reduce sticker shock and remove cash flow objections. They appear on different surfaces based on where the user is in their decision process.

**Cost Per Day** = "This is actually cheap." Shows up almost everywhere prices appear.
**Split the Cost** = "You can actually afford this right now." Shows up only where someone is close to converting.

### Placement Map

| Surface | Cost Per Day | Split Payment | Rationale |
|---|---|---|---|
| Quiz results cards | ✅ | ❌ | First price exposure. Soften sticker shock. Too early for payment plans. |
| Flight finder — TripCostBar | ✅ | ❌ | First time seeing combined total. Per-day makes it digestible. |
| Flight finder — compare mode | ✅ | ❌ | Normalizes different trip lengths for apples-to-apples comparison. |
| Price comparison page | ✅ | ✅ | Already sold on value. Per-day on SALTY side. Split payment below as final nudge. |
| Trip planner — TripCostSummary | ✅ | ✅ | Full trip built. Both reframes push toward booking. |
| Share flows (email/WhatsApp) | ✅ | ❌ | Per-day does the selling in shared messages. Payment plans feel salesy in shares. |

---

## FEATURE A: COST PER DAY REFRAME

### The Psychology

$2,399 is a big number. $343/day is a small number. $343/day for accommodation, 3 meals, 4 workout classes, surf lessons, coaching, transfers, and professional photography is a no-brainer. The per-day frame also lets users mentally compare to things they already spend money on daily: a nice dinner out, a hotel night, a day pass at a resort.

This is the same psychology Netflix uses. They don't say "$180/year." They say "$15/month."

### Calculation

```typescript
// src/utils/pricing-reframes.ts

export function getCostPerDay(
  retreatPrice: number,
  retreatDays: number,
  flightEstimate?: number
): { perDay: number; label: string; includesFlights: boolean } {
  
  if (flightEstimate && flightEstimate > 0) {
    const total = retreatPrice + flightEstimate;
    const perDay = Math.round(total / retreatDays);
    return {
      perDay,
      label: `$${perDay}/day all-in`,
      includesFlights: true,
    };
  }
  
  const perDay = Math.round(retreatPrice / retreatDays);
  return {
    perDay,
    label: `$${perDay}/day`,
    includesFlights: false,
  };
}
```

### Per-Retreat Reference Values

Based on Early Bird dorm (lowest tier) prices and trip duration:

| Retreat | Price From | Days | Per Day (retreat only) | Per Day (+ ~$800 flights) |
|---|---|---|---|---|
| Sri Lanka | $1,999 | 9 | $222/day | $311/day |
| Panama | $2,399* | 8 | $300/day | $400/day |
| Morocco | $1,999 | 7 | $286/day | $400/day |
| Sicily | $2,099 | 7 | $300/day | $414/day |
| El Salvador | $1,949 | 7 | $278/day | $393/day |
| Costa Rica v4 | $1,949 | 7 | $278/day | $393/day |

*Panama pricing TBD — using estimate. All values recalculate dynamically from retreat data.

### Surface-Specific Implementation

#### 1. Quiz Results Cards

**Current price display:**
```
from $1,999
```

**New price display:**
```
from $1,999  ·  $222/day
```

One line. The per-day sits right next to the sticker price, separated by a middle dot. Muted text, slightly smaller than the price. No extra explanation needed — the number speaks for itself.

No flights included here (user hasn't searched flights yet), so this is retreat-only per-day.

#### 2. Flight Finder — TripCostBar (single mode)

The TripCostBar from Spec #2 already shows:
```
Retreat from $2,399  +  Flights ~$824  =  ~$3,223 total
That's 8 days of coaching, meals, surf, transfers & more
```

**Add per-day to the value line:**
```
Retreat from $2,399  +  Flights ~$824  =  ~$3,223 total
~$403/day all-in — coaching, meals, surf, transfers & more
```

The per-day replaces the beginning of the value summary line. Uses total (retreat + flights) divided by trip days. The `all-in` label signals that flights are included in the daily rate.

#### 3. Flight Finder — Compare Mode Cards

**Current (with Spec #2 additions):**
```
Total trip: ~$3,223
(retreat from $2,399 + flights ~$824)
```

**Add per-day:**
```
Total trip: ~$3,223  ·  ~$403/day
(retreat from $2,399 + flights ~$824)
```

This is where per-day is most powerful. A 9-day Sri Lanka trip at ~$311/day vs a 7-day Sicily trip at ~$414/day tells a completely different story than comparing $2,799 vs $2,899 lump sums. Users can now compare value per day across trips of different lengths.

#### 4. Price Comparison Page

Add a per-day comparison row to the existing SALTY vs DIY breakdown:

```
              SALTY         DIY
Per day:      $286/day      ~$520/day
```

This sits near the top of the comparison, right under the total price comparison. It's the single most compelling line on the page because it makes the gap concrete and daily.

#### 5. Trip Planner — TripCostSummary

The TripCostSummary from Spec #2 shows:
```
Retreat      from $2,399
Flights      ~$1,223 (4/4 legs)
─────────────────────
Total        ~$3,622
```

**Add per-day below the total:**
```
Retreat      from $2,399
Flights      ~$1,223 (4/4 legs)
─────────────────────
Total        ~$3,622
             ~$403/day all-in
```

Small, muted text below the total line. If user has added buffer days (pre/post cities), use total trip days (retreat + buffer), not just retreat days. A 12-day trip that's $3,622 total = $302/day, which is even more compelling.

```typescript
// For planner, use total trip days including buffer cities
const totalTripDays = retreatDays + beforeCityDays + afterCityDays;
const perDay = Math.round(totalCost / totalTripDays);
```

#### 6. Share Flows

**WhatsApp append (update from Spec #2):**
```
💰 Trip estimate: ~$3,223 (~$403/day all-in)
```

Replaces the previous format that showed retreat + flights separately. The per-day is the shareable soundbite. When someone texts a friend "$400/day for everything including flights," that does more selling than any breakdown.

**Email share:** Add per-day to the trip estimate section:
```
YOUR TRIP ESTIMATE
Retreat (from):  $2,399
Flights:         ~$824
Estimated total: ~$3,223
That's ~$403/day for 8 days — all-in.
```

---

## FEATURE B: SPLIT THE COST PAYMENT VISUALIZER

### The Psychology

The jump from "I want this" to "I can spend $2,500 right now" kills conversions. SALTY already offers payment plans (2 or 3 installments), but that info is buried in FAQ text that nobody reads during the emotional consideration phase.

Showing "$350 today" as the entry point completely changes the mental math. You're not asking them to spend $2,500 today. You're asking them to spend $350 today and figure out the rest over 3 months. That's an entirely different decision.

### Payment Plan Data

From SALTY's booking structure:

```typescript
// src/utils/pricing-reframes.ts

export interface PaymentPlan {
  planType: '2-pay' | '3-pay';
  deposit: number;          // Always $350
  installments: number[];   // Remaining amounts
  adminFee: number;         // $0 for 2-pay, $50 for 3-pay
  totalCost: number;        // Original price + admin fee
  label: string;            // Display label
}

export function getPaymentPlans(retreatPrice: number): PaymentPlan[] {
  const deposit = 350;
  const remaining = retreatPrice - deposit;

  return [
    {
      planType: '2-pay',
      deposit,
      installments: [remaining],
      adminFee: 0,
      totalCost: retreatPrice,
      label: '2 payments, no extra fees',
    },
    {
      planType: '3-pay',
      deposit,
      installments: [
        Math.ceil((remaining + 50) / 2),
        Math.floor((remaining + 50) / 2),
      ],
      adminFee: 50,
      totalCost: retreatPrice + 50,
      label: '3 payments ($50 admin fee)',
    },
  ];
}
```

**Example for $2,399 retreat:**

| Plan | Today | Payment 2 | Payment 3 | Total |
|---|---|---|---|---|
| 2 payments | $350 | $2,049 | — | $2,399 |
| 3 payments | $350 | $1,050 | $1,049 | $2,449 |

### Component: `SplitCostToggle`

**File:** `src/components/shared/SplitCostToggle.tsx`

**Props:**
```typescript
interface SplitCostToggleProps {
  retreatPrice: number;
  retreatSlug: string;
  variant: 'inline' | 'expanded';
}
```

**Collapsed state (default):**
```
$2,399  ·  or from $350 today
```

The "or from $350 today" text is a clickable link/toggle. Subtle, not pushy. Uses the SALTY teal/coral for the link color.

**Expanded state (after click/tap):**
```
┌──────────────────────────────────────────┐
│  Pay your way                            │
│                                          │
│  ○ 2 payments (no extra fee)             │
│    $350 today  →  $2,049 later           │
│                                          │
│  ○ 3 payments ($50 admin fee)            │
│    $350 today  →  $1,050  →  $1,049      │
│                                          │
│  $350 secures your spot today.           │
│  Remaining balance through Movement      │
│  Travel on a schedule that works for     │
│  you.                                    │
│                                          │
│  [Book Your Spot — $350 today →]         │
│                                          │
└──────────────────────────────────────────┘
```

**Visual spec:**
- Card container with warm sand background (consistent with TripCostBar)
- Radio-style selection between 2-pay and 3-pay (visual only, not functional — actual payment happens through Lisa)
- Payment steps shown as a horizontal flow with arrows
- CTA button text changes from "Book Your Spot" to "Book Your Spot — $350 today" when expanded
- Collapse toggle: clicking the header or an "×" closes it back to the one-line state

**Important copy note:** The visualizer does NOT process payments. It shows the structure to reduce anxiety, then links to the booking page or WhatsApp. The fine print ("Remaining balance through Movement Travel on a schedule that works for you") makes this clear without being legalistic.

### Surface-Specific Implementation

#### 1. Price Comparison Page

**Position:** Below the savings banner, above the final CTA section. It's a natural bridge between "SALTY is better value" (comparison) and "here's how to actually pay for it" (action).

**Variant:** `expanded` — show the full visualizer open by default on this page. The user is already deep in the value consideration. Don't make them click to discover payment plans exist.

**Layout within page:**
```
[Savings Banner: "Save $X,XXX+ compared to planning it yourself"]

[SplitCostToggle variant="expanded"]

[Book Your Spot CTA]
```

#### 2. Trip Planner — TripCostSummary

**Position:** Below the TripCostSummary card from Spec #2, as an additional element.

**Variant:** `inline` — collapsed by default. Shows the one-liner:

```
Your trip estimate
Retreat      from $2,399
Flights      ~$1,223 (4/4 legs)
─────────────────────
Total        ~$3,622
             ~$403/day all-in

or from $350 today — see payment options
```

Clicking "see payment options" expands the SplitCostToggle below.

When expanded in planner context, add the flight caveat:
```
$350 secures your retreat spot today.
Flights are booked separately at your convenience.
```

This is important because the split payment only applies to the retreat, not flights. Don't let users think $350 covers the total trip cost.

### Edge Cases

**Retreat with no price (coming_soon/tbd):** Don't render SplitCostToggle.

**Retreat that's sold out:** Change CTA to "Join Waitlist" but still show payment structure. Knowing it's only $350 to secure a spot motivates waitlist signups for future retreats.

**Different room tiers:** The toggle shows the lowest tier by default. If the user has indicated a room preference (from quiz budget question), use that tier's price instead.

```typescript
// If quiz answered "mid-range budget" → use Split Double price
// If quiz answered "budget-friendly" → use Dorm price (default)  
// If quiz answered "treat myself" → use Single/Premium price
function getRelevantPrice(retreat: Retreat, budgetPreference?: string): number {
  // Default to lowestPrice
  if (!budgetPreference) return retreat.lowestPrice;
  
  // Map quiz budget answers to room tiers
  // This depends on how room tier pricing is stored
  // For now, always use lowestPrice as the floor
  return retreat.lowestPrice;
}
```

Note: If retreat data gets expanded to include per-tier pricing (not just `lowestPrice`), this function should use the budget-appropriate tier. For MVP, `lowestPrice` is fine.

---

## Combined Display Examples

### Quiz Results Card (Cost Per Day only)

```
┌───────────────────────────────────────┐
│  🏆 92% Match                         │
│  Panama — City to Sea                 │
│  Mar 14-22, 2026  ·  8 days          │
│                                       │
│  from $2,399  ·  $300/day             │
│                                       │
│  [Testimonial card]                   │
│                                       │
│  [Check Flights]  [View Trip]         │
└───────────────────────────────────────┘
```

### TripCostBar — Flight Finder (Cost Per Day only)

```
┌───────────────────────────────────────────────────┐
│  Your Panama trip estimate                        │
│                                                   │
│  Retreat from $2,399 + Flights ~$824 = ~$3,223    │
│  ~$403/day all-in — coaching, meals, surf & more  │
│                                                   │
│  [Book Your Spot →]                               │
└───────────────────────────────────────────────────┘
```

### Compare Mode Card (Cost Per Day only)

```
┌─────────────────────────┐
│  Panama                 │
│  Mar 14-22 · 8 days     │
│  YYZ → PTY              │
│                         │
│  Cheapest flight: $412  │
│  ───────────────────    │
│  Total: ~$3,223         │
│  ~$403/day              │
│  (from $2,399 + ~$824)  │
│                         │
│  [View Flights] [Book]  │
└─────────────────────────┘
```

### Price Comparison Page (Both)

```
[SALTY vs DIY comparison table]
[Per day: $286/day SALTY vs ~$520/day DIY]
[Savings banner]

┌──────────────────────────────────────────┐
│  Pay your way                            │
│                                          │
│  ○ 2 payments (no extra fee)             │
│    $350 today  →  $2,049 later           │
│                                          │
│  ○ 3 payments ($50 admin fee)            │
│    $350 today  →  $1,050  →  $1,049      │
│                                          │
│  $350 secures your spot today.           │
│                                          │
│  [Book Your Spot — $350 today →]         │
└──────────────────────────────────────────┘
```

### Trip Planner Summary (Both)

```
┌────────────────────────────────────────┐
│  Your trip estimate                    │
│                                        │
│  Retreat      from $2,399              │
│  Flights      ~$1,223 (4/4 legs)      │
│  ─────────────────────────────         │
│  Total        ~$3,622                  │
│               ~$302/day all-in         │
│                                        │
│  or from $350 today — see options      │
│                                        │
│  [Book Your Spot]  [Send My Plan]      │
└────────────────────────────────────────┘
```

---

## GHL Integration

### Tags
- `viewed_per_day_price` — fired once per session when per-day calculation renders (any surface)
- `viewed_payment_plan` — fired when SplitCostToggle is expanded
- `payment_plan_cta_clicked` — fired when user clicks "Book Your Spot — $350 today"

### Custom Fields
- `price_reframe_seen` — `per_day`, `payment_plan`, or `both` (tracks which reframes the user encountered)

### When to Fire
Only if user has submitted lead data (existing contact in GHL). Don't create contacts from pricing interactions.

---

## Implementation Notes for Claude Code

### New Files
1. **`src/utils/pricing-reframes.ts`** (~60 lines) — `getCostPerDay()` and `getPaymentPlans()` functions
2. **`src/components/shared/SplitCostToggle.tsx`** (~150 lines) — expandable payment plan visualizer

### Modified Files
1. **Quiz results card component** — add per-day next to price
2. **`TripCostBar`** (from Spec #2) — integrate per-day into value line
3. **Compare mode card component** — add per-day to total line
4. **Price comparison page** — add per-day row to comparison table + SplitCostToggle below savings
5. **`TripCostSummary`** (from Spec #2) — add per-day below total + SplitCostToggle below
6. **Share flow templates** — update WhatsApp and email to include per-day format

### Dependencies
- Spec #2 (Total Trip Cost Display) should be built first. Cost Per Day on flight surfaces depends on TripCostBar and TripCostSummary existing.
- Quiz results per-day and compare page per-day are independent of Spec #2 and can be built in parallel.
- SplitCostToggle is fully independent and can be built anytime.

### Build Order
1. `pricing-reframes.ts` utility functions (no UI dependencies)
2. Per-day on quiz results cards (standalone, no Spec #2 dependency)
3. Per-day on compare page (standalone)
4. SplitCostToggle component (standalone)
5. SplitCostToggle on compare page (needs #4)
6. Per-day on TripCostBar (needs Spec #2)
7. Per-day on TripCostSummary + SplitCostToggle in planner (needs Spec #2)
8. Share flow updates (needs Spec #2)

### Testing Checklist
- [ ] Per-day calculates correctly for each retreat (retreat-only)
- [ ] Per-day calculates correctly with flights included (all-in)
- [ ] Per-day in compare mode normalizes across different trip lengths
- [ ] Per-day in planner uses total trip days (including buffer cities)
- [ ] SplitCostToggle expands/collapses smoothly
- [ ] Payment math is correct for 2-pay (no fee) and 3-pay ($50 fee)
- [ ] SplitCostToggle CTA links to correct booking URL
- [ ] SplitCostToggle doesn't render for retreats without pricing
- [ ] Sold out retreats show "Join Waitlist" instead of "Book"
- [ ] Currency conversion applies to per-day and payment amounts
- [ ] WhatsApp share includes per-day format
- [ ] Email share includes per-day in trip estimate section
- [ ] Mobile: SplitCostToggle doesn't overflow on small screens
- [ ] GHL tags fire correctly on expand and CTA click
