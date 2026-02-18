# SALTY Lead Magnet — Project Handover Document

> **Last updated:** February 11, 2026
> **Purpose:** Give any Claude session full context to pick up work on any feature in this project.
> **Location:** `/Users/nathanielbehar/Desktop/Claude/salty-lead-magnet/`

---

## 1. WHAT THIS PROJECT IS

A **lead-magnet web app** for SALTY Retreats — a Canadian fitness retreat company. The app helps potential guests:

1. **Take a quiz** to find their best retreat match
2. **Search real flights** to that retreat destination
3. **Compare pricing** (SALTY vs DIY)
4. **Plan a multi-city trip** around the retreat
5. **Share plans** with friends

Every touchpoint captures lead data and pushes it to GoHighLevel CRM (GHL) with behavioral tags for sales automation.

**Live domain (planned):** `explore.getsaltyretreats.com`
**Main brand site (Squarespace):** `getsaltyretreats.com`

---

## 2. TECH STACK

| Layer | Tech | Version | Notes |
|-------|------|---------|-------|
| Framework | Next.js (App Router) | 15.5 | React 19, TypeScript 5.7 |
| Styling | Tailwind CSS | 4.0 | `@tailwindcss/postcss` plugin, `@theme inline` |
| Animation | Framer Motion | 12 | ScrollReveal, AnimatePresence, spring physics |
| State | Zustand | 5 | Persist middleware → localStorage |
| Forms | React Hook Form + Zod | 7.54 / 3.24 | Lead capture, planner forms |
| Carousel | Swiper | 11 | Flight card horizontal scroll |
| Flights API | SerpApi | — | Google Flights scraper, 250 searches/mo free |
| CRM | GoHighLevel | v1 REST | Mock mode if API key not set |
| Fonts | TAN Headline + Roca | — | `/public/fonts/`, display + body |

### Key Config Files
- `next.config.ts` — allows remote images from `logo.clearbit.com` (airline logos)
- `tsconfig.json` — strict mode, `@/*` path alias, excludes `Research for Cost comparison/` folder
- `postcss.config.mjs` — uses `@tailwindcss/postcss`
- `.env.local` — SerpApi key (active), GHL keys (empty/mock), GTM/Meta Pixel (not configured yet)

---

## 3. BRAND RULES

| Element | Value |
|---------|-------|
| Display Font | TAN Headline — **always uppercase** |
| Body Font | Roca |
| Primary Colors | Deep Teal `#0E3A2D`, Orange-Red `#F75A3D`, Cream `#F7F4ED` |
| Full Palette | 13 custom colors defined in `globals.css` `@theme inline` block |
| WhatsApp | +1 431-829-1135 |
| Deposit | $350 across all retreats |
| Voice | Casual, exciting, community-first. Never corporate. |

### Color Reference (all available as `text-salty-*` / `bg-salty-*`)
```
salty-salmon: #FF7E70       salty-yellow: #FED260
salty-orange-red: #F75A3D   salty-burnt-red: #C74235
salty-mauve: #CCB4B3        salty-light-blue: #B6D4EA
salty-seafoam: #A4E5D9      salty-deep-teal: #0E3A2D
salty-deep-teal-light: #1A5A45  salty-forest-green: #3A6B35
salty-cream: #F7F4ED        salty-beige: #E7D7C0
salty-slate: #4A4E58        salty-charcoal: #383838
```

---

## 4. FILE STRUCTURE

