# Full-Screen Particle Composition Revision — Design Specification

Date: 2026-10-27
Branch: `feature/3d-data-portfolio`
Status: Visual direction, written specification, and manual-trace amendment approved by the user on 2026-10-27

## Purpose

Revise the existing four-chapter immersive portfolio so the particle subject fills more of the viewport, the opening figure becomes a bottom-anchored half-body portrait, and the India chapter uses the outer national silhouette from the user-supplied `Indiamap.pdf`.

This revision replaces the earlier full-body, lower-left-name, and Natural Earth map decisions. It does not replace the approved four-chapter information architecture or the existing professional content.

## Approved decisions

- Increase particle coverage through responsive, per-chapter framing rather than one indiscriminate global zoom.
- Open with a stylized half-body boy: head, torso, and arms only, with no legs, feet, or shoes.
- Anchor the portrait at the bottom of the viewport so the lower torso continues beyond the bottom edge.
- Move `Akshant Kumar` to a horizontally centered position near the top of the hero composition, below the fixed header's safe area.
- Use a manually cleaned outer-contour trace of the main India map, approved on 2026-10-27 after source inspection showed that automatic vector/raster extraction could not reliably exclude map artifacts.
- Use no internal state borders, labels, roads, photographs, or page inset in the particle map.
- Retain a restrained particle fill inside the outer silhouette for three-dimensional depth.
- Preserve four chapters, 20,000 main particles, at most 1,200 ambient particles, cyan/violet accents, real portfolio facts, native scrolling, accessibility, and the editable root scene.

## Non-goals

- No photorealistic portrait or claim that the procedural boy is Akshant’s exact likeness.
- No copied reference-site model, source, assets, text, or exact layout.
- No political map labels, employer-location markers, or inference of employer offices from the India visual.
- No additional chapters, long copy blocks, scroll hijacking, sound, or autoplay carousel.
- No production merge, deployment, or GitHub Pages change.
- No public-domain or open-license claim for the supplied PDF; its redistribution license has not been established.

## Composition and scale

The fixed WebGL canvas remains `100vw × 100svh`. Each chapter receives its own responsive scale and vertical offset, calculated from viewport and camera constraints. A single scale multiplier for every chapter is explicitly rejected because the portrait, map, constellation, and portal have different aspect ratios and text safe zones.

The subject should occupy most of the available central stage, with atmospheric particles extending beyond it. Coverage is judged from projected, visible bounds at the review viewports rather than from an arbitrary model-space size.

| Chapter | Revised particle composition | HTML composition |
| --- | --- | --- |
| Boy | Large half-body figure rising from the bottom edge; head, torso, and raised/free arms remain readable | `Akshant Kumar` centered near the top; `Data Engineer` remains a compact edge label; minimal scroll cue |
| India | Enlarged north-up map with a brighter outer contour and restrained interior depth particles | `Based in India`, `7+ years`, and concise experience entries surround the map without covering its recognizable outline |
| Skills | Larger central data constellation, scaled independently from the map | Four category controls remain around the perimeter; only the selected group’s tools are shown |
| Contact | Larger deep particle portal with a clear central opening | Centered closing statement and existing email/GitHub actions remain unobstructed |

No essential text may be hidden behind particles. Intentional cropping is limited to the hero’s lower torso at the bottom edge and atmospheric particles beyond the viewport.

## Half-body hero

### Geometry

- Remove the upper-leg, lower-leg, foot, and shoe generators and their particle-region assignments.
- Retain the head/hair, neck, torso/waist, raised arm, free arm, and hands.
- Redistribute the former leg-particle allocation across the retained forms so the total remains exactly 20,000 across the shared subject buffer.
- Preserve enough torso density and shoulder/arm separation to read as a half-body person rather than a disconnected head or stick figure.
- Keep geometry original, procedural, deterministic, and three-dimensional.

### Bottom anchor

- Define the portrait’s framing from its visible head and torso bounds, not from deleted leg bounds.
- Position the lower torso at or slightly below the viewport’s bottom edge at the hero’s resting chapter position.
- Keep the head clear of the top-centered name and fixed header at both review viewports.
- Breathing, raised-hand motion, free-arm motion, head tracking, and pointer scattering may remain subtle, but none may reveal legs or move the entire torso away from its intended bottom anchor.
- During morphs to other chapters, normal curved particle travel remains available; the bottom-anchor constraint applies to the assembled hero, not every transitional particle.

### Name lockup

- Use one semantic `h1` containing `Akshant Kumar`, horizontally centered near the top of the hero.
- Place it below the fixed header’s occupied safe area rather than at viewport coordinate zero.
- Desktop and narrow-screen rules must both preserve top-center placement; no media query may restore the previous lower-left positioning.
- The heading may scale or wrap as a unit on narrow screens, but its alignment remains centered.
- Remove no professional content other than visual duplication created by the layout change.

## India outline from the supplied PDF

### Source and provenance

- Source: user-supplied `Indiamap.pdf`, copied locally to `docs/reference/Indiamap.pdf` without modifying the desktop original.
- The source is a detailed political map. Only the primary mainland national silhouette is required for this artistic particle treatment; the page’s map inset is excluded.
- Attribution must say `Derived from the user-supplied Indiamap.pdf` and note that source rights were not independently established.
- Do not retain the previous Natural Earth attribution for the revised derived geometry.
- Do not fetch a map service or third-party geometry at runtime.
- Keep the approximately 18 MB source PDF local and untracked by default. Commit the small derived coordinate asset and reproducible extraction tooling, not the source PDF, unless the user separately requests otherwise.

