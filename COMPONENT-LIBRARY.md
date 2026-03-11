# SALTY Component Library

**Version:** 1.0  
**Date:** 2026-03-01  
**Applies to:** `salty-website` + `salty-lead-magnet`  
**Use with:** `DESIGN-SYSTEM-RULES.md` (Section 0 + Sections 2-31)

---

## 0) How To Use This File

- This file removes visual ambiguity at component level.
- For each Tier 1 component, follow the exact structure, measurements, states, and anti-pattern rules.
- For each Tier 2 component, apply token/state rules exactly and avoid the listed anti-pattern.
- If a component here conflicts with implementation details, this file wins for visual behavior and `DESIGN-SYSTEM-RULES.md` wins for tokens/standards.

---

## 1) Shared Baseline (All Components)

- **Typography:** TAN Headline for headings only; Roca One Light for body/UI text.
- **Surface model:** Use only defined surface tokens plus retreat variants.
- **Motion:** No bounce, no overshoot, no glass effects.
- **Shadows:** Warm neutral shadows only (`shadow/sm`, `shadow/md`, `shadow/lg`).
- **Borders:** Thick framed photos (4-8px) are a brand pattern, not an exception.
- **Asymmetry:** Every expressive section should include one overlap/offset.

---

## 2) Tier 1 Components (Art-Directed, 27)

Each block includes required fields: what, where, visual, structure, props, measurements, colors, typography, states, animation, anti-patterns, references.

---

### 2.1 Hero - Video

- **What:** Full-viewport video-led hero for homepage and major landing sections.
- **Where:** Homepage hero, campaign hero blocks.
- **Visual:** Full-bleed footage with oversized TAN Headline that feels editorial and physical.
- **Structure:** `section > video layer + content layer + optional CTA row + divider mount`.
- **Props:** `videoSrc`, `posterSrc`, `title`, `subtitle`, `primaryCta`, `secondaryCta`, `align`, `showDivider`.
- **Measurements:** Desktop `min-height: 100vh`; mobile `85vh`; content max width `1200px`; top padding aligns with fixed nav offset.
- **Colors:** Text on video uses `text/inverse`; CTA uses global primary/secondary button rules.
- **Typography:** Headline `type/display` or `type/h1` (uppercase, tight leading); body `type/body-lg`.
- **States:** Default, reduced-motion (poster only), low-bandwidth fallback.
- **Animation:** Hero fade-out on scroll; text parallax only (no background parallax).
- **Anti-patterns:** Over-dark gradient overlays; tiny centered headline; boxed video.
- **References:** DS Sections 0.2, 0.7, 12, 13, 14.

### 2.2 Hero - Image (Retreat)

- **What:** Retreat detail hero using full-bleed image and retreat ticket language.
- **Where:** `retreats/[slug]` pages.
- **Visual:** Bold destination identity with retreat-aware palette and overlapping metadata.
- **Structure:** `section > image layer + retreat ticket + title stack + CTA stack + stats badges`.
- **Props:** `retreatSlug`, `imageSrc`, `dates`, `priceFrom`, `spots`, `ctaPrimary`, `ctaSecondary`.
- **Measurements:** Desktop `100vh`; mobile `75vh`; ticket top-left; CTA cluster upper-right; title stack lower-left quadrant.
- **Colors:** `retreat/primary`, `retreat/accent`, `retreat/text-on-primary`, `retreat/dark`.
- **Typography:** Destination wordmark in TAN Headline, metadata in Roca.
- **States:** Default; image fallback; sold-out overlay state.
- **Animation:** Entry reveal + subtle content stagger; no zoom-heavy hero effects.
- **Anti-patterns:** Generic centered text over dark gradient; missing ticket; no retreat color mapping.
- **References:** DS Sections 2.7, 11, 12, 22.

### 2.3 Navigation / Header

- **What:** Global nav with transparent-to-solid and scroll direction behavior.
- **Where:** All pages.
- **Visual:** Quiet-but-strong top rail that adapts by page context.
- **Structure:** `header > logo + nav links + CTA + retreats dropdown + mobile trigger`.
- **Props:** `retreatDark?`, `retreatAccent?`, `retreats[]`.
- **Measurements:** Height `72-84px`; sticky at top; mobile tray full-height right drawer.
- **Colors:** Global uses `surface/dark`; retreat pages use `retreat/dark`.
- **Typography:** Link labels in Roca, logo/brand mark treatment as defined in layout components.
- **States:** Transparent, scrolled solid, hidden-on-scroll-down, focus-visible, mobile open.
- **Animation:** 250ms color/shadow transition; slide-up hide/show; drawer slide-in.
- **Anti-patterns:** Always-solid nav; no hide-on-scroll behavior; mismatched retreat colors.
- **References:** DS Sections 11, 13, 8.

