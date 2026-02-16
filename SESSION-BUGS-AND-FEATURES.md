# SALTY Lead Magnet — Bug Hunt & Feature Build Session

> **Date:** February 11, 2026
> **Scope:** Quiz & Matching, Flight Search, Compare/Pricing, Trip Planner, Shared Plans
> **Context:** This document captures all decisions from a detailed product interview. Read this + HANDOVER.md to have full context.

---

## YOUR FIRST TASK

Scan the entire codebase thoroughly — every component, page, store, lib, data file, API route, and type file within the scope below. Identify and list ALL bugs, inconsistencies, dead code, broken logic, missing error handling, and UX issues before writing any code. Present findings to the user for review before fixing anything.

---

## SCOPE: Files To Audit

### Quiz & Matching
- `src/types/quiz.ts`
- `src/stores/quiz-store.ts`
- `src/lib/matching.ts`
- `src/lib/testimonial-matching.ts`
- `src/data/retreats.ts`
- `src/data/testimonials.ts`
- `src/components/quiz/*` (all quiz components)
- `src/app/quiz/page.tsx`
- `src/app/quiz/results/page.tsx`

### Flight Search
- `src/types/flight.ts`
- `src/stores/flight-store.ts`
- `src/lib/serpapi.ts`
- `src/lib/trip-cost.ts`
- `src/data/mock-flights.ts`
- `src/data/airports.ts`
- `src/data/alliances.ts`
- `src/components/flights/*` (all flight components)
- `src/app/flights/page.tsx`
- `src/app/api/flights/search/route.ts`

### Compare / Pricing
- `src/data/diy-pricing.ts`
- `src/data/city-cost-anchors.ts`
- `src/data/retreat-value-summaries.ts`
- `src/components/compare/*`
- `src/components/shared/CostPerDay.tsx`
- `src/components/shared/PaymentPlanToggle.tsx`
- `src/components/shared/TripCostBar.tsx`
- `src/app/compare/page.tsx`

### Trip Planner
- `src/components/planner/TripConfidenceScore.tsx`
- `src/app/planner/page.tsx`

### Shared Plans
- `src/lib/shared-plans.ts`
- `src/app/api/plans/route.ts`
- `src/components/shared/SharePlanButton.tsx`
- `src/app/plan/[id]/page.tsx`

### Shared / Cross-Cutting
- `src/lib/ghl.ts`
- `src/lib/utils.ts`
- `src/app/api/leads/capture/route.ts`
- `src/app/api/leads/share-flights/route.ts`
- `src/components/shared/*`
- `src/components/layout/MinimalHeader.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx` (homepage)

---

## DECIDED FEATURES TO BUILD (in this session's scope)

