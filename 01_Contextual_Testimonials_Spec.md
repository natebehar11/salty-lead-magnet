# Improvement #1: Contextual Testimonials on Quiz Results

## Overview

Dynamically display 1-2 testimonials per retreat card on the results page, matched to the user's quiz answers. A solo traveler who selected "culture & food" vibes sees a testimonial from a solo traveler talking about the food. A group of friends who selected "party & nightlife" sees one about the crew energy and nightlife.

---

## How It Works

### Matching Algorithm

When the results page renders, for each retreat card:

1. Get the user's quiz answers: `vibes[]`, `groupStyle`, `mustHaves[]`, `partyVsRest`
2. Filter testimonials to that retreat (by `retreatSlug`)
3. Score each testimonial by relevance:
   - **Vibe match** (highest weight): Does the testimonial's `vibeMatch` array overlap with the user's `vibes[]`? +3 points per overlap.
   - **Guest type match**: Does the testimonial's `guestType` match the user's `groupStyle`? Solo→solo, couple→couple, friends→friends. +2 points if match.
   - **Objection match**: First-time travelers → prioritize testimonials tagged `solo_travel` or `fitness_level`. Budget-conscious users → prioritize `worth_money`. +2 points if match.
   - **Priority score**: Add the testimonial's priority rating (1-5) as a tiebreaker.
4. Select the top 1-2 testimonials by score.
5. If fewer than 2 testimonials exist for that retreat, show what's available.
6. If zero testimonials exist for that retreat, show nothing (no empty state, just skip the section).

### Fallback Logic

If no testimonial matches the user's specific profile well (score < 3):
- Show the highest-priority testimonial for that retreat regardless of match.
- This ensures every retreat with testimonials shows at least one.

---

## Data Schema

### File: `src/data/testimonials.ts`

```typescript
export interface Testimonial {
  id: number;
  guestName: string;           // "Sarah M."
  retreatSlug: string;         // "costa-rica-v3"
  guestType: 'solo' | 'couple' | 'friends' | 'group' | 'returner';
  format: 'written' | 'video' | 'audio';
  pullQuote: string;           // 1-2 sentence excerpt (the display text)
  themeTags: string[];         // ["solo", "community", "fitness"]
  vibeMatch: string[];         // ["adventure", "social", "fitness"]
  objectionAddressed: string | null; // "solo_travel" | "fitness_level" | etc.
  quizMatchKeys: string[];     // Exact quiz answer values for precise matching
  priority: number;            // 1-5 (5 = strongest)
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    guestName: "Sarah M.",
    retreatSlug: "costa-rica-v3",
    guestType: "solo",
    format: "written",
    pullQuote: "I showed up knowing nobody. By day two I had a crew I'm still texting every week.",
    themeTags: ["solo", "community"],
    vibeMatch: ["social", "adventure"],
    objectionAddressed: "solo_travel",
    quizMatchKeys: ["solo", "meeting-new-people"],
    priority: 5,
  },
  // ... more testimonials
];
```

### Retreat Slug Mapping

| Retreat | Slug |
|---------|------|
| Costa Rica v1 | `costa-rica-v1` |
| Costa Rica v2 | `costa-rica-v2` |
| Costa Rica v3 | `costa-rica-v3` |
| Costa Rica v4 | `costa-rica-v4` |
| Sri Lanka | `sri-lanka` |
| Panama | `panama` |
| Morocco | `morocco` |
| Morocco v2 | `morocco-v2` |
| Sicily | `sicily` |
| Sicily v2 | `sicily-v2` |
| El Salvador | `el-salvador` |
| Nicaragua | `nicaragua` |

