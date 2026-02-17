# Quiz Feature Spec

## Overview
Changes to the quiz flow including renaming and restructuring the budget/room question, skipping lead capture for returning users, adding a WhatsApp country code picker, removing spots remaining from results, updating the share behavior, and adding payment plan info to the deposit CTA.

**Dependency**: Requires `01-global-changes.md` to be implemented first (global currency, native share, PriceDisplay component).

---

## 1. Replace Room Question with Budget Question

### Current State
Question 2 is `RoomPreferenceQuestion.tsx` which asks "How do you like to sleep?" with options:
- Dorm Style
- Triple Room
- Split or Cozy Double
- Private Room

It currently maps these to budget ranges internally via `roomToBudget` mapping.

### Required Changes

**Rename the question**: Change heading from "How do you like to sleep?" to **"What's your budget?"**

**Update the options** with new price ranges, labels, and supportive body copy:

| Option | Label | Price Range | Body Copy |
|--------|-------|-------------|-----------|
| 1 | `<$1,999` | under-2000 | **Dorm or Shared Accommodations.** This is for people who want to get on the trip first and foremost. You're prioritizing the experience over the room — and honestly, you'll barely be in it. You'll be too busy surfing, training, and making lifelong friends. |
| 2 | `$2,000 – $2,399` | 2000-2400 | **Triple or Standard Double.** You want the experience AND a bit more comfort. Share a room with one or two others, but still have quality beds and space to recharge. Best of both worlds. |
| 3 | `$2,300 – $2,799` | 2300-2800 | **Premium Doubles.** Comfort is key for you. You want a quality room that feels like a real vacation. Expect upgraded bedding, better views, and the space to unwind after big days. |
| 4 | `$2,800+` | 2800-plus | **Single Room.** Traveling solo and want your own space? This is for you. Full privacy, your own bathroom, and a room that's all yours. Recharge on your terms. |

**Note on overlapping ranges**: The ranges intentionally overlap ($2,300-$2,399 appears in both options 2 and 3). This is by design — the matching algorithm should handle this gracefully by scoring both budget tiers when a retreat falls in the overlap zone.

### Type Changes

Update `src/types/quiz.ts`:
```typescript
// Change BudgetRange to match new tiers:
export type BudgetRange = 'under-2000' | '2000-2400' | '2300-2800' | '2800-plus';
```

### Component Changes

Update `src/components/quiz/questions/RoomPreferenceQuestion.tsx`:
- Rename file to `BudgetQuestion.tsx`
- Update `QuizContainer.tsx` import accordingly
- Change the question heading to "What's your budget?"
- Remove the subtext about "This helps us match you to the best room option"
- Replace it with something like: "This helps us find retreats that fit your travel style and comfort level."
- Update the option cards to show the price range prominently (as the label) and the room type + description as body text
- The `icon` field should change from emoji to price-relevant icons or just the price range itself

### Visual Design

Each option card should display:
```
┌─────────────────────────────────────────┐
│  💰  <$1,999                            │
│      Dorm or Shared Accommodations      │
│      This is for people who want to     │
│      get on the trip first and          │
│      foremost...                        │
└─────────────────────────────────────────┘
```

- Price range should be the primary label (font-display, text-lg)
- Room type should be the secondary label (font-body, font-bold)
- Description should be body text (font-body, text-sm, reduced opacity)

### Currency Interaction

The budget ranges shown in the quiz should convert based on the global currency selector:
- Use the `PriceDisplay` logic from `01-global-changes.md`
- If EUR is selected, show `<€1,850` instead of `<$1,999` (converted)
- Always show the USD range in small text below if non-USD is selected (TICO requirement)

### Matching Algorithm Update

Update `src/lib/matching.ts` to handle the new budget ranges. The `roomScore` calculation should map:
- `under-2000` → matches retreats with tiers starting at the lowest price
- `2000-2400` → matches triple/standard double tiers
- `2300-2800` → matches premium double tiers
- `2800-plus` → matches single room tiers