### 2.4 Footer

- **What:** Multi-column brand footer with retreat/tool/legal blocks.
- **Where:** All pages.
- **Visual:** Deep anchored surface with warmth and utility.
- **Structure:** `footer > brand + retreats + explore + tools + legal + subfooter`.
- **Props:** `retreats[]`, `instagram`, `tiktok`.
- **Measurements:** Desktop 5-column; mobile 2-column collapse; generous top padding.
- **Colors:** `surface/dark-deep` base, `text/inverse` primary, warm accent links on hover.
- **Typography:** Section labels TAN Headline small; links/body in Roca.
- **States:** Default, hover, focus-visible.
- **Animation:** Minimal (link color transition only).
- **Anti-patterns:** Light footer backgrounds; crowded single-column text dump.
- **References:** DS Sections 2, 4, 9.

### 2.5 Retreat Card - Large

- **What:** Signature boarding-pass retreat card for grid/listing contexts.
- **Where:** Homepage retreats, retreats hub, booking hubs.
- **Visual:** Physical ticket metaphor with strong retreat color identity.
- **Structure:** `card > image frame + ticket badge + status badge + content pane + vibe toggle`.
- **Props:** `retreat`, `dates`, `price`, `totalDays`, `badge`, `discountPrice`, `showMeter`, `saltyMeterScores`.
- **Measurements:** Desktop width ~376px in 3-col grid; image ratio 3:4; card radius 16.
- **Colors:** Card surface from retreat accent; ticket from retreat primary.
- **Typography:** TAN for destination labels; Roca for dates/price.
- **States:** Default, hover, focus-visible, sold-out, early-bird.
- **Animation:** Hover lift `-3px`, shadow sm->md, optional slight image scale.
- **Anti-patterns:** Flat generic card with no ticket motif; same color for all retreats.
- **References:** DS Sections 0.4, 6, 7, 22.

### 2.6 Retreat Card - Medium

- **What:** Carousel variant of the large retreat card.
- **Where:** Retreat carousels, recommendation rails.
- **Visual:** Same metaphor, reduced copy density.
- **Structure:** Same as large, with compact content block.
- **Props:** Same as large + `size="medium"`.
- **Measurements:** Width `280-320px`, image still portrait-dominant.
- **Colors:** Same retreat token mapping.
- **Typography:** TAN `h4` / Roca `body-sm`.
- **States:** Default, hover, focus, sold-out.
- **Animation:** Carousel snapping + card hover.
- **Anti-patterns:** New visual language diverging from large card.
- **References:** DS Sections 9, 13, 22.

### 2.7 Retreat Card - Small

- **What:** Compact retreat card for mobile and dense lists.
- **Where:** Mobile retreat lists, drawer selections.
- **Visual:** Quick-scan boarding pass slice with vibe trigger.
- **Structure:** `horizontal card > image thumb + destination + date + price + vibe button`.
- **Props:** Same as large + `size="small"`.
- **Measurements:** Height ~120px; thumb 1:1; touch targets >=44px.
- **Colors:** Retreat accent background, text with retreat text-on-primary.
- **Typography:** TAN for name, Roca for metadata.
- **States:** Default, hover/tap, selected, sold-out.
- **Animation:** Minimal hover lift; mobile tap opens modal SALTY meter.
- **Anti-patterns:** Tiny text; missing vibe trigger; generic row card style.
- **References:** DS Sections 4, 5, 22.

### 2.8 Coach Card

- **What:** Equal-size profile card with unique per-coach color system.
- **Where:** About page, retreat coach sections.
- **Visual:** Color-varied framed photo + starburst name + specialty bar personality.
- **Structure:** `card > framed photo + starburst name + specialty bar + hover bio surface`.
- **Props:** `name`, `bio`, `photoUrl`, `specialties[]`, `personality`, `cardColor`, `size`.
- **Measurements:** Desktop equal grid cards; frame 6-8px; starburst overlap top-left offset.
- **Colors:** Every coach assigned unique accent; never repeated adjacent colors.
- **Typography:** TAN for name/specialties; Roca for bio/personality descriptor.
- **States:** Default, hover (bio reveal), tap modal on mobile, focus.
- **Animation:** Overlay reveal 250-300ms; no dramatic scaling.
- **Anti-patterns:** Mixed card sizes; same color across coaches; no starburst overlap.
- **References:** DS Sections 0.5, 6, 9, 25.

