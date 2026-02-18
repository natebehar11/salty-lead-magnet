# Flight Finder Spec (Specific Trip + Compare Trips)

## Overview
Changes to both flight finder modes: fixing currency conversion, implementing return flights with full parity, redesigning the save/share flow, removing heart/favourite buttons, updating the max price slider default, and adding CTAs to compare mode retreat cards.

**Dependency**: Requires `01-global-changes.md` to be implemented first (global currency system).

---

## CHANGES APPLYING TO BOTH MODES

### 1. Remove Heart/Favourite Button from All Flight Cards

#### Current State
Every `FlightCard` (`src/components/flights/FlightCard.tsx`) has a heart button (lines 60-74) that toggles favourites stored in `favouriteFlightIds` in the flight store.

#### Required Changes
- **Delete the heart button entirely** from `FlightCard.tsx` (the `<button onClick={() => toggleFavourite(flight.id)}>` block)
- Remove the `isFavourited` variable and `toggleFavourite` import from the component
- **Do NOT remove** `favouriteFlightIds` from the store yet — the `TripConfidenceScore` component in Build a Trip references `hasFavouritedFlights`. That will be refactored in `04-build-a-trip.md`.
- The favourite system is being replaced by the checkbox selection system (which already exists for outbound flights)

### 2. Max Price Slider Default: $3,000

#### Current State
The flight filters have `maxPrice: null` as the default in `src/stores/flight-store.ts`:
```typescript
const defaultFilters: FlightFilters = {
  maxStops: null,
  maxDuration: null,
  maxPrice: null,  // "Any" — no max
  currency: 'USD',
  alliances: [],
};
```

#### Required Changes
- Change `maxPrice` default to `3000`
- The slider UI should start at $3,000 instead of "Any"
- Users can still slide it higher or to "Any" if they want
- This applies to both Specific Trip and Compare Trips mode
- The slider should use the global currency for display (e.g., if EUR selected, show €2,780 or whatever the converted amount is)

### 3. Currency Conversion Fix

#### Current State
Currency selector exists but doesn't convert. Flight prices display in whatever currency code is selected, but the actual dollar amount stays the same (incorrect).

#### Required Changes
- **Remove the local CurrencySelector** from the flight search UI — it's now global in the header (per `01-global-changes.md`)
- Flight prices should convert using the global exchange rate service
- SerpAPI returns prices in USD — conversion happens at display time in `FlightCard`
- Update `FlightCard.tsx` to read from the global currency store instead of receiving `currency` as a prop
- The `formatCurrency()` call in FlightCard should now handle conversion automatically

**SerpAPI currency tracking**: The flight search API route (`src/app/api/flights/search/route.ts`) should include a `sourceCurrency` field in its response so the client knows what currency the raw price is in. Currently SerpAPI returns USD by default. This field ensures correct conversion even if the API behavior changes.

---

## SPECIFIC TRIP MODE

### 4. Return Flights — Full Implementation

#### Current State
When a departing flight is selected and the user clicks to search return flights:
- The current behavior shows return flights BUT the departing flights remain visible
- Return flights don't have the same feature parity (checkboxes, inclusion in share messages)

#### Required Changes

**4a. UI Flow Change — Replace Departing with Return Flights**

When the user selects one or more departing flights and clicks "Search Return Flights":
1. The departing flight list should **slide away** (animate out) and be **replaced** by the return flight list
2. Show a "← Back to Departing Flights" link at the top of the return flights section to go back
3. The selected departing flights should show as a compact summary strip above the return flights (airline, price, time — no full card)
4. Maintain the current filters/sort for the return flight search

**4b. Return Flights — Full Feature Parity**

