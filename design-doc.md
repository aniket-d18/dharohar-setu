# Design doc — Dharohar Setu

## Reference (carried over)
Dark travel-site hero: fanned card carousel, bold title + tagline overlay, orange CTA. Kept the fanned-card layout and confident editorial typography. Changed: palette (heritage tones, not travel-orange), no all-caps nav, CTA copy rewritten to be active/specific.

## Color palette (unchanged — still fits)
- Night indigo `#1E2340` — background
- Parchment `#F3ECDD` — text on dark
- Marigold `#E8A33D` — primary accent / CTAs
- Deep teal `#2F6E5D` — secondary accent, links, category tags
- Brick `#B54A3A` — vitality: critical
- Sage `#7C9473` — vitality: safer (marigold doubles as "vulnerable")

## Type (unchanged)
- Headlines: Fraunces (warm serif)
- Body/UI: Work Sans
- Sentence case only, no eyebrow labels, no ALL CAPS

## What's new vs. the earlier doc
The old doc only covered Home, Browse, and a static Languages page. This version adds screens for the Atlas, multi-modal Capture, Verification Console, Record detail (museum-plaque), and Steward Console — all built on the same visual language, no new styling system introduced.

## Home
Same fanned-hero structure as before, extended:
```
[ dharohar setu   capture   atlas   archive          [capture a memory] ]

    card   card   ┌── FEATURED ──┐   card   card
                   │  Toda · Tamil Nadu │
                   │  ~800 voices left  │
                   │     [ listen ]     │
                   └────────────────────┘
```
Below the fold: live counters (records / languages / contributors), a "fading fastest" auto-rotating strip (3–5 items, brick-colored urgency chip), then the "why this matters" editorial block linking to the Atlas.

## Capture flow
Single-column wizard, one step visible at a time, thin progress dots (not a numbered stepper — keeps the museum feel, not a form-wizard feel). Media-type is chosen via three large flat icon-cards (Audio / Video / Image / Text) rather than a dropdown. Waveform/preview uses marigold on indigo, matching the hero card accents.

## Atlas (new)
Full-bleed map, indigo base with region fills in brick/marigold/sage by vitality. Side panel slides in from the right on region click — same card frame as Browse cards, no shadow, 1px marigold-tinted border. Layer toggle (Language / Craft / Density) as a small pill switcher, top-left of the map, teal accent on active state.

## Browse / Archive (unchanged from before)
Same card shape as hero: flat, 1px marigold-tinted border, no drop shadow. 2-column grid on mobile. Card shows photo/thumbnail or waveform placeholder, teal category tag, region, play icon. Media-type icon added top-right corner of the card (small, quiet).

## Record detail — "museum plaque" (new, named in the PRD, spec'd here)
Treat the page like a museum object label: large title (Fraunces), a thin horizontal rule, then metadata in a two-column key–value layout (region / category / contributor / date) in Work Sans, small caps disabled — sentence case throughout. Media player sits above the plaque, full-width, no card border (it's the "artifact," not a card). Verification badge as a small pill (unverified = parchment outline, community-verified = teal fill, steward-endorsed = marigold fill, expert-reviewed = brick fill — deliberately not "green = good," since this is a trust spectrum, not a pass/fail).

## Verification Console (new)
Two-pane layout: queue list on the left (compact rows, urgency-sorted, brick dot for oldest/highest-priority), detail+player on the right. Correct/Edit/Dispute as three flat text-buttons (not colored buttons) under the AI draft text, keeping the page calm — this is a workspace, not a marketing surface.

## Steward Console (new, light)
Same visual system as Verification Console but read-mostly: a region summary header (vitality bar, record count, gap flag if a critically-endangered pocket has zero records) above a simplified activity list. No new components — reuses the horizontal vitality bar from the Atlas panel.

## CTA copy (unchanged principle, extended)
Active, specific: "Capture a memory," "Listen," "Save recording," "Review this clip," "Endorse region." Never "Submit," "View," "Get started."

## Principles (unchanged)
1. One bold moment: the fanned hero. Every other screen stays quiet and flat.
2. Dusk palette is deliberate — matches when this content is traditionally shared.
3. No generic SaaS chrome: no card shadows, no all-caps nav, no numbered badges, no green-means-good status colors.
