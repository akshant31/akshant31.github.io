# Cinematic Editorial Refinement — Design Specification

Date: 2026-10-28
Branch: `feature/3d-data-portfolio`
Status: Visual direction and design approved by the user on 2026-10-28; written specification awaiting user review

## Purpose

Refine the existing immersive portfolio without replacing its working particle system. Correct the northern Ladakh and far-northeastern India trace and mobile overlaps, introduce cinematic typography with restrained cursive accents, add a persistent light theme with vibrant particles, animate text during chapter changes, and turn the desktop pointer into a falling-star comet.

The selected direction is **Cinematic Editorial**. Dark mode remains the default; the user explicitly selected a light-mode toggle rather than a light default or light-only website.

## Existing contracts to preserve

- Exactly four chapters: `hero`, `experience`, `skills`, and `contact`, with morph indices `0`–`3` and shortcuts `1`–`4`.
- Exactly 20,000 main particles in one Points draw call and at most 1,200 ambient particles in one additional draw call.
- Existing professional facts, contact links, semantic content, native scrolling, touch and keyboard navigation, reduced-motion behavior, WebGL fallback, and editable root scene.
- Project id `akshant-data-universe` and artifact id `d655609d-2886-476c-9abe-f9dda9200f2a`.
- The bottom-anchored half-body portrait, top-centered name, responsive per-chapter framing, and existing particle morphs.
- Feature-branch delivery only: no merge, deployment, GitHub Pages change, or modification of `master`.

## Non-goals

- No replacement of the particle engine, new chapters, long copy, scroll hijacking, sound, or autoplay carousel.
- No photorealistic portrait, copied reference-site assets, internal Indian state borders, map labels, roads, photographs, or page inset.
- No cursive body text, animation of essential facts into inaccessibility, or custom cursor on touch/reduced-motion configurations.
- No production deployment or public-domain/open-license claim for the supplied PDF.

## Typography

- Load `Bodoni Moda` for cinematic display headings and `Caveat` for restrained handwritten accents, alongside the existing Inter body face and Fira Code technical labels.
- Use readable fallbacks: Georgia or another system serif for display, a system cursive for accents, and the existing sans/monospace fallbacks. Font failure must not hide content or cause overflow.
- `Akshant Kumar` and major headings use the cinematic serif. The existing outlined treatment may remain on `Kumar` with a theme-aware stroke.
- Apply cursive only to selected accent words, initially `India.` and `next.`; do not apply it to professional facts, dates, tools, navigation, or contact details.
- Preserve one semantic `h1`, all existing heading hierarchy, readable line heights, and mobile text containment.

## India contour correction

- Inspect the current northern Ladakh and far-northeastern trace against the same user-supplied main-map PDF and correct only points that diverge from its visible outer national border.
- Keep the existing `2807 × 3974` source coordinate system, one closed `path#india-mainland`, explicit absolute `M`/`L`/`Z`, deterministic normalizer, and single normalized ring.
- Do not redraw the entire map, add internal divisions, use the inset, or silently switch to rejected automatic candidates or a third-party geometry source.
- If the source itself clips the relevant outer border, report that limitation instead of inventing geometry outside the supplied source.
- Regenerate `src/data/india-outline.js` and the SVG/PNG previews through `python scripts/prepare-india-map.py`; do not hand-patch normalized JavaScript coordinates.
- Preserve attribution: `Derived from the user-supplied Indiamap.pdf; source rights were not independently established.` The PDF remains local and ignored.
- Compare the corrected rendered outline with the main PDF at high magnification before accepting the scene change.

## Mobile composition and overlap correction

Separate text and particles into deliberate vertical safe zones rather than placing essential copy over the subject. Preserve the fixed WebGL canvas and native chapter scrolling, but give each chapter its own mobile frame and CSS layout.

- **Hero:** keep the name at the top and the half-body portrait bottom anchored. Move the role and scroll cue into the open area below the name and above the portrait’s occupied region.
- **Experience:** keep the title and years summary in the upper text zone, the complete India silhouette in a reserved central stage, and all four experience rows in a lower flow zone. No title, dates, or rows may cover the map.
- **Skills:** place category controls above and below a reserved constellation stage, with the active tools in their own lower zone. No category label or tool chip may sit over the constellation.
- **Contact:** keep the heading above the portal, contact actions below it, and the footer in a separate bottom zone.
- Preserve minimum 44 px interactive targets, readable type, no horizontal overflow, and functional content when WebGL or JavaScript enhancement is unavailable.
- Review at `320 × 740`, `390 × 844`, and `768 × 1024`, in addition to the desktop `1440 × 900` target. Use measured projected-particle bounds and text rectangles, not source inspection alone, to check separation.

## Dark and light themes

### Theme behavior

- Default to dark when no valid saved preference exists. Offer an accessible header button that switches between dark and light and persists the explicit choice under `akshant-portfolio-theme`.
- The toggle has a meaningful accessible name, a visible theme state, a minimum 44 px target, keyboard operation, and an icon-only narrow-screen presentation if needed.
- Update the root `color-scheme`, CSS variables, and `meta[name="theme-color"]` without reloading the page or recreating the WebGL scene.
- Catch unavailable or invalid local storage and retain a working in-memory theme toggle.
- Reflect the active theme in the editable scene where practical without removing existing palette controls or changing project/artifact ids.

### Dark theme

- Preserve the current near-black graphite background, soft ivory text, cyan `#00D4FF`, violet `#9D4EDD`, additive particle treatment, and overall visual character.
- Keep the corrected mobile geometry/layout and accessibility improvements independent of theme.

### Light theme