```
src/
├── app/
│   ├── page.tsx                    # Homepage (hero, how it works, stats, Elfsight reviews)
│   ├── layout.tsx                  # Root layout (GTM, Meta Pixel, Elfsight script, header)
│   ├── globals.css                 # Tailwind theme, fonts, custom CSS components
│   ├── quiz/
│   │   ├── page.tsx                # Quiz landing + start
│   │   └── results/page.tsx        # Results display (protected route)
│   ├── flights/page.tsx            # Flight search + results + compare mode
│   ├── compare/page.tsx            # DIY vs SALTY pricing breakdown
│   ├── planner/page.tsx            # Multi-city trip builder + AI suggestions
│   ├── plan/[id]/page.tsx          # Shared plan viewer (friends join/status)
│   └── api/
│       ├── flights/search/route.ts # SerpApi flight search + mock fallback
│       ├── leads/capture/route.ts  # POST: create lead + PATCH: update intent
│       ├── leads/share-flights/route.ts  # Format + send flight summaries
│       └── plans/route.ts          # CRUD for shared plans
├── components/
│   ├── quiz/                       # QuizContainer, QuizResults, 10 question components
│   ├── flights/                    # FlightSearchForm, FlightCard, filters, lead gate
│   ├── compare/                    # CostOfStayingHome
│   ├── planner/                    # TripConfidenceScore
│   ├── shared/                     # Button, ScrollReveal, WhatsApp, ShareButton, etc.
│   └── layout/                     # MinimalHeader
├── data/
│   ├── retreats.ts                 # 7 retreats with full metadata + room tiers
│   ├── testimonials.ts             # 32 real tagged testimonials
│   ├── airports.ts                 # IATA airport list
│   ├── alliances.ts                # Airline alliances (Star, OneWorld, SkyTeam)
│   ├── mock-flights.ts             # Fallback flight data for dev
│   ├── diy-pricing.ts              # DIY cost anchors for compare page
│   ├── city-cost-anchors.ts        # 6 cities for "cost of staying home"
│   ├── coaches.ts                  # Coach profiles
│   ├── region-map.ts               # Country → region mapping
│   └── retreat-value-summaries.ts  # 1-line value props per retreat
├── stores/
│   ├── quiz-store.ts               # Quiz answers, results, lead data (persisted)
│   └── flight-store.ts             # Origin, retreat, results, filters, favourites (persisted)
├── lib/
│   ├── matching.ts                 # Quiz → retreat matching algorithm
│   ├── testimonial-matching.ts     # Contextual testimonial scoring
│   ├── ghl.ts                      # GoHighLevel CRM integration (mock-safe)
│   ├── serpapi.ts                   # SerpApi Google Flights wrapper
│   ├── google-flights.ts           # Alt flights (unused, kept for future)
│   ├── trip-cost.ts                # Flight + retreat total calculator
│   ├── shared-plans.ts             # In-memory plan store (swap to Vercel KV)
│   └── utils.ts                    # cn(), date/price formatters
└── types/
    ├── index.ts                    # Barrel export for all types (single import entry point)
    ├── quiz.ts                     # QuizAnswers, QuizResult, QUIZ_STEPS, enums
    ├── retreat.ts                  # Retreat, SaltyMeter, RoomTier, Testimonial, Coach, etc.
    ├── flight.ts                   # Airport, FlightOption, FlightSearchResults, etc.
    ├── alliances.ts                # Alliance
    ├── diy-pricing.ts              # DIYLineItem, DIYComparison
    ├── city-cost-anchors.ts        # CityAnchor, CityLineItem
    └── mock-flights.ts             # MockFlightConfig
```

---

## 5. USER FLOW

```
Homepage (/) ──────────────────────────────────────────────────────────
    │                                                                  │
    ▼                                                                  ▼
Quiz (/quiz)                                              Flights (/flights)
    │ 10 questions                                             │ Select origin + retreat
    │ (vibes → group → room → dates →                         │ SerpApi search
    │  region → party/rest → solo →                            │ Cheapest/Best/Fastest tabs
    │  experience → must-haves → lead capture)                 │ Alliance/stops/price filters
    │                                                          │ Currency selector
    ▼                                                          │ Lead gate (if not captured)
Results (/quiz/results)                                        │
    │ Hero match + "Also Consider"                             │
    │ Contextual testimonials                                  │
    │ CostPerDay, PaymentPlanToggle                            │
    │ Share plan, check flights CTAs                            │
    │                                                          │
    ├──────────── "Check Flights" ─────────────────────────────┘
    │
    ▼
Compare (/compare)                        Planner (/planner)
    │ SALTY vs DIY breakdown                  │ Add cities before/after retreat
    │ Cost of Staying Home                    │ AI suggestions (mock)
    │ Savings % badge                         │ Trip Confidence Score (0-100)
    │                                         │ Save + share itinerary
    │                                         │
    └─────────────────────────────────────────┘
                        │
                        ▼
              Share Plan (/plan/[id])
                  │ Friends join with name + city
                  │ Status: interested/in/maybe/out
                  │ Real-time updates
```