### 2.9 Testimonial Card / Quote

- **What:** Emotion-led quote card with photo and highlighted quote treatment.
- **Where:** Testimonials sections on homepage, retreat page, reviews.
- **Visual:** Candid photo + marker/highlight quote language + warm credibility.
- **Structure:** `card > star row + quote + guest name + retreat label + avatar/photo`.
- **Props:** `guestName`, `quote`, `rating`, `retreatLabel`, `avatarUrl`, `surface`.
- **Measurements:** Standard card radius 16; quote area visually dominant.
- **Colors:** Surface-based text mapping (`base`, `warm-light`, `dark-raised`).
- **Typography:** TAN for key phrase accents/headline snippets; Roca for quote body.
- **States:** Default, hover, dark-surface variant.
- **Animation:** Subtle reveal, no noisy effects.
- **Anti-patterns:** Corporate quote cards; generic grayscale avatar-only layout.
- **References:** DS Sections 0.4, 4, 7.

### 2.10 Accommodation Card (Tabbed)

- **What:** Accommodation browser with tabs + carousel + room detail.
- **Where:** Retreat detail accommodation sections.
- **Visual:** Structured informational mode with retreat accent tabs.
- **Structure:** `section > tablist + panel + carousel + room meta + pricing`.
- **Props:** `rooms[]`, `retreatAccent`, `defaultTab`, `onRoomSelect`.
- **Measurements:** Desktop split panel; mobile stacked with horizontal tab pills.
- **Colors:** Active tab uses retreat accent; inactive uses warm neutrals.
- **Typography:** TAN for section/tab labels, Roca for room details.
- **States:** Tab active/inactive, image loading, sold-out room.
- **Animation:** Tab panel fade/slide 200ms.
- **Anti-patterns:** Browser-default tabs; no retreat-aware colors.
- **References:** DS Sections 9, 10, 27.

### 2.11 Interactive Daily Itinerary

- **What:** Day-by-day horizontal itinerary with modal expansion.
- **Where:** Retreat detail itinerary sections.
- **Visual:** Framed day cards with tactile travel-journal feel.
- **Structure:** `scroller > day card (photo + title + bullets + expand action)`.
- **Props:** `days[]`, `retreatColor`, `onOpenDay`.
- **Measurements:** Card widths tuned for horizontal swipe; framed images 4px border.
- **Colors:** Retreat accent + warm secondary surfaces.
- **Typography:** TAN for day labels, Roca for itinerary details.
- **States:** Default, active day, expanded modal.
- **Animation:** Horizontal snap + modal enter.
- **Anti-patterns:** Plain text timeline list; no images/frame treatment.
- **References:** DS Sections 6, 9, 10, 27.

### 2.12 SALTY Meter

- **What:** Bespoke radar/hex chart for retreat vibe dimensions.
- **Where:** Retreat pages, cards (overlay), modal detail, quiz contexts.
- **Visual:** Distinct branded data visual, never generic chart library styling.
- **Structure:** `chart canvas/svg + dimension labels + value metadata`.
- **Props:** `scores`, `fillColor`, `onClose`, `onDark`.
- **Measurements:** Primary chart radius based on 6 dimensions; readable labels at all breakpoints.
- **Colors:** Fill from retreat accent/global coral; grid neutral.
- **Typography:** Roca labels, TAN optional heading.
- **States:** Full display, overlay display, modal display.
- **Animation:** Optional path draw/fade; respect reduced motion.
- **Anti-patterns:** Off-the-shelf radar chart theme; hard-to-read tiny labels.
- **References:** DS Sections 2.6, 13, 28.

### 2.13 Button

- **What:** Pill CTA system for global and retreat contexts.
- **Where:** All pages/components.
- **Visual:** Warm, tactile, prominent without looking SaaS-like.
- **Structure:** Single component with `variant` and `size`.
- **Props:** `variant`, `size`, `retreatAccent`, `retreatSecondary`, `invertText`, `fullWidth`.
- **Measurements:** `sm 36`, `md 44`, `lg 52` heights.
- **Colors:** Global and retreat mappings per DS section 3.
- **Typography:** Roca bold 16/18.
- **States:** Default, hover, active, disabled, focus-visible.
- **Animation:** 200ms color + shadow + slight lift.
- **Anti-patterns:** Square corners; tiny text; hard black shadows.
- **References:** DS Sections 3, 6, 7.

