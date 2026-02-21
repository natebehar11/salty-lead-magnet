# SALTY Design System — Rules

**Read this file before writing any code.** Non-negotiable.

**Source of truth:** `tokens.json` in this repo for values. This file for rules.
**Products:** getsaltyretreats.com (brand site) + explore.getsaltyretreats.com (lead magnet app)
**Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, Sanity CMS, Vercel
**Last updated:** 2026-02-21

---

## 1. BRAND CONTEXT

SALTY Retreats is an international fitness + adventure travel brand. Archetype: Free-Spirited Outlaw (Ted Lasso + Jack Sparrow + Anthony Bourdain). Slogan: "Make fun of wellness." Voice: energetic, grounded, human, funny, inclusive. Anti-woo, anti-corporate, anti-influencer.

Everything in the UI should feel warm, organic, playful, and human. Never corporate, sharp, or template-y.

---

## 2. COLOR SYSTEM

### 2.1 Primary Brand Colors (6 Primitives)

| Token | Hex | Name |
|---|---|---|
| `primitive/teal` | `#0e3a2d` | Dark Teal |
| `primitive/sand` | `#e7d7c0` | Sand |
| `primitive/white` | `#f7f4ed` | Paper White |
| `primitive/sky` | `#b6d4ea` | Sky Blue |
| `primitive/coral` | `#f75a3d` | Warm Coral |
| `primitive/golden` | `#fed260` | Golden Sun |

### 2.2 Secondary Brand Colors (6 Additionals)

| Token | Hex | Name |
|---|---|---|
| `secondary/palm-green` | `#3a6b35` | Palm Green |
| `secondary/aquamarine` | `#a4e5d9` | Aquamarine |
| `secondary/rust-red` | `#c74235` | Rust Red |
| `secondary/rose-stone` | `#ccb4b3` | Rose Stone |
| `secondary/bright-coral` | `#ff7e70` | Bright Coral |
| `secondary/slate-grey` | `#4a4e58` | Slate Grey |

### 2.3 Surface Tokens

**Light Surfaces (use Dark Teal text):**

| Token | Hex | Use |
|---|---|---|
| `surface/base` | `#f7f4ed` | Primary page background |
| `surface/warm-light` | `#f0e8db` | Subtle warm alternation |
| `surface/warm` | `#e7d7c0` | Warm section backgrounds |

**Dark Surfaces (use Paper White text):**

| Token | Hex | Use |
|---|---|---|
| `surface/dark` | `#0e3a2d` | Primary dark sections, nav |
| `surface/dark-raised` | `#1f4638` | Cards on dark surfaces, tooltips |
| `surface/dark-deep` | `#0b3126` | Footer, deepest backgrounds |

**Rule: No secondary colors as page backgrounds. Only the 6 surface tokens above + retreat/surface.**

### 2.4 Surface Classification — MUST CHECK BEFORE APPLYING TEXT

```
LIGHT SURFACES → text/primary (Dark Teal #0e3a2d):
  surface/base            #f7f4ed
  surface/warm-light      #f0e8db
  surface/warm            #e7d7c0
  primitive/sky           #b6d4ea
  primitive/golden        #fed260
  secondary/aquamarine    #a4e5d9
  secondary/rose-stone    #ccb4b3
  secondary/bright-coral  #ff7e70
  All retreat/surface values (see 2.7)

DARK SURFACES → text/inverse (Paper White #f7f4ed):
  surface/dark            #0e3a2d
  surface/dark-raised     #1f4638
  surface/dark-deep       #0b3126
  secondary/palm-green    #3a6b35
  secondary/slate-grey    #4a4e58
  secondary/rust-red      #c74235
  Darkened Rust Red        #a7372c (Morocco/Sicily nav only)

SPECIAL:
  primitive/coral         #f75a3d  → Dark Teal text (CTA buttons only)
```

### 2.5 Color Usage Rules

**Accent text (buttons, CTAs, small headers, labels) — ALLOWED:**
- Warm Coral, Bright Coral, Golden Sun, Aquamarine may be used as accent text in CTAs, buttons, badges, small headers, and labels where they meet contrast requirements for the text size used.

**Body text — PROHIBITED:**
- **Warm Coral (`#f75a3d`): NEVER as body text.** Fails contrast on light backgrounds for running copy.
- **Bright Coral (`#ff7e70`): NEVER as body text.** Same rule.
- **Golden Sun (`#fed260`): NEVER as body text on light backgrounds.** Only as accent or body text on dark surfaces.
- **Aquamarine (`#a4e5d9`): NEVER as body text.** Accent use only (success states, tags, small headers on dark).

