# Global Changes Spec

## Overview
Cross-cutting changes that affect the entire SALTY lead magnet app. These must be implemented BEFORE the feature-specific specs, as other features depend on the global currency system, native share behavior, session persistence, and header navigation state.

---

## 1. Global Currency Converter

### Problem
The current `CurrencySelector` component (`src/components/flights/CurrencySelector.tsx`) is **UI-only** — it lets users toggle between USD/CAD/GBP/EUR/AUD but performs no actual conversion. The `formatCurrency()` utility in `src/lib/utils.ts` just formats with `Intl.NumberFormat` using the selected currency code, which produces incorrect values (e.g., showing "€500" when the actual USD price is $500, rather than the converted EUR equivalent).

### Solution

#### 1a. Create a Currency Service (`src/lib/currency.ts`)

```typescript
// Exchange rate API: ExchangeRate-API (free tier: 1,500 req/mo, daily updates)
// Endpoint: https://open.er-api.com/v6/latest/USD
// No API key required for the free tier

interface ExchangeRates {
  rates: Record<string, number>;
  fetchedAt: number; // Unix timestamp
}

// Cache exchange rates in memory with 24-hour TTL
// On app boot or first currency interaction, fetch rates
// Store in a module-level variable (not in Zustand — this is shared infrastructure)
// If fetch fails, use hardcoded fallback rates with a visual indicator that rates may be stale
```

Key behaviors:
- Fetch rates from `https://open.er-api.com/v6/latest/USD` on first use
- Cache in memory for 24 hours (check `fetchedAt` timestamp)
- If the API call fails, use hardcoded fallback rates AND show a small "rates may be approximate" indicator
- Export a `convertCurrency(amountUSD: number, targetCurrency: string): number` function
- Export a `getExchangeRate(currency: string): number` function
- All prices in the app are stored as USD internally — conversion happens at display time only

#### 1b. Create a Global Currency Store (`src/stores/currency-store.ts`)

```typescript
interface CurrencyState {
  selectedCurrency: string; // 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD'
  rates: Record<string, number> | null;
  lastFetched: number | null;
  isLoading: boolean;
  isStale: boolean; // true if using fallback rates

  setCurrency: (currency: string) => void;
  fetchRates: () => Promise<void>;
}
```

- Persist `selectedCurrency` to localStorage (key: `salty-currency`)
- Do NOT persist rates (fetch fresh on each session)
- The store should be separate from the flight store — currency is app-wide now

#### 1c. Move CurrencySelector to Header

- Remove `CurrencySelector` from its current location inside the flight search UI
- Add it to `MinimalHeader.tsx` as a global element, positioned in the nav area
- On mobile: show as a compact dropdown (not the current pill buttons — too wide for mobile header)
- On desktop: keep the pill-button style but smaller, integrated into the nav bar
- The selector must be visible on ALL pages, not just flights

#### 1d. Update `formatCurrency()` in `src/lib/utils.ts`

```typescript
// Current signature (keep backward compatible):
export function formatCurrency(amount: number, currency: string = 'USD'): string

// New behavior:
// 1. If currency !== 'USD', look up the exchange rate and convert
// 2. Format with Intl.NumberFormat using the target currency
// 3. Return the formatted string
```

#### 1e. TICO USD Price Display Requirement

**Legal requirement**: Anywhere a retreat price is displayed, if the user's selected currency is NOT USD, the USD price must also be shown in smaller, less dominant styling.

Implementation:
- Create a `<PriceDisplay>` component that wraps all retreat price displays
- Props: `amountUSD: number`, `label?: string`
- If selected currency is USD: show price normally
- If selected currency is NOT USD: show converted price prominently, then show USD price below/beside it in smaller text with reduced opacity

```tsx
// Example rendering when EUR is selected:
// €1,850        ← primary, large, salty-orange-red
// US$1,999      ← secondary, text-xs, salty-slate/40
```

