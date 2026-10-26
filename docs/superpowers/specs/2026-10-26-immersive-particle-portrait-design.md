# Immersive Particle Portrait — Design Specification

Date: 2026-10-26
Branch: `feature/3d-data-portfolio`
Status: Approved through collaborative design, pending written-spec review

## Concept

Transform Akshant Kumar's portfolio into four full-screen, cinematic particle chapters. A single 20,000-point subject occupies the center of the viewport and transforms continuously from a living boy into India, a skills constellation, and a contact portal. Minimal semantic HTML surrounds the subject instead of competing with it in cards or side panels.

The visual direction is **Living Particle Portrait** with restrained holographic details. It takes interaction inspiration from the supplied reference without copying its model, assets, text, or exact layout.

## Goals

- Make the 3D subject the primary experience on every chapter.
- Open with a recognizable, animated boy built from particles.
- Follow with a particle map of India, the user-provided "Based in India" detail, and concise experience information.
- Preserve the portfolio's real professional facts while substantially reducing visible copy.
- Keep normal scrolling, direct navigation, touch, keyboard, reduced-motion, and no-WebGL experiences usable.
- Retain an editable 3D scene and the corrected full-website preview launcher.
- Deliver only on the existing feature branch; do not merge, deploy, or change production.

## Non-goals

- No photorealistic reconstruction of Akshant's likeness.
- No copied human model, reference-site source code, or reference-site assets.
- No invented employer locations, project claims, metrics, testimonials, or availability claims.
- No scroll hijacking, autoplaying chapter carousel, video background, or sound.
- No production deployment or GitHub Pages change in this implementation.

## Information architecture

The site has exactly four chapters in this order:

| Index | DOM id | Navigation label | Particle subject | Essential HTML content |
| --- | --- | --- | --- | --- |
| 0 | `hero` | Boy | Articulated boy | Akshant Kumar; Data Engineer |
| 1 | `experience` | India | India map | Based in India; 7+ years; four employers with roles and dates |
| 2 | `skills` | Skills | Data constellation | Languages, Databases, Cloud, Tech & Tools; tools for the selected group |
| 3 | `contact` | Contact | Particle portal | Let's build what's next; email; GitHub |

The current separate About chapter is removed. Its factual identity, years-of-experience, and professional-through-line content are condensed into the hero and India chapters. The `experience` id is retained for the India chapter so existing experience-anchor intent remains meaningful.

Keyboard shortcuts are `1`–`4`. Arrow keys move between adjacent chapters. Native scrolling and ordinary anchor navigation remain available.

## Visual system

### Composition

- The WebGL canvas is fixed at `100vw × 100svh`; the primary subject is centered at 50% viewport width on desktop.
- Desktop text occupies edge safe zones and leaves the central figure unobstructed.
- Each semantic chapter occupies at least one dynamic viewport height. Sections scroll naturally over the persistent canvas.
- A minimal fixed header contains an `AK` brand, four numbered chapter links, and a thin progress indicator.
- There are no content cards, terminal windows, large hero button groups, or long responsibility lists.

### Palette and typography

- Background: near-black graphite, continuing the existing visual identity.
- Primary particles and text: soft ivory rather than harsh pure white.
- Interactive accents and flowing highlights: electric cyan.
- Violet is reserved primarily for chapter transitions and selected accents.
- Typography remains editorial and oversized where useful, with compact monospace labels for chapter metadata and technical details.
- Text contrast is maintained with restrained edge shading rather than opaque panels over the subject.

### Particle treatment

- The main subject contains exactly 20,000 particles in one `THREE.Points` draw call.
- A separate ambient-dust field may contain at most 1,200 dim particles in one additional draw call.
- Soft round sprites, size attenuation, depth layering, and vertex colors provide dimensionality without post-processing bloom.
- The main subject remains brighter and sharper than atmospheric effects.

## Chapter designs

### 1. Boy / Introduction

The boy is an original, stylized youthful male figure generated procedurally from articulated three-dimensional forms. Head and hair, neck, torso, pelvis, upper and lower limbs, hands, and shoes are sampled into the shared particle buffer. Youthful proportions and casual clothing silhouettes distinguish the figure from a generic stick figure or abstract humanoid.