**Background rules:**
- **Global/brand pages:** Backgrounds use only the 6 surface tokens (base, warm-light, warm, dark, dark-raised, dark-deep). No secondary colors as page backgrounds on global pages.
- **Retreat pages:** May use `retreat/surface` as a background. Secondary colors from the active retreat palette may appear as section backgrounds where appropriate. Never mix colors from two different retreat palettes in one view.
- **Retreat colors on global sections:** NEVER use retreat colors in testimonials, general FAQ, newsletter signup, or app promo blocks. These always use core brand colors.

### 2.6 Semantic Color Tokens

```
text/primary            → #0e3a2d  Dark Teal
text/inverse            → #f7f4ed  Paper White
text/secondary          → #4a4e58  Slate Grey
text/warm               → #fed260  Golden Sun (ONLY on dark surfaces)
text/on-retreat         → per retreat mode (see retreat table)

brand/primary           → #0e3a2d  Dark Teal
brand/accent            → #f75a3d  Warm Coral
brand/warm              → #fed260  Golden Sun
brand/cool              → #b6d4ea  Sky Blue

state/success           → #a4e5d9  Aquamarine
state/error             → #f75a3d  Warm Coral (fill, not text)
state/warning           → #fed260  Golden Sun
state/info              → #b6d4ea  Sky Blue
```

### 2.7 Retreat Color System

Each retreat has 6 tokens. Switch via Figma mode / CSS class / data attribute.

| Mode | primary | secondary | accent | surface | dark | text-on-primary |
|---|---|---|---|---|---|---|
| Sri Lanka | `#0e3a2d` | `#ff7e70` | `#f75a3d` | `#e4e5dd` | `#0e3a2d` | `#f7f4ed` |
| Panama | `#3a6b35` | `#b6d4ea` | `#c74235` | `#e7e9de` | `#3a6b35` | `#f7f4ed` |
| Morocco | `#c74235` | `#e7d7c0` | `#f75a3d` | `#f3e5de` | `#a7372c` | `#f7f4ed` |
| Sicily | `#fed260` | `#b6d4ea` | `#c74235` | `#f7f1e1` | `#a7372c` | `#0e3a2d` |
| El Salvador | `#4a4e58` | `#ccb4b3` | `#a4e5d9` | `#e9e6e1` | `#4a4e58` | `#f7f4ed` |
| Costa Rica | `#3a6b35` | `#0e3a2d` | `#b6d4ea` | `#e7e9de` | `#0e3a2d` | `#f7f4ed` |
| Nicaragua | `#b6d4ea` | `#3a6b35` | `#fed260` | `#f1f1ec` | `#3a6b35` | `#0e3a2d` |

**retreat/surface** = retreat/primary at 8% opacity over Paper White. All are LIGHT surfaces (use Dark Teal text).

**retreat/dark** = nav and footer background on retreat pages. `#a7372c` (darkened Rust Red) for Morocco and Sicily only. This is a surface-only color — never used as text, fill, accent, or border.

**On global pages** (Home, About, Retreats Hub, etc.) nav/footer ALWAYS use Dark Teal.

### 2.8 60/30/10 Rule

Every section follows a 60/30/10 color distribution:
- 60% — dominant background
- 30% — secondary supporting elements
- 10% — accent (CTAs, highlights)

On retreat pages, which color occupies which role can vary section to section. The ratio stays constant.

---

## 3. CTA BUTTONS

```
GLOBAL PAGES:
  Primary:    bg coral #f75a3d     text Dark Teal #0e3a2d
  Secondary:  bg Paper White        text Dark Teal
  Hover:      color inversion (bg Dark Teal, text Paper White) — 200ms ease

RETREAT PAGES:
  Primary:    bg retreat/accent     text Dark Teal #0e3a2d
  Secondary:  bg Paper White        text retreat/dark
  Hover:      color inversion — 200ms ease

EXCEPTIONS (Rust Red accent — Panama, Sicily):
  Primary:    bg Rust Red #c74235   text Paper White #f7f4ed (not Dark Teal)
  Hover:      color inversion — 200ms ease
```

**Button text: 16px mobile / 18px desktop, weight 700 (bold).** This ensures AA-Large compliance on Coral backgrounds (3.90:1).

**Shape:** Pill (radius/full). All buttons are pill-shaped.

