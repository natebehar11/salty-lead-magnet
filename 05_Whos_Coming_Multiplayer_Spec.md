# Feature Spec: "Who's Coming?" Multiplayer Share Layer
**Improvement #5 from Strategic Plan**
**Date:** February 9, 2026

---

## The Problem

Every share flow is currently one-directional. User sends a trip plan or flight info to a friend. The friend receives a static snapshot — they can look at it, but they can't interact with it, add their own flights, or signal "I'm in."

This matters because 32% of SALTY guests come with at least one other person. And many solo travelers were convinced by a friend who went before. Right now, the app has no mechanism for the social commitment that turns "I'll think about it" into "we're doing this."

"I'll think about it" stays private and dies quietly. "Sarah is also looking at flights for Panama" creates accountability. It's much harder to abandon a trip when someone else is invested in it.

---

## The Fix

When a user shares a trip plan or flight search to a friend, the friend gets a **live link** to the plan — not a static snapshot. The friend can view the plan, search their own flights (from their own origin airport), and add their name. The original sharer gets notified via email when someone engages with their plan.

The plan grows from "my trip" to "our trip" as friends join.

---

## Persistence: Vercel KV

### Why Vercel KV

Shared plans need a backend. The friend opens a link days later and needs to see the plan. localStorage can't do this. The options:

- **URL-encoded state:** URLs become 4-8KB, break in WhatsApp/email, can't support write-back. Ruled out.
- **Vercel KV (Redis):** Native to Vercel, sub-ms reads, built-in TTL, JSON blob storage. Perfect for this use case.
- **Vercel Postgres:** Overkill. No relational queries needed. A JSON blob per plan is the right abstraction.

Vercel KV free tier: 3,000 daily commands. Pro tier: 30,000 daily commands (~$1/mo). At 50-100 shared plans per week, this is well within free tier.

### Data Model

```typescript
// src/types/shared-plan.ts

interface SharedPlan {
  id: string;                    // 8-char nanoid (e.g., "abc12def")
  type: 'planner' | 'flights';  // which tool created this share
  createdAt: string;             // ISO date
  lastActivityAt: string;        // ISO date, updated on any engagement
  
  // Creator info
  creator: {
    name: string;                // from lead data
    email: string;               // from lead data
    originAirport: string;       // IATA code
  };

  // The plan snapshot (what the creator built)
  plan: SharedPlanData | SharedFlightData;

  // Friends who've engaged
  participants: SharedParticipant[];
}

// For planner shares
interface SharedPlanData {
  retreatSlug: string;
  retreatName: string;
  retreatDates: string;          // "Mar 14-22, 2026"
  retreatDays: number;
  itinerary: SharedCity[];       // simplified city data
  selectedFlights: SharedFlight[];
  totalFlightEstimate: number | null;
  tripCostEstimate: number | null;
}

interface SharedCity {
  city: string;
  country: string;
  countryCode: string;
  days: number;
  position: 'before' | 'after';
  highlights: { name: string; type: string }[];  // simplified, no descriptions
}

// For flight shares
interface SharedFlightData {
  retreatSlug: string;
  retreatName: string;
  retreatDates: string;
  originAirport: string;
  selectedFlights: SharedFlight[];
  totalFlightEstimate: number | null;
}

interface SharedFlight {
  legLabel: string;     // "YYZ → PTY"
  airline: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  googleFlightsUrl: string;
}

// A friend who engaged with the plan
interface SharedParticipant {
  name: string;
  email: string;
  originAirport: string | null;   // null if they haven't searched flights yet
  joinedAt: string;               // ISO date
  flightSearches: ParticipantFlightSearch[];
  status: 'viewing' | 'interested' | 'searching';
}

interface ParticipantFlightSearch {
  legLabel: string;
  cheapestPrice: number;
  currency: string;
  searchedAt: string;
}
```

### Storage Pattern

