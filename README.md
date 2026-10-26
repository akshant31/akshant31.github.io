# Akshant Kumar — Particle Data Universe

A 3D data-engineering portfolio built from the content of the original [Akshant Kumar portfolio](https://akshant31.github.io). One persistent Three.js particle subject transforms through five chapters: raw records, an orchestrated pipeline, a skills constellation, an experience helix, and a structured output lattice.

The design uses the supplied particle reference as interaction inspiration without copying its portrait, assets, text, or layout.

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
npm test
npm run check
npm run build
```

`npm run build` creates the Edit3D service in `dist/`, including static public assets in `dist/public/`.

### Verification on this branch

- All 23 Node regression tests pass, covering deterministic morphs, content, responsive behavior, camera composition, editor-owned material replacement, and normal website preview routing.
- The Edit3D compile check and production build pass. The build retains non-fatal SDK decoder-asset and large-chunk warnings.
- All five chapters were visually reviewed at 1440 × 900 and 390 × 844 with no horizontal overflow or runtime errors.
- Real-browser checks cover section navigation, keyboard shortcuts, scene emphasis, pointer interaction, contact links, reduced motion, and the no-WebGL fallback.
- Standalone editor checks cover scene lint, framing, parameter edits, undo/redo, save/reload persistence, and Raw/Lattice Play morphs. Native desktop toolbar and IPC integration were not exercised.

`npm audit` reports a high-severity advisory chain in the editor CLI's pinned Vite 8.2.2 development dependency. npm reports no available fix, so this branch does not force an unsupported dependency rewrite.

## Interaction

- Scroll or use the section navigation to morph the 3D data universe.
- Move the pointer over the scene for a subtle particle-dissolve effect.
- Select skill groups and experience entries to change scene emphasis.
- In embedded Edit3D Play, use the five shape buttons or keys `1`–`5`.
- Semantic HTML, keyboard focus, responsive layouts, reduced-motion behavior, and a no-WebGL fallback keep the portfolio readable.

## Content chapters

| Section | 3D state | Portfolio content |
| --- | --- | --- |
| Home | Raw records | Name, role, 7+ years summary, primary actions |
| About | Pipeline | `about_me.py`, professional summary, existing counters |
| Skills | Constellation | Languages, databases, cloud, and data tools |
| Experience | Timeline helix | Ametris, Biofourmis, Tribes.AI, Infosys |
| Contact | Structured lattice | Email and GitHub |

All professional facts come from the existing portfolio. No impact metrics, project claims, certifications, or social links have been invented.

## Project structure

```text
├── index.html              # Semantic portfolio content
├── src/
│   ├── main.js             # Normal and embedded runtime entry
│   ├── scene.js            # Edit3D scene and editable parameters
│   ├── play.js             # Particle motion and interaction
│   ├── shapes.js           # Deterministic morph targets
│   ├── morph.js            # Pure morph math
│   ├── site.js             # Navigation and UI emphasis
│   ├── content.js          # Section metadata
│   ├── styles.css          # Responsive visual system
│   └── review.js           # Actual runtime review evidence
├── tests/                  # Node test runner contracts
├── docs/                   # Approved design and implementation plan
└── .edit3d/                # Installed plugin launcher configuration
```

The project uses the Edit3D plugin SDK and Three.js. When moving the source to another machine, install the editor plugin and run its `prepare` command before `npm run dev`.

## Contact

**Akshant Kumar** — Data Engineer

- Email: [akst31@yahoo.com](mailto:akst31@yahoo.com)
- GitHub: [@akshant31](https://github.com/akshant31)
