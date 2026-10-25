# Particle Data Universe — Design Specification

Date: 2026-10-25
Branch: `feature/3d-data-portfolio`
Status: Direction A approved by Akshant

## 1. Product goal

Transform Akshant Kumar's existing static portfolio into a polished, responsive 3D portfolio whose central particle subject communicates data engineering. Borrow the reference site's techniques—large particle forms, dissolution, reconstruction, scroll-driven transformation, and restrained typography—without copying its portrait, layout, text, or assets.

The production `master` branch must remain untouched. All work stays on `feature/3d-data-portfolio` until Akshant explicitly requests a merge or deployment.

## 2. Source-of-truth content

Use only facts present in the current portfolio:

- Name: Akshant Kumar.
- Role: Data Engineer.
- Experience summary: 7+ years building data pipelines, real-time systems, and cloud architectures.
- Professional themes: healthcare data operations, real-time learning platforms, ETL, automation, business intelligence, and data transformation.
- Skills: Python, SQL, Java, Scala, MongoDB, Redshift, Elasticsearch, AWS, Azure, Apache Spark, Apache Kafka, Apache Airflow, Tableau, Docker, Kubernetes, PostgreSQL, and Git where present in the existing site.
- Experience: Ametris (Jan 2025–Present, Lead Data Engineer), Biofourmis (Dec 2021–Dec 2024, Lead Data Engineer), Tribes.AI (Mar 2021–Nov 2021, Data Engineer), Infosys (Nov 2017–Feb 2021, Senior Systems Engineer).
- Contact: `akst31@yahoo.com` and `https://github.com/akshant31`.

Do not invent employer descriptions, project outcomes, customer names, location, certifications, social accounts, numerical impact, or a résumé download.

## 3. Experience structure

### Home — Raw records

A full-viewport 3D particle field begins as a dispersed but coherent cloud of records around a database-like core. Large typographic name and role frame the subject rather than covering it. Include the existing 7+ years summary and links to Experience and Contact.

### About — Orchestrated pipeline

Particles reorganize into connected source, transform, and destination stages. The section presents the existing `about_me.py` terminal profile, professional summary, and the three existing counters, relabeled for consistency with the fuller skill list: 7+ years, 4 companies, and 12 core technologies. Avoid adding unverified metrics.

### Skills — Constellation

Particles form an orbital constellation. Skill groups remain readable as semantic HTML: Languages, Databases, Cloud, and Tech & Tools. Selecting a skill group highlights its related color/channel in the 3D field; no skill percentages are invented.

### Experience — Timeline helix

Particles form a vertical helix with four illuminated milestones. The real roles, dates, responsibilities, and technology tags appear in a vertical timeline. Selecting a milestone moves the particle emphasis to its corresponding stage.

### Contact — Structured lattice

Particles settle into an ordered three-dimensional lattice, symbolizing reliable, usable data. A large email link and GitHub link replace unnecessary form infrastructure. The footer uses the current year and Akshant's name.

## 4. Visual system

- Background: graphite `#0B0D12` with subtle depth from the scene, not heavy gradients or stock imagery.
- Primary text: `#E8EBF2`; secondary text: `#8A93A6`.
- Existing identity accents: electric cyan `#00D4FF`, violet `#9D4EDD`, restrained pink `#FF006E`, and green `#00FF88` for active/success states.
- Typography: Inter for display/body and Fira Code for technical labels, preserving fonts already used by the existing portfolio.
- Layout: generous negative space, oversized editorial headings, thin rules, small technical labels, and minimal translucent surfaces only where text contrast requires them.
- No emoji-dependent controls, stock portraits, copied reference assets, or decorative card grids.

## 5. 3D design and interaction

- Use a deterministic particle set of approximately 12,000 points with precomputed target arrays for the five morph states.
- Interpolate between states with damped motion. Pointer proximity produces a subtle dissolve/repulsion effect; pointer movement adds restrained camera parallax.
- Scroll position determines the active morph state. Navigation buttons and keyboard arrows provide equivalent section movement.
- Skill and experience selections affect emphasis, not the factual content.
- Use one Points draw call and a small LineSegments network; avoid a large mesh count, post-processing, bloom, or per-frame geometry allocation.
- The 3D subject remains secondary to text readability. Content never exists only inside WebGL.