### Extraction workflow

1. Use the `2807 × 3974` main-map page render as the visual tracing reference; the PDF’s embedded raster artwork and rejected automatic-extraction experiments are diagnostic inputs only.
2. Manually trace one closed outer mainland polyline in SVG source coordinates. Use explicit absolute `M`, `L`, and `Z` commands with at least 80 line segments so coastal and northern features remain recognizable.
3. Exclude internal state boundaries, labels, roads, photographs, graticules, decorative frames, and the page inset. Do not use the cleaner-looking inset as a substitute for the main map.
4. Validate finite coordinates, closure, non-degenerate segments, and India aspect-ratio bounds. Flip the SVG y-down coordinates during normalization to preserve north-up/west-left orientation.
5. Generate normalized SVG and PNG contour previews and compare them with the main PDF map before using the geometry in the full scene.
6. Commit the small manual trace, derived coordinate asset, normalization tooling, and previews. Keep the source PDF local and ignored.

A human-viewable contour render and visual comparison are mandatory. No automatic candidate from the rejected extraction experiments may become the source geometry.

### Particle treatment

- Allocate a brighter subset of the existing main particles to the outer contour.
- Fill the interior lightly using only the selected outer silhouette; do not derive internal divisions from the PDF.
- Preserve subtle depth variation without tipping or rotating the map into an unreadable orientation.
- Keep the existing deterministic sampler interface where practical, with finite coordinates and no runtime network dependency.

## Responsive, motion, and accessibility behavior

- Desktop review target: `1440 × 900`.
- Mobile review target: `390 × 844`.
- Per-chapter framing must respond to viewport size and camera aspect without horizontal page overflow.
- On mobile, the portrait remains bottom anchored and the name remains top centered; surrounding experience and skill content may stack compactly as it does now.
- Native scrolling, direct anchors, shortcuts `1`–`4`, arrow-key chapter movement, touch, skill selection, experience selection, email, and GitHub links remain available.
- Reduced-motion mode continues to disable idle rigging, pointer scattering, parallax, ambient motion, and eased particle travel while preserving static chapter compositions.
- Essential content remains semantic HTML and readable when WebGL or JavaScript enhancement is unavailable.
- Preserve project id `akshant-data-universe` and artifact id `d655609d-2886-476c-9abe-f9dda9200f2a`.

## Implementation boundaries

The later implementation plan should limit changes to the revision’s concerns:

- `src/subjects/boy.js` and `src/boy-motion.js`: half-body regions, retained rigging, and portrait bounds.
- `src/data/india-outline.js`, `src/subjects/india.js`, and extraction tooling: PDF-derived outer ring and truthful provenance.
- `src/scene.js` and `src/play.js`: reusable responsive per-chapter framing, bottom anchoring, and existing motion integration.
- `index.html` and `src/styles.css`: top-centered hero name and any required safe-zone adjustments.
- `tests/`: revised half-body, map, framing, responsive, accessibility, and regression contracts.
- `src/review.js`, `src/main.js`, `src/project.js`, `README.md`, and `docs/design-brief.md`: final measured evidence and documentation only after implementation and review.

The editable root scene remains the design source; `preview/` remains the normal full-website launcher. Do not silently resume the obsolete full-body assumptions in the earlier Task 7 brief.

## Verification requirements

### Automated checks

Add or update regression coverage for:

- Exactly four chapters and 20,000 finite, deterministic particles per target.
- No leg, foot, or shoe regions or generated leg geometry in the boy.
- Retained head, torso, raised-arm, and free-arm regions with valid motion metadata.
- Hero bounds and bottom-anchor framing that keep the head clear of the name safe zone.
- Responsive per-chapter frames with finite values and no indiscriminate shared scale assumption.
- PDF-derived India ring closure, non-degenerate segments, finite coordinates, expected aspect-ratio bounds, and non-mirrored orientation.
- Outline and interior sampling using the new ring, with no runtime map fetch.
- Existing navigation, selection, reduced-motion, fallback, and editable-scene behavior.

### Visual and interaction checks

Review actual captures, when tooling is available, for every chapter at both target viewports:

- The first screen shows a recognizable half-body boy with no legs, bottom-anchored torso, and top-centered name.
- Each chapter’s central particle subject feels substantially larger than the pre-revision composition without hiding essential text.
- India is recognizably aligned with the supplied PDF’s outer silhouette and contains no labels, roads, photographs, inset, or internal state-border particle pattern.
- Skills and contact use the available central stage effectively.
- No essential content is clipped, no controls are blocked, and no horizontal overflow appears.
- Navigation, keyboard shortcuts, selections, links, reduced motion, and WebGL fallback still work.

Run the complete gate before delivery:

```bash
npm test && npm run check && npm run build && git diff --check
```

Update `src/review.js` and other verification claims only with evidence actually collected. Record unavailable checks honestly.

## Delivery

Implement only after this written specification is reviewed and a separate implementation plan is prepared. Commit intended revision files to `feature/3d-data-portfolio`, push that branch after verification, and confirm local and remote commit ids match. Leave `master` and production unchanged. Provide the normal preview path and preview link only after the revised website has been visually checked.