---

## 4. TYPOGRAPHY

### 4.1 Font Roles (strict)

| Font | Role | Never use for |
|---|---|---|
| **TAN Headline** | ALL headings H1–H5, hero display, section titles | Body, labels, UI text, anything below 16px mobile |
| **Roca One Light** | ALL body, labels, UI, captions, buttons, inputs | Headings of any level |

**No exceptions.** TAN Headline owns headings. Roca One Light owns everything else.

### 4.2 Type Scale

| Token | Mobile | Desktop | Font | Weight | Leading |
|---|---|---|---|---|---|
| `type/display` | 48px | 72px | TAN Headline | 700 | 1.1 |
| `type/h1` | 36px | 60px | TAN Headline | 700 | 1.1 |
| `type/h2` | 28px | 48px | TAN Headline | 700 | 1.25 |
| `type/h3` | 22px | 32px | TAN Headline | 700 | 1.25 |
| `type/h4` | 18px | 22px | TAN Headline | 700 | 1.25 |
| `type/h5` | 16px | 18px | TAN Headline | 700 | 1.25 |
| `type/body-lg` | 16px | 18px | Roca One Light | 400 | 1.625 |
| `type/body-base` | 14px | 16px | Roca One Light | 400 | 1.5 |
| `type/body-sm` | 12px | 14px | Roca One Light | 400 | 1.5 |
| `type/label` | 12px | 14px | Roca One Light | 500 | 1.5 |
| `type/label-sm` | 10px | 12px | Roca One Light | 500 | 1.5 |
| `type/button` | 16px | 18px | Roca One Light | 700 | 1.5 |
| `type/caption` | 11px | 12px | Roca One Light | 400 | 1.5 |

### 4.3 Alignment

- Hero / display: centered
- Body content: left-aligned
- Right-aligned: only prices and table data
- Retreat card text: always left-aligned

---

## 5. SPACING

### 5.1 Primitive Scale (4px base)

```
space/px    → 1px      space/8     → 32px
space/0.5   → 2px      space/10    → 40px
space/1     → 4px      space/12    → 48px
space/2     → 8px      space/16    → 64px
space/3     → 12px     space/20    → 80px
space/4     → 16px     space/24    → 96px
space/5     → 20px     space/32    → 128px
space/6     → 24px
```

### 5.2 Semantic Spacing

| Token | Mobile | Desktop | Use |
|---|---|---|---|
| `spacing/section-y` | 48px | 96px | Between page sections |
| `spacing/section-x` | 16px | 80px | Horizontal page padding |
| `spacing/container-max` | 100% | 1200px | Max content width |
| `spacing/component-y` | 16px | 32px | Internal vertical padding |
| `spacing/component-x` | 16px | 32px | Internal horizontal padding |
| `spacing/card-padding` | 16px | 24px | Card internal padding |
| `spacing/stack-sm` | 8px | 12px | Tight vertical stack |
| `spacing/stack-md` | 16px | 24px | Medium stack |
| `spacing/stack-lg` | 24px | 48px | Large stack within component |
| `spacing/inline-sm` | 8px | 8px | Tight horizontal gap |
| `spacing/inline-md` | 16px | 16px | Medium horizontal gap |
| `spacing/grid-gap` | 16px | 24px | Grid column gaps |

---

## 6. BORDERS & RADIUS

```
RADIUS:
  radius/button         → 9999px (pill)
  radius/card           → 16px
  radius/card-image     → 16px top, 0 bottom
  radius/input          → 8px
  radius/badge          → 9999px
  radius/modal          → 24px
  radius/tag            → 9999px

BORDERS:
  border/width/thin         → 1px
  border/width/base         → 2px
  border/width/thick        → 3px
  border/width/photo-frame  → 4px
  border/width/coach-frame  → 6-8px

CARD BORDERS: None. Cards use shadow only for resting depth.
  Hover adds a 3-4px bottom border in retreat color (retreat cards) or Coral (global cards).

INPUT BORDERS:
  default → 1px Sand
  focus   → 2px Dark Teal
  error   → 2px Warm Coral
```

---

## 7. SHADOWS

Warm neutral shadows. Never grey/black, never retreat-tinted. Shadows = spatial depth only.

