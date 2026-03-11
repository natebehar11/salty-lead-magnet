## SALTY Design System — Rules

**Read this file before writing any code.** Non-negotiable.

**Source of truth:** `tokens.json` in this repo for values. This file for rules.
**Products:** getsaltyretreats.com (brand site) + explore.getsaltyretreats.com (lead magnet app)
**Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, Sanity CMS, Vercel
**Last updated:** 2026-03-01

---

## 0. ART DIRECTION — READ FIRST, OVERRIDE NOTHING BELOW

This section defines HOW the design system should be interpreted visually. The token values, component specs, and color rules in the sections that follow are technically correct — but without this creative direction, the output will look like a competent template instead of an art-directed brand. Every section below must be built through the lens of these principles.

### 0.1 Design Philosophy: "Analog Maximalism"

SALTY's visual identity sits at the intersection of vintage travel ephemera, independent surf magazine editorial, and screen-printed poster culture. It is NOT a clean wellness brand. NOT a SaaS template. NOT minimalist luxury.

**Reference points:** 1970s airline boarding passes × early-2000s surf magazine layouts × hand-printed gig posters × streetwear lookbooks.

**The Non-Negotiable Feeling:** Every page should feel like something you'd pin to a corkboard, tear out of a zine, or find stuck to a fridge with a magnet. Physical, tactile, collected — like real objects photographed on a surface, not pixels arranged in a grid.

### 0.2 Typography Behavior (Supplements Section 4)

TAN Headline and Roca One are the correct typefaces. Section 4 has the scale values. This section defines how the type should BEHAVE in compositions:

- **TAN Headline dominates compositions.** Headlines should fill 60–80% of the horizontal width on desktop. They command the frame.
- **Type overlaps images, crosses section boundaries, runs edge-to-edge.** It does NOT sit politely inside a box at a polite size.
- **Line-height on display type is tight** — letters stack and compress. This creates visual density and energy. Use the leading values in Section 4.2 as a floor, not a ceiling.
- **TAN Headline italic is a signature move** — used for hero display text, pull quotes, and section headers where the brand needs to feel editorial and expressive.
- If a headline feels "comfortable" or "reasonable" in the layout, it's probably too small. Push it up one scale step.

### 0.3 Layout Philosophy: "Organized Chaos"

Layouts should feel art-directed by a human with strong opinions, not assembled by a design system generator.

**Core principles:**
- **Asymmetric by default.** Section 4.3 says hero/display text is centered — that's correct for those specific contexts. But the overall page composition is asymmetric: left-heavy headlines next to right-offset photos, staggered elements, split layouts where one half bleeds and the other breathes. If every element on the page is centered, the design has failed.
- **Overlap intentionally.** A starburst badge overlapping a photo. A headline crossing a section boundary. A card element peeking from behind another. Every major section should have at least one intentional overlap or break.
- **Variable spacing creates rhythm.** Some elements packed tight, others breathing with generous whitespace. This contrast IS the visual energy — uniform spacing across an entire page kills it. Use the spacing tokens from Section 5 but vary them section to section.
- **Break the grid** at least once per major section. Section 9 defines a 12-column grid — use it as the underlying structure, but let one element per section ignore it. An image that bleeds past the container max, a headline that spans wider than its content column, a graphic device that sits outside the expected bounds.
- **Split layouts are a signature pattern.** Photo taking 50–60% of the viewport on one side, text content on the other — with the photo bleeding edge-to-edge (no padding, no margin on the bleed side) while the text side has comfortable interior margins. This appears on the About page origin story and should be a recurring pattern.

**Section transitions are material changes, not color swaps:**
- Section 14 defines the Swoop, Wave, and Double Line dividers — these are critical. They create the physical feeling that the page is made of layered surfaces, not flat screens.
- Between dividers, the background shifts should feel like moving from one physical surface to another: warm cream paper → dark green painted wall → full-bleed photograph → cream paper again.
- These transitions are the connective tissue of the whole design. They should never be skipped or replaced with hard horizontal lines.

### 0.4 Signature Graphic Devices

These recurring visual elements are as important to SALTY's identity as the color palette. They are what separate the brand from generic travel sites. Section numbers reference where specs live; this section defines the personality.

**Boarding Pass / Ticket Cards (see Section 22):**
The retreat listing cards are styled as physical airline boarding passes / event tickets. They include: a barcode strip on the left edge, airplane icon, perforated semicircle notches on card edges, QR code placeholder, destination name + trip dates, and the tagline "Life's too short not to take the trip." Background color rotates per retreat using the retreat color system (Section 2.7). The SALTY salt-shaker icon appears on each pass. These should feel like collectible physical objects — not flat rectangles. Subtle warm shadow (Section 7), slight implied physicality. Use SVG/CSS placeholders for graphic elements that will be swapped for final assets.