```typescript
// Write (on share)
await kv.set(`plan:${planId}`, JSON.stringify(sharedPlan), { ex: 90 * 86400 });

// Read (on friend open)
const plan = JSON.parse(await kv.get(`plan:${planId}`));

// Update (on friend engagement)
plan.participants.push(newParticipant);
plan.lastActivityAt = new Date().toISOString();
await kv.set(`plan:${planId}`, JSON.stringify(plan), { ex: 90 * 86400 });
```

90-day TTL covers the full booking consideration window and auto-cleans expired plans.

---

## Shared Plan URLs

```
Planner: explore.getsaltyretreats.com/planner?plan=abc12def
Flights: explore.getsaltyretreats.com/flights?plan=abc12def
```

Short, clean, no encoded blobs. The `plan` query param triggers shared mode on either page.

---

## Flow 1: Creator Shares a Plan

### What Changes in Existing Share Flows

Currently, "Email to friend" sends a static email via GHL. The new flow adds one step: before sending the email, create a shared plan in Vercel KV and include the live link in the email.

**Updated share sequence:**

1. User taps "Send My Trip Plan" → share tray opens
2. User selects "Email to friend"
3. User enters friend's name and email
4. **NEW:** API creates shared plan in Vercel KV, returns `planId`
5. GHL email is sent to friend with the **live plan link** (not just a static snapshot)
6. GHL creates friend as contact with existing referral tags
7. **NEW:** GHL tags original sender with `shared_plan_active`
8. **NEW:** GHL custom field `shared_plan_id` = planId on sender's contact

The email to the friend now has a prominent CTA:

```
Subject: [Name] is planning a trip to Panama and wants you to come

---

Hey [Friend name],

[Creator name] built a trip plan for SALTY Panama (Mar 14-22) 
and thinks you should come along.

[View the trip plan and add your flights →]
explore.getsaltyretreats.com/planner?plan=abc12def

---

[Rest of email: itinerary snapshot, city highlights, flight info]
```

The static content is still there (so the email is useful even without clicking), but the live link is the primary CTA.

### WhatsApp Shares

WhatsApp "to friend" messages already include a link to the app. Replace the generic `explore.getsaltyretreats.com/planner` link with the shared plan link:

```
[Creator name]'s SALTY Trip Plan

🇵🇦 Lisbon, Portugal (3 days)
🏄 SALTY Panama — City to Sea (8 days)
🇨🇴 Bogota, Colombia (4 days)

Flights: ~$1,223 total

Check it out and add your flights:
explore.getsaltyretreats.com/planner?plan=abc12def
```

The plan is created in KV before the WhatsApp message is generated, so the link is ready.

### "Share to self" — No KV Needed

WhatsApp to self and email to self do NOT create a shared plan. These are personal saves, not multiplayer. The existing flow stays exactly the same for self-shares.

---

## Flow 2: Friend Opens a Shared Plan

### Planner Shared View

When `/planner?plan=abc12def` loads:

1. API route fetches plan from Vercel KV
2. If plan not found (expired or invalid): show fallback page with "This plan has expired. Take the quiz to find your perfect retreat →"
3. If plan found: render shared planner view

**Shared planner view layout:**

```
┌──────────────────────────────────────────────────────┐
│  🏄 [Creator name]'s trip plan for Panama            │
│                                                      │
│  [Creator name] is planning this trip and thinks     │
│  you should come. Check it out and add your flights. │
│                                                      │
│  [I'm interested — let me search flights]            │
│  [Just browsing]                                     │
└──────────────────────────────────────────────────────┘

[Full itinerary visualization — read only]
  Cities, retreat, highlights, creator's selected flights

[Creator's flight info — read only]
  Their origin, selected flights, prices

[Who's in]
  👤 [Creator name] — flights found from YYZ
  (empty state if no other participants yet)
```

The plan is **read-only**. The friend cannot edit the itinerary, cities, or creator's flight selections. They can only:

