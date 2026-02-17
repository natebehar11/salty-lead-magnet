# Build a Trip (Planner) Spec

## Overview
Major overhaul of the trip planner to make it a conversational, AI-powered itinerary builder. Changes include an always-visible chat interface, redesigned milestone progress ring, Claude-powered conversational brainstorming with rich itinerary suggestions, link verification, shareable itineraries, and removal of the multi-city flights button.

**Dependencies**: Requires `01-global-changes.md` (global currency, native share, planner store).

---

## 1. Always-Visible Chat/Prompt Box

### Current State
The prompt box is inside the "Need inspiration?" section — a textarea that only appears after selecting a retreat. It's buried below the timeline visualization and Trip Confidence Score.

### Required Changes

The chat/prompt box should be **always visible** as a persistent element at the bottom of the planner page (similar to a chat interface).

**Design**:
```
┌─────────────────────────────────────────────────┐
│  [Your message here...]              [Send ➤]   │
│                                                  │
│  💡 Try: "I love food and nightlife"             │
│     "Show me beach towns near Sicily"            │
└─────────────────────────────────────────────────┘
```

- Position: sticky/fixed at the bottom of the planner section (not the whole viewport — only within the planner content area)
- Input: single-line text input (not textarea) with a send button
- Placeholder text: "Describe your ideal trip..." or "Ask me anything about your trip..."
- Below the input: subtle suggestion chips that users can tap
- The chat should NOT appear until a retreat is selected (it needs context)
- On send, the input clears and the conversation appears above it

**Conversation display**:
```
┌─ AI Message ──────────────────────────────────┐
│  You're going to Sicily! Do you want to       │
│  explore more of coastal Italy or head         │
│  inland for hill towns and vineyards?          │
└───────────────────────────────────────────────┘

┌─ User Message ────────────────────────────────┐
│  Coastal Italy for sure, I want beaches       │
│  and seafood restaurants                       │
└───────────────────────────────────────────────┘

┌─ AI Message ──────────────────────────────────┐
│  Great taste! Here are my top suggestions...  │
│  [Itinerary cards appear here]                │
└───────────────────────────────────────────────┘
```

- Messages scroll upward as the conversation grows
- AI messages use salty-cream background, user messages use salty-deep-teal/10 background
- The conversation history persists in the planner store (per `01-global-changes.md`)

---

## 2. Milestone Ring — No Percentage, Ring-Based Progress

### Current State
`TripConfidenceScore.tsx` shows a numerical score (0-100), a percentage-derived ring, tier labels ("Exploring", "Planning", etc.), and a milestone checklist.

### Required Changes

**Remove the percentage number** from inside the ring. The ring should only show visual progress (the arc closing).

**Progress logic change**:
- There are currently 10 milestones with weighted scores
- New behavior: completing **any 6 tasks** should visually fill the ring to approximately **90%**
- Only **"Book your spot"** (the final action) should complete the ring to 100%
- This means each of the first 9 completable tasks contributes ~15% to the ring (6 × 15% = 90%)
- Booking contributes the final 10%

**Updated ring center display**:
Instead of showing "85 / 100", show the tier label inside the ring:
```
    ╭──────╮
   │ Almost │
   │ There  │
    ╰──────╯
```

Or a motivational micro-message:
- 0 tasks: "Let's go!"
- 1-2 tasks: "Getting started"
- 3-4 tasks: "Making progress"
- 5-6 tasks: "Almost there"
- 7-9 tasks: "Ready to book!"
- Booked: "You're going! 🎉"

**Keep the milestone checklist** below the ring — it's useful for users to see what steps remain.

**Update milestone list** to reflect new features:
1. Choose a retreat
2. Add a destination before or after
3. Get AI suggestions
4. Explore suggested activities
5. Search flights
6. Select flights to save
7. Save your contact info
8. Share with friends
9. Book your spot (always last, always the one that completes the ring)

---

## 3. "Need Inspiration" → Conversational AI Section

### Current State
The "Need inspiration?" section has:
- A heading and description about suggesting cities
- A textarea for user input
- A "Suggest Cities" button
- Results show 2-3 city cards with highlights

### Required Changes

