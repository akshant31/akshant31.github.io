# Akshant Kumar — Immersive Particle Portrait

A four-chapter 3D data-engineering portfolio built with Three.js and the Edit3D SDK. One persistent field of 20,000 main particles, accompanied by 1,200 ambient points, transforms through a half-body portrait, an India silhouette, a skills constellation, and a deep contact portal.

The opening figure is bottom anchored with no legs or feet, while `Akshant Kumar` remains top centered. Responsive, per-chapter framing keeps each subject substantial without replacing the semantic HTML content. The visual treatment uses near-black graphite, soft ivory, cyan, and restrained violet.

## Branches

- `master`: existing production portfolio, unchanged by this work.
- `feature/3d-data-portfolio`: this 3D redesign.

No merge or production deployment is configured by this branch.

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

The development command forwards standard host and port arguments:

```bash
npm run dev -- --host localhost --port 5173
```

### Full website preview in Kimi Work

Use `preview/` as the preview project root. Its package intentionally has no Edit3D scene marker, so the preview opens the complete semantic website rather than the embedded scene-only presentation. The launcher forwards host and port arguments to the root development command. The root project remains available for editable-scene previews.

## Verify

```bash
npm test && npm run check && npm run build && git diff --check
```

`npm run build` creates the Edit3D service in `dist/`, including static public assets in `dist/public/`.

### Verification on this branch

- All 44 Node regression tests pass, covering deterministic morphs, content, responsive framing, half-body geometry, India geometry, playback, reduced motion, and website routing.
- The Edit3D compile check and production build pass. Non-fatal SDK decoder-asset and large-chunk warnings may remain.
- All four chapters were captured and visually reviewed at 1440 × 900 and 390 × 844. The review found no horizontal overflow or blocked essential controls.
- Real-browser checks cover native scrolling, all navigation links, keys `1`–`4`, arrow keys, every skill and experience selection, pointer displacement and settled restoration, contact links, reduced motion, and the no-WebGL fallback.
- Editable-scene checks cover registered objects and parameter groups, live particle-size and palette changes, and motion control through actual Play-canvas pixels. Native desktop toolbar and IPC integration were not exercised.

Measured evidence is recorded in `src/review.js`. Review captures and machine-check output remain ignored under `.superpowers/sdd/final-review/`.

## Interaction

- Scroll or use the four header links to move between chapters.
- Use keys `1`–`4` for direct chapter selection and adjacent arrow keys to move forward or backward.
- Move the pointer over the scene for local particle dissolution and restoration.
- Select skill groups and experience entries to change the active panel and scene emphasis.
- In embedded Edit3D Play, use the four chapter controls or keys `1`–`4`.
- Semantic HTML, keyboard focus, responsive layouts, reduced-motion behavior, and a no-WebGL fallback keep the portfolio readable.

## Content chapters

| Section | Centered particle subject | Portfolio content |
| --- | --- | --- |
| Home | Bottom-anchored half-body boy | Top-centered Akshant Kumar; Data Engineer |
| Experience | North-up India outline with restrained interior depth | Based in India; 7+ years; Ametris, Biofourmis, Tribes.AI, Infosys |
| Skills | Four-group orbital constellation | Languages, databases, cloud, and data tools |
| Contact | Deep particle portal | Email and GitHub |

All professional facts come from the existing portfolio. No impact metrics, project claims, certifications, or social links have been invented.

## Map data

Derived from the user-supplied Indiamap.pdf; source rights were not independently established.

The approved geometry begins with the manual outer-contour trace in `docs/reference/india-mainland-trace.svg`. Run:

```bash
python scripts/prepare-india-map.py
```

The script validates closure, finite coordinates, segment count, degenerate segments, and aspect ratio; normalizes the SVG y-down coordinates to a north-up ring; and regenerates `src/data/india-outline.js` plus the SVG/PNG comparison previews in `docs/reference/`. The normalized contour was visually compared with the supplied main map before integration.

Rejected automatic extraction candidates and scratch extraction directories are not inputs. The source PDF remains local and ignored rather than committed or claimed as redistributable. No map data is fetched at runtime.

## Project structure

```text
├── index.html                       # Semantic portfolio content
├── src/
│   ├── main.js                      # Normal and embedded runtime entry
│   ├── project.js                   # Project identity and scene registration
│   ├── scene.js                     # Edit3D scene and editable parameters
│   ├── play.js                      # Particle motion and interaction
│   ├── framing.js                   # Responsive per-chapter composition
│   ├── shapes.js                    # Four deterministic morph targets
│   ├── morph.js                     # Pure morph math
│   ├── boy-motion.js                # Half-body portrait rigging
│   ├── site.js                      # Navigation and UI emphasis
│   ├── content.js                   # Four chapter definitions
│   ├── styles.css                   # Responsive visual system
│   ├── data/india-outline.js        # Normalized manual India trace
│   ├── subjects/                    # Boy, India, constellation, and portal geometry
│   └── review.js                    # Measured runtime review evidence
├── scripts/prepare-india-map.py     # Trace validation and normalization
├── tests/                           # Node regression contracts
├── docs/                            # Approved designs and map previews
└── .edit3d/                         # Installed plugin launcher configuration
```

The project uses the Edit3D plugin SDK and Three.js. When moving the source to another machine, install the editor plugin and run its `prepare` command before `npm run dev`.

## Contact

**Akshant Kumar** — Data Engineer

- Email: [akst31@yahoo.com](mailto:akst31@yahoo.com)
- GitHub: [@akshant31](https://github.com/akshant31)