| Token | Value | Use |
|---|---|---|
| `shadow/sm` | `0 1px 3px rgba(30,25,20,0.06), 0 1px 2px rgba(30,25,20,0.04)` | Card resting state |
| `shadow/md` | `0 4px 12px rgba(30,25,20,0.08), 0 2px 4px rgba(30,25,20,0.04)` | Card hover, active |
| `shadow/lg` | `0 12px 32px rgba(30,25,20,0.12), 0 4px 8px rgba(30,25,20,0.06)` | Modals, overlays, nav |

---

## 8. Z-INDEX

| Token | Value | Use |
|---|---|---|
| `z/base` | 1 | Default content |
| `z/card-overlay` | 50 | SALTY Meter on cards, Coach info |
| `z/sticky` | 100 | Nav bar |
| `z/drawer` | 200 | Mobile nav tray |
| `z/modal` | 300 | Modals |
| `z/toast` | 400 | Toast notifications |

---

## 9. GRID & LAYOUT

- **Grid:** 12-column
- **Card grids:** 3 per row desktop (4 cols each), 2 per row at `md`, 1 per row below `md`
- **Container max:** 1200px, centered above 1280px
- **Card width at 1200px:** ~376px each (with 24px gaps)
- **Card image aspect:** 16:9 for large cards, 4:3 for medium, 1:1 for small

---

## 10. BREAKPOINTS

Mobile-first. 4 breakpoints only.

| Name | Value | What shifts |
|---|---|---|
| Base | 0px | Mobile styles, 375px design reference |
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablet — nav collapses, multi-column |
| `lg` | 1024px | Desktop — full layout |
| `xl` | 1280px | Container max kicks in |

No 320px breakpoint (fluid handles it). No 1440px breakpoint. No fixed-width element wider than 320px.

---

## 11. NAVIGATION

**Desktop:**
- Logo: left-aligned
- Links: right-aligned, grouped near CTA
- CTA (Book Now): right-most, gentle text-style CTA (not a full pill button — understated, inviting, not aggressive)
- Active link: Golden Sun dot below active link
- Transparent over hero → solid on scroll (250ms ease)
- **Hide on scroll-down, show on scroll-up**

**Mobile:**
- Right hamburger → right-side tray (slide from right)
- Tray: Dark Teal (global) or retreat/dark (retreat pages)
- Links: full width, large tap targets
- CTA: gentle CTA at bottom of tray, consistent with desktop treatment

**Retreat pages:** Nav background swaps to retreat/dark. CTA uses retreat/accent.

---

## 12. HERO SECTIONS

**Main pages:** Video autoplay muted loop, photo fallback. **No overlay on video** — let the footage breathe. Centered content, 100vh desktop / 85vh mobile. Text positioned in naturally darker areas of the composition.

**Retreat pages:** Full-bleed photo. **No gradient overlay.** Each retreat has a custom **Retreat Ticket** component — a branded SVG graphic positioned top-left of the hero containing the destination name and locations (e.g. "PANAMA / Santa Catalina, Panama City" with SALTY shaker icon). These are designed per-retreat and imported as SVGs into Figma. CTAs (Book Now, Ask a Question) sit in the upper-right area. H1 = retreat name (e.g. "Panama Fitness Retreat"), sub-line = official name (e.g. "City to Sea"), then dates below. All positioned lower in the hero. Height: 100vh desktop / 75vh mobile.

**Retreat Ticket component:** Per-retreat SVG asset (NOT a systematic component). Each retreat gets its own version styled in that retreat's accent color with destination text in TAN Headline. Positioned top-left of hero, overlaying photo. Must be designed and exported as SVG for each active retreat.

**Parallax:** Text layer scrolls at ~85% of scroll rate (15-20px separation). CSS transform, desktop only. Never parallax the image/video layer.

**Hero fade-out:** Hero section fades opacity as it scrolls out of view. Hero only, not content sections.

---

## 13. MOTION & ANIMATION

### 13.1 Tokens

```
motion/duration/instant   → 100ms
motion/duration/fast      → 200ms
motion/duration/base      → 250ms
motion/duration/moderate  → 300ms
motion/duration/slow      → 400ms

motion/easing/default     → cubic-bezier(0.25, 0.1, 0.25, 1.0)
motion/easing/enter       → cubic-bezier(0.0, 0.0, 0.2, 1.0)
motion/easing/exit        → cubic-bezier(0.4, 0.0, 1.0, 1.0)
```

No bounce. No overshoot. Clean, warm, functional.

### 13.2 Animation Inventory