### 2.14 Badge / Status Tag

- **What:** Status labels used over cards and photos.
- **Where:** Retreat cards, promos, availability states.
- **Visual:** High-contrast pill/sticker overlays.
- **Structure:** `badge text + optional struck original price`.
- **Props:** `variant: selling-fast|sold-out|new-trip|early-bird`, `originalPrice`.
- **Measurements:** Pill radius full; min tap size when interactive.
- **Colors:** Variant token mapping: coral/rust/sky/golden.
- **Typography:** Roca bold label.
- **States:** Default, early-bird with strike-through.
- **Animation:** Optional tiny entrance fade.
- **Anti-patterns:** Neutral gray tags; unbranded default badges.
- **References:** DS Sections 2, 4, 23.

### 2.15 Divider - Swoop

- **What:** Major section transition divider.
- **Where:** Hero exits, dark-to-light transitions.
- **Visual:** Full-width organic curve with directional intent.
- **Structure:** SVG path component with `direction` and `color`.
- **Props:** `color`, `direction`, `height`.
- **Measurements:** Height `48-64px`.
- **Colors:** Pull from section color relationship.
- **Typography:** N/A.
- **States:** Left/right variants.
- **Animation:** Static by default.
- **Anti-patterns:** Hard horizontal section cuts.
- **References:** DS Section 14.

### 2.16 Divider - Wave

- **What:** Minor section transition divider.
- **Where:** Light-light or subtle transitions.
- **Visual:** Gentle undulating arc.
- **Structure:** SVG wave component.
- **Props:** `color`, `height`.
- **Measurements:** `24-32px` height typical.
- **Colors:** Should harmonize above/below surfaces.
- **States:** Single variant with color overrides.
- **Animation:** Static.
- **Anti-patterns:** Replacing major swoop transitions where stronger cut is needed.
- **References:** DS Section 14.

### 2.17 Divider - Double Lines

- **What:** Accent punctuation divider for key moments.
- **Where:** Before pricing/stats/testimonials.
- **Visual:** Two parallel thick lines.
- **Structure:** `line top + line bottom`.
- **Props:** `topColor`, `bottomColor`.
- **Measurements:** 6px lines, 4-8px gap.
- **Colors:** Inversion principle (top from below, bottom from above).
- **States:** Color variants only.
- **Animation:** Static.
- **Anti-patterns:** More than 2 uses per page.
- **References:** DS Section 14.

### 2.18 Divider - Angle

- **What:** Sharp diagonal transition divider.
- **Where:** High-energy transitions, especially expressive sections.
- **Visual:** Linear diagonal cut alternative to swoop.
- **Structure:** SVG polygon/clip path with direction control.
- **Props:** `color`, `direction`, `height`.
- **Measurements:** `40-64px` height.
- **Colors:** Same transition logic as swoop.
- **States:** Left-to-right / right-to-left.
- **Animation:** Static.
- **Anti-patterns:** Jagged low-quality CSS hacks with aliasing artifacts.
- **References:** DS Section 14 (to be added as implementation).

### 2.19 Carousel

- **What:** Shared horizontal carousel engine.
- **Where:** Retreat cards, accommodation media, galleries.
- **Visual:** Snappy but calm; tactile nav controls.
- **Structure:** `scroll container + optional arrows + optional dots`.
- **Props:** `children[]`, `snap`, `showDots`, `showArrows`, `gap`.
- **Measurements:** Gap default 24; arrow controls 40x40.
- **Colors:** Controls on paper-white with teal icon.
- **Typography:** Dot labels if needed use Roca.
- **States:** Start/mid/end, disabled arrows, active dot.
- **Animation:** Smooth scroll behavior.
- **Anti-patterns:** Auto-play carousels with no user control.
- **References:** DS Sections 9, 13.

### 2.20 Inclusions Section