Also set the `roomPreference` field based on budget selection for backward compatibility:
```typescript
const budgetToRoom: Record<BudgetRange, RoomPreference> = {
  'under-2000': 'dorm',
  '2000-2400': 'triple',
  '2300-2800': 'premium',
  '2800-plus': 'single',
};
```

---

## 2. Skip Lead Capture for Returning Users

### Current State
The lead capture gate (`LeadCaptureGate.tsx`) is always shown as the final quiz step, requiring name, email, and WhatsApp before showing results.

### Required Changes

If the user has already submitted lead data (either from a previous quiz session or from the flight finder), skip the lead capture step entirely and go straight to results.

**Detection logic**:
```typescript
// In QuizContainer.tsx, check before rendering LeadCaptureGate:
const { hasSubmittedLead, leadData } = useQuizStore();
const flightStore = useFlightStore();

const hasExistingLead = hasSubmittedLead || flightStore.hasSubmittedLead;
```

If `hasExistingLead` is true:
1. Skip the `leadCapture` step in the quiz flow
2. Use the existing `leadData` from whichever store has it
3. Auto-calculate matches and navigate to results
4. Still submit to GHL (as a quiz_completed event) to update their tags

**Implementation approach**:
- In `QuizContainer.tsx`, when advancing to the `leadCapture` step, check if lead data already exists
- If it does, call the same submit logic that `LeadCaptureGate.onSubmit` does (calculate matches, submit to GHL, navigate to results) but without showing the form
- The quiz step counter should show "6 of 6" instead of "7 of 7" for returning users

**Edge case**: If lead data exists in the flight store but NOT the quiz store, copy it over:
```typescript
if (flightStore.leadData && !quizStore.leadData) {
  quizStore.setLeadData(flightStore.leadData);
}
```

---

## 3. WhatsApp Country Code Picker

### Current State
The WhatsApp number field in `LeadCaptureGate.tsx` is a plain `<input type="tel">` with no country code handling.

### Required Changes

Add a country code selector/picker before the phone number input:

1. **Default to +1** (Canada/US) — auto-detected
2. Show a dropdown/selector with the most common country codes
3. The selected country code should prepend to the stored phone number

**Implementation options** (choose one):

**Option A — Simple dropdown** (recommended for MVP):
```tsx
<div className="flex gap-2">
  <select
    value={countryCode}
    onChange={(e) => setCountryCode(e.target.value)}
    className="w-24 px-2 py-3 rounded-xl border-2 border-salty-beige bg-salty-cream font-body text-sm"
  >
    <option value="+1">+1 🇨🇦</option>
    <option value="+1">+1 🇺🇸</option>
    <option value="+44">+44 🇬🇧</option>
    <option value="+61">+61 🇦🇺</option>
    <option value="+353">+353 🇮🇪</option>
    {/* Add top 15-20 countries your guests come from */}
  </select>
  <input type="tel" placeholder="(555) 123-4567" className="flex-1 ..." />
</div>
```

**Option B — Searchable with flag** (better UX, more work):
- Use a library like `react-phone-number-input` (npm package)
- Auto-detects country from browser locale
- Shows flag + code + formatted input
- Would need to install: `npm install react-phone-number-input`

**Recommendation**: Go with Option A for now — it's simpler, no new dependencies, and covers the primary use case. Add a text note below: "Include your country code for WhatsApp."

**Data handling**: When storing the WhatsApp number, concatenate `countryCode + number` and store as a single string. The existing `LeadCaptureData.whatsappNumber` field should contain the full international number (e.g., `+14165551234`).

**Also apply this to**:
- The planner page lead capture form (`src/app/planner/page.tsx` — the form at the bottom)
- Any other place WhatsApp numbers are collected

---

## 4. Remove "Spots Remaining" from Results

### Current State
In `QuizResults.tsx`, the `HeroMatchCard` shows:
```tsx
{retreat.spotsRemaining !== null && retreat.spotsRemaining <= 15 && (
  <p className="font-body text-sm text-salty-burnt-red mt-1 font-semibold">
    {retreat.spotsRemaining} spots remaining
  </p>
)}
```