Return flights must have ALL the same functionality as departing flights:
- **Checkboxes** for selection (use `selectedReturnIds` — new field in flight store)
- **Same card design** (FlightCard component — it's already reusable)
- **Same filters** (max stops, max duration, max price, alliances)
- **Same sort modes** (cheapest, best, fastest)
- **Included in save/share** — when saving flight plans (see section 5 below), both selected departing AND return flights are included

**Store changes** (`src/stores/flight-store.ts`):
```typescript
// Add new fields:
selectedReturnIds: string[];
toggleReturnSelection: (flightId: string) => void;
clearReturnSelection: () => void;

// Add to partialize (persist during session):
selectedReturnIds: state.selectedReturnIds,
```

### 5. Redesigned "Save These Flight Plans" Section

#### Current State
`ShareFlightPanel.tsx` has:
- Heading: "Send these flight plans to yourself"
- Supporting text: "Save your top options so you can compare later."
- Shows only departing flights (up to 5)
- "Email Me" and "WhatsApp Me" buttons
- A ShareButton at the bottom

#### Required Changes

**5a. Header and Copy Changes**
- Heading: **"Save These Flight Plans"**
- Supporting text: **"Send your top options to yourself, or a friend. Track them and save."**

**5b. Departing/Return Toggle**

Add a toggle above the flight list:
```
┌──────────────────────────────────────┐
│  [Departing Flights] [Return Flights]│  ← tab/toggle
├──────────────────────────────────────┤
│  ☑ Air Canada · $450 · Direct       │
│  ☑ WestJet · $520 · 1 stop          │
│  ☐ United · $380 · 1 stop           │
└──────────────────────────────────────┘
```

- Default view: Departing flights tab
- Users can switch to Return flights tab to select return options
- Multiple flights can be selected from each tab
- Both tabs show checkboxes
- Selected count indicator: "3 departing, 2 return selected"

**5c. All Selected Flights in Share Message**

When the user sends (email/WhatsApp/share):
- Include ALL selected flights from BOTH departing and return tabs
- Group them clearly: "DEPARTING FLIGHTS" section and "RETURN FLIGHTS" section
- Include key details for each: airline, price, departure time, arrival time, stops, date

**5d. Send via GHL Email**

The "Email Me" button should send an email through GoHighLevel's Conversations API:
- Endpoint: `POST https://services.leadconnectorhq.com/conversations/messages`
- The user must already be a GHL contact (captured via quiz or flight lead gate)
- Email should be well-formatted HTML with flight details, retreat info, and a CTA
- If GHL send fails, fall back to `mailto:` link

**Note on GHL API version**: The current codebase uses GHL API V1 (`https://rest.gohighlevel.com/v1`). The email send via Conversations API is V2 (`https://services.leadconnectorhq.com`). The spec should note this requires V2 authentication (OAuth2 or Private Integration Token). If V2 is not yet configured, fall back to `mailto:` deep links.

**5e. Share with Friends — Native Share**

The "Share with Friends" action at the bottom of the panel should:
1. Compile the selected flights into a shareable text message
2. Use `navigator.share()` for the native share tray on mobile
3. Fall back to the existing ShareButton menu on desktop
4. The share message should include all selected departing + return flights with prices

**5f. Share with Friend as New Contact**

When sharing with a friend via email (not the native share tray), the friend's email should be captured and:
1. Created as a new GHL contact with tag `referred_by_{original_user_email}`
2. The email sends through GHL to this new contact
3. This is a secondary flow — the primary path is native share tray

---

## COMPARE TRIPS MODE

### 6. Learn More CTA on Each Retreat Card

#### Current State
In Compare Trips mode, each retreat card shows flights but no link back to the retreat details.

#### Required Changes

Add a CTA button on each retreat card in the compare view:
```tsx
<a
  href={`https://getsaltyretreats.com/retreats/${retreat.slug}`}
  target="_blank"
  rel="noopener noreferrer"
  className="font-body text-xs font-bold text-salty-orange-red hover:underline"
>
  Learn more about this trip →
</a>
```

Position it below the retreat name/dates in the card header area.

### 7. Checkboxes and Save Flight Plans in Compare Mode

#### Current State
Compare mode shows flight cards across multiple retreats, but there's no way to select flights or save them.

#### Required Changes

**7a. Add Checkboxes to Compare Mode Flight Cards**

- Pass `showCheckbox={true}` to `FlightCard` in compare mode
- Selection state should track which retreat each selected flight belongs to
- Use a new field in the flight store: `compareSelectedFlightIds: string[]`

**7b. Floating "Save These Flight Plans" Panel**

When any flights are selected in compare mode:
- Show a floating/sticky panel at the bottom of the screen (similar to a shopping cart indicator)
- Clicking it opens the full `ShareFlightPanel` component
- The panel should show: "X flights selected across Y retreats — Save Plans"
- The ShareFlightPanel in this context should group flights by retreat:
  ```
  SALTY Costa Rica (Feb 15-22):
  ☑ Air Canada · $450 · Direct
  ☑ United · $380 · 1 stop

  SALTY Morocco (Mar 8-15):
  ☑ Royal Air Maroc · $620 · Direct
  ```

**7c. Same Save/Share Functionality**

All the same functionality from section 5 applies:
- Email through GHL
- WhatsApp
- Native share tray for friends
- Flights grouped by retreat in the message

---

## Files to Create/Modify

### Modified Files:
- `src/components/flights/FlightCard.tsx` — Remove heart button, read from global currency store
- `src/components/flights/ShareFlightPanel.tsx` — Major redesign (heading, toggle, return flights, GHL email)
- `src/stores/flight-store.ts` — Add `selectedReturnIds`, `compareSelectedFlightIds`, update maxPrice default
- `src/app/flights/page.tsx` — Update return flight flow (replace departing list), add compare mode checkboxes
- `src/components/flights/FlightSearchForm.tsx` — Remove local CurrencySelector
- `src/app/api/flights/search/route.ts` — Add `sourceCurrency` to response
- `src/types/flight.ts` — Add `sourceCurrency` to `FlightSearchResults`

### New Files:
- `src/app/api/leads/send-flights/route.ts` — GHL V2 email send endpoint (rename/update existing `/api/leads/share-flights`)
- `src/components/flights/CompareFlightSaveBar.tsx` — Floating save bar for compare mode

---

## Testing Checklist

- [ ] Heart/favourite button is completely removed from all flight cards
- [ ] Max price slider defaults to $3,000 in both modes
- [ ] Flight prices display in the globally selected currency with correct conversion
- [ ] Specific Trip: selecting departing flight and searching return replaces the departing list
- [ ] "Back to Departing Flights" link works correctly
- [ ] Return flights have checkboxes and can be selected
- [ ] Return flights respect all filters (stops, duration, price, alliances)
- [ ] "Save These Flight Plans" heading and copy is updated
- [ ] Departing/Return toggle works in the save panel
- [ ] Multiple flights from both tabs can be selected
- [ ] Email via GHL sends correctly formatted flight details
- [ ] Email falls back to mailto: if GHL V2 is not configured
- [ ] Native share tray works on mobile for sharing with friends
- [ ] Share message includes all selected flights (departing + return)
- [ ] Compare mode: "Learn more" link appears on each retreat card
- [ ] Compare mode: flight cards have checkboxes
- [ ] Compare mode: floating save bar appears when flights are selected
- [ ] Compare mode: save panel groups flights by retreat
- [ ] Currency display is consistent between card view and save panel