### 1. Cut Quiz from 10 → 7 Steps
**What:** Remove Group Style (step 2), Solo (step 7), and Experience Level (step 8) questions entirely.
**Why:** These have 0% matching weight — only generated CRM tags. Cutting them improves completion rate.
**Files to modify:**
- `src/types/quiz.ts` — Remove from `QUIZ_STEPS`, `QuizAnswers` interface
- `src/stores/quiz-store.ts` — Remove from default state and actions
- `src/lib/matching.ts` — Remove any references (shouldn't affect scoring)
- `src/lib/ghl.ts` — Tags referencing these fields will need graceful handling (don't crash if null)
- `src/components/quiz/QuizContainer.tsx` — Remove step rendering for these 3 components
- Delete: `GroupStyleQuestion.tsx`, `SoloQuestion.tsx`, `ExperienceQuestion.tsx` (or confirm file names)
**New step order:** Vibes → Room Preference → Availability → Regions → Party/Rest → Must-Haves → Lead Capture (7 steps)

### 2. Auto-Hide Past Retreats
**What:** Filter out retreats whose end dates have passed from quiz results, compare page, planner, and anywhere retreats are listed.
**Why:** Costa Rica v3 (Jan 3-10, 2026) has already passed. Only bookable or coming-soon retreats should appear.
**Logic:** Compare retreat `endDate` against `new Date()`. If past → exclude. Respect `status` field as well (sold_out already excluded).
**Files to modify:** `src/lib/matching.ts`, `src/app/compare/page.tsx`, `src/app/planner/page.tsx`, anywhere retreats are filtered/listed.

### 3. Full Return Flight Search
**What:** After user selects outbound flight(s) and clicks "Continue to Return Flights", perform a real SerpApi search for return flights and display with same UX (sort tabs, filters, cards).
**Why:** Currently only searches outbound and estimates return as 2x. User wants identical experience for both directions.
**Files to modify:**
- `src/stores/flight-store.ts` — Already has `returnResults`, `isReturnMode`, `selectedOutboundIds`
- `src/app/api/flights/search/route.ts` — Support reverse origin/destination search
- `src/lib/serpapi.ts` — May need to handle return date logic
- `src/app/flights/page.tsx` — UI for outbound selection → continue → return results
- `src/components/flights/*` — May need tweaks for return flight context
**SerpApi cost:** Doubles credits per full search (outbound + return = 2 credits)

### 4. USD Default + Currency Toggle
**What:** All prices default to USD. Retreat prices, flight totals, DIY comparisons — everything in USD with a toggle to convert.
**Why:** SALTY retreats are priced in USD on Squarespace. Consistency matters.
**Files to modify:** Flight currency selector (already exists), compare page, planner, results page — anywhere prices appear.

### 5. DIY Pricing Disclaimers + Date Stamps
**What:** Add "Estimated as of [month year]" to all DIY price comparisons. Add "Click to verify current prices" next to source links.
**Why:** Prices fluctuate. If a user clicks through and sees different numbers, it hurts trust.
**Files to modify:** `src/app/compare/page.tsx`, `src/data/diy-pricing.ts` (add `estimatedDate` field to data)

### 6. Pricing Data Refresh Mechanism
**What:** Build a way to update DIY cost data with new prices and dates — could be a script, admin endpoint, or documented manual process.
**Why:** Prices go stale. Need a sustainable way to keep comparisons honest.

### 7. Real AI Planner Suggestions (Claude API)
**What:** Replace hardcoded mock suggestions with real Claude API calls. Pass full user context: quiz answers, selected flights, retreat details, cities already added.
**Why:** Current suggestions are fake (hardcoded with 2-second delay). Real AI makes the planner a genuine differentiator.
**Files to modify:**
- `src/app/planner/page.tsx` — Replace mock suggestion logic
- New API route: `src/app/api/planner/suggest/route.ts`
- Need `ANTHROPIC_API_KEY` in `.env.local`

### 8. Planner GHL Submit
**What:** Wire up the planner's lead capture form to push data to GoHighLevel CRM.
**Why:** Currently has `// TODO: Submit to GHL` at line ~593 of `planner/page.tsx`.
**Files to modify:** `src/app/planner/page.tsx`, `src/lib/ghl.ts`

### 9. Vercel KV for Shared Plans
**What:** Replace in-memory `Map<string, SharedPlan>` with Vercel KV for persistence.
**Why:** In-memory storage resets on every server restart. Plans must survive deployment.
**Files to modify:** `src/lib/shared-plans.ts` (pattern already documented in comments)
**Requires:** `@vercel/kv` package, Vercel KV store provisioned in Vercel dashboard

### 10. Contextual CTAs Between Sections
**What:** Each page suggests the logical next action — results → "Check Flights", flights → "Compare Prices", compare → "Plan Your Trip", planner → "Share With Friends".
**Why:** Multi-entry-point app needs clear pathways between sections without relying on nav alone.

### 11. Contextual WhatsApp Placement
**What:** Remove the global floating WhatsApp button. Place WhatsApp CTAs at strategic conversion moments: after quiz results, after flight search, on compare page, on planner save.
**Why:** Floating button is intrusive on mobile and overlaps content. Contextual placement converts better.
**Files to modify:** Remove from layout or shared component, add to specific pages at relevant breakpoints.

---

## KEY PRODUCT DECISIONS (for reference)

| Decision | Choice |
|----------|--------|
| Primary goal | Lead capture + booking links to Squarespace |
| Success metric | Total leads captured |
| Target audience | Mixed: 25-35 fitness + 30-45 wellness |
| App structure | Multi-entry-point (not linear funnel) |
| Viral hooks | Flight deals + shared plans |
| Booking flow | Link to Squarespace per-retreat checkout pages |
| Lead gate | Gate before quiz results and before flight results |
| Currency | USD default, toggle for others |
| Retreat curation | Manually updated monthly — only bookable + coming soon |
| Images | Professional photos available (will replace placeholders) |
| OG images | Rotating library of pro photos per retreat |
| Retreat detail | Link to Squarespace (don't rebuild detail pages) |
| Coaches | Not shown in app |
| User identity | localStorage only, no auth |
| Animations | Essential only (transitions, loading) — strip decorative |
| Mobile | Critical priority — most traffic from Instagram/WhatsApp |
| Accessibility | Basic compliance (contrast, prefers-reduced-motion, aria labels) |
| SEO | Future priority — architecture should support it later |
| Analytics | Lightweight dashboard (Vercel Analytics or PostHog free tier) |
| Error handling | Must-have — branded 404, error boundaries, loading skeletons |
| Deployment | Vercel (not yet set up) → explore.getsaltyretreats.com |
| Shared plan storage | Vercel KV (swap from in-memory Map) |

---

## BRAND RULES (quick reference)

- **Display font:** TAN Headline — ALWAYS UPPERCASE
- **Body font:** Roca
- **Colors:** Deep Teal `#0E3A2D`, Orange-Red `#F75A3D`, Cream `#F7F4ED` (13 total in palette)
- **Voice:** Casual, exciting, community-first. Never corporate.
- **No emojis in UI** (except quiz question options)
- **Tailwind classes only** — no inline styles
- **`cn()` utility** for conditional classes
- **Framer Motion** for functional animations only
- **Button component** — use `variant` prop, never custom-style

---

## HOW TO RUN

```bash
cd ~/Desktop/Claude/salty-lead-magnet
npx next dev -p 3001
# → http://localhost:3001
```

---

## SESSION INSTRUCTIONS

1. **Read HANDOVER.md first** for full technical context
2. **Read this file** for decided features and scope
3. **Scan every file listed in the SCOPE section** — thoroughly
4. **List all bugs, issues, and inconsistencies** before writing any code
5. **Present findings** for user review
6. **Then implement features** in the order listed above