**Starburst / Jagged Badge:**
An irregular star shape (8–12 points, NOT perfectly symmetrical). Used for: coach names overlaid on photos, "EARLY BIRD" pricing tags, promotional callouts, personality descriptors. Typically terracotta/coral fill with golden or cream type, or golden fill with dark teal type. The badge overlaps the photo it belongs to, anchored to the top-left or top-right. The edges should feel hand-cut — slight irregularity is the point. The starburst is NOT a decorative ornament; it's a functional container for text that adds visual tension to a composition. Use CSS clip-path or SVG placeholder.

**Thick Colored Borders / Frames (see Section 6, border/width/coach-frame and border/width/photo-frame):**
Photos frequently get bold 4–8px colored strokes. This is NOT a subtle hairline — it makes images feel like framed printed photographs with a colored mat. Coach cards use 6–8px frames. Itinerary photos use 4px frames. The frame color is contextual — coach-specific accent, retreat palette color, or brand primary.

**Organic Blob Shapes:**
Text blocks sometimes sit on soft, amorphous background shapes with irregular organic edges — NOT rectangles, NOT circles, NOT perfectly rounded containers. These appear as text background highlights (the sky-blue blob behind "WE TRIED IT WITH FRIENDS" on the About page). They add a hand-crafted, collage-like quality. Think: watercolor wash or torn paper shape behind text.

**Line-Art Icons:**
Inclusions, features, and "What Is a SALTY Retreat?" sections use a consistent set of single-weight line-art icons (accommodations, meals, workouts, surf, experiences, cultural activities, transfers). These are drawn in a warm, rounded style — not sharp geometric. Rendered in the retreat accent color or rust red on light backgrounds, cream/paper-white on dark backgrounds. Displayed in grid formations (2×3 or 3×2) with TAN Headline labels and short Roca One descriptions beneath each.

**Dashed Cut-Line Borders:**
Purple/indigo dashed borders mimicking print-shop cut marks. Used sparingly on coach profile cards and trip listing cards. Adds tactile "this was printed and cut out" quality. Not on every card — reserved for specific physical-metaphor moments.

**Highlighted Text / Marker Effect:**
Testimonial or story headlines sit on a yellow or cream irregular brush-stroke shape — as if highlighted with a physical marker. Edges should be slightly torn/wavy, not a clean rectangle. This is the visual treatment for the "couple's testimonial" pattern: full-bleed candid photo with a highlighted headline overlaid.

### 0.5 Coach Cards (Supplements Section 25 — CORRECTS prior assumptions)

Coach cards follow a specific pattern visible on the live site:

- **All cards are the same dimensions** — equal height and width in a uniform grid (3 per row desktop, per Section 9).
- **Every card has a DIFFERENT accent color.** Each coach is assigned a unique color from the brand palette (teal frame, aquamarine frame, golden frame, coral frame, etc.). This color applies to both the thick photo frame border AND the specialty bar below the photo. No two coaches share a color.
- **Starburst name badge** overlaps the top-left of the photo, sitting partially on and partially off the image. Coach name in TAN Headline inside the starburst.
- **Specialty bar** below the photo: solid background in the coach's accent color, with disciplines listed pipe-separated in TAN Headline (e.g., "THE BOSS | YOGA | PILATES") plus a fun personality descriptor on a second line (e.g., "MARGARITA MASTER", "R&B CONNOISSEUR", "S-CLUB OWNER", "MOTIVATIONAL YELLER").
- **Hover/tap state:** Photo side swaps to a Sand background with the coach's name and bio paragraph. Mobile uses a modal instead of an overlay.
- **The uniformity of card SIZE combined with the variety of card COLOR is the design tension.** The grid is orderly; the color palette is not. This prevents the section from feeling like a template while maintaining structural clarity.

### 0.6 Feature / Pillar Cards ("What Is a SALTY Retreat?" Pattern)

When presenting 4–6 features or pillars in a grid (fitness, food, experiences, etc.):

- Cards alternate between TWO background colors — typically coral and dark teal on dark sections, or coral and sand on light sections. The alternation creates a checkerboard energy that prevents the grid from feeling uniform.
- Each card contains: a line-art icon at top, TAN Headline title, short Roca One description.
- The grid sits alongside a vertical video or tall image on the opposite side — creating an asymmetric split (media on one side, card grid on the other).

### 0.7 Photography Treatment (Supplements Section 26)

Section 26 has the correct aspect ratios and optimization rules. This defines the art direction:

- **Candid, sweaty, joyful, unposed.** Mid-laugh, water spraying, sand on skin. Tongue out. Eyes closed from smiling. Sunscreen on faces. These are real humans having the best week of their lives.
- **No studio lighting.** Natural light — golden hour, tropical overcast, beach shade. The locations and the energy do the work.
- **Real bodies, real mess, real fun.** Not aspirational fitness model imagery. Diverse body types, diverse backgrounds, universal joy.
- **Photos are frequently partially obscured** by overlapping type, starburst badges, divider swoops, or section boundaries. They're part of a composition, not isolated in frames.
- **Full-bleed is the default for hero and narrative sections.** Photos go edge-to-edge on at least one axis. The split-layout pattern (photo bleeds on one side, text breathes on the other) is a signature move.