**Cross-retreat display:** If a retreat has no testimonials of its own (e.g., El Salvador hasn't happened yet), show testimonials from the same region or similar SALTY Meter profile. El Salvador could pull from Nicaragua or Costa Rica testimonials tagged with similar vibes.

---

## UI Component

### Component: `TestimonialCard`

**Location:** Within each retreat result card, below the "Why this matches" reasons and above the CTAs.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ★★★★★                                          │
│  "I showed up knowing nobody. By day two I had  │
│   a crew I'm still texting every week."         │
│                                                  │
│  — Sarah M. · Solo traveler · Costa Rica        │
│  ─────────────────────────────────────          │
│  Matched because you're traveling solo           │
└─────────────────────────────────────────────────┘
```

**Design details:**
- Subtle background (cream or light sand, not white — differentiate from the card body)
- Left border accent in SALTY brand coral/orange
- Pull quote in slightly larger font, not italic (italic reads as fake)
- Guest name + guest type + retreat in smaller muted text
- "Matched because you're [reason]" in smallest text, links the testimonial to the user's quiz answer
- No quotation marks (cleaner). The formatting makes it obvious it's a quote.
- If 2 testimonials show, stack vertically with a thin divider.

**Match reason copy logic:**
- If matched on `solo_travel` objection: "Matched because you're traveling solo"
- If matched on `vibeMatch` overlap with "adventure": "Matched because you're chasing adventure"
- If matched on `vibeMatch` overlap with "culture": "Matched because you love culture and food"
- If matched on `guestType` = "returner": "From a guest who came back for more"
- If matched on `fitness_level` objection: "For guests at every fitness level"
- Fallback (no specific match): "What guests say about this retreat"

### Stars

Show 5 filled stars above the quote. Every testimonial gets 5 stars (you're curating these, they're all positive). This is a trust signal, not a rating system.

---

## Results Page Integration

### Where it appears:
Each retreat card on `/quiz/results` gets the testimonial section.

### Card structure (updated):
```
[Match Score Ring]
[Retreat Name + Destination + Dates + Price]
[Why This Matches — 2-4 reason strings]
[SALTY Meter bars]
[Testimonial Card — 1-2 quotes] ← NEW
[CTAs: Check Flights | View Trip | Plan This Trip]
```

### Performance:
- Testimonial matching runs client-side (data file is small, <50 entries)
- No API calls needed
- Matching function runs once when results render, results cached in component state

---

## Workflow: From Intake to App Data

### Step 1: Nate fills the intake spreadsheet
- Columns A-F in the "Testimonial Intake" sheet
- Aim for 3-5 per retreat minimum, 8-10 ideal
- Prioritize testimonials that are specific and emotional (not "had a great time")

### Step 2: Bring the filled spreadsheet to Claude
- "Here's my testimonial intake. Process it using the Tagging Reference and fill the Tagged Output sheet."
- Claude reads each raw testimonial, assigns theme tags, vibe matches, objection addressed, priority score, and extracts the best pull quote.
- Claude fills the Tagged Output sheet.

### Step 3: Review Claude's tagging
- Nate reviews the Tagged Output sheet
- Adjust any tags that feel off
- Confirm pull quotes are the strongest excerpts

### Step 4: Convert to app data
- "Convert the Tagged Output sheet to the testimonials.ts data file."
- Claude generates the TypeScript file matching the schema above.
- Drop into `src/data/testimonials.ts`

### Step 5: Build the component
- `TestimonialCard` component
- `useTestimonialMatch` hook (takes quiz answers + retreat slug, returns ranked testimonials)
- Integrate into results page retreat cards

---

## GHL Integration

When a testimonial renders on the results page:

**Tag:** `viewed_testimonial`
**Custom field:** `testimonial_retreat` = retreat slug where testimonial was shown

This fires once per session (don't re-tag on page refresh). It's a signal that the user reached the results page AND engaged with social proof, which is a higher-intent indicator than just viewing results.

---

## Content Requirements

### Minimum viable testimonial count:
- 25 total across all retreats
- At least 2 per active retreat (retreats currently selling)
- At least 5 tagged as `solo` guest type (your biggest segment)
- At least 3 tagged with `solo_travel` objection
- At least 3 tagged with `fitness_level` objection

### What makes a good testimonial for this system:
- **Specific detail** ("by day two" not "quickly")
- **Emotional truth** ("I cried saying goodbye" not "it was emotional")
- **Addresses a fear** ("I was nervous showing up alone" → perfect for solo_travel)
- **Short enough** (1-2 sentences for pull quote, not a paragraph)
- **First-person voice** (their words, not your summary)

### What to avoid:
- Generic praise ("best trip ever!!" — no specifics, can't match to quiz data)
- Anything that reads like it was written for SALTY to use (too polished)
- Anything that mentions price negatively
- Anything that qualifies the experience ("it was great BUT...")

---

## Future Enhancements

### Video testimonials (Phase 3):
If format = "video", the testimonial card could embed a 15-30 second video clip instead of text. This requires video hosting (YouTube unlisted or Cloudflare Stream) and thumbnail generation. Text pull quote serves as the fallback and accessible alternative.

### A/B testing (Phase 4):
Track which testimonials get the most downstream conversions (click to flights, click to book). Over time, the system could auto-optimize which testimonials show for which quiz profiles.