- This ONLY applies to retreat prices (not flight prices, as those come from SerpAPI in whatever currency the API returns)
- Places where retreat prices appear:
  - Quiz results page (`QuizResults.tsx`) — "From $X" displays
  - Compare page (`compare/page.tsx`) — SALTY Price column
  - Flight page trip cost bar (`TripCostBar.tsx`)
  - Any deposit amount displays

#### 1f. Flight Price Currency Handling

- SerpAPI returns flight prices in USD by default (the `currency` param can be set)
- When user changes global currency, flight prices must also convert
- The flight search API route (`src/app/api/flights/search/route.ts`) should continue to request prices in USD from SerpAPI
- Conversion happens client-side at display time using the global exchange rates
- The `FlightCard` component currently receives `currency` as a prop — update it to read from the global currency store instead

---

## 2. Native Share Tray

### Problem
The current `ShareButton` component (`src/components/shared/ShareButton.tsx`) correctly tries `navigator.share()` first, but falls back to a custom dropdown menu with WhatsApp/Email/Twitter/Copy links. The issue is that on some browsers, the native share works but the implementation doesn't pass all the right data formats, and on desktop browsers without native share support, the fallback menu needs to remain.

### Solution

Update `ShareButton.tsx`:

1. **Always attempt native share first** via `navigator.share({ title, text, url })`
2. **Only show the fallback menu on desktop browsers** where `navigator.share` is `undefined`
3. The fallback menu should remain as-is (WhatsApp, Email, Twitter, Copy Link) for desktop
4. Remove any custom share UI that duplicates what the native share tray provides

The key change is behavioral — the component already does this mostly correctly, but every place in the app that has a "share with friends" action must use the `ShareButton` component (or call `navigator.share` directly), not custom share links.