---

## 6. THE RETREATS (7 total)

| # | Slug | Destination | Dates | Status | Room Tiers | Lowest Price |
|---|------|-------------|-------|--------|------------|-------------|
| 1 | `costa-rica-fitness-retreat` | Costa Rica (Osa Peninsula) | Jan 3–10, 2026 | available | None (no breakdown in FAQ) | $2,399 |
| 2 | `sri-lanka-surf-yoga-retreat` | Sri Lanka (Ahangama + Ella) | Feb 12–21, 2026 | available | 4 tiers (Dorm→Split Double) | $1,999 |
| 3 | `panama-surf-retreat` | Panama (Panama City + Santa Catalina) | Mar 14–22, 2026 | tbd | None (pricing coming soon) | $0 |
| 4 | `morocco-surf-yoga-retreat` | Morocco (Taghazout) | May 16–23, 2026 | available | 4 tiers (Dorm→Single) | $1,999 |
| 5 | `sicily-wellness-retreat` | Sicily (Ragusa) | Aug 9–16, 2026 | available | 3 tiers (Shared→Single) | $2,099 |
| 6 | `el-salvador-surf-retreat` | El Salvador (El Tunco) | Nov 21–28, 2026 | available | 4 tiers (Group 4→Premium Double) | $1,949 |
| 7 | `costa-rica-fitness-retreat-v4` | Costa Rica (Osa Peninsula) | Jan 9–16, 2027 | coming_soon | 3 tiers (Quad→Double) | $1,949 |

### SALTY Meter Values (from FAQ — source of truth)

| Retreat | Adventure | Culture | Party | Sweat | Rest | Group Size |
|---------|-----------|---------|-------|-------|------|------------|
| Costa Rica v3 | 7 | 6 | 5 | 7 | 8 | 25–35 |
| Sri Lanka | 10 | 8 | 5 | 6 | 6 | 25–35 |
| Panama | 7 | 8 | 7 | 7 | 6 | 35–45 |
| Morocco | 9 | 10 | 3 | 8 | 4 | 20–25 |
| Sicily | 3 | 8 | 9 | 9 | 3 | 35–45 |
| El Salvador | 5 | 9 | 7 | 8 | 3 | 20–24 |
| Costa Rica v4 | 7 | 6 | 2 | 7 | 9 | 25–30 |

### Airport Codes
- Costa Rica (both): **SJO** (San Jose) — NOT LIR
- Sri Lanka: **CMB** (Colombo)
- Panama: **PTY** (Tocumen)
- Morocco: **AGA** (Agadir)
- Sicily: **CTA** (Catania)
- El Salvador: **SAL**
- Note: Costa Rica requires SANSA domestic flight (~$310, guest pays separately)

---

## 7. MATCHING ALGORITHM

**File:** `src/lib/matching.ts`

Weighted composite score, bounded to [5, 99]. No percentages shown to user.

| Dimension | Weight | How It Scores |
|-----------|--------|---------------|
| Vibes | 30% | Average of matched SALTY Meter dimensions (0–10) × 10 |
| Room | 20% | Price tier proximity to user's room preference |
| Date | 15% | Exact month=100, ±1mo=60, ±2mo=30, flexible=80, none=20 |
| Region | 15% | Match=100, surprise-me=80, no-pref=50, no-match=45 |
| Activity | 10% | Matched must-haves / total must-haves × 100 |
| Party/Rest | 10% | 100 − (|userRatio − retreatRatio| × 12) |