- **What:** Included vs not-included presentation with icon-driven cards.
- **Where:** Retreat detail pages.
- **Visual:** Informational mode with brand line-art icons and alternating cards.
- **Structure:** `section > heading + 2-column included/not included + list rows`.
- **Props:** `included[]`, `notIncluded[]`.
- **Measurements:** 2-column desktop, single column mobile.
- **Colors:** Retreat-aware accents, no generic gray iconography.
- **Typography:** TAN labels + Roca detail text.
- **States:** Optional expand/collapse sections.
- **Animation:** Light accordion transitions.
- **Anti-patterns:** Plain bullet dump with no icon/structure.
- **References:** DS Sections 0.6, 27.

### 2.21 Section Wrapper

- **What:** Surface container component that enforces section rhythm.
- **Where:** All page templates.
- **Visual:** Material-like transitions across six surface variants.
- **Structure:** `SectionWrapper` around each major section.
- **Props:** `surface`, `dividerTop`, `dividerBottom`, `contentWidth`, `py`.
- **Measurements:** Section y spacing 48 mobile / 96 desktop.
- **Colors:** `base`, `warm-light`, `warm`, `dark`, `dark-raised`, `dark-deep`, plus retreat surface.
- **Typography:** Inherits, but enforces color pairing.
- **States:** Optional dark/inverse mode.
- **Animation:** N/A.
- **Anti-patterns:** Free-form section colors outside token system.
- **References:** DS Sections 2.3, 5.2, 14.

### 2.22 Photo Frame / Bordered Image

- **What:** Reusable framed image treatment.
- **Where:** Coach cards, itinerary cards, feature photos.
- **Visual:** Printed-photo frame feel with strong color border.
- **Structure:** `frame wrapper + image + optional rotation`.
- **Props:** `src`, `alt`, `borderColor`, `borderWidth`, `radius`, `rotation`.
- **Measurements:** Border width 4-8px depending context.
- **Colors:** Retreat/coach accent or brand primary.
- **Typography:** N/A.
- **States:** Hover slight lift for interactive frames.
- **Animation:** Optional tiny rotate/scale on hover.
- **Anti-patterns:** Bare unframed rectangular images everywhere.
- **References:** DS Sections 6, 26.

### 2.23 FAQ / Accordion

- **What:** Shared FAQ component with schema support.
- **Where:** Homepage teaser, retreat pages, FAQ pages.
- **Visual:** Clean informational with warm, on-brand typography.
- **Structure:** `accordion > item > trigger + panel`.
- **Props:** `items[]`, `schema`, `variant(global|retreat)`.
- **Measurements:** Comfortable tap targets >=44px.
- **Colors:** Global and retreat variants.
- **Typography:** TAN labels for categories, Roca Q/A text.
- **States:** Collapsed/expanded/focus.
- **Animation:** 200ms expand.
- **Anti-patterns:** Browser-default accordion styling.
- **References:** DS Sections 13, 30.

### 2.24 Stat / Counter Block

- **What:** High-impact numeric credibility blocks.
- **Where:** Homepage, about, fitness pillar.
- **Visual:** Big TAN Headline numerals + concise labels.
- **Structure:** `stat grid > value + label`.
- **Props:** `stats[]`, `animateOnView`, `surface`.
- **Measurements:** 2x2 or 4-col depending page.
- **Colors:** Numbers can use coral/golden on dark or teal on light.
- **Typography:** TAN for values, Roca for labels.
- **States:** Static vs animated count-up.
- **Animation:** Viewport-triggered count animation.
- **Anti-patterns:** Tiny KPI cards with generic dashboard style.
- **References:** DS Sections 4, 13.

### 2.25 Marquee Ticker

- **What:** Full-width horizontal moving text break.
- **Where:** Hybrid section transitions.
- **Visual:** High-energy editorial strip in TAN Headline.
- **Structure:** `overflow row + repeated text nodes`.
- **Props:** `items[]`, `speed`, `direction`, `surface`.
- **Measurements:** Full viewport width; single-line high-contrast strip.
- **Colors:** Strong contrast pairings only.
- **Typography:** TAN Headline uppercase.
- **States:** Reduced motion fallback static.
- **Animation:** Continuous linear marquee.
- **Anti-patterns:** Tiny unreadable text; jittery keyframes.
- **References:** DS Sections 0.2, 13.

### 2.26 Starburst Badge (Standalone)