| Element | Animation | Duration | Easing | Trigger |
|---|---|---|---|---|
| Scroll reveal | translateY(15-20px) + opacity 0→1 | 300-400ms | enter | Once on viewport entry |
| Hero fade-out | opacity 1→0 | Scroll-driven | — | Hero section only |
| Hero parallax | Text translateY at 85% scroll rate | Scroll-driven | — | Desktop only |
| Image hover | scale(1.02-1.03), overflow hidden | 300ms | default | Hover |
| Card hover | translateY(-3px) + shadow sm→md + bottom border | 250ms | default | Hover |
| Button hover | Color inversion (bg↔text swap) | 200ms | default | Hover |
| Nav transparent→solid | Background + shadow transition | 250ms | default | Scroll position |
| Accordion expand | Height + opacity | 200ms | default | Click |
| Lazy images | Sand shimmer skeleton → fade in | — | — | Load complete |

**All animations require `prefers-reduced-motion` fallback (instant display, no animation).**

### 13.3 What Does NOT Animate

- Text content sections
- FAQ accordions (content doesn't animate, expand/collapse does)
- Form sections
- Footer
- Page transitions (no route animation)

---

## 14. DIVIDERS

### 14.1 Three Variants

**Swoop** — Full-width SVG filled curve. Major section transitions (dark↔light). Props: `color`, `direction` (left/right), `height` (48-64px). Direction alternates per page.

**Wave** — Full-width SVG gentle arc. Minor section transitions (subtle background shifts). Props: `color`. Height: 24-32px.

**Double Lines** — Two 6px parallel lines with 4-8px gap. Accent punctuation. Props: `topColor`, `bottomColor`. **Inversion principle:** top line pulls from section below, bottom line from section above.

### 14.2 Rules

- Swoop ALWAYS appears after the hero (consistent site-wide entry)
- Swoop handles all dark↔light transitions
- Wave handles subtle same-tone shifts (Paper White↔Sand, Warm Cream↔Paper White)
- Double Lines appear max 2× per page, before high-impact moments (testimonials, pricing, stats)
- On retreat pages, divider colors use the retreat palette
- On global pages, divider colors use the 6 primary brand colors
- Sequences are standardized per page template (see Section 14.3)

### 14.3 Divider Sequences Per Page

**Homepage** (5 dividers):
```
Hero                    [Dark Teal]
  ↓ SWOOP (left-high)
SALTY Snapshot           [Paper White]
  — no divider —
Social Proof Bar         [Sand]
  ↓ WAVE
What Makes SALTY         [Paper White]
  — no divider —
How It Works             [Warm Cream]
  ↓ SWOOP (right-high)
Upcoming Retreats        [Paper White]
  ↓ DOUBLE LINES
What People Say          [Dark Teal]
  ↓ SWOOP (left-high)
FAQ Teaser               [Sand]
  — no divider —
Community CTA + Footer   [Dark Deep]
```

**Retreats Hub** (4 dividers):
```
Hero                    [Dark Teal]
  ↓ SWOOP
Our Retreats (grid)      [Paper White]
  ↓ WAVE
SALTY Meter Carousel     [Sand]
  — no divider —
Past Retreats (video)    [Warm Cream]
  ↓ DOUBLE LINES
Need Help Choosing?      [Dark Teal]
  ↓ SWOOP
FAQs                     [Paper White]
Footer                   [Dark Deep]
```

**Retreat Detail** (8 dividers):
```
Retreat Hero             [Hero Photo]
  ↓ SWOOP (retreat color)
About + Quick Facts      [Retreat Surface]
  — no divider —
Inclusions               [Dark Teal]
  ↓ SWOOP (retreat color)
Experience Narrative     [Paper White]
  ↓ WAVE
What You'll Do           [Sand]
  — no divider —
Day-by-Day Itinerary     [Warm Cream]
  ↓ DOUBLE LINES
Dates & Pricing          [Paper White]
  ↓ SWOOP
Where You'll Stay        [Retreat Surface]
  — no divider —
Your Coaches             [Paper White]
  ↓ WAVE
SALTY Meter              [Sand]
  ↓ DOUBLE LINES
Testimonials             [Dark Teal]
  ↓ SWOOP
Retreat FAQ              [Paper White]
  — no divider —
Final CTA + Footer       [Dark Deep]
```

**About** (3 dividers):
```
Hero                    [Dark Teal]
  ↓ SWOOP
GEO Snapshot             [Paper White]
  — no divider —
The Story                [Warm Cream]
  ↓ WAVE
Meet the Founders        [Paper White]
  — no divider —
Our Coaches              [Sand]
  ↓ DOUBLE LINES
The Numbers (stats)      [Dark Teal]
  — no divider —
CTA + Footer             [Dark Deep]
```

**Fitness Retreats Pillar** (5 dividers):
```
Hero                    [Dark Teal]
  ↓ SWOOP
GEO Definition           [Paper White]
  — no divider —
What You'll Do           [Warm Cream]
  ↓ WAVE
Not For You              [Paper White]
  — no divider —
Where We Go              [Sand]
  ↓ DOUBLE LINES
By the Numbers           [Dark Teal]
  ↓ SWOOP
What's Included          [Paper White]
  — no divider —
What People Say          [Dark Teal]
  ↓ SWOOP
FAQ                      [Sand]
  — no divider —
Final CTA + Footer       [Dark Deep]
```

**Simple Pages** (/faq, /reviews, /book, /blog, /destinations) — 1 divider:
```
Hero (compact)           [Dark Teal]
  ↓ SWOOP
Main Content             [Paper White]
  — content sections vary, clean bg shifts only —
Footer                   [Dark Deep]
```

---

## 15. CAROUSEL / HORIZONTAL SCROLL

One shared component with variant props.

| Context | Desktop | Mobile | Snap |
|---|---|---|---|
| Card carousels | Arrow buttons | Swipe + dots | ON |
| Accommodation photos | Arrow buttons | Swipe + dots | ON |
| Daily itinerary | Arrows or free scroll | Swipe, free scroll | OFF |

Desktop arrows: visible at all times (not hover-only). No progress bars or counters.
Mobile dots: below content, active dot highlighted.

---

## 16. TOOLTIPS

**Scope: ONLY for pricing and itinerary clarifications.** Not for activity tags, navigation, SALTY Meter, or general UI.

- Desktop: hover, 200ms delay, dismiss on mouse-out
- Mobile: tap-to-reveal popover, dismiss on tap outside
- Style: `surface/dark-raised` bg, Paper White text, `radius/md`, `shadow/md`

---

## 17. LINKS

```
LIGHT SURFACES:
  default   → Dark Teal text, persistent underline
  hover     → Warm Coral text

DARK SURFACES:
  default   → Sand text, persistent underline
  hover     → Golden Sun text
```

---

## 18. FORMS

**In scope:** Email capture, quiz inputs, contact/enquiry, lead capture gates, search/filter inputs.
**Booking:** GHL/Stripe checkout embedded in site (managed by Sabhi). Not a redirect.

**All forms must connect to the GoHighLevel API.** Every form submission creates or updates a contact in GHL with appropriate tags and pipeline stage.

**Input states (all must be built):** default, focus, filled, error, disabled, success.
**Labels:** Always visible. Never placeholder-only.
**Touch targets:** Minimum 44×44px on mobile.

---

## 19. PRICING & CURRENCY

**On cards / browse views:** `From $XXX/day` (total ÷ number of days, rounded up)
**On retreat detail pages:** `From $X,XXX USD` with full room tier table, payment schedule, cancellation policy
**Currency:** USD primary. Supported: USD, GBP, CAD, AUD, EUR.

**Currency toggle:** Inline toggle placed directly in the Pricing/Rooms section of retreat detail pages. Not in the nav (keeps nav clean — the lead magnet handles global currency in its own nav). When a non-USD currency is selected, show the converted price prominently with USD in small print below: "Prices shown in USD. Approximate conversions for reference only."

**Room price tooltips:** Each room type tooltip explains the per-person context: "This is the price for 1 guest in a shared double room" or "This is the price for 1 guest staying in a triple room."

**Day calculation:** `Math.ceil(totalPrice / totalDays)` — use DAYS not nights. Panama = 9 days, not 8 nights.

---

## 20. AVAILABILITY & STATUS

- **Selling Fast:** Manual badge, triggered via Sanity CMS. No automated threshold.
- **Sold Out:** Full-color card stays visible, CTA swaps to "Join Waitlist", "Sold Out" badge overlays image. No greyscale, no dark overlay. Card serves as social proof.
- **New Trip:** Sky Blue badge.
- **Early Bird:** Golden Sun badge with struck-through original price.

---

## 21. DATE FORMATTING

- Short: `Mar 15–22, 2026` (abbreviated month, en-dash)
- Long: `March 15 to 22, 2026`
- Duration: `9 Days / 8 Nights`

---

## 22. RETREAT NAMING

| Retreat | Official Name | Slug |
|---|---|---|
| Panama | City to Sea | panama-fitness-retreat |
| Morocco | Beyond the Dunes | morocco-fitness-retreat |
| Sicily | Endless Summer | sicily-fitness-retreat |
| El Salvador | SALT & HUSTL | el-salvador-surf-retreat |
| Costa Rica | Surf Sweat Flow v4 | costa-rica-fitness-retreat-v4 |
| Nicaragua | TBD | nicaragua-[tbd]-retreat |
| Sri Lanka | Island Tides | sri-lanka-v2 |

Card display: `[Official Name]` as headline, destination + dates as subhead.

---

## 23. DAILY ITINERARY (Expandable)

The day-by-day itinerary section uses horizontal scroll cards (free-scroll, no snap). Each day card shows the day number, title, and a thumbnail photo.

**Expandable detail:** Tapping/clicking a day card opens a **modal** with the full day breakdown:
- Header: "Day X - [Title]" in TAN Headline, X close button top-right
- Left column: Photo (4:3) of the day's key experience
- Right column: Narrative description paragraphs in Roca One Light
- Below photo/text: Data row with icons for:
  - **Accommodation:** Property name and location
  - **Meals Included:** Breakfast, lunch, dinner (whichever apply)
- Modal uses `radius/xl`, `shadow/lg`, dark backdrop, click-outside to dismiss

**Mobile:** Modal goes full-screen or near-full-screen drawer (slide up from bottom).

---

## 24. ACCOMMODATION CARDS

### Layout: Tabbed Full-Width

Accommodation uses a **tabbed interface** with one full-width card per room type. Tabs are visible at the top of the section.

**Tab bar:**
- Each tab shows: Room Type Name + Total Price (e.g. "Standard Double | $2,399 USD")
- Tabs are sizeable on desktop — large enough to scan all room options at a glance
- **Default selection: most cost-effective room type** (anchors low, reduces sticker shock)
- Mobile: horizontal scrollable pill row or dropdown selector (tabs overflow on small screens)

**Active tab content (full-width card):**
```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐   [ROOM TYPE NAME]      [H3, TAN]  │
│  │                     │   $X,XXX USD per person             │
│  │   Photo Carousel    │                                     │
│  │   (4:3, swipeable   │   [Description paragraph in Roca   │
│  │    2-4 photos)      │    One Light — what the room is    │
│  │                     │    like, who it's for, what makes   │
│  └─────────────────────┘    it special]                      │
│                                                              │
│  🛏 X Beds · 👑 [Bed Size] · 🚿 Private/Shared             │
│                                                              │
│                            [Book Now]                        │
└──────────────────────────────────────────────────────────────┘
```

**Photo carousel:** Left-aligned, 4:3 aspect ratio, swipeable with dots on mobile, arrows on desktop. 2-4 photos per room type. This is where beautiful venue photography shines.

**Highlights strip:** Below photo. Small icons with labels: total beds, bed sizes, bathroom type (private/shared). Quick scannable facts.

**Right panel:** Room type name in TAN Headline (H3), price in type/h4, description paragraph, Book Now CTA.

**Mobile layout:** Stacks vertically — photo carousel on top, highlights strip, then details below.

**Currency toggle:** Inline in this section (see Section 19). When non-USD selected, show converted price with USD small print.

**Room tooltip:** Each room type has a tooltip on the price: "This is the price for 1 guest in a [room type]."

### Group Booking Section

Below the tabbed room cards, a **collapsible section** handles group discounts:

**Header:** "Traveling with Friends?" (collapsible, closed by default)

**When expanded:**
- Grid of group options (Group of 3, Group of 4, etc.)
- Each option shows: group label, regular price struck through, discounted price, short description, Book Now CTA
- Note at bottom: "All group members must book together. These rooms use the same [room type] suites. Not available for solo travelers or pairs."

This is a booking modifier, not a room type — it stays separate from the tabs.

**Data source:** Group options vary per retreat and are managed in Sanity CMS. Not all retreats offer group discounts.

---

## 25. COACH CARDS

- 3 per row on desktop (same grid as retreat cards)
- Portrait photo (3:4) with thick colored border (6-8px), color assigned per coach (fixed, not retreat-dependent)
- Name overlaid on photo in TAN Headline with brand illustration element (starburst/stamp) behind it
- Specialty bar below photo: same color as frame, disciplines + personality descriptor in TAN Headline
- Hover/info state: photo swaps to Sand background with name + bio paragraph
- Mobile: tap triggers modal instead of overlay
- **Coaches appear only on retreat detail pages and /about. NOT on retreat cards.**

---

## 26. PHOTOGRAPHY & MEDIA

| Context | Aspect Ratio |
|---|---|
| Hero (video) | 16:9 |
| Hero (photo) | 16:9 or full-bleed |
| Retreat Card Large | 16:9 |
| Retreat Card Medium | 4:3 |
| Retreat Card Small | 1:1 |
| Accommodation Carousel | 4:3 |
| Coach Card | 3:4 (portrait) |
| Testimonial Avatar | 1:1 (circle) |
| Itinerary Photo | 4:3 or 16:9, with 4px bordered photo frame in retreat color |

**Image optimization:** `next/image` for automatic WebP/AVIF, responsive srcset, lazy loading.
**Eager load:** Hero images only. Everything else lazy loads.
**Skeleton:** Sand (#e7d7c0) shimmer animation. No grey placeholders.
**Photo treatment:** No blanket filter. SALTY photography is bold, vibrant, authentic.

---

## 27. ACCESSIBILITY

- **Standard:** WCAG AA on all text
- **Focus states:** Visible on all interactive elements
- **Alt text:** Required on all images
- **Touch targets:** 44×44px minimum on mobile
- **Labels:** Visible on all form inputs
- **Motion:** `prefers-reduced-motion` fallback on all animations
- **Keyboard:** Carousel arrows and all interactive elements keyboard-accessible

---

## 28. FEEDBACK STATES

| State | Treatment |
|---|---|
| Empty (no results) | Warm, on-brand illustration. Recovery CTA. Never cold/grey. |
| Success | Aquamarine (#a4e5d9) fill |
| Error | Warm Coral fill (not text) |
| Loading | Sand skeleton with shimmer |
| Toast | Bottom-center mobile, bottom-right desktop. Auto-dismiss 4s. |
| Modal | Dark semi-transparent backdrop. X close + backdrop click. radius/xl. |

---

## 29. DARK SECTIONS

SALTY is light-first. No system-wide dark mode. Dark sections are deliberate design pattern for emphasis.

- Background: `surface/dark`, `surface/dark-raised`, or `surface/dark-deep`
- Text: Paper White
- Headings: Paper White
- Accent text: Golden Sun (ONLY on dark surfaces)
- Links: Sand text, underline, Golden Sun on hover
- CTAs: Same Coral pill button, Dark Teal text

---

## 30. HOW TO ADD A NEW RETREAT

1. **Design:** In Figma, duplicate an existing mode in the `Color/Retreat` collection. Rename to new retreat. Swap the 6 color values (primary, secondary, accent, surface, dark, text-on-primary).
2. **Generate surface:** Mix new primary at 8% opacity over Paper White (#f7f4ed). Verify Dark Teal text contrast ≥ 4.5:1.
3. **Check accessibility:** Paper White text on new retreat/dark ≥ 4.5:1. Golden Sun text on retreat/dark ≥ 4.5:1. Dark Teal text on retreat/accent ≥ 3.0:1 (AA-Large for buttons). If any fail, adjust dark value or specify Paper White CTA text.
4. **Tokens:** Export updated Variables via Tokens Studio. Add new retreat key to `tokens.json`.
5. **Code:** Add retreat slug to the retreat config in both repos. The color system auto-applies via the mode/class structure.
6. **CMS:** Create new retreat entry in Sanity with all content fields.
7. **Dividers:** Assign divider sequence following the Retreat Detail template pattern. Swoop and double line colors use the new retreat palette.

---

## 31. FUTURE STATE (Phase 2)

These are designed but deferred to post-launch:

- **Video-on-hover for retreat cards** — Desktop only. Short .webm/.mp4 loops (3-5s). SALTY Meter toggle pauses video. Preload on viewport entry. Cards accept optional `hoverVideo` prop from launch.
- **Cursor-following gradient on dark sections** — Radial gradient (Golden Sun at 3-4% opacity, ~400px radius) follows cursor with lerp interpolation. Desktop only. Applied to `::after` pseudo-element.
- **SVG divider draw animation** — Stroke animation on double lines, clip-path reveal on swoops/waves. First 2-3 dividers per page only. Intersection Observer, trigger once.

---

*This is a living document. Update it when design decisions change. If a rule isn't here, check SALTY_DESIGN_SYSTEM_HANDOVER_v3.md for full context.*