**Hard penalties:**
- Must-have zero match: −30 points (soft filter, doesn't eliminate)
- `sold_out` retreats: excluded entirely

**Output:** Single best match (hero card) + remaining as "Also Consider". No match percentages displayed.

---

## 8. TESTIMONIALS

**File:** `src/data/testimonials.ts` — 32 real testimonials from `SALTY_Testimonials_Tagged.xlsx`

**Coverage:**
- El Salvador: 3 testimonials
- Sicily: 8 testimonials
- Costa Rica (cross-matched from Nicaragua/Mexico): 7 testimonials
- Morocco: 8 testimonials (+ 2 spare mapped broadly)
- Sri Lanka: 0 (future retreat — falls back to cross-retreat)
- Panama: 0 (future retreat — falls back to cross-retreat)
- Costa Rica v4: 0 (future retreat — falls back to cross-retreat)

**Matching algorithm** (`src/lib/testimonial-matching.ts`):
- vibes +3, guest type +2, solo/fitness objection +2, priority tiebreaker
- Falls back to highest-priority cross-retreat testimonials when retreat has none

---

## 9. GHL CRM INTEGRATION

**File:** `src/lib/ghl.ts`

**Current state:** Mock mode (API keys not configured). All functions log to console and return mock data.

**Pipeline stages:** Quiz Lead → Exploring → High Intent → Booked

**Tag prefixes:** `quiz_*`, `flight_*`, `intent_*`

**Functions:**
- `createOrUpdateContact()` — lookup by email, merge tags
- `moveToStage()` — create/update opportunity in pipeline
- `generateQuizTags()` — 20+ tags from quiz answers
- `generateFlightTags()` — origin + retreat tags
- `generateIntentTags()` — behavioral tags (favourite, share, compare)

**To activate:** Set `GHL_API_KEY`, `GHL_LOCATION_ID`, and pipeline/stage IDs in `.env.local`

---

## 10. FLIGHT SEARCH

**File:** `src/lib/serpapi.ts` + `src/app/api/flights/search/route.ts`

**Active API:** SerpApi (key in `.env.local`, 250 searches/month free tier)

**Behavior:**
1. POST to `/api/flights/search` with origin + retreat slug
2. Looks up retreat airport code from `retreats.ts`
3. Calls SerpApi Google Flights engine (1 credit per search)
4. Sorts results into Cheapest / Best / Fastest buckets (10 each)
5. Falls back to `mock-flights.ts` if SerpApi fails or returns 0

**Best score formula:** `(normalizedPrice × 0.6) + (normalizedDuration × 0.4)`

**Alternate API:** Kiwi.com Tequila (env vars exist but not configured)

---

## 11. SHARED PLANS

**File:** `src/lib/shared-plans.ts`

**Current storage:** In-memory `Map<string, SharedPlan>` (resets on server restart)

**Production swap:** Replace with Vercel KV (pattern documented in file comments):
```typescript
import { kv } from '@vercel/kv';
export async function getPlan(id) { return kv.get<SharedPlan>(`plan:${id}`); }
export async function savePlan(plan) { await kv.set(`plan:${plan.id}`, plan, { ex: 60*60*24*30 }); }
```

**Plan structure:** Creator, retreat, flights, friends list with join/status tracking

---

## 12. TRACKING & PIXELS

**File:** `src/app/layout.tsx`

| Pixel | Status | Env Var |
|-------|--------|---------|
| Google Tag Manager | Not configured | `NEXT_PUBLIC_GTM_ID` |
| Meta Pixel | Not configured | `NEXT_PUBLIC_META_PIXEL_ID` |
| Elfsight Reviews | Live | Widget ID hardcoded in layout + homepage |

Scripts are conditional — only injected if env vars are set. No code changes needed to activate.

---

## 13. KNOWN GAPS & TODOS

### Not Yet Built / Configured
| Item | Status | Notes |
|------|--------|-------|
| GHL API credentials | Waiting on Sabhi | Set keys in `.env.local` to activate |
| GTM container ID | Waiting on team | Set `NEXT_PUBLIC_GTM_ID` |
| Meta Pixel ID | Waiting on team | Set `NEXT_PUBLIC_META_PIXEL_ID` |
| Shared plans persistent storage | Dev only | Swap in-memory Map → Vercel KV |
| Planner GHL submit | TODO in code | `planner/page.tsx:593` — form doesn't submit to GHL yet |
| Costa Rica v3 room tiers | Missing from FAQ | No room breakdown provided |
| Panama pricing | Pricing TBD | FAQ says "COMING SOON" |
| Return flight search | Cost optimization | Only outbound searched via SerpApi (×2 for estimate) |
| Trip planner AI suggestions | Mock | Hardcoded per-retreat suggestions with 2s fake delay |

### Data Gaps
| Item | Details |
|------|---------|
| Testimonials for Sri Lanka, Panama, Costa Rica v4 | No testimonials exist yet (future retreats). System falls back to cross-retreat highest-priority. |
| Room tier images | All `images: []` — no room photos uploaded yet |
| Retreat hero/card images | Using placeholder lifestyle images |
| Itinerary data | `itinerary: []` for all retreats — day-by-day not built out |
| FAQ data | `faq: []` for all retreats — Q&A not built out |

---

## 14. DATA SOURCES

| Source | Location | What It Contains |
|--------|----------|------------------|
| Retreats FAQ | `~/Desktop/SALTY Retreats/Claude SALTY/Retreats FAQ Jan '26.md` | Room tiers, SALTY Meter, coaches, airports, inclusions — **source of truth** |
| Tagged Testimonials | `~/Desktop/Claude/salty-lead-magnet/SALTY_Testimonials_Tagged.xlsx` | 32 testimonials with retreat mapping, guest type, vibes, objections |
| Elfsight Widget | Hardcoded in layout | Widget ID: `bcb6e237-0108-4ffa-a743-3d801a3b39b2` |

---

## 15. HOW TO RUN

```bash
cd ~/Desktop/Claude/salty-lead-magnet
npx next dev -p 3001
# → http://localhost:3001
```

**Build:**
```bash
npx next build
```

**Kill stuck port:**
```bash
lsof -i :3001 -t | xargs kill -9
```

---

## 16. KEY TEAM

| Person | Role | Relevant To |
|--------|------|-------------|
| Nate | Ops, project lead | All decisions |
| Erin | Creative director | Brand, copy, design |
| Lisa | Movement Travel | Booking/travel agent integration |
| KP | Social media | Content, sharing features |
| Sabhi | Digital / GHL | CRM setup, API keys, automations |

---

## 17. FEATURE-SPECIFIC SESSION GUIDES

When starting a focused session on a specific feature, share this document and reference the relevant section. Here's what each feature area touches:

### Quiz & Matching
**Files:** `types/quiz.ts`, `stores/quiz-store.ts`, `lib/matching.ts`, `data/retreats.ts`, `components/quiz/*`, `app/quiz/*`

### Flight Search
**Files:** `types/flight.ts`, `stores/flight-store.ts`, `lib/serpapi.ts`, `app/api/flights/search/route.ts`, `components/flights/*`, `app/flights/page.tsx`

### GHL / Lead Capture
**Files:** `lib/ghl.ts`, `app/api/leads/capture/route.ts`, `components/quiz/LeadCaptureGate.tsx`, `components/flights/FlightLeadGate.tsx`

### Compare / Pricing
**Files:** `data/diy-pricing.ts`, `data/city-cost-anchors.ts`, `components/compare/*`, `components/shared/CostPerDay.tsx`, `components/shared/PaymentPlanToggle.tsx`, `app/compare/page.tsx`

### Trip Planner
**Files:** `components/planner/TripConfidenceScore.tsx`, `app/planner/page.tsx`

### Shared Plans
**Files:** `lib/shared-plans.ts`, `app/api/plans/route.ts`, `components/shared/SharePlanButton.tsx`, `app/plan/[id]/page.tsx`

### Styling / Brand
**Files:** `app/globals.css`, `public/fonts/*`, `components/shared/Button.tsx`, `components/shared/WaveDivider.tsx`

### Testimonials
**Files:** `data/testimonials.ts`, `lib/testimonial-matching.ts`, `types/retreat.ts` (Testimonial interface)

---

## 18. CONVENTIONS TO FOLLOW

1. **Tailwind classes only** — no inline styles, no CSS modules
2. **`cn()` utility** for conditional classes (`src/lib/utils.ts`)
3. **Framer Motion** for all animations — `ScrollReveal` wrapper for scroll-triggered
4. **TAN Headline** is always uppercase (CSS handles this via `font-display`)
5. **Zustand stores** — use persist middleware, partialize what should survive refresh
6. **API routes** — always handle GHL mock mode gracefully (check for empty API key)
7. **Component patterns** — functional components, hooks only, no class components
8. **Button component** — use `variant` prop, never custom-style buttons
9. **WaveDivider** — use between major page sections (5 color variants)
10. **No emojis in UI** unless explicitly part of design (quiz question options are an exception)