1. View everything
2. Signal interest (which captures their info and notifies the creator)
3. Search their own flights

This keeps the architecture simple. No real-time collaboration, no conflict resolution, no merge logic.

### "I'm interested" Flow

When friend taps "I'm interested — let me search flights":

**Step 1: Lightweight lead capture**

```
┌──────────────────────────────────────┐
│  Join [Creator name]'s trip          │
│                                      │
│  [Your first name]                   │
│  [Your email]                        │
│  [Your city / nearest airport]       │
│                                      │
│  [Search my flights →]               │
└──────────────────────────────────────┘
```

Three fields. Name, email, airport. No WhatsApp number required (lower friction than full lead capture). Airport uses the same autocomplete as the flight finder.

**Step 2: Add participant to shared plan**

API writes participant to the plan's `participants` array in KV:

```typescript
{
  name: "Sarah",
  email: "sarah@example.com",
  originAirport: "YOW",
  joinedAt: "2026-02-15T14:30:00Z",
  flightSearches: [],
  status: "interested"
}
```

**Step 3: Create GHL contact**

Same as existing referral flow, with additional tags:
- `referral`
- `referred_by_[creator_name]`
- `interested_[retreat_slug]`
- `shared_plan_participant` (new)
- `plan_id_[planId]` (new)

Custom fields:
- `shared_plan_id`: planId
- `referred_by_email`: creator's email
- `origin_airport`: their airport code

**Step 4: Notify creator**

Fire GHL email to creator:

```
Subject: Sarah just checked out your Panama trip plan

Hey [Creator name],

Sarah from Ottawa just looked at your trip plan for SALTY Panama 
and searched flights from YOW.

Looks like your crew might be growing. 👀

See your plan: explore.getsaltyretreats.com/planner?plan=abc12def
```

Also update creator's GHL contact:
- Add tag `group_booking_potential` (if 1+ participants have joined)
- Update custom field `shared_plan_participants` = count

### Friend's Flight Search

After completing the interest form, the friend gets a flight search section below the read-only plan. It works exactly like the regular flight finder but:

- Pre-filled with their origin airport
- Destination is the retreat airport
- Dates are the retreat dates
- Only outbound + return (no multi-city — they haven't built their own itinerary)

When flights load, the cheapest result is saved to the participant's record in KV:

```typescript
participant.flightSearches.push({
  legLabel: "YOW → PTY",
  cheapestPrice: 487,
  currency: "CAD",
  searchedAt: "2026-02-15T14:35:00Z"
});
participant.status = "searching";
```

The friend can also select specific flights, which are stored locally (their localStorage) but NOT written back to the shared plan. The shared plan only tracks that they searched and the cheapest option found. This keeps KV writes minimal.

### "Just browsing"

If the friend taps "Just browsing," they see the full read-only plan without the lead capture or flight search. They can change their mind and tap "I'm interested" at any time (button stays visible in the header).

No GHL contact created for "just browsing." No KV update. The friend is anonymous.

---

## Flow 3: Flight Finder Shared View

When `/flights?plan=abc12def` loads:

Same pattern but simpler. The shared flight data shows:

```
┌──────────────────────────────────────────────────────┐
│  🏄 [Creator name] found flights for Panama          │
│                                                      │
│  They found flights from YYZ starting at $412.       │
│  Search from your airport to compare.                │
│                                                      │
│  [Search my flights from ___]                        │
│  [Just browsing]                                     │
└──────────────────────────────────────────────────────┘

[Creator's flights — read only]
  Outbound: TAP, YYZ → PTY, $412, 7h direct
  Return: Copa, PTY → YYZ, $389, 8h 1 stop

[Who's in]
  👤 [Creator name] — $412 from YYZ
```

"Search my flights" triggers the same lightweight lead capture (name, email, airport), then loads the regular flight finder pre-filled for that retreat. Their cheapest result gets added to the plan's participants.

---

## "Who's In" Component

**File:** `src/components/shared/WhosIn.tsx`

Renders on both shared planner and shared flight views. Shows everyone engaged with this plan.

### Layout

```
┌──────────────────────────────────────┐
│  Who's in                            │
│                                      │
│  👤 Nate — flights from YYZ ✓        │
│  👤 Sarah — flights from YOW ✓       │
│  👤 Mike — interested                │
│                                      │
│  Know someone else who'd be in?      │
│  [Share this plan →]                 │
└──────────────────────────────────────┘
```

**States per participant:**
- **Creator:** Always first. Shows origin airport + "✓" if flights selected.
- **Searching:** Shows origin airport + "✓" if they've searched flights.
- **Interested:** Shows "interested" if they signed up but haven't searched yet.

**Empty state (no participants beyond creator):**
```
│  👤 Nate — flights from YYZ ✓        │
│                                      │
│  You could be next.                  │
│  [I'm interested →]                  │
```

**"Share this plan" CTA:** The friend can ALSO share the plan further. Same link, same plan ID. Creates a viral chain. If Mike shares to Lisa, Lisa opens the same `plan=abc12def` link and sees Nate, Sarah, and Mike already in. Social proof compounds.

When the friend shares further, the plan's participant list grows. Each new person who joins sends a notification to the **original creator only** (not to every participant — that would get noisy).

---

## API Routes

### POST `/api/plans/create`

Creates a shared plan in Vercel KV.

**Request:**
```typescript
{
  type: 'planner' | 'flights',
  creator: { name: string, email: string, originAirport: string },
  plan: SharedPlanData | SharedFlightData
}
```

**Response:**
```typescript
{
  planId: "abc12def",
  shareUrl: "https://explore.getsaltyretreats.com/planner?plan=abc12def"
}
```

**Logic:**
1. Generate 8-char nanoid
2. Build `SharedPlan` object
3. Write to KV with 90-day TTL
4. Return planId and URL

### GET `/api/plans/[planId]`

Fetches a shared plan.

**Response:** Full `SharedPlan` object, or 404 if expired/not found.

### POST `/api/plans/[planId]/join`

Adds a participant to a shared plan.

**Request:**
```typescript
{
  name: string,
  email: string,
  originAirport: string | null
}
```

**Logic:**
1. Fetch plan from KV
2. Check if email already in participants (prevent duplicates)
3. Add participant to array
4. Update `lastActivityAt`
5. Write back to KV (same TTL)
6. Create GHL contact with referral tags
7. Send notification email to creator via GHL
8. If participants.length >= 1 (first friend), tag creator `group_booking_potential`

### POST `/api/plans/[planId]/flights`

Updates a participant's flight search results.

**Request:**
```typescript
{
  email: string,          // identifies which participant
  legLabel: string,       // "YOW → PTY"
  cheapestPrice: number,
  currency: string
}
```

**Logic:**
1. Fetch plan from KV
2. Find participant by email
3. Add flight search to their record
4. Update status to `searching`
5. Write back to KV

---

## Creator's View: Return Visits

When the original creator returns to their own plan link (`/planner?plan=abc12def`), they see their full editable planner (loaded from their localStorage) PLUS the "Who's In" component showing participant activity.

**Detection:** Compare creator email from KV plan with email in local lead data. If they match, this is the creator returning. Show editable planner with the social overlay, not the read-only shared view.

```typescript
const isCreator = sharedPlan.creator.email === quizStore.leadData?.email;
```

If creator has cleared localStorage (or is on a new device), they see the shared read-only view like any other visitor. They can re-identify by entering their email in the "I'm interested" form, which would match the creator email and redirect to the quiz/planner flow.

---

## Notification Emails (via GHL)

### Friend Joined Notification (to creator)

**Trigger:** POST `/api/plans/[planId]/join` succeeds

**Template:**

```
Subject: [Friend name] just checked out your [Retreat name] trip plan

Hey [Creator name],

[Friend name] from [City] just looked at your trip plan for 
SALTY [Retreat name] and is interested in coming along.

[If friend searched flights:]
They found flights from [Airport] starting at $[price].

Your crew so far:
👤 You — flights from [Airport]
👤 [Friend 1] — [status]
👤 [Friend 2] — [status]

See your plan: [plan URL]

Questions about group bookings? Reply to this email or 
message us on WhatsApp.
```

### Multiple Friends — Throttle Notifications

If multiple friends join in quick succession (e.g., a shared link goes viral in a group chat), batch notifications:

- First friend: immediate notification
- Subsequent friends within 1 hour: hold and batch into one email
- Batch email: "[3 people] just checked out your Panama trip plan"

Implementation: on join, check if a notification was sent in the last hour (store `lastNotifiedAt` on the plan). If yes, set a flag. A scheduled check (or the next join after 1 hour) sends the batched update.

For MVP, immediate notification for every join is fine. Batching is a polish item.

---

## GHL Integration

### Tags — Creator

| Trigger | Tag | Notes |
|---|---|---|
| Creates a shared plan | `shared_plan_active` | Has an active shared link |
| First friend joins | `group_booking_potential` | High-value signal for sales |
| 3+ friends join | `group_booking_hot` | Very high intent — personal outreach |

### Tags — Friend (Participant)

| Trigger | Tag | Notes |
|---|---|---|
| Opens shared plan and submits interest | `referral`, `referred_by_[creator_name]`, `interested_[retreat_slug]`, `shared_plan_participant` | |
| Searches flights from shared plan | `flight_searcher`, `origin_[airport]` | Same tags as organic flight search |
| Clicks "Book Your Spot" from shared view | `shared_plan_book_clicked` | Conversion signal |

### Custom Fields — Creator

| Field | Value |
|---|---|
| `shared_plan_id` | Plan ID |
| `shared_plan_participants` | Count of participants |
| `shared_plan_retreat` | Retreat slug |

### Custom Fields — Friend

| Field | Value |
|---|---|
| `shared_plan_id` | Plan ID |
| `referred_by_email` | Creator's email |
| `origin_airport` | Their IATA code |

### The `group_booking_potential` Signal

This is one of the most valuable signals the app produces. When a creator shares a plan and a friend actually engages (not just views — fills in their info), that's a group booking in motion. Sabhi should set up a GHL workflow:

1. `group_booking_potential` tag fires
2. Wait 2 hours (let the social momentum build)
3. Send personal WhatsApp from Erin or Nate: "Hey [Name], looks like you and [Friend] might be planning something for Panama. Want us to hold rooms next to each other? We can also set up a payment plan that works for both of you."

This is warm outreach backed by real behavioral data. It should convert significantly higher than cold nurture sequences.

---

## Edge Cases

### Plan expired (90 days)
Show: "This trip plan has expired. Plans stay active for 90 days. Want to start fresh? Take the quiz to find your perfect retreat →"

### Creator shares to multiple friends (separate emails)
Each friend email creates a new participant on the SAME plan. The "Who's In" list grows. All friends see each other. Social proof compounds.

### Friend shares the link further
Works perfectly. The link is the same. Third-degree friend opens it, sees the full participant list, can join. Notification goes to the original creator only.

### Friend is already a GHL contact
The `/api/plans/[planId]/join` route should check if the email exists in GHL before creating a new contact. If they exist, add the new tags to the existing contact. Don't create a duplicate.

### Same friend opens link multiple times
Deduplicate by email. If the participant already exists in the plan's participants array, don't add them again. Show the plan as if they're already "in" (skip lead capture, show their previous status).

### Creator has no lead data
This shouldn't happen — share flows require lead capture first. But defensively: if `quizStore.leadData` is null when creating a shared plan, require lead capture before the share completes (this is already the existing behavior).

### Very large participant lists
Unlikely but possible if someone posts the link publicly. Cap participants array at 20. After 20, the "I'm interested" flow still creates a GHL contact and sends notification, but the participant isn't added to the KV plan. The "Who's In" component shows "20+ people are interested" instead of individual names.

### Privacy
Participants only see first names of other participants, not emails or full details. The creator sees first names + cities (from airport). Emails are stored in KV for deduplication and GHL integration but never rendered in the UI.

---

## Implementation Notes for Claude Code

### New Dependencies
- `@vercel/kv` — Vercel KV client library
- `nanoid` — Short ID generation (already likely in the project, if not, it's tiny)

### Environment Variables
```
KV_REST_API_URL=     # From Vercel KV dashboard
KV_REST_API_TOKEN=   # From Vercel KV dashboard
```

### New Files

1. **`src/types/shared-plan.ts`** (~80 lines) — All type definitions
2. **`src/app/api/plans/create/route.ts`** (~60 lines) — Create shared plan
3. **`src/app/api/plans/[planId]/route.ts`** (~30 lines) — Fetch shared plan
4. **`src/app/api/plans/[planId]/join/route.ts`** (~80 lines) — Add participant + GHL + notify
5. **`src/app/api/plans/[planId]/flights/route.ts`** (~50 lines) — Update participant flights
6. **`src/components/shared/WhosIn.tsx`** (~120 lines) — Participant list component
7. **`src/components/shared/SharedPlanBanner.tsx`** (~80 lines) — Top banner on shared views
8. **`src/components/shared/JoinPlanForm.tsx`** (~100 lines) — Lightweight lead capture for friends
9. **`src/hooks/useSharedPlan.ts`** (~50 lines) — Hook to fetch and manage shared plan state

### Modified Files

1. **`src/app/planner/page.tsx`** — Detect `?plan=` param, fetch shared plan, render shared vs editable view
2. **`src/app/flights/page.tsx`** — Detect `?plan=` param, fetch shared flight plan, render shared view
3. **Share flow components (planner + flights)** — On "email to friend," call `/api/plans/create` first, include plan URL in email
4. **WhatsApp share templates** — Replace generic app link with plan-specific link when sharing to friend

### Build Order

1. Set up Vercel KV (dashboard config + env vars)
2. Type definitions (`shared-plan.ts`)
3. API routes (create, fetch, join, flights)
4. `useSharedPlan` hook
5. `SharedPlanBanner` component
6. `JoinPlanForm` component  
7. `WhosIn` component
8. Integrate into planner page (shared view mode)
9. Integrate into flights page (shared view mode)
10. Update share flows to create plans before sending
11. Update WhatsApp templates
12. GHL notification email templates
13. GHL workflow for `group_booking_potential`

### Testing Checklist

- [ ] Creating a shared plan returns a valid planId and URL
- [ ] Shared plan URL loads the read-only view correctly
- [ ] Expired plans (90+ days) show fallback page
- [ ] Invalid planIds show fallback page
- [ ] "I'm interested" creates participant in KV and GHL contact
- [ ] Duplicate email doesn't create duplicate participant
- [ ] Creator notification email fires on first friend join
- [ ] `group_booking_potential` tag fires on creator's GHL contact
- [ ] Friend can search flights from shared view
- [ ] Friend's cheapest flight saves to participant record
- [ ] "Who's In" component renders all participants with correct status
- [ ] Creator returning to their own plan link sees editable view + Who's In
- [ ] Friend can re-share the link (viral chain works)
- [ ] Participant cap at 20 works gracefully
- [ ] Only first names shown in UI (no emails exposed)
- [ ] WhatsApp share to friend includes plan-specific URL
- [ ] Email to friend includes live plan link as primary CTA
- [ ] Self-shares do NOT create shared plans
- [ ] `group_booking_hot` fires at 3+ participants
- [ ] Plan TTL is 90 days