- Use warm ivory `#F6F3EC` as the base background with dark charcoal primary text and theme-aware muted, faint, line, overlay, focus, header, and footer colors.
- Maintain WCAG AA contrast for essential text: 4.5:1 for normal text and 3:1 for qualifying large text and control boundaries.
- Give the particles a deterministic multicolor treatment using vibrant cyan, violet, coral, and gold. Keep the same positions, geometry, draw calls, motion, and particle budgets.
- Use theme-appropriate normal particle blending, opacity, dust color, and base-particle color so colors remain saturated and the boy, India, constellation, and portal remain legible on ivory. Do not carry additive dark-mode blending into light mode.
- Theme changes update colors and material settings in place. Avoid per-frame allocations or a scene reload.

## Scroll-linked text motion

- Mark major headings, chapter tags, summaries, controls, and contact actions as reveal items without changing their semantic elements.
- When a chapter becomes active through the existing section flow, reveal its heading with a short mask/translate/opacity transition, then stagger supporting items by small bounded delays.
- Let outgoing text recede gently. Do not hijack scrolling, repeatedly restart animation from minor intersection fluctuations, or leave non-active content permanently inaccessible.
- Gate enhanced hidden/reveal states behind successful JavaScript initialization so content is visible by default and in fallback mode.
- Use shorter travel and delays on mobile. Under `prefers-reduced-motion: reduce`, show all chapter text immediately with no stagger, masked entrance, or outgoing animation.

## Falling-star pointer

- On fine-pointer desktop devices, replace the native pointer with a small bright star head and a short tapered comet trail directed opposite pointer movement.
- Render the effect in a lightweight, pointer-transparent 2D overlay with bounded trail history, short fade time, capped device-pixel ratio, and one managed animation loop. It does not consume the WebGL particle budget.
- Keep interactive hover/focus behavior and ensure the overlay cannot intercept pointer, touch, keyboard, or accessibility input.
- Suspend work while the document is hidden, clear stale trail state on pointer leave, and release listeners, animation frames, and overlay resources on disposal.
- On coarse pointers, touch devices, and reduced-motion configurations, retain the native cursor and disable the trail. Theme the star/trail for sufficient visibility in both modes.

## Component boundaries

- `src/theme.js`: preference validation, persistence, CSS/theme-color updates, toggle state, and theme notifications; no Three.js dependency.
- `src/text-motion.js`: chapter reveal state and reduced-motion/fallback handling using existing chapter activation events.
- `src/comet-cursor.js`: fine-pointer detection, bounded 2D trail, lifecycle, and cleanup; no scene geometry dependency.
- `src/styles.css` and `index.html`: typography, theme toggle, reveal semantics, mobile safe zones, and theme-aware surfaces.
- `src/scene.js` and framing/playback modules: in-place theme palette/material updates and corrected mobile subject frames without changing the shared particle-buffer architecture.
- `docs/reference/india-mainland-trace.svg` and generated map assets: localized contour correction through the established reproducible workflow.
- Tests and measured review evidence: add focused contracts and record only actual results; remove stale counts or claims.

## Error handling and accessibility

- Font-service failure uses fallbacks without invisible text or layout overflow.
- Storage failure does not break theme switching.
- The comet and reveal enhancements fail soft: essential content and native pointer behavior remain available.
- Every theme and motion control works by keyboard and retains visible focus.
- Reduced motion disables comet animation, text reveal travel/stagger, and existing nonessential scene motion while preserving static chapter compositions.
- WebGL-disabled mode keeps every chapter, theme control, and contact action readable and usable.

## Verification requirements

### Automated checks

Add focused tests for:

- Theme default, valid/invalid saved values, persistence, storage failure, toggle accessible state, and theme-color updates.
- Dark/light scene palette and blending changes without recreation, changed particle counts, or lost editable parameters.
- Reveal initialization, chapter transitions, no-JavaScript/fallback visibility, and reduced-motion immediate content.
- Fine-pointer gating, bounded trail history, pointer-transparency, reduced-motion/touch disabling, and complete comet cleanup.
- India ring validity and localized corrected geometry through the existing generator.
- Mobile frame/zone contracts, accessible typography markup, navigation names, and text contrast in both themes.
- Existing navigation, selection, pointer dissolution/damped return, reduced motion, fallback, and editable-scene behavior.

### Visual and interaction review

- Inspect the corrected India contour against the main PDF and in the actual scene.
- Review all four chapters in dark and light modes at `1440 × 900` and `390 × 844`; review all chapters at `320 × 740` and `768 × 1024` for overlap and overflow.
- Verify vibrant but legible light-mode particles, readable cursive/display fallbacks, and no text/particle collisions using measured bounds and actual pixels.
- Exercise theme persistence across reload, storage-unavailable behavior, native scroll, header links, keyboard shortcuts, skill/experience selections, contact links, and the theme toggle by keyboard.
- Verify comet movement/fade and native-cursor behavior for touch/reduced motion. Confirm no text motion or comet under reduced motion.
- Recheck WebGL-disabled fallback and editable-scene controls.

Run the final gate and record the resulting actual test count:

```bash
npm test && npm run check && npm run build && git diff --check
```

Stop every temporary validation server/browser owned by the work. Keep review scratch, the PDF, and generated comparison evidence not intended for the repository out of commits.

## Delivery

After the written specification is reviewed, prepare a separate implementation plan. Implement on `feature/3d-data-portfolio`, review each correction and visual enhancement, push only that branch, and verify local and remote commit ids match. Provide the normal `preview/` path and preview link after actual dark/light desktop and mobile checks. Do not merge or deploy.