This section transforms from a one-shot city suggester into a **conversational AI itinerary builder**.

**3a. Rename and Restructure**

- Remove the "Need inspiration?" heading
- The section is now the **conversational area** of the planner (tied to the always-visible chat box from section 1)

**3b. Two Primary Buttons**

Replace the single "Suggest Cities" button with two buttons:

1. **Primary button: "Suggest Plans"**
   - Sends the user's prompt (or a default request) to the Claude API
   - Returns up to 5 destination suggestions with full itinerary details (see section 4)
   - This is the "give me answers" path

2. **Secondary button: "Help me brainstorm"**
   - Instead of returning suggestions, the AI asks the user a question to help refine their preferences
   - This is the "I don't know what I want yet" path
   - Example AI questions (contextual to the selected retreat):
     - "You're going to Sicily — do you want to see more beach towns in Europe around the trip, or do you want some city life?"
     - "How many other places do you want to travel to? How far do you want to fly?"
     - "Are you looking for adventure activities, cultural experiences, or mostly relaxation between retreats?"
     - "What's your budget for the additional travel days? This helps me suggest the right level of accommodation and activities."
   - After the user responds, the AI can ask follow-up questions or provide suggestions
   - This creates a back-and-forth conversation

**3c. API Changes**

Update `src/app/api/planner/suggest/route.ts` to support two modes:

```typescript
// Request body:
interface PlannerRequest {
  destination: string;
  retreatName: string;
  mode: 'suggest' | 'brainstorm'; // NEW
  userPrompt?: string;
  conversationHistory: ConversationMessage[]; // NEW — full conversation context
  existingCities?: string[];
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

**For `suggest` mode**:
- Send the full conversation history as context
- System prompt instructs Claude to return structured JSON with up to 5 cities (see section 4)
- Response format: `SuggestionResponse` (enhanced, see section 4)

**For `brainstorm` mode**:
- Send the conversation history
- System prompt instructs Claude to ask ONE thoughtful, specific question based on the retreat destination and any context from the conversation
- Response format: `{ question: string }` — a single conversational question
- The question should be warm, on-brand (SALTY voice — enthusiastic, casual, adventure-focused), and genuinely useful for planning

**AI Provider configuration**:
- Primary: Claude API (Anthropic) — already integrated, use `claude-haiku-4-5-20251001` for speed
- Fallback: OpenAI API — if Claude fails, fall back to `gpt-4o-mini`
  - Add `OPENAI_API_KEY` to env vars
  - Create a wrapper function that tries Claude first, then OpenAI
  - Same prompt structure for both

---

## 4. Enhanced Itinerary Suggestions

### Current State
Suggestions return 2-3 cities with name, country, days, and 3-4 text highlights.

### Required Changes

**4a. Maximum 5 Cities**

The AI should suggest a **maximum of 5 total cities**. The system prompt should enforce this:
```
Suggest between 2 and 5 cities. Never suggest more than 5.
```

**4b. Rich Activity Details per City**

Each city should have **6-10 suggested activities** across these categories:
- Landmarks and must-see attractions
- Highly rated fitness studios (gyms, CrossFit boxes, yoga studios)
- Restaurants (with cuisine type and price range)
- Specific neighborhoods/areas that match the user's described vibe
- Lesser-known but highly rated attractions
- Outdoor activities (if relevant to the destination)

Updated response structure:
```typescript
interface SuggestedCity {
  name: string;
  country: string;
  days: number;
  description: string; // 2-3 sentence overview of why this city
  activities: SuggestedActivity[];
}

interface SuggestedActivity {
  name: string;
  category: 'landmark' | 'fitness' | 'restaurant' | 'neighborhood' | 'hidden-gem' | 'outdoor';
  description: string; // 1-2 sentences
  url?: string; // Google Maps or TripAdvisor link
  priceRange?: '$' | '$$' | '$$$'; // for restaurants
}
```

**4c. Expandable City Cards**

Suggested cities should display as expandable cards (chevron to open/close):

```
┌────────────────────────────────────────────┐
│  ▸ Catania, Italy              3 days  ☐   │
│    "Baroque architecture meets street..."  │
└────────────────────────────────────────────┘

