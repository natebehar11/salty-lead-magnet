# Price Comparison Spec

## Overview
Changes to the DIY vs SALTY price comparison page: automated link and price verification, updated copy emphasizing time savings, share functionality per comparison card, and renaming "Breakfast" to "Full Board" / "All Meals".

**Dependencies**: Requires `01-global-changes.md` (global currency, native share, PriceDisplay component).

---

## 1. Automated Link and Price Verification

### Problem
The comparison page relies on static pricing data in `src/data/diy-pricing.ts` with links to sources like Airbnb, TripAdvisor, Booking.com, and Google Maps. These links and prices can go stale.

### Solution — Hybrid Verification System

#### 1a. Vercel Cron for Scheduled Checks

Create a Vercel Cron job that runs on a schedule to verify all DIY pricing source links.

**API Route**: `src/app/api/cron/verify-diy-links/route.ts`

```typescript
// This route is called by Vercel Cron
// Schedule: Every Monday at 3:00 AM UTC (weekly)
// vercel.json: { "crons": [{ "path": "/api/cron/verify-diy-links", "schedule": "0 3 * * 1" }] }

export async function GET(request: NextRequest) {
  // 1. Verify cron secret (prevent unauthorized calls)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Load all DIY comparisons from diy-pricing.ts
  // 3. Extract all sourceUrl values
  // 4. For each URL, send HEAD request with 10-second timeout
  // 5. Record result: { url, valid, statusCode, checkedAt }
  // 6. Store results in Vercel KV (key: 'diy-link-status')
  // 7. If any links are broken, log a warning (and optionally send an alert email via GHL)

  return NextResponse.json({ checked: urlCount, broken: brokenCount });
}
```

**Vercel config** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/verify-diy-links",
      "schedule": "0 3 * * 1"
    }
  ]
}
```

**Environment variable**: Add `CRON_SECRET` to env vars for authentication.

#### 1b. Link Status Display on Compare Page

When the compare page loads:
1. Fetch link verification status from KV (or an API route that reads KV)
2. For each source link in the DIY comparison:
   - If verified and valid: show the link normally with a subtle ✓ indicator
   - If verified and broken: hide the link, show "Source unavailable" in muted text
   - If not yet checked: show the link normally (no indicator)
3. Show a small footer note: "Source links last verified: [date]"

**API Route**: `src/app/api/diy-link-status/route.ts`

```typescript
// GET: Returns the latest link verification results
// Response: { results: Record<string, { valid: boolean; checkedAt: string }>, lastRun: string }
// Reads from Vercel KV (key: 'diy-link-status')
// Falls back to empty object if KV not configured
```

#### 1c. Price Staleness Indicator

The `estimatedDate` field in `DIYComparison` already tracks when prices were last verified (currently all "February 2026").

Add logic to display a staleness warning if prices are older than 3 months:
```tsx
const estimatedDate = new Date(comparison.estimatedDate);
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

if (estimatedDate < threeMonthsAgo) {
  // Show: "These prices were estimated in [month]. Click source links to verify current rates."
  // Use a subtle amber/yellow background for the warning
}
```

#### 1d. Price Verification (Manual Process — Spec Only)

Automated price scraping from Airbnb, Booking.com, etc. is against their ToS and technically complex. Instead, spec a **manual verification workflow**:

1. The cron job checks if links are alive (not if prices are correct)
2. Price accuracy requires manual review — flag this with the `estimatedDate` field
3. When prices are manually updated, update `estimatedDate` in `diy-pricing.ts`
4. Consider adding a data file or admin route where prices can be bulk-updated

**Future enhancement**: If SALTY wants automated price tracking, consider a service like Apify or ScrapingBee that handles the complexity of scraping booking sites within their terms. This is out of scope for this spec.

---

## 2. Copy Updates — Emphasize Time Savings

### Current State
The hero section says:
- "DIY vs SALTY"
- "Think you can do it cheaper?"
- "We compared the cost of our all-inclusive retreats against booking the same quality trip yourself. The numbers don't lie."

### Required Changes

Update the copy to also emphasize **time saved**, not just money:

**Hero copy update**:
```
Think you can do it cheaper?
(Spoiler: probably not — and definitely not faster.)

We compared the cost AND the time of building the same quality trip yourself.
Between research, booking, coordination, and logistics, our retreats save you
weeks of planning and hundreds of dollars. The numbers don't lie.
```

**Disclaimer section update** (the blue info box):
Add a time component:
```
How we calculated: DIY prices are based on comparable quality boutique
accommodations, guided activities with certified instructors, and average
meal costs at quality restaurants in each destination. Time estimates are
based on average booking and research hours for similar trips. Your actual
costs and time may vary.
```

**Per-card savings messaging**:
Currently shows: "Save $X with SALTY"
Also show: "Save $X and 20+ hours of planning with SALTY" (or similar)

The time estimate can be a static value per retreat (add to `DIYComparison` type):
```typescript
interface DIYComparison {
  // ... existing fields
  estimatedPlanningHours: number; // e.g., 25 — hours you'd spend planning DIY
}
```

Reasonable estimates:
- 7-night retreat: ~20-25 hours of planning (researching accommodation, booking activities individually, finding restaurants, arranging transport, etc.)
- 9-night retreat: ~25-30 hours

---

## 3. Share Per Comparison Card

### Current State
There's a single ShareButton at the top of the compare page that shares the entire comparison page URL. Individual comparison cards don't have their own share option.

### Required Changes

Add a ShareButton to **each individual comparison card** (`ComparisonCard` component):

```tsx
// After the CTA buttons (Check Flights / View Trip Details), add:
<div className="mt-3 text-center">
  <ShareButton
    title={`${comparison.destination} — DIY vs SALTY Price Comparison`}
    text={`Check this out: a SALTY ${comparison.destination} retreat saves you $${savings.toLocaleString()} (${savingsPercent}%) compared to booking it yourself. Plus ${comparison.estimatedPlanningHours}+ hours of planning time.`}
    url={`https://explore.getsaltyretreats.com/compare#${comparison.retreatSlug}`}
  />