The figure stands centrally with one hand raised. "Akshant Kumar" sits at the lower-left and "Data Engineer" at the upper-right. A small scroll cue is the only other prominent hero UI. No introductory paragraph is required.

Idle motion includes subtle breathing, small weight shifts, a raised-hand wave, and clamped head movement toward the pointer. Pointer proximity scatters nearby particles with a damped return. These movements must preserve the figure's recognizability.

### 2. India / Experience

The boy's particles follow controlled curved paths and assemble into a filled, three-dimensional particle map of India. The outline receives a brighter allocation of particles so the country remains recognizable at desktop and mobile sizes. A slight map tilt and sparse flowing highlights add depth without rotating the map into an unreadable orientation.

"Based in India" and "7+ years" occupy opposite edge zones. Four concise experience entries surround the map:

- Ametris — Lead Data Engineer — Jan 2025–Present
- Biofourmis — Lead Data Engineer — Dec 2021–Dec 2024
- Tribes.AI — Data Engineer — Mar 2021–Nov 2021
- Infosys — Senior Systems Engineer — Nov 2017–Feb 2021

Selecting an experience entry changes its visual emphasis and the map's accent pulse. Employer selection does not place geographic markers or imply that an employer is based at a particular Indian location.

### 3. Skills / Constellation

India folds into a layered orbital data constellation. Four selectable category labels sit at compass-like edge positions: Languages, Databases, Cloud, and Tech & Tools. Only the selected category reveals its tool list, reducing visual noise while retaining real buttons and semantic content.

Selecting a category rotates its visual group forward and updates its tool list. Existing portfolio technologies remain unchanged: Python, SQL, Java, Scala; MongoDB, Redshift, Elasticsearch, PostgreSQL; AWS, Azure; Apache Spark, Apache Kafka, Apache Airflow, Tableau, Docker, Kubernetes, and Git.

### 4. Contact / Portal

The constellation expands into a deep circular particle portal. "Let's build what's next." appears with two primary actions:

- `akst31@yahoo.com` as a `mailto:` link
- `@akshant31` linking to `https://github.com/akshant31`

The portal responds gently to pointer position. No contact paragraph or surrounding card is needed.

## Motion and interaction model

### Continuous morphing

All chapters share one position buffer and one deterministic target per chapter. Scroll position maps to chapter progress from 0 to 3. A morph sampler interpolates targets and adds a deterministic, bounded curved-path offset that fades to zero at both endpoints. The result is a controlled spiral-like transition rather than unrelated objects fading in and out.

The camera and subject framing remain stable enough for text safe zones to stay usable. There are no per-frame geometry or material allocations in the animation loop.

### Navigation

- Native scrolling remains the primary interaction; it is never prevented to force timed transitions.
- Header links and direct anchors select chapters.
- Keys `1`–`4` select a chapter directly.
- Arrow keys move to the previous or next chapter unless the user is interacting with an editable control.
- Skill and experience selections use actual buttons with pressed or selected state exposed semantically.
- Touch uses normal scrolling and taps; hover is never required.

### Responsive behavior

On narrow screens, the subject scales down and shifts upward into a clear central stage. Concise text moves below and around that stage. Experience entries become compact stacked rows rather than four absolute corner blocks. The header remains usable and no control depends on precise pointer movement.

### Reduced motion

With `prefers-reduced-motion: reduce`, ambient rotation, breathing, waving, head tracking, pointer scattering, parallax, and camera drift are disabled. Chapter shapes are static, and changes occur at chapter boundaries without eased particle travel. Native scrolling and all content remain available.

### No WebGL or script failure

All essential content exists in semantic HTML and remains readable without WebGL. The interface must not apply a class that hides content before a successful scene mount. A restrained static visual treatment may replace the canvas, but no essential copy is carried only by WebGL. Without JavaScript, every skill list remains expanded; inactive groups are collapsed only after their interaction controller initializes successfully.

## Architecture

### Subject generation

Split the current shape module into focused generators with a shared deterministic sampling utility:

- `boy`: articulated body forms plus per-particle body-region metadata for rigged idle movement.
- `india`: locally stored boundary coordinates, interior sampling, and brighter outline sampling.
- `constellation`: four deterministic orbital skill groups.
- `portal`: a layered circular tunnel with depth.

Each generator returns finite coordinates for the same 20,000-particle count. Boy metadata is separate from position targets so morph interpolation never corrupts rig information.

### Scene and playback

- `scene.js` owns Three.js objects, named materials, camera, editable parameters, and resource disposal.
- `play.js` owns scroll progress, interaction events, animation state, and frame updates.
- The pure morph module owns interpolation and curved-path math and remains independently testable.
- `site.js` owns semantic navigation and selection state; it communicates with playback through the existing typed portfolio events.
- `content.js` exposes exactly four chapter records and their morph indices.

Data flow is one-way: semantic navigation or scroll → target chapter progress → morph/rig sampler → reused position buffer → Three.js render. Skill and experience events affect emphasis only; they do not replace the main scene.

### Editable 3D design workflow

Use the installed 3D design tooling for camera composition, particle appearance, palette, motion tuning, and scene review. Preserve meaningful registered objects and parameters for particle size, motion speed, flow intensity, cyan, and violet. The root project remains the editable scene; `preview/` remains the non-embedded full-website launcher.

### India boundary asset

Use Natural Earth 1:50m country geometry or another verified reusable dataset if that source cannot be obtained. Verify and record the source and license before committing the derived coordinates. Simplify and bundle only the required India geometry locally; do not fetch a third-party map service at runtime. Keep attribution with the derived asset and in project documentation.

The map is a visual location reference, not a statement about disputed boundaries or employer office locations.

## Performance budget

- 20,000 main particles in one draw call.
- At most 1,200 ambient particles in one additional draw call; no additional WebGL network-line or core-ring meshes.
- Constellation, portal, map outline, and holographic accents use the two point buffers or HTML/CSS rather than extra scene geometries.
- Reused typed arrays, vectors, and scratch state in frame updates.
- No post-processing chain, shadow-casting lights, or per-frame geometry/material creation.
- Renderer pixel density is capped at 1.75 on desktop and 1.5 on narrow screens.
- While `document.hidden` is true, playback returns before advancing motion time or writing buffers; resume starts with a zero frame delta.
- Local map data and procedural boy geometry avoid runtime model downloads.

## Verification requirements

### Automated checks

Update and extend the Node regression suite for:

- Exactly four chapter records and valid morph indices.
- Preservation of real identity, experience, skill, and contact facts.
- Equal particle counts, finite coordinates, deterministic output, and bounded target extents for all four subjects.
- Recognizable boy structure through region assignments and articulated metadata coverage.
- India outline/interior coverage and geographic aspect-ratio bounds that reject an unrelated or mirrored shape.
- Finite curved morphs that return exactly to target endpoints.
- Keyboard, responsive, reduced-motion, fallback, and normal-preview contracts.
- Continued editable-scene registration and material/parameter behavior.

### Browser and visual checks

Use the corrected full-site preview to verify:

- The boy is the first visible central subject, with name and role unobstructed.
- All four chapters render with the canvas centered and content visible.
- India is recognizable and all four experience entries are reachable.
- Navigation, `1`–`4`, arrow keys, skill selection, experience selection, email, and GitHub links work.
- Pointer scattering and return work without leaving particles displaced.
- Reduced-motion and no-WebGL modes retain usable content.
- Desktop at 1440 × 900 and mobile at 390 × 844 have no horizontal overflow, clipped essential content, or blocked controls.
- Actual visual captures are reviewed when capture tooling is available; any unavailable capture check is recorded honestly rather than claimed.

Run the complete gate before delivery:

```bash
npm test && npm run check && npm run build && git diff --check
```

Update `src/review.js` and README verification claims only with checks actually run.

## Delivery

Commit the implementation to `feature/3d-data-portfolio` and push that branch only after the full verification gate passes. Keep the working tree clean, confirm local and remote commit ids match, and provide the corrected `preview/` project path with the standard full-site preview link. Do not merge or deploy production.