And `AlsoConsiderCard` shows the same for `<= 10`.

### Required Changes

**Remove both instances entirely.** Delete the `spotsRemaining` display from:
- `HeroMatchCard` component (line ~96-100 in QuizResults.tsx)
- `AlsoConsiderCard` component (line ~247-250 in QuizResults.tsx)

The data field can remain in the retreat type for future use — just don't display it on the quiz results.

---

## 5. Quiz Results Share — Native Share Tray

### Current State
Quiz results page uses `ShareButton` component and `SharePlanButton` component. The `ShareButton` already attempts native share first, which is correct.

### Required Changes

Verify that on the quiz results page:
1. The "Share with Friends" button at the bottom uses `navigator.share()` on mobile
2. The `SharePlanButton` (which creates a shareable plan link) also uses `navigator.share()` after generating the link

In `SharePlanButton.tsx`, after the plan is created and the shareable URL is generated, instead of just showing a "copy link" button, **also offer native share**:
```typescript
if (navigator.share) {
  await navigator.share({
    title: `Join me on ${retreatName}`,
    text: `I'm planning to go on the ${retreatName} retreat! Check out the trip plan and let me know if you're in.`,
    url: shareableUrl,
  });
}
```

---

## 6. "Lock It In" Deposit CTA — Payment Plan Messaging

### Current State
When a retreat is revealed on the quiz results page, there's a `PaymentPlanToggle` component that shows deposit vs full price.

### Required Changes

Wherever the deposit amount is shown (including the "Lock it in for $350 today" style CTA), add supporting text:

```
Lock it in for $350 today
Payment plans are available.
```

- "Payment plans are available." should be in `font-body text-xs text-salty-slate/50` — subtle, supportive, not primary
- This text should appear directly below the deposit/CTA button
- If the `PaymentPlanToggle` component is already visible, this messaging may be redundant — audit to avoid duplication
- The $350 deposit amount should also respect the global currency converter (show in selected currency with USD small print if non-USD)

---

## Files to Create/Modify

### Renamed Files:
- `src/components/quiz/questions/RoomPreferenceQuestion.tsx` → `BudgetQuestion.tsx`

### Modified Files:
- `src/types/quiz.ts` — Update `BudgetRange` type, keep `RoomPreference` for backward compat
- `src/components/quiz/QuizContainer.tsx` — Import BudgetQuestion, skip lead capture for returning users
- `src/components/quiz/LeadCaptureGate.tsx` — Add country code picker to WhatsApp field
- `src/components/quiz/QuizResults.tsx` — Remove spotsRemaining displays, verify share behavior
- `src/components/shared/SharePlanButton.tsx` — Add native share after plan creation
- `src/lib/matching.ts` — Update budget/room scoring for new ranges
- `src/stores/quiz-store.ts` — Update initialAnswers if needed
- `src/app/planner/page.tsx` — Add country code picker to WhatsApp field (until planner store migration)

---

## Testing Checklist

- [ ] Budget question shows correct price ranges and descriptions
- [ ] Budget ranges convert with global currency selector
- [ ] USD small print appears on budget options when non-USD currency is selected
- [ ] Selecting a budget correctly maps to room preference for matching
- [ ] Matching algorithm scores correctly with new budget tiers
- [ ] Returning users (who already submitted lead data) skip directly to results
- [ ] Lead data from flight store is recognized and reused
- [ ] GHL still receives quiz_completed tags even for returning users
- [ ] WhatsApp field has country code picker defaulting to +1
- [ ] Country code is prepended to stored phone number
- [ ] "Spots remaining" does NOT appear on quiz results
- [ ] Share button on quiz results uses native share tray on mobile
- [ ] SharePlanButton uses native share after creating plan link
- [ ] Payment plan messaging appears near deposit CTA
- [ ] Quiz step counter adjusts for returning users (6 of 6 vs 7 of 7)