## 6. Architecture

- `index.html`: semantic portfolio content, navigation, accessible links, and the 3D mount point.
- `src/styles.css`: responsive visual system, content layout, focus states, and reduced-motion rules.
- `src/main.js`: runtime entry. Normal portfolio mode mounts the Edit3D content preview and starts Play. Embedded Work mode mounts the Edit3D editor using the review gate.
- `src/scene.js`: scene, camera, materials, object registration, editable parameters, and cleanup.
- `src/shapes.js`: seeded target generators for raw, pipeline, constellation, helix, and lattice states.
- `src/play.js`: scroll/pointer/keyboard input, particle interpolation, HTML section synchronization, and embedded Play controls.
- `src/site.js`: DOM navigation, active-section observation, skill/experience controls, and current-year footer.
- `src/review.js`: concrete runtime review evidence; pending until checks are actually completed.
- `src/kit/` and `src/environment/`: only required verified Edit3D helpers copied from the installed plugin.
- `docs/design-brief.md`: visual and technical production brief.

No React or application framework is needed. Three.js and the installed Edit3D SDK provide the scene runtime.

## 7. Data flow

1. Semantic HTML renders immediately and remains usable without WebGL.
2. Normal mode loads the scene, then starts Play.
3. DOM scroll/navigation produces a section index and local progress.
4. Play maps that state to two adjacent target arrays and interpolation weight.
5. Each frame updates particle positions, network emphasis, and camera parallax.
6. Skill/experience controls update a small shared interaction state consumed by Play.
7. Embedded editor parameters update actual material/size/motion properties through the SDK subscription mechanism.

## 8. Accessibility and responsiveness

- Preserve heading order, landmarks, native links, keyboard focus, and meaningful labels.
- Provide visible focus styles and keyboard-equivalent navigation.
- Respect `prefers-reduced-motion`: disable pointer repulsion, smoothing, and nonessential transitions; show stable morph states.
- On narrow screens, stack content around the scene, reduce visual interference, and keep tap targets at least 44 px.
- If WebGL or SDK initialization fails, hide the canvas and retain the complete portfolio with a lightweight CSS fallback.

## 9. Edit3D integration

- Keep the plugin-generated `edit3d.sceneProtocol` marker and real artifact ID.
- Normal portfolio mode uses the SDK content preview with Play for the public website experience.
- Embedded Work mode uses the reviewed editor so the scene, materials, and meaningful parameters remain inspectable/editable.
- Expose working controls for particle size, motion speed, flow intensity, and accent colors. Do not expose unsupported controls.
- Name every material by purpose and verify names through the actual SDK runtime.
- Keep editor framing centered on the data-universe subject; exclude any distant decorative field from framing.

## 10. Error handling

- Scene initialization errors are caught and logged; the HTML portfolio stays visible.
- Missing WebGL defaults to the static current morph state or CSS fallback without blocking navigation.
- Event listeners and animation resources use the Play abort signal and dispose path.
- No test values remain in saved editor state after verification.
- Build or runtime failures must be reported honestly; compilation alone is not visual acceptance.

## 11. Verification criteria

- `npm run check` and `npm run build` complete successfully.
- Inspect the final normal portfolio at desktop and mobile widths, including all five sections.
- Verify scroll, navigation, skill selection, experience selection, mailto, and GitHub links.
- Verify reduced-motion behavior and the no-WebGL content fallback.
- Complete at least one screenshot → defect list → fix → re-verify cycle.
- Inspect a multi-view scene contact sheet and confirm subject framing.
- In embedded edit mode, verify one color parameter and particle size, console cleanliness, undo/redo, and save/restore; revert test values.
- Confirm every material has a meaningful runtime name.
- Stop temporary preview services and close verification tabs created during the task.

## 12. Delivery scope

Deliver the source on `feature/3d-data-portfolio`, a local Work preview, and a GitHub branch link. Do not merge, open a pull request, alter GitHub Pages settings, or deploy production without a separate explicit request.