### 0.8 Motion & Interaction (Supplements Section 13)

Section 13 has the correct tokens and inventory. This defines the creative intent:

Motion should feel **physical and analog**, not slick and digital. Every animation should pass the test: "Could I imagine a physical object doing this?"

- **Card hover:** Subtle lift (translateY per Section 13.2) + slightly deeper shadow. Like sliding a card forward on a table. No scale transforms.
- **Boarding pass hover:** Very subtle rotation shift (0.5–1 degree). Like nudging a physical ticket sitting on a desk.
- **Scroll reveals:** Elements enter from their natural reading direction with staggered delays. The stagger creates a sense of things being placed one-by-one, not appearing all at once.
- **Divider transitions:** Swoops and waves should feel like a physical surface curling away to reveal the next layer. The organic shapes are the key — they make section changes feel dimensional.
- **AVOID:** Parallax on backgrounds (text parallax per Section 12 is fine), elastic/bouncy easing (Section 13 already says no bounce), glassmorphism, neon glow effects, gradient mesh backgrounds, or any visual treatment that signals "modern web design trend" over "physical object with warmth."

### 0.9 ⛔ ANTI-PATTERNS — If output exhibits these, rework immediately

These are the most common failure modes when AI generates SALTY UI. Each one makes the output look like a template instead of a brand. Check every section against this list:

1. **Uniform card grids with no color variation** — Three identical cards with the same background color, same padding, same border. The SIZE can be uniform (coach cards prove this); the COLOR and accent treatment must vary.
2. **Everything centered on the page** — Hero display text centers (per Section 4.3). Beyond that, the brand is asymmetric. Left-heavy compositions, split layouts, offset elements. If every element on a page is centered, rework it.
3. **Politely contained layouts** — Every element sitting neatly inside its box, nothing overlapping, nothing breaking the 12-column grid. Too safe. Too clean. Add an overlap, let a photo bleed, push a headline wider.
4. **Flat solid-color section backgrounds with hard edges** — Background changes between sections should use the Swoop, Wave, or Double Line dividers from Section 14. Never a hard horizontal line where one color stops and another starts.
5. **Excessive whitespace with no visual tension** — The "Apple-style" approach of floating a single element in vast emptiness. SALTY is layered, warm, and energetic. Whitespace is used for breathing room between dense moments, not as the default state.
6. **Digital-looking drop shadows** — Harsh, dark, offset shadows. Section 7 defines warm neutral shadows with low opacity. Follow those values exactly.
7. **Thin or light-weight typography** — TAN Headline is bold (700) always. Roca One Light is the body weight, but it's "light" in name only — it still has warmth and presence. Nothing on the site should look wispy or delicate.
8. **Gradient backgrounds** — Linear or radial CSS gradients as section backgrounds. Not part of this visual language. Section transitions use the SVG divider system instead.
9. **Headlines that feel "comfortable"** — If the display text doesn't feel like it's almost too big, push it up one step in the type scale. TAN Headline at the `type/display` scale (48px mobile / 72px desktop) is the floor for hero text, not the ceiling.
10. **Missing graphic devices** — A coach card without a starburst badge, a retreat listing without the boarding pass treatment, a section transition without a swoop divider. These elements ARE the brand. Skipping them makes the output generic.
11. **Icon grids rendered as text lists** — Inclusions and features should use the line-art icon grid pattern, not bullet point lists. The icons add visual variety and break up text-heavy sections.
12. **Ignoring the split-layout pattern** — Defaulting to full-width centered content blocks when the design calls for asymmetric photo-bleed + text compositions.

### 0.10 Quick Decision Guide

When building any section, use this for rapid creative checks:

| Question | SALTY Answer |
|----------|-------------|
| Center this element? | Only hero display text and section headings. Everything else: left-align or offset asymmetrically. |
| Add more padding? | Less than instinct suggests. Let things get close. Density creates energy. |
| Same background color on adjacent cards? | Never. Vary colors per card (coach cards) or alternate between two colors (feature cards). |
| Make this type bigger? | Yes. If it feels reasonable, go one scale step up. |
| Contain this photo in a box? | Only with a thick colored border (physical frame metaphor). Otherwise: bleed it. |
| Should elements overlap? | Yes. At least one overlap or grid-break per major section. |
| Hard edge between sections? | Never. Use Swoop, Wave, or Double Line dividers (Section 14). |
| Animation on this element? | Only if it passes the "physical object" test. Card lift = yes. Elastic bounce = no. |
| Background for this section? | Paper White or retreat surface. Then Dark Teal. Then full-bleed photo. Almost never a secondary/accent color as a flat fill (Section 2.5 rules apply). |
| Does this section look "clean"? | Then it probably needs one more thing: an overlap, a larger headline, a starburst badge, an organic blob, or a grid-breaking photo bleed. |

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