</div>
```

- Each card shares its specific retreat comparison
- The URL includes a hash anchor to the specific card (add `id={comparison.retreatSlug}` to the card element)
- The page should scroll to the anchored card when loaded with a hash
- Share uses native share tray on mobile

---

## 4. "Breakfast" → "Full Board" or "All Meals"

### Current State
In `src/data/diy-pricing.ts`, the meal items are listed separately:
- "Breakfast" (saltyIncluded: true)
- "Lunch" (saltyIncluded: false — not included in SALTY price)
- "Dinner" (saltyIncluded: false — not included in SALTY price)

### Required Changes

**Context check**: SALTY retreats include breakfast only, not all meals. The user's request says `"Breakfast" should say "Full Board" or "All Meals"`.

**If SALTY retreats now include ALL meals** (breakfast, lunch, dinner):
- Combine all three meal items into one line item: **"Full Board (All Meals)"**
- Set `saltyIncluded: true` for this combined item
- The DIY cost would be the sum of all three (breakfast + lunch + dinner)
- Description: "All meals included — breakfast, lunch, and dinner at quality restaurants and local favorites"

**If SALTY retreats still only include breakfast**:
- Rename "Breakfast" to **"Full Board"** with description noting it covers all provided meals
- Keep lunch and dinner as separate non-included items

**Data changes per retreat** (example for Costa Rica):

```typescript
// BEFORE:
{ category: 'Breakfast', description: 'Daily breakfast...', saltyIncluded: true, diyPrice: 140 },
{ category: 'Lunch', description: 'Lunch at mid-range spots...', saltyIncluded: false, diyPrice: 175 },
{ category: 'Dinner', description: 'Dinner at restaurants...', saltyIncluded: false, diyPrice: 245 },

// AFTER (if all meals included):
{ category: 'Full Board', description: 'All meals — breakfast, lunch, and dinner daily (7 days). Quality restaurants, local cuisine, and group dining experiences.', saltyIncluded: true, diyPrice: 560, emoji: '🍽' },

// AFTER (if only breakfast included):
{ category: 'Full Board', description: 'Daily breakfast included — fresh, quality morning meals at your accommodation (7 days)', saltyIncluded: true, diyPrice: 140, emoji: '🍽' },
{ category: 'Lunch', description: 'Lunch at mid-range spots...', saltyIncluded: false, diyPrice: 175, emoji: '🥗' },
{ category: 'Dinner', description: 'Dinner at restaurants...', saltyIncluded: false, diyPrice: 245, emoji: '🍷' },
```

**IMPORTANT**: Clarify with Nate whether ALL meals are now included before implementing. The answer affects the savings calculation significantly. The spec should handle both scenarios.

**Apply this change to ALL retreats** in `diy-pricing.ts` (Costa Rica, Sri Lanka, Morocco, Sicily, El Salvador).

---

## 5. Currency Display on Compare Page

### Current State
All prices are hardcoded as USD with `$` prefix: `${comparison.saltyPriceFrom.toLocaleString()}`.

### Required Changes

Per `01-global-changes.md`:
- Wrap SALTY retreat prices with the `<PriceDisplay>` component (shows converted price + USD small print)
- DIY prices should also convert using `formatCurrency(amount, selectedCurrency)`
- Savings amounts and percentages should calculate from the converted values (or stay as-is since the ratio is the same regardless of currency)
- The "from / person" label should remain

---

## Files to Create/Modify

### New Files:
- `src/app/api/cron/verify-diy-links/route.ts` — Scheduled link verification cron job
- `src/app/api/diy-link-status/route.ts` — API to read link verification results

### Modified Files:
- `src/app/compare/page.tsx` — Add per-card sharing, anchor IDs, currency display, copy updates, link status indicators
- `src/data/diy-pricing.ts` — Rename Breakfast to Full Board, add `estimatedPlanningHours` field, update descriptions
- `vercel.json` — Add cron schedule configuration

### Configuration:
- Add `CRON_SECRET` to environment variables
- Ensure Vercel KV is configured (or the cron results fall back gracefully)

---

## Implementation Order

1. Update `diy-pricing.ts` — rename Breakfast, add planning hours
2. Update compare page copy (hero, disclaimer)
3. Add per-card ShareButton with anchor links
4. Add currency display via PriceDisplay component
5. Build cron job for link verification
6. Build link status API and integrate into compare page
7. Add price staleness warning logic

---

## Testing Checklist

- [ ] "Full Board" (or "All Meals") replaces "Breakfast" in all retreat comparisons
- [ ] DIY total and savings calculate correctly with the renamed/combined meal item
- [ ] Hero copy mentions both time and money savings
- [ ] Each comparison card has its own share button
- [ ] Share button uses native share tray on mobile
- [ ] Shared URLs include anchor hash that scrolls to the correct card
- [ ] Currency display converts all prices based on global currency selector
- [ ] SALTY prices show USD small print when non-USD is selected (TICO compliance)
- [ ] Cron job runs weekly and checks all source URLs
- [ ] Broken links display "Source unavailable" instead of a dead link
- [ ] Link verification results are cached and displayed on the page
- [ ] "Last verified" date appears in the footer
- [ ] Prices older than 3 months show a staleness warning
- [ ] Planning hours estimate appears in savings messaging
- [ ] Page loads correctly when accessed with an anchor hash