When expanded:
┌────────────────────────────────────────────┐
│  ▾ Catania, Italy              3 days  ☐   │
│    "Baroque architecture meets street..."  │
│                                            │
│  🏛 Via Etnea                              │
│     Main shopping boulevard with...        │
│     [View on Maps →]                       │
│                                            │
│  🏋 CrossFit Catania                       │
│     Top-rated box near the city center...  │
│     [View on Maps →]                       │
│                                            │
│  🍽 Trattoria do Fiore  · $$              │
│     Traditional Sicilian seafood...        │
│     [View on Maps →]                       │
│                                            │
│  💎 La Pescheria Fish Market               │
│     Historic outdoor market, lesser...     │
│     [View on Maps →]                       │
│                                            │
│  ... more activities                       │
└────────────────────────────────────────────┘
```

**4d. Checkbox for Share Selection**

Each city card should have a checkbox (top-right, next to the days badge):
- When checked, that city and its activities will be included in the share message
- Default: all cities checked
- This checkbox state is tracked in the planner store

**4e. Remove "Check Multi-City Flights" Button**

Remove the "Check Multi-City Flights" button and its functionality from the suggestions results section. The existing "Find Flights" button in the timeline area is sufficient.

**4f. Add Share Functionality**

Below the suggestion results, add a "Share This Itinerary" section:
- Uses native share tray (via ShareButton component)
- Share message includes all checked cities with their activity highlights
- Format: "My trip plan: 3 days in Catania (Landmarks: Via Etnea, La Pescheria...) → 2 days in Taormina (...)  → SALTY Sicily retreat"
- Also offer "Send to myself" via email (GHL if available, mailto: fallback)

---

## 5. Link Verification System (On-Demand + Cache)

### Problem
AI-generated activity links (Google Maps, TripAdvisor) may break over time or be invalid from the start.

### Solution — On-Demand Verification with Cache

**5a. Link Checker API Route** (`src/app/api/links/verify/route.ts`)

```typescript
// POST: Check a batch of URLs
// Request: { urls: string[] }
// Response: { results: Record<string, { valid: boolean; checkedAt: string }> }

// Implementation:
// 1. For each URL, send a HEAD request with a 5-second timeout
// 2. Consider valid if status is 200-399
// 3. Cache results in Vercel KV (or in-memory Map for dev) with 48-hour TTL
// 4. If URL is in cache and not expired, return cached result
// 5. Rate limit: max 20 URLs per request
```

**5b. Client-Side Integration**

When itinerary suggestions are displayed:
1. Collect all activity URLs from the suggestion
2. Call `/api/links/verify` with the batch
3. While checking: show a subtle loading indicator on each link
4. After check:
   - Valid links: show normally with the link
   - Invalid/broken links: hide the link icon and show the activity text without a hyperlink
   - Add a small "Link verified ✓" or "Link unavailable" indicator

**5c. Fallback URL Generation**

If an AI-generated URL is broken, generate a fallback Google Search URL:
```typescript
const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(activityName + ' ' + cityName)}`;
```

This ensures users can always find the place even if the specific link broke.

---

## 6. Planner State Persistence

### Current State
All planner state is in React `useState` — lost on navigation.

### Required Changes
Per `01-global-changes.md`, migrate all planner state to a Zustand store (`src/stores/planner-store.ts`). The store should persist:

- `selectedRetreatSlug`
- `beforeCities` and `afterCities`
- `prompt` (last entered text)
- `suggestion` (last AI suggestion results)
- `conversationHistory` (full AI conversation)
- `checkedCityIds` (which suggested cities are checked for sharing)
- `formSubmitted`

Do NOT persist:
- `isGenerating` (transient)
- `showForm` (UI state)

---

## Files to Create/Modify

### New Files:
- `src/stores/planner-store.ts` — Planner state with Zustand persistence
- `src/app/api/links/verify/route.ts` — Link verification endpoint
- `src/components/planner/PlannerChat.tsx` — Conversational chat UI (input + message history)
- `src/components/planner/SuggestedCityCard.tsx` — Expandable city card with activities
- `src/components/planner/SuggestedActivityItem.tsx` — Individual activity with link and verification status