- **What:** Reusable irregular jagged badge primitive.
- **Where:** Coach cards, promos, early-bird callouts.
- **Visual:** Hand-cut tactile badge overlapping key elements.
- **Structure:** `svg/clip-path shape + centered text`.
- **Props:** `text`, `bgColor`, `textColor`, `size`, `rotation`, `pointsVariant`.
- **Measurements:** Common sizes 72/96/120.
- **Colors:** Coral/golden/teal combinations.
- **Typography:** TAN or Roca bold depending density.
- **States:** Static; optional pulse-in on mount.
- **Animation:** Very subtle wobble optional; no constant spinning.
- **Anti-patterns:** Perfect geometric star icons with no irregularity.
- **References:** DS Section 0.4.

### 2.27 Boarding Pass / Ticket Card (Primitive)

- **What:** Primitive visual card for ticket metaphor independent of retreat card wrapper.
- **Where:** Retreat listings, campaign modules, schedule cards.
- **Visual:** Barcode strip, perforated notches, QR placeholder, icon, tagline.
- **Structure:** `left barcode rail + body + right utility zone`.
- **Props:** `title`, `subtitle`, `dates`, `tagline`, `colorMode`, `showQr`, `showPlane`.
- **Measurements:** Horizontal ratio ~3:1; notch radius ~8-12; barcode rail 12-20%.
- **Colors:** Destination/retreat-specific color variants.
- **Typography:** TAN title + Roca metadata.
- **States:** Default, hover, sold-out variant.
- **Animation:** Slight rotational nudge on hover.
- **Anti-patterns:** Flat rectangular promo cards missing ticket anatomy.
- **References:** DS Sections 0.4, 22.

---

## 3) Tier 2 Components (Brand-Tinted, 23)

Each block: token rules + states + one anti-pattern.

### 3.1 Icon / Activity Tag Pill
- Use pill radius full; icon+label inline.
- Map activity to predefined accent color table.
- Label uses Roca `type/label`.
- States: default, active, disabled.
- **Anti-pattern:** gray chips with no icon mapping.

### 3.2 Avatar
- Sizes: 32 / 48 / 64.
- Circle crop; fallback uses sand background + initials in teal.
- Optional status ring in accent color.
- States: default, loading skeleton.
- **Anti-pattern:** square avatars or random fallback colors.

### 3.3 Input Field
- Border states: default sand 1px, focus teal 2px, error coral 2px.
- Label + helper + error text all Roca.
- Height min 44 for touch.
- States: default/focus/filled/error/disabled/success.
- **Anti-pattern:** browser default blue focus + mismatched border colors.

### 3.4 Tooltip
- `surface/dark-raised` with paper-white text.
- Radius `md`; compact padding.
- Trigger supports hover + focus.
- States: top/bottom positioning.
- **Anti-pattern:** white tooltip with drop shadow.

### 3.5 Modal / Dialog
- Backdrop darkened; panel radius xl.
- Close via X, ESC, backdrop click.
- Focus trap required.
- States: default, destructive confirm, mobile drawer style.
- **Anti-pattern:** non-modal overlays that allow background interaction.

### 3.6 Toast Notification
- Placement: mobile bottom-center, desktop bottom-right.
- Variants: success/error/info/warning using semantic tokens.
- Auto-dismiss 4s; pause on hover.
- States: entering, visible, exiting.
- **Anti-pattern:** top-center intrusive toasts with generic colors.

### 3.7 Drawer / Tray
- Right-side slide for mobile navigation and filters.
- Surface uses `surface/dark` or `retreat/dark`.
- Include overlay and close affordance.
- States: closed/open/closing.
- **Anti-pattern:** drawer without backdrop/focus management.

### 3.8 Empty State
- Include illustration or icon, headline, helper, recovery CTA.
- Warm surfaces only (`base` or `warm-light`).
- Tone: encouraging, not error-like.
- States: generic/no-results/no-bookmarks.
- **Anti-pattern:** sterile gray empty box.

### 3.9 Error State
- Inline and full-page variants.
- Use coral fill accents, not only red text.
- Provide clear action path.
- States: retry, fallback contact.
- **Anti-pattern:** tiny red text under fields only.

### 3.10 Success State
- Aquamarine primary indicator with teal text.
- Optional check icon.
- Inline + full-page.
- States: transient/persistent.
- **Anti-pattern:** same visual as info state.

### 3.11 Loading / Skeleton
- Skeleton base sand with warm shimmer.
- Match eventual content shape.
- Avoid generic gray.
- States: static for reduced motion.
- **Anti-pattern:** spinner-only loading for complex cards.