**Audit all share points in the app:**
- `QuizResults.tsx` — uses `ShareButton` ✓ and `SharePlanButton` ✓
- `ShareFlightPanel.tsx` — uses `ShareButton` ✓ but also has its own email/WhatsApp send via API (this is different — it's "send to self", not "share with friends")
- `compare/page.tsx` — uses `ShareButton` ✓
- `SharePlanButton.tsx` — has its own sharing flow for plan links — should also use native share

**No new components needed** — just ensure all "Share with Friends" actions route through `navigator.share()` where available.

---

## 3. Session Persistence

### Problem
Screen inputs and progress should save on the session so that navigating back keeps the user's place. The Zustand stores already persist to localStorage, but some page-level state (like which cities are added in the planner, or which flights are selected) is held in React component state and lost on navigation.

### Solution

#### 3a. Planner State Persistence

Currently, the planner page (`src/app/planner/page.tsx`) holds ALL state in `useState`:
- `selectedRetreat`
- `beforeCities`, `afterCities`
- `prompt`, `suggestion`
- `showForm`, `formData`, `formSubmitted`

**Create a new Zustand store**: `src/stores/planner-store.ts`

```typescript
interface PlannerState {
  selectedRetreatSlug: string | null;
  beforeCities: PlannerCity[];
  afterCities: PlannerCity[];
  prompt: string;
  suggestion: ItinerarySuggestion | null;
  conversationHistory: ConversationMessage[]; // for the new AI chat feature (see build-a-trip.md)
  formSubmitted: boolean;

  // Actions
  setSelectedRetreat: (slug: string | null) => void;
  addCity: (type: 'before' | 'after') => void;
  updateCity: (id: string, updates: Partial<PlannerCity>) => void;
  removeCity: (id: string) => void;
  setPrompt: (prompt: string) => void;
  setSuggestion: (suggestion: ItinerarySuggestion | null) => void;
  setFormSubmitted: (value: boolean) => void;
  reset: () => void;
}
```

Persist to localStorage (key: `salty-planner-state`). Exclude `isGenerating` and other transient UI state.

#### 3b. Flight State — Already Mostly Persisted

The flight store already persists `leadData`, `hasSubmittedLead`, `filters`, and `favouriteFlightIds`. This is correct — search results should NOT persist (they go stale).

However, `selectedOutboundIds` and `isReturnMode` are NOT persisted but SHOULD be if the user navigates away and comes back during the same session. Add these to the `partialize` function.

#### 3c. Quiz State — Already Persisted ✓

Quiz store persists `answers`, `leadData`, `results`, `isComplete`, `hasSubmittedLead`, and `currentStep`. This is correct.

#### 3d. Compare Page — No Persistence Needed

The compare page is read-only from static data. No state to persist.

---

## 4. Active Page Indicator in Header

### Problem
The header navigation links (`MinimalHeader.tsx`) don't indicate which page the user is currently on. All links use the same `text-salty-slate/60` styling.

### Solution

Use Next.js `usePathname()` hook to detect the current route and apply active styling:

```tsx
'use client';
import { usePathname } from 'next/navigation';

// In the nav links:
const pathname = usePathname();

// For each link, check if pathname starts with the link's href:
const isActive = pathname.startsWith('/quiz');
// Apply active class:
className={cn(
  'font-body text-sm transition-colors',
  isActive
    ? 'text-salty-orange-red font-bold'
    : 'text-salty-slate/60 hover:text-salty-orange-red'
)}
```

Active states:
- `/quiz` and `/quiz/results` → "Find Your Retreat" is active
- `/flights` → "Flight Finder" is active
- `/compare` → "Price Comparison" is active
- `/planner` → "Build a Trip" is active
- `/` (homepage) → none active

Add a subtle bottom border or underline to the active link (2px solid salty-orange-red) for clear visual indication.

**Mobile**: The header currently hides nav links on mobile. Consider adding a simple mobile nav indicator — even just highlighting the page name below the logo, or adding a minimal mobile menu.

---

## Files to Create/Modify

### New Files:
- `src/lib/currency.ts` — Exchange rate service
- `src/stores/currency-store.ts` — Global currency state
- `src/components/shared/PriceDisplay.tsx` — Retreat price with USD fallback
- `src/stores/planner-store.ts` — Planner page state persistence

### Modified Files:
- `src/components/layout/MinimalHeader.tsx` — Add currency selector + active page indicator + usePathname
- `src/lib/utils.ts` — Update `formatCurrency()` to use exchange rates
- `src/components/flights/CurrencySelector.tsx` — Move to header, make responsive
- `src/components/shared/ShareButton.tsx` — Ensure native share is primary path
- `src/stores/flight-store.ts` — Add `selectedOutboundIds` to persisted state
- All pages displaying retreat prices — wrap with `<PriceDisplay>`

### Dependencies to Install:
- None — `fetch` is built into Next.js, and ExchangeRate-API requires no SDK

---

## Implementation Order

1. Currency service (`currency.ts`) + currency store
2. Move CurrencySelector to header + add active page indicator
3. Update `formatCurrency()` and create `PriceDisplay` component
4. Update all price displays across the app
5. Create planner store and migrate planner state
6. Update flight store persistence
7. Verify native share behavior across all share points

---

## Testing Checklist

- [ ] Currency selector appears in header on all pages
- [ ] Changing currency updates all prices across all pages instantly
- [ ] Exchange rates load on first use and cache for 24 hours
- [ ] Stale/fallback rates show an indicator
- [ ] TICO compliance: USD price shows in small text when non-USD currency is selected (retreat prices only)
- [ ] Flight prices convert correctly based on global currency
- [ ] Share buttons use native share tray on mobile (iOS Safari, Chrome Android)
- [ ] Share buttons fall back to custom menu on desktop
- [ ] Navigating away from planner and back preserves all state
- [ ] Navigating away from flights and back preserves selected outbound flights
- [ ] Active page is visually indicated in header
- [ ] Header is responsive and works on mobile