### Modified Files:
- `src/app/planner/page.tsx` — Major restructure: use planner store, add chat, restructure AI section
- `src/app/api/planner/suggest/route.ts` — Add brainstorm mode, conversation history, enhanced response format, OpenAI fallback
- `src/components/planner/TripConfidenceScore.tsx` — Remove percentage, ring-only progress, new milestone list
- `src/types/planner.ts` (new) — Types for conversation, suggested cities, activities

### Removed Functionality:
- "Check Multi-City Flights" button
- Numerical score display in confidence ring
- "Need inspiration?" as a standalone section (replaced by conversational chat)

---

## API Prompt Guidelines

### System Prompt for "Suggest Plans" Mode
```
You are a travel planning assistant for SALTY Retreats, a Canadian fitness and adventure retreat company. You help travelers plan multi-city itineraries before and after their retreats.

Your suggestions should be:
- Logistically practical (easy connections from the retreat destination)
- Specific and actionable (real place names, not generic categories)
- Enthusiastic and on-brand (adventurous, fitness-minded, culturally curious)
- Varied (mix of activities, food, fitness, culture, hidden gems)

RESPONSE FORMAT: Return valid JSON matching this structure:
{
  "cities": [
    {
      "name": "City Name",
      "country": "Country",
      "days": 3,
      "description": "2-3 sentence overview of why this city rocks for the traveler.",
      "activities": [
        {
          "name": "Place Name",
          "category": "landmark|fitness|restaurant|neighborhood|hidden-gem|outdoor",
          "description": "1-2 sentence description with specific details.",
          "url": "https://maps.google.com/... or https://tripadvisor.com/...",
          "priceRange": "$|$$|$$$"  // for restaurants only
        }
      ]
    }
  ],
  "totalDays": 10,
  "reasoning": "2-3 sentences explaining the overall plan."
}

RULES:
- Suggest 2-5 cities maximum
- 6-10 activities per city
- Include at least 1 fitness studio per city
- Include at least 2 restaurants per city
- Include at least 1 hidden gem per city
- Use real, verified business names and locations
- Generate Google Maps search URLs for each activity
- Keep totalDays between 3 and 14
```

### System Prompt for "Brainstorm" Mode
```
You are a friendly travel planning assistant for SALTY Retreats. The traveler is planning a trip around their retreat and isn't sure what they want yet. Your job is to ask ONE thoughtful question that helps them figure out their ideal itinerary.

Be warm, casual, and enthusiastic. Reference the specific retreat destination. Make the question easy to answer (give 2-3 options when possible).

RESPONSE FORMAT: Return valid JSON:
{ "question": "Your question here?" }

Examples of good questions:
- "You're going to Sicily! Are you more of a 'lazy beach days with a good book' person or a 'let's rent a scooter and find hidden coves' person?"
- "How many extra days do you want to add to your trip — thinking a quick 3-day extension or a full 2-week adventure?"
- "Do you want to stay close to [destination] and really soak it in, or use this as a chance to see another country nearby?"
```

---

## Testing Checklist

- [ ] Chat box is always visible at the bottom of the planner section (after retreat selection)
- [ ] "Suggest Plans" button triggers AI suggestion with full itinerary response
- [ ] "Help me brainstorm" button triggers a conversational question from the AI
- [ ] Conversation history persists when navigating away and back
- [ ] AI responses are contextual to the selected retreat and conversation history
- [ ] Suggested cities show as expandable cards with chevron
- [ ] Each city has 6-10 activities with correct categorization
- [ ] Activity links are verified via the link checker API
- [ ] Broken links fall back to Google Search URLs
- [ ] City checkboxes control what's included in share messages
- [ ] "Check Multi-City Flights" button is removed
- [ ] Share itinerary uses native share tray on mobile
- [ ] Milestone ring shows visual progress without percentage number
- [ ] Completing 6 tasks fills ring to ~90%
- [ ] Only "Book your spot" completes the ring to 100%
- [ ] OpenAI fallback works when Claude API is unavailable
- [ ] All planner state persists in Zustand across navigation
- [ ] Planner store persists to localStorage