### 3.12 Sold Out State
- Keep retreat card visually rich; do not grayscale.
- Overlay sold-out badge + waitlist CTA.
- Preserve social proof value.
- States: sold-out + waitlist-open.
- **Anti-pattern:** dimmed unusable card that removes context.

### 3.13 Spinner / Loader
- Brand-colored indicator; optional salt-shaker motif.
- Sized for inline and full-screen use.
- Reduced motion fallback static.
- States: default/inverse.
- **Anti-pattern:** OS default spinner style.

### 3.14 Inclusions / Exclusions Accordion
- Two panels: Included / Not Included.
- Icon + label + optional detail.
- Retreat page only by default.
- States: collapsed/expanded.
- **Anti-pattern:** single undifferentiated checklist.

### 3.15 Price Comparison Row
- Show DIY vs SALTY delta clearly.
- Use strong value emphasis and confidence labels.
- Keep legal notes and assumptions visible.
- States: collapsed summary vs expanded breakdown.
- **Anti-pattern:** hidden math with no source assumptions.

### 3.16 Iconography Library
- Single stroke style, rounded endings.
- Colored by context (retreat accent, rust red, paper white on dark).
- Include 24x24 and 32x32 baseline exports.
- States: default/inverse.
- **Anti-pattern:** mixed icon packs from multiple styles.

### 3.17 Separator / Horizontal Rule
- Thin in-section separator distinct from decorative dividers.
- Use brand token colors with low contrast.
- Vertical rhythm around separator must be explicit.
- States: light and dark versions.
- **Anti-pattern:** using `<hr>` default browser styling.

### 3.18 Link
- Light surfaces: teal; dark surfaces: sand.
- Underline default; hover can shift to golden on dark.
- Focus-visible ring required.
- States: default/hover/visited/focus.
- **Anti-pattern:** button-styled links for all text links.

### 3.19 Heading
- Wrapper component for TAN Headline tiers (h1-h5).
- Enforce uppercase and spacing rules.
- Optional retreat-aware color prop.
- States: default and inverse.
- **Anti-pattern:** direct hardcoded heading styles across pages.

### 3.20 Popover
- Extends tooltip for richer interactive content.
- Uses `surface/dark-raised`, radius md/lg.
- Keyboard dismiss and outside click required.
- States: closed/open/anchored positions.
- **Anti-pattern:** modal behavior masquerading as popover.

### 3.21 Tabs
- Mobile: horizontal pill row; desktop: full tab rail.
- Active tab uses retreat accent or coral.
- Include panel ARIA wiring.
- States: active/inactive/disabled.
- **Anti-pattern:** tab labels without clear active indicator.

### 3.22 Search Input
- Input style follows field rules + leading search icon.
- Optional clear button and filter trigger.
- Used for retreat filters and flight finder.
- States: idle/typing/results-empty/error.
- **Anti-pattern:** generic browser search style with no brand tokens.

### 3.23 Pagination
- Numeric page pills with prev/next.
- Active page high contrast using brand accent.
- Ensure large touch targets on mobile.
- States: active/disabled/ellipsis.
- **Anti-pattern:** tiny text-only pagination links.

---

## 4) Implementation Cross-Reference (Current Codebase)

Legend:  
- **Good** = close to spec, keep and refine incrementally.  
- **Adjust** = implemented but needs visual/behavior upgrades to match this library.  
- **Missing** = create net-new component.

### 4.1 Tier 1 Assessment

