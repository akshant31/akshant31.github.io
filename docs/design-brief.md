# Immersive Particle Portrait — Production Design Brief

The approved implementation designs are:

- `docs/superpowers/specs/2026-10-26-immersive-particle-portrait-design.md`
- `docs/superpowers/specs/2026-10-27-particle-composition-revision-design.md`

## Concept

A calm, editorial data-engineering portfolio in which one persistent particle subject changes form around Akshant Kumar’s real content. The scene carries visual meaning, while semantic HTML carries every essential fact and action.

The implementation uses 20,000 main particles and 1,200 ambient points, near-black graphite, soft ivory, cyan `#00D4FF`, and restrained violet `#9D4EDD`. Production remains unchanged.

## Composition

| Chapter | Centered particle subject | Edge content |
| --- | --- | --- |
| Boy | Articulated half-body figure, bottom anchored with no legs or feet | Top-centered Akshant Kumar; compact Data Engineer label |
| India | Enlarged north-up outer silhouette with a bright contour and restrained interior depth | Based in India; 7+ years; four concise experience entries |
| Skills | Large four-group orbital constellation | Selectable categories and one active tool list |
| Contact | Deep particle portal with a clear central opening | Closing statement, email, and GitHub |

The fixed WebGL canvas uses responsive, per-chapter framing rather than a shared zoom. Intentional cropping is limited to the hero’s lower torso at the bottom edge and atmospheric particles beyond the viewport. The boy’s head remains clear of the top-centered name and fixed header.

## India geometry and provenance

Derived from the user-supplied Indiamap.pdf; source rights were not independently established.

The only geometry input is the manually cleaned outer mainland trace in `docs/reference/india-mainland-trace.svg`. Internal borders, labels, roads, photographs, decorative cartography, and the page inset are excluded.

The reproducible workflow is manual SVG trace → `python scripts/prepare-india-map.py` validation and normalization → SVG/PNG visual comparison. The script produces `src/data/india-outline.js` and the previews in `docs/reference/`. Rejected automatic candidates and scratch extraction directories are not geometry inputs. The source PDF stays local and ignored; no map data is fetched at runtime.

## Interaction and accessibility

- Native scrolling and four direct header links select chapters without scroll hijacking.
- Keys `1`–`4` select chapters directly; adjacent arrow keys move forward and backward.
- Pointer movement produces local dissolution and damped restoration without carrying essential content in the canvas.
- Every skill category reveals only its selected tool panel; every experience entry exposes a reachable selection control and scene emphasis.
- Reduced motion freezes idle rigging, pointer scattering, parallax, ambient motion, and eased travel at exact chapter frames.
- With WebGL unavailable, all four semantic chapters, navigation, and contact links remain readable in static portfolio mode.

## Editable scene

The root Edit3D project preserves project id `akshant-data-universe` and artifact id `d655609d-2886-476c-9abe-f9dda9200f2a`. Registered objects are Data Universe, Particle Field, Ambient Dust, and Main camera.

Editable parameter groups are:

- Data Field: particle size, default `0.075`.
- Data Motion: motion speed `1` and flow intensity `0.7`.
- Data Palette: cyan `#00D4FF` and violet `#9D4EDD`.

The separate `preview/` launcher opens the normal full website; the root project opens the editable scene.

## Performance and implementation

The four subjects share one 20,000-point buffer. Geometry and typed arrays are reused during playback, with no per-frame geometry or material creation. The unlit particle treatment uses size attenuation, controlled opacity, perspective, and ACES tone mapping without bloom or realistic lighting.

Professional content remains sourced from the existing portfolio. The half-body figure is original procedural geometry and is not presented as Akshant’s exact likeness.

## Review and delivery

`src/review.js` records measured evidence from actual desktop and mobile captures, same-viewport pre-revision/current chapter comparisons, ten intermediate post-leave pointer frames and exact restoration, reduced-motion checks, WebGL-disabled fallback, editable-scene controls, and the complete automated gate. Review scratch stays ignored under `.superpowers/sdd/final-review/`.

Delivery stays on `feature/3d-data-portfolio`; no production merge or deployment is part of this work.