| Component | Current files | Status | Action |
|---|---|---|---|
| Hero - Video | `src/components/retreat/VideoHero.tsx`, `CinematicHero.tsx`, `sections/HomepageHero.tsx` | Adjust | Normalize overlay/scale and Section 0 expressive behavior. |
| Hero - Image (Retreat) | `src/components/sections/RetreatHero.tsx` | Adjust | Enforce ticket/content placement consistency across retreats. |
| Navigation/Header | `src/components/layout/Navbar.tsx`, `MobileMenu.tsx` | Good | Keep; tighten retreat mode + active marker behavior. |
| Footer | `src/components/layout/Footer.tsx` | Good | Keep; validate retreat-aware variants where needed. |
| Retreat Cards L/M/S | `src/components/shared/RetreatCard.tsx` | Good | Keep; ensure medium spec parity and hover micro-interactions. |
| Coach Card | `src/components/shared/CoachCard.tsx` | Adjust | Strengthen strict equal sizing + color assignment map. |
| Testimonial Card | `src/components/shared/TestimonialCard.tsx` | Adjust | Add richer highlighted quote/overlap variants. |
| Accommodation Card (Tabbed) | `src/components/retreat/AccommodationTabs.tsx`, `AccommodationBrowser.tsx` | Good | Keep; unify tabs behavior with tier-2 Tabs primitive. |
| Daily Itinerary | `src/components/retreat/ItineraryScroll.tsx`, `ScrollOverItinerary.tsx` | Good | Keep; ensure framed-photo border consistency. |
| SALTY Meter | `src/components/shared/SaltyMeter.tsx` | Good | Keep; add formal display-mode prop contract. |
| Button | `src/components/shared/Button.tsx` | Good | Keep; only tune hover semantics where needed. |
| Badge/Status Tag | `src/components/shared/StatusBadge.tsx` | Good | Keep; add activity pill variant separately. |
| Swoop/Wave/Double divider | `src/components/layout/*.tsx` | Good | Keep; add Angle divider as net-new. |
| Divider - Angle | N/A | Missing | Build new `AngleDivider.tsx`. |
| Carousel | `src/components/shared/Carousel.tsx` | Good | Keep. |
| Inclusions Section | `src/components/retreat/InclusionsSection.tsx` | Good | Keep; add icon set completeness. |
| Section Wrapper | Pattern only | Missing | Add `SectionWrapper.tsx`. |
| Photo Frame / Bordered Image | Embedded patterns only | Missing | Add `PhotoFrame.tsx`. |
| FAQ/Accordion | `src/components/shared/FAQAccordion.tsx` | Good | Keep. |
| Stat/Counter | `src/components/shared/StatBar.tsx`, `retreat/CounterStats.tsx` | Adjust | Create one canonical API + count animation option. |
| Marquee Ticker | `src/components/retreat/MarqueeTicker.tsx` | Good | Keep. |
| Starburst Badge | Embedded in `CoachCard`/`RetreatCard` | Missing (standalone) | Add shared `StarburstBadge.tsx`. |
| Boarding Pass/Ticket Primitive | `src/components/retreat/RetreatTicket.tsx` | Adjust | Keep per-retreat SVG but add reusable primitive wrapper. |

### 4.2 Tier 2 Assessment

| Component | Website status | Lead-magnet status | Action |
|---|---|---|---|
| Icon/Activity Tag Pill | Missing | Missing | Build shared primitive. |
| Avatar | Missing | Missing | Build shared primitive. |
| Input Field | Missing canonical | Missing canonical | Build shared `InputField`. |
| Tooltip | Built | Missing | Port website implementation. |
| Modal/Dialog | Built | Built (specific modals) | Normalize shared API. |
| Toast | Missing | Missing | Build once and reuse both apps. |
| Drawer/Tray | Built (`MobileMenu`) | Missing general drawer | Extract shared drawer primitive. |
| Empty/Error/Success states | Missing formal primitives | Missing formal primitives | Build state components. |
| Loading/Skeleton | Built | Built (`FlightCardSkeleton`) | Normalize shared style tokens. |
| Sold Out state | Built via badge+card | N/A | Keep. |
| Spinner/Loader | Built | Missing canonical | Add shared spinner package. |
| Inclusions/Exclusions accordion | Built | N/A | Keep website-only for now. |
| Price comparison row | Partial | Built (`CostOfStayingHome`, `CostPerDay`) | Extract reusable row primitive. |
| Iconography library | Partial | Partial | Create centralized icon set. |
| Separator/Link/Heading | Partial | Partial | Build shared typography primitives. |
| Popover | Missing | Missing | Build shared primitive. |
| Tabs | Built (accommodation) | Partial | Generalize shared tabs component. |
| Search input | Missing canonical | Partial (`AirportAutocomplete`) | Build shared search input primitive. |
| Pagination | Missing | Missing | Build shared pagination primitive. |

---

## 5) Build Order Recommendation

1. **Tier 1 missing primitives:** `AngleDivider`, `SectionWrapper`, `PhotoFrame`, `StarburstBadge`.
2. **Tier 2 foundations:** `InputField`, `ActivityTagPill`, `Avatar`, `Toast`, `Popover`, `SearchInput`, `Pagination`.
3. **Unification pass:** Merge duplicate patterns into shared primitives across website + lead-magnet.
4. **QA pass:** accessibility, motion performance, metadata where page-level.

