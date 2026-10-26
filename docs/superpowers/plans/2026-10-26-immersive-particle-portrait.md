# Immersive Particle Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved four-chapter immersive portfolio with a living particle boy, a 3D India particle map and surrounding experience, a skills constellation, and a contact portal.

**Architecture:** Keep semantic HTML and normal scrolling around one fixed Three.js canvas. Generate four deterministic 20,000-point targets from focused subject modules, morph them through one reused position buffer, and layer boy rigging, bounded curved travel, interaction emphasis, reduced motion, and fallbacks in separate testable units.

**Tech Stack:** Node.js 22.12+, node:test, vanilla HTML/CSS/JavaScript, Three.js 0.186.0, the installed Edit3D SDK/CLI, Natural Earth 1:50m public-domain geometry bundled locally.

## Global Constraints

- Work only on `feature/3d-data-portfolio`; never merge, deploy, alter GitHub Pages, or touch `master`.
- Preserve only existing portfolio facts plus the user-provided `Based in India`; do not invent metrics, projects, testimonials, employer locations, or availability.
- Use exactly four chapters: `hero`, `experience`, `skills`, `contact`, with morph indices `0`–`3` and shortcuts `1`–`4`.
- Use exactly `20,000` main particles in one Points draw call and at most `1,200` ambient particles in one additional draw call; no network-line or core-ring meshes.
- Use Edit3D's supported hardware-aware pixel-ratio cap (2 on hardware renderers, 1 on software renderers) and its 2048 × 1536 view-pixel budget; do not fork or monkey-patch the SDK renderer.
- Keep all essential content in semantic HTML. Native scrolling must never be hijacked.
- Keep the root Edit3D project editable and keep `preview/` as the non-embedded full-site launcher.
- Do not copy the reference site's model, source, assets, text, or exact layout.
- Bundle India geometry locally. Source: `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson`; terms: `https://www.naturalearthdata.com/about/terms-of-use/` (public domain, verified 2026-10-26).
- Use TDD for every task: write the specified failing tests, observe failure, implement, observe success, then commit only the task's files.
- Final gate must be `npm test && npm run check && npm run build && git diff --check`; the planned final suite has 36 tests.

## File Structure

- `index.html`: four semantic chapters and minimal edge-positioned copy.
- `src/content.js`: canonical four-chapter metadata.
- `src/styles.css`: immersive desktop/mobile composition, focus, embedded, reduced-motion, and fallback styles.
- `src/site.js`: navigation, progress, skill-panel enhancement, and selection events.
- `src/shapes.js`: shared-count validation and `createSubjectTargets` / `createShapeTargets` aggregation only after Task 4.
- `src/subjects/shared.js`: deterministic random and point-sampling primitives.
- `src/subjects/boy.js`: procedural boy positions and `Uint8Array` body-region metadata.
- `src/subjects/india.js`: India interior/outline sampling from bundled rings.
- `src/subjects/constellation.js`: four orbital skill groups.
- `src/subjects/portal.js`: layered contact tunnel.
- `src/data/india-outline.js`: generated, attributed, normalized India outer rings; no runtime fetch.
- `scripts/prepare-india-map.mjs`: reproducible one-time Natural Earth extraction and projection.
- `src/morph.js`: progress frames, damped motion, scroll mapping, linear and curved morph sampling.
- `src/boy-motion.js`: pure articulated idle animation over a reused position buffer.
- `src/scene.js`: Points materials, ambient dust, camera, Edit3D registration, parameters, and disposal.
- `src/play.js`: scroll/keyboard/pointer/visibility state and frame orchestration.
- `src/review.js`: only final measured visual/runtime evidence.
- `tests/*.test.js`: deterministic contracts and regression coverage.

---

### Task 1: Four-Chapter Contract and Semantic Content

**Files:**
- Modify: `src/content.js`
- Modify: `src/morph.js:1-7`
- Modify: `src/shapes.js:1-3,137-147`
- Modify: `src/play.js:4,37-49,89-105`
- Replace: `index.html`
- Test: `tests/content.test.js`
- Test: `tests/shapes.test.js`
- Test: `tests/play.test.js`

**Interfaces:**
- Produces: `SECTIONS = [{id, label, morph, shortcut}, ...]` in `hero → experience → skills → contact` order.
- Produces: `PARTICLE_COUNT = 20000`, four targets from `createShapeTargets(count)`, and progress clamped to `3`.
- Preserves: `playPortfolio(context, objects, settings)`, `setProgress(number)`, and existing `portfolio:*` events.

- [ ] **Step 1: Write the failing four-chapter tests**

In `tests/shapes.test.js`, replace the five-shape and frame assertions with:

```js
test('four deterministic finite shapes are generated', () => {
  const a = createShapeTargets(120)
  const b = createShapeTargets(120)
  assert.equal(a.length, SECTION_IDS.length)
  assert.equal(a.length, 4)
  a.forEach((shape) => {
    assert.ok(shape instanceof Float32Array)
    assert.equal(shape.length, 360)
    assert.ok(shape.every(Number.isFinite))
    assert.ok(shape.every((value) => Math.abs(value) <= 20))
  })
  assert.deepEqual(a, b)
  for (let index = 1; index < a.length; index += 1) assert.notDeepEqual(a[index - 1], a[index])
})

test('morph frames clamp and interpolate at section boundaries', () => {
  assert.deepEqual(getMorphFrame(-1), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(getMorphFrame(0), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(getMorphFrame(0.25), { from: 0, to: 1, mix: 0.25 })
  assert.deepEqual(getMorphFrame(1.5), { from: 1, to: 2, mix: 0.5 })
  assert.deepEqual(getMorphFrame(3), { from: 3, to: 3, mix: 0 })
  assert.deepEqual(getMorphFrame(9), { from: 3, to: 3, mix: 0 })
  assert.deepEqual(getMorphFrame(NaN), { from: 0, to: 0, mix: 0 })
})
```

In `tests/content.test.js`, use this metadata/content test and retain the existing responsive, overlay, and mobile-status tests until Task 5:

```js
test('section metadata matches four semantic chapters', () => {
  assert.deepEqual(SECTIONS.map((section) => section.id), ['hero', 'experience', 'skills', 'contact'])
  assert.equal((html.match(/<section\b/g) || []).length, 4)
  assert.ok(!html.includes('id="about"'))
  SECTIONS.forEach((section, index) => {
    assert.equal(section.morph, index)
    assert.ok(html.includes(`id="${section.id}" data-morph="${index}"`))
  })
})

test('portfolio preserves the approved professional facts and contacts', () => {
  for (const fact of [
    'Akshant Kumar', 'Data Engineer', 'Based in India', '7+ years',
    'Ametris', 'Jan 2025 - Present', 'Biofourmis', 'Dec 2021 - Dec 2024',
    'Tribes.AI', 'Mar 2021 - Nov 2021', 'Infosys', 'Nov 2017 - Feb 2021',
    'akst31@yahoo.com', 'https://github.com/akshant31', 'Apache Spark',
    'Apache Kafka', 'Apache Airflow', 'Redshift', 'Tableau',
  ]) assert.ok(html.includes(fact), `missing portfolio fact: ${fact}`)
  assert.ok(!/lorem ipsum/i.test(html))
})
```

In `tests/play.test.js`, replace the offsets case and final-target index with:

```js
test('scroll offsets map to continuous section progress', () => {
  const offsets = [0, 1000, 2000, 3500]
  assert.equal(progressFromOffsets(offsets, -10), 0)
  assert.equal(progressFromOffsets(offsets, 500), 0.5)
  assert.equal(progressFromOffsets(offsets, 1500), 1.5)
  assert.equal(progressFromOffsets(offsets, 3000), 2.5)
  assert.equal(progressFromOffsets(offsets, 7000), 3)
  assert.throws(() => progressFromOffsets([0, 0], 10), /INVALID_SECTION_OFFSETS/)
})
```

Change the last Play assertion loop from `targets[4]` to `targets[3]`.

- [ ] **Step 2: Run the tests and observe the old contract fail**

Run: `node --test tests/content.test.js tests/shapes.test.js tests/play.test.js`
Expected: FAIL on five existing sections/shapes, `Based in India`, and progress clamped to `4`.

- [ ] **Step 3: Implement the four-chapter runtime contract**

Replace `src/content.js` with:

```js
export const SECTIONS = Object.freeze([
  Object.freeze({ id: 'hero', label: 'Boy', morph: 0, shortcut: '1' }),
  Object.freeze({ id: 'experience', label: 'India', morph: 1, shortcut: '2' }),
  Object.freeze({ id: 'skills', label: 'Skills', morph: 2, shortcut: '3' }),
  Object.freeze({ id: 'contact', label: 'Contact', morph: 3, shortcut: '4' }),
])
```

In `src/morph.js`, replace `getMorphFrame` with:

```js
export function getMorphFrame(progress) {
  const value = Math.max(0, Math.min(3, Number.isFinite(progress) ? progress : 0))
  if (value === 0) return { from: 0, to: 0, mix: 0 }
  if (value === 3) return { from: 3, to: 3, mix: 0 }
  const from = Math.floor(value)
  return { from, to: from + 1, mix: value - from }
}
```

In `src/shapes.js`, set `SECTION_IDS = ['hero', 'experience', 'skills', 'contact']`, set `PARTICLE_COUNT = 20000`, and make the final return:

```js
return [
  buildRawCloud(count, random),
  buildPipeline(count, random),
  buildConstellation(count, random),
  buildLattice(count, random),
]
```

In `src/play.js`, use `CONTROL_LABELS = ['Boy', 'India', 'Skills', 'Portal']`; replace both progress clamps `Math.min(4, ...)` with `Math.min(3, ...)`; change the hint to `Scroll or use 1–4 to transform the portrait · move the pointer to dissolve`.

- [ ] **Step 4: Replace the document with the four semantic chapters**

Replace `index.html` with the following complete document. Inactive skill lists intentionally have no `hidden` attribute in source, so all content remains readable without JavaScript.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Akshant Kumar — Data Engineer. An immersive particle portrait, India, experience, skills, and contact.">
  <meta name="keywords" content="Akshant Kumar, Data Engineer, Python, SQL, Spark, Kafka, Airflow, AWS, Azure">
  <meta name="author" content="Akshant Kumar">
  <meta name="theme-color" content="#05070B">
  <title>Akshant Kumar — Data Engineer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  <a class="skip-link" href="#hero">Skip to portfolio</a>
  <div id="app"></div>
  <div class="scene-shade" aria-hidden="true"></div>
  <div class="chapter-progress" aria-hidden="true"><span id="chapter-progress-fill"></span></div>

  <header class="site-header">
    <a class="brand" href="#hero" data-nav-link="0" aria-label="Akshant Kumar — home">
      <span class="brand-mark">AK</span>
      <span class="brand-copy">Immersive<br>Portfolio</span>
    </a>
    <nav class="section-nav" aria-label="Portfolio chapters">
      <a href="#hero" data-nav-link="0" aria-current="page"><span class="nav-index">01</span><span class="nav-label">Boy</span></a>
      <a href="#experience" data-nav-link="1"><span class="nav-index">02</span><span class="nav-label">India</span></a>
      <a href="#skills" data-nav-link="2"><span class="nav-index">03</span><span class="nav-label">Skills</span></a>
      <a href="#contact" data-nav-link="3"><span class="nav-index">04</span><span class="nav-label">Contact</span></a>
    </nav>
  </header>

  <div class="scene-status" id="scene-status" aria-hidden="true">
    <span class="status-dot"></span><span id="scene-status-text">Initializing particle portrait</span>
  </div>

  <main id="portfolio">
    <section id="hero" data-morph="0" class="section hero" aria-labelledby="hero-title">
      <div class="section-inner hero-inner">
        <p class="chapter-tag hero-tag">01 / Human input</p>
        <h1 class="hero-name" id="hero-title"><span>Akshant</span><span>Kumar</span></h1>
        <p class="hero-role">Data Engineer</p>
        <div class="scroll-cue" aria-hidden="true"><span class="scroll-cue-line"></span><span>Scroll to transform</span><span>01 — 04</span></div>
      </div>
    </section>

    <section id="experience" data-morph="1" class="section experience" aria-labelledby="experience-title">
      <div class="section-inner experience-inner">
        <header class="location-heading">
          <p class="chapter-tag">02 / Coordinates</p>
          <h2 id="experience-title">Based in<br><span>India.</span></h2>
        </header>
        <p class="experience-total" aria-label="7+ years engineering data"><strong>7+</strong><span>years engineering data</span></p>
        <div class="experience-list" aria-label="Professional experience">
          <article class="experience-item is-active" data-experience="0">
            <button class="experience-select" type="button" aria-pressed="true"><span class="experience-company">Ametris</span><span class="experience-role">Lead Data Engineer</span><span class="experience-date">Jan 2025 - Present</span></button>
          </article>
          <article class="experience-item" data-experience="1">
            <button class="experience-select" type="button" aria-pressed="false"><span class="experience-company">Biofourmis</span><span class="experience-role">Lead Data Engineer</span><span class="experience-date">Dec 2021 - Dec 2024</span></button>
          </article>
          <article class="experience-item" data-experience="2">
            <button class="experience-select" type="button" aria-pressed="false"><span class="experience-company">Tribes.AI</span><span class="experience-role">Data Engineer</span><span class="experience-date">Mar 2021 - Nov 2021</span></button>
          </article>
          <article class="experience-item" data-experience="3">
            <button class="experience-select" type="button" aria-pressed="false"><span class="experience-company">Infosys</span><span class="experience-role">Senior Systems Engineer</span><span class="experience-date">Nov 2017 - Feb 2021</span></button>
          </article>
        </div>
      </div>
    </section>

    <section id="skills" data-morph="2" class="section skills" aria-labelledby="skills-title">
      <div class="section-inner skills-inner">
        <header class="sr-only"><h2 id="skills-title">Skills and technologies</h2></header>
        <p class="chapter-tag skills-tag">03 / Connected tools</p>
        <div class="skill-groups" aria-label="Skill categories">
          <button class="skill-group is-active" type="button" data-skill-group="0" aria-pressed="true" aria-controls="skill-tools-0"><span>01</span>Languages</button>
          <button class="skill-group" type="button" data-skill-group="1" aria-pressed="false" aria-controls="skill-tools-1"><span>02</span>Databases</button>
          <button class="skill-group" type="button" data-skill-group="2" aria-pressed="false" aria-controls="skill-tools-2"><span>03</span>Cloud</button>
          <button class="skill-group" type="button" data-skill-group="3" aria-pressed="false" aria-controls="skill-tools-3"><span>04</span>Tech &amp; Tools</button>
        </div>
        <div class="skill-tool-panels">
          <ul class="skill-tools" id="skill-tools-0" data-skill-tools="0"><li>Python</li><li>SQL</li><li>Java</li><li>Scala</li></ul>
          <ul class="skill-tools" id="skill-tools-1" data-skill-tools="1"><li>MongoDB</li><li>Redshift</li><li>Elasticsearch</li><li>PostgreSQL</li></ul>
          <ul class="skill-tools" id="skill-tools-2" data-skill-tools="2"><li>AWS</li><li>Azure</li></ul>
          <ul class="skill-tools" id="skill-tools-3" data-skill-tools="3"><li>Apache Spark</li><li>Apache Kafka</li><li>Apache Airflow</li><li>Tableau</li><li>Docker</li><li>Kubernetes</li><li>Git</li></ul>
        </div>
      </div>
    </section>

    <section id="contact" data-morph="3" class="section contact" aria-labelledby="contact-title">
      <div class="section-inner contact-inner">
        <header class="section-heading"><p class="chapter-tag">04 / Meaningful output</p><h2 id="contact-title">Let's build<br>what's next.</h2></header>
        <div class="contact-links">
          <a class="contact-email" href="mailto:akst31@yahoo.com">akst31@yahoo.com</a>
          <a class="contact-github" href="https://github.com/akshant31" target="_blank" rel="noreferrer"><span>GitHub</span><span>@akshant31</span></a>
        </div>
        <footer class="site-footer"><span>Designed &amp; built by Akshant Kumar</span><span>© <span id="current-year">2026</span> / Structured with purpose</span></footer>
      </div>
    </section>
  </main>

  <script id="edit3d-state" type="application/json">null</script>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Run the task tests and full suite**

Run: `npm test`
Expected: PASS, 23 tests total; no stale five-chapter or `targets[4]` assertion remains.

- [ ] **Step 6: Commit the independently testable contract**

```bash
git add index.html src/content.js src/morph.js src/shapes.js src/play.js tests/content.test.js tests/shapes.test.js tests/play.test.js
git commit -m "feat: establish four-chapter immersive portfolio"
```

---

### Task 2: Procedural Articulated Boy

**Files:**
- Create: `src/subjects/shared.js`
- Create: `src/subjects/boy.js`
- Modify: `src/shapes.js`
- Test: `tests/boy.test.js`

**Interfaces:**
- Produces: `seededRandom(seed) → () => number`, `writePoint(target, index, x, y, z)`, and `sphericalPoint(random, radius) → [x,y,z]`.
- Produces: `BOY_REGION` numeric constants and `createBoy(count, random) → {positions: Float32Array, regions: Uint8Array}`.
- Produces: `createSubjectTargets(count) → {targets, boyRegions, indiaOutlineCount, phases}`; `createShapeTargets(count)` remains the array-only compatibility wrapper.

- [ ] **Step 1: Write failing boy-structure tests**

Create `tests/boy.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubjectTargets, seededRandom } from '../src/shapes.js'
import { BOY_REGION, createBoy } from '../src/subjects/boy.js'

test('boy exposes every articulated region with one region per particle', () => {
  const subject = createSubjectTargets(5000)
  assert.equal(subject.targets[0].length, 15000)
  assert.ok(subject.boyRegions instanceof Uint8Array)
  assert.equal(subject.boyRegions.length, 5000)
  assert.equal(subject.phases.length, 5000)
  const present = new Set(subject.boyRegions)
  for (const region of Object.values(BOY_REGION)) assert.ok(present.has(region), `missing boy region ${region}`)
})

test('boy has youthful head, raised hand, legs, and full 3D proportions', () => {
  const { positions, regions } = createBoy(5000, seededRandom(31))
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
  let headY = 0
  let headCount = 0
  let raisedMaxY = -Infinity
  let legMinY = Infinity
  for (let index = 0; index < regions.length; index += 1) {
    const point = [positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]]
    point.forEach((value, axis) => {
      bounds.min[axis] = Math.min(bounds.min[axis], value)
      bounds.max[axis] = Math.max(bounds.max[axis], value)
    })
    if (regions[index] === BOY_REGION.HEAD) { headY += point[1]; headCount += 1 }
    if (regions[index] === BOY_REGION.RAISED_LOWER) raisedMaxY = Math.max(raisedMaxY, point[1])
    if ([BOY_REGION.LEFT_LEG, BOY_REGION.RIGHT_LEG].includes(regions[index])) legMinY = Math.min(legMinY, point[1])
  }
  const size = bounds.max.map((value, axis) => value - bounds.min[axis])
  assert.ok(size[0] > 3 && size[0] < 6, `boy width ${size[0]}`)
  assert.ok(size[1] > 7.5 && size[1] < 9.5, `boy height ${size[1]}`)
  assert.ok(size[2] > 1, `boy depth ${size[2]}`)
  assert.ok(headY / headCount > 2.5)
  assert.ok(raisedMaxY > 3.5)
  assert.ok(legMinY < -3.5)
})

test('boy geometry and region assignments are deterministic', () => {
  const a = createBoy(1000, seededRandom(31031))
  const b = createBoy(1000, seededRandom(31031))
  assert.deepEqual(a.positions, b.positions)
  assert.deepEqual(a.regions, b.regions)
  assert.ok(a.positions.every(Number.isFinite))
})
```

- [ ] **Step 2: Verify the new tests fail before implementation**

Run: `node --test tests/boy.test.js`
Expected: FAIL because `src/subjects/boy.js` and `createSubjectTargets` do not exist.

- [ ] **Step 3: Add deterministic sampling primitives**

Create `src/subjects/shared.js`:

```js
export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function writePoint(target, index, x, y, z) {
  const offset = index * 3
  target[offset] = x
  target[offset + 1] = y
  target[offset + 2] = z
}

export function sphericalPoint(random, radius) {
  const theta = random() * Math.PI * 2
  const cosPhi = random() * 2 - 1
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
  return [Math.cos(theta) * sinPhi * radius, cosPhi * radius, Math.sin(theta) * sinPhi * radius]
}
```

- [ ] **Step 4: Implement the original procedural boy**

Create `src/subjects/boy.js`:

```js
import { sphericalPoint, writePoint } from './shared.js'

export const BOY_REGION = Object.freeze({
  HEAD: 0,
  TORSO: 1,
  RAISED_UPPER: 2,
  RAISED_LOWER: 3,
  FREE_UPPER: 4,
  FREE_LOWER: 5,
  LEFT_LEG: 6,
  RIGHT_LEG: 7,
})

const ellipsoid = (center, radii, region, weight) => ({ type: 'ellipsoid', center, radii, region, weight })
const capsule = (a, b, radius, region, weight) => ({ type: 'capsule', a, b, radius, region, weight })
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normalize = (v) => { const length = Math.hypot(...v); return v.map((value) => value / length) }

function sampleCapsule(part, random) {
  const axis = normalize(part.b.map((value, index) => value - part.a[index]))
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const side = normalize(cross(axis, helper))
  const up = normalize(cross(side, axis))
  const angle = random() * Math.PI * 2
  const radial = side.map((value, index) => value * Math.cos(angle) + up[index] * Math.sin(angle))
  const t = random()
  const radius = part.radius * (0.94 + random() * 0.1)
  return part.a.map((value, index) => value + (part.b[index] - value) * t + radial[index] * radius)
}

function samplePart(part, random) {
  if (part.type === 'capsule') return sampleCapsule(part, random)
  const direction = sphericalPoint(random, 1)
  const surface = 0.94 + random() * 0.1
  return part.center.map((value, index) => value + direction[index] * part.radii[index] * surface)
}

function createParts() {
  const R = BOY_REGION
  return [
    ellipsoid([0, 3.3, 0], [0.82, 0.95, 0.72], R.HEAD, 1.5),
    ellipsoid([0, 3.68, -0.03], [0.86, 0.62, 0.76], R.HEAD, 0.65),
    ellipsoid([-0.81, 3.3, 0], [0.14, 0.23, 0.16], R.HEAD, 0.15),
    ellipsoid([0.81, 3.3, 0], [0.14, 0.23, 0.16], R.HEAD, 0.15),
    ellipsoid([0, 3.25, 0.69], [0.15, 0.18, 0.18], R.HEAD, 0.15),
    capsule([0, 2.25, 0], [0, 2.58, 0], 0.28, R.TORSO, 0.3),
    ellipsoid([0, 1.35, 0], [0.95, 1.25, 0.48], R.TORSO, 2.4),
    ellipsoid([0, 0.2, 0], [0.75, 0.55, 0.45], R.TORSO, 1.1),
    capsule([-0.82, 2.05, 0], [-1.45, 2.85, 0], 0.27, R.RAISED_UPPER, 0.7),
    capsule([-1.45, 2.85, 0], [-1.2, 3.85, 0.05], 0.22, R.RAISED_LOWER, 0.6),
    ellipsoid([-1.18, 4.05, 0.05], [0.25, 0.35, 0.18], R.RAISED_LOWER, 0.35),
    capsule([0.82, 2.05, 0], [1.25, 0.95, 0.1], 0.28, R.FREE_UPPER, 0.7),
    capsule([1.25, 0.95, 0.1], [1.15, -0.05, 0.18], 0.22, R.FREE_LOWER, 0.6),
    ellipsoid([1.15, -0.22, 0.18], [0.23, 0.34, 0.18], R.FREE_LOWER, 0.3),
    capsule([-0.43, -0.05, 0], [-0.5, -1.85, 0.05], 0.34, R.LEFT_LEG, 1.1),
    capsule([-0.5, -1.85, 0.05], [-0.55, -3.55, 0], 0.27, R.LEFT_LEG, 1.0),
    capsule([0.43, -0.05, 0], [0.5, -1.85, 0.05], 0.34, R.RIGHT_LEG, 1.1),
    capsule([0.5, -1.85, 0.05], [0.55, -3.55, 0], 0.27, R.RIGHT_LEG, 1.0),
    ellipsoid([-0.55, -3.85, 0.18], [0.36, 0.25, 0.65], R.LEFT_LEG, 0.5),
    ellipsoid([0.55, -3.85, 0.18], [0.36, 0.25, 0.65], R.RIGHT_LEG, 0.5),
  ]
}

export function createBoy(count, random) {
  const positions = new Float32Array(count * 3)
  const regions = new Uint8Array(count)
  const parts = createParts()
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0)
  for (let index = 0; index < count; index += 1) {
    let selection = random() * totalWeight
    let part = parts[parts.length - 1]
    for (const candidate of parts) {
      selection -= candidate.weight
      if (selection <= 0) { part = candidate; break }
    }
    const [x, y, z] = samplePart(part, random)
    writePoint(positions, index, x, y, z)
    regions[index] = part.region
  }
  return { positions, regions }
}
```

- [ ] **Step 5: Aggregate boy metadata without breaking existing targets**

In `src/shapes.js`, remove the local `seededRandom`, `writePoint`, and `sphericalPoint` definitions. Add:

```js
import { createBoy } from './subjects/boy.js'
import { seededRandom, sphericalPoint, writePoint } from './subjects/shared.js'
export { seededRandom } from './subjects/shared.js'
```

Keep the existing abstract builders temporarily. Replace `createShapeTargets` with:

```js
export function createSubjectTargets(count = PARTICLE_COUNT) {
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_PARTICLE_COUNT')
  const random = seededRandom(31031)
  const phaseRandom = seededRandom(91031)
  const boy = createBoy(count, random)
  return {
    targets: [
      boy.positions,
      buildPipeline(count, random),
      buildConstellation(count, random),
      buildLattice(count, random),
    ],
    boyRegions: boy.regions,
    indiaOutlineCount: 0,
    phases: Float32Array.from({ length: count }, phaseRandom),
  }
}

export function createShapeTargets(count = PARTICLE_COUNT) {
  return createSubjectTargets(count).targets
}
```

- [ ] **Step 6: Run all tests and commit**

Run: `npm test`
Expected: PASS, 26 tests total.

```bash
git add src/shapes.js src/subjects/shared.js src/subjects/boy.js tests/boy.test.js
git commit -m "feat: generate articulated particle boy"
```

---

### Task 3: Local India Geometry and Particle Map

**Files:**
- Create: `scripts/prepare-india-map.mjs`
- Create: `src/data/india-outline.js` (generated by the script)
- Create: `src/subjects/india.js`
- Modify: `src/shapes.js`
- Test: `tests/india.test.js`

**Interfaces:**
- Consumes: `createSubjectTargets` structure from Task 2.
- Produces: `INDIA_RINGS: ReadonlyArray<ReadonlyArray<readonly [number,number]>>`, projected around `[0,0]` with height `8`.
- Produces: `createIndia(count, random, rings = INDIA_RINGS) → {positions, outlineCount}`; outline receives `28%` of particles.
- Produces: `pointInPolygon(point, ring) → boolean` for verification.

- [ ] **Step 1: Write failing India source, shape, orientation, and interior tests**

Create `tests/india.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { INDIA_RINGS } from '../src/data/india-outline.js'
import { createIndia, pointInPolygon } from '../src/subjects/india.js'
import { createSubjectTargets, seededRandom } from '../src/shapes.js'

const mainRing = INDIA_RINGS.reduce((largest, ring) => ring.length > largest.length ? ring : largest)

test('local India asset retains detailed Natural Earth geometry and attribution', () => {
  assert.ok(INDIA_RINGS.length >= 10)
  assert.ok(mainRing.length > 500)
  const source = readFileSync(new URL('../src/data/india-outline.js', import.meta.url), 'utf8')
  assert.ok(source.includes('Made with Natural Earth'))
  assert.ok(source.includes('public domain'))
  assert.ok(source.includes('ne_50m_admin_0_countries.geojson'))
  for (const ring of INDIA_RINGS) for (const point of ring) assert.ok(point.every(Number.isFinite))
})

test('India target has recognizable projected bounds and sampled interior', () => {
  const { positions, outlineCount } = createIndia(5000, seededRandom(31))
  assert.equal(outlineCount, 1400)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (let index = 0; index < 5000; index += 1) {
    const x = positions[index * 3], y = positions[index * 3 + 1]
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  const width = maxX - minX, height = maxY - minY
  assert.ok(height > 7.5 && height <= 8.05, `India height ${height}`)
  assert.ok(width / height > 0.75 && width / height < 1.15, `India aspect ${width / height}`)
  for (let index = outlineCount; index < outlineCount + 100; index += 1) {
    assert.ok(pointInPolygon([positions[index * 3], positions[index * 3 + 1]], mainRing), 'interior particle escaped mainland')
  }
  assert.ok(positions.every(Number.isFinite))
})

test('northern India remains west of the normalized center to reject mirroring', () => {
  const { positions } = createIndia(10000, seededRandom(31))
  let x = 0, count = 0
  for (let index = 0; index < 10000; index += 1) {
    if (positions[index * 3 + 1] > 2.5) { x += positions[index * 3]; count += 1 }
  }
  assert.ok(count > 20)
  assert.ok(x / count < 0, `northern centroid drifted east: ${x / count}`)
})

test('India target and outline allocation are deterministic in the aggregate', () => {
  const a = createSubjectTargets(2000)
  const b = createSubjectTargets(2000)
  assert.equal(a.indiaOutlineCount, 560)
  assert.deepEqual(a.targets[1], b.targets[1])
  assert.notDeepEqual(a.targets[0], a.targets[1])
})
```

- [ ] **Step 2: Verify the map tests fail before the asset exists**

Run: `node --test tests/india.test.js`
Expected: FAIL because `src/data/india-outline.js` is missing.

- [ ] **Step 3: Add the reproducible Natural Earth extractor**

Create `scripts/prepare-india-map.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises'

const SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
const TERMS = 'https://www.naturalearthdata.com/about/terms-of-use/'
const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`Natural Earth request failed: ${response.status}`)
const data = await response.json()
const feature = data.features.find((item) => item.properties.ADM0_A3 === 'IND' || item.properties.ISO_A3 === 'IND')
if (!feature) throw new Error('India geometry not found')
const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
const rings = polygons.map((polygon) => polygon[0]).filter((ring) => ring.length >= 6)
const coordinates = rings.flat()
const minLat = Math.min(...coordinates.map((point) => point[1]))
const maxLat = Math.max(...coordinates.map((point) => point[1]))
const cosLatitude = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180)
const projected = rings.map((ring) => ring.map(([longitude, latitude]) => [longitude * cosLatitude, latitude]))
const projectedCoordinates = projected.flat()
const minX = Math.min(...projectedCoordinates.map((point) => point[0]))
const maxX = Math.max(...projectedCoordinates.map((point) => point[0]))
const minY = Math.min(...projectedCoordinates.map((point) => point[1]))
const maxY = Math.max(...projectedCoordinates.map((point) => point[1]))
const centerX = (minX + maxX) / 2
const centerY = (minY + maxY) / 2
const scale = 8 / (maxY - minY)
const normalized = projected.map((ring) => ring.map(([x, y]) => [
  Number(((x - centerX) * scale).toFixed(5)),
  Number(((y - centerY) * scale).toFixed(5)),
]))
const arrayLiteral = `[\n${normalized.map((ring) => `  ${JSON.stringify(ring)}`).join(',\n')}\n]`
const output = `// Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com.\n// Natural Earth data is public domain: ${TERMS}\n// Source: ${SOURCE}\n// Generated by scripts/prepare-india-map.mjs; no runtime network request.\nexport const INDIA_RINGS = Object.freeze(${arrayLiteral}.map((ring) => Object.freeze(ring.map((point) => Object.freeze(point)))))\n`
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
await writeFile(new URL('../src/data/india-outline.js', import.meta.url), output)
console.log(`India: ${normalized.length} rings, ${normalized.reduce((sum, ring) => sum + ring.length, 0)} points`)
```

Run: `node scripts/prepare-india-map.mjs`
Expected: `India: 14 rings, 1518 points` (the verified source currently contains 14 outer rings and 1,518 outer-ring points).

- [ ] **Step 4: Implement outline and interior sampling**

Create `src/subjects/india.js`:

```js
import { INDIA_RINGS } from '../data/india-outline.js'
import { writePoint } from './shared.js'

export function pointInPolygon(point, ring) {
  const [x, y] = point
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [xi, yi] = ring[index]
    const [xj, yj] = ring[previous]
    const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi)
    if (intersects) inside = !inside
  }
  return inside
}

function buildOutline(rings) {
  const segments = []
  const cumulative = []
  let total = 0
  for (const ring of rings) {
    for (let index = 1; index < ring.length; index += 1) {
      const a = ring[index - 1], b = ring[index]
      const length = Math.hypot(b[0] - a[0], b[1] - a[1])
      if (length < 1e-6) continue
      total += length
      segments.push({ a, b })
      cumulative.push(total)
    }
  }
  return { segments, cumulative, total }
}

function sampleOutline(outline, random) {
  const value = random() * outline.total
  let low = 0, high = outline.cumulative.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (value <= outline.cumulative[middle]) high = middle
    else low = middle + 1
  }
  const segment = outline.segments[low]
  const t = random()
  return [
    segment.a[0] + (segment.b[0] - segment.a[0]) * t,
    segment.a[1] + (segment.b[1] - segment.a[1]) * t,
  ]
}

export function createIndia(count, random, rings = INDIA_RINGS) {
  const positions = new Float32Array(count * 3)
  const outlineCount = Math.floor(count * 0.28)
  const outline = buildOutline(rings)
  const mainland = rings.reduce((largest, ring) => ring.length > largest.length ? ring : largest)
  const xs = mainland.map((point) => point[0]), ys = mainland.map((point) => point[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)

  function sampleInterior() {
    for (let attempt = 0; attempt < 256; attempt += 1) {
      const point = [minX + random() * (maxX - minX), minY + random() * (maxY - minY)]
      if (pointInPolygon(point, mainland)) return point
    }
    return sampleOutline(outline, random)
  }

  for (let index = 0; index < count; index += 1) {
    const isOutline = index < outlineCount
    const [x, y] = isOutline ? sampleOutline(outline, random) : sampleInterior()
    const z = isOutline ? 0.08 + (random() - 0.5) * 0.12 : (random() - 0.5) * 0.32
    writePoint(positions, index, x, y, z)
  }
  return { positions, outlineCount }
}
```

- [ ] **Step 5: Connect India as morph target 1**

Add `import { createIndia } from './subjects/india.js'` to `src/shapes.js`. Delete the now-unused `buildPipeline` function. In `createSubjectTargets`, create `const india = createIndia(count, random)` after the boy and return:

```js
return {
  targets: [
    boy.positions,
    india.positions,
    buildConstellation(count, random),
    buildLattice(count, random),
  ],
  boyRegions: boy.regions,
  indiaOutlineCount: india.outlineCount,
  phases: Float32Array.from({ length: count }, phaseRandom),
}
```

- [ ] **Step 6: Run all tests and commit the local map**

Run: `npm test`
Expected: PASS, 30 tests total. If the northern-centroid test fails, inspect the projection and sampling; do not weaken the orientation assertion.

```bash
git add scripts/prepare-india-map.mjs src/data/india-outline.js src/subjects/india.js src/shapes.js tests/india.test.js
git commit -m "feat: morph portrait into particle India"
```

---

### Task 4: Constellation, Portal, Centered Scene, and Ambient Depth

**Files:**
- Create: `src/subjects/constellation.js`
- Create: `src/subjects/portal.js`
- Replace: `src/shapes.js`
- Replace: `src/scene.js`
- Modify: `src/play.js`
- Test: `tests/scene.test.js`
- Test: `tests/visual-review.test.js`

**Interfaces:**
- Consumes: boy, India, shared random, phases, and metadata from Tasks 2–3.
- Produces: final `createSubjectTargets` with no legacy abstract builders.
- Produces: Edit3D objects `dataUniverse`, `particleField`, `ambientDust`, `camera`; no `network` or `coreRings`.
- Produces to playback: `{universe, particles, dust, camera, targets, boyRegions, indiaOutlineCount, phases}`.

- [ ] **Step 1: Update scene and visual contracts to reject the old off-center rings**

In `tests/scene.test.js`, change registered-object expectations to `['dataUniverse', 'particleField', 'ambientDust', 'camera']` and expect two named materials. In the parameter-subscription test, change the three sampled color offsets from `7 * 3` to `10 * 3`; index `10` uses the editable cyan outline color. Replace the ring test with:

```js
test('ambient dust is a separate secondary point field', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  const particles = asset.objects.get('particleField')
  const dust = asset.objects.get('ambientDust')
  assert.ok(dust instanceof THREE.Points)
  assert.equal(dust.geometry.attributes.position.count, 1200)
  assert.ok(dust.material.opacity < particles.material.opacity)
  assert.ok(dust.material.size < particles.material.size)
  assert.ok(dust.material.name.trim().length > 0)
  result.dispose()
})
```

In `tests/visual-review.test.js`, replace the offset and ring cases with:

```js
test('Play centers the universe and camera on the immersive subject', async () => {
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(makeContext())
  play.update(0)
  assert.equal(result.scene.getObjectByName('Data Universe').position.x, 0)
  const expected = new THREE.Vector3(0, 0, 0).sub(result.camera.position).normalize()
  const actual = result.camera.getWorldDirection(new THREE.Vector3())
  assert.ok(actual.dot(expected) > 0.999999)
  play.dispose()
  result.dispose()
})
```

Use particle size `>= 0.07`, opacity `>= 0.9`, and base luminance `> 0.55` in the legibility test. Replace the palette test with:

```js
test('particle palette contains visible cyan and violet accents', () => {
  const result = createScene({ asset: makeAsset() })
  const colors = result.scene.getObjectByName('Particle Field').geometry.attributes.color.array
  let cyan = 0, violet = 0
  for (let index = 0; index < colors.length; index += 3) {
    if (colors[index] < 0.1 && colors[index + 1] > 0.5 && colors[index + 2] > 0.8) cyan += 1
    if (colors[index] > 0.2 && colors[index + 1] < 0.4 && colors[index + 2] > 0.5) violet += 1
  }
  assert.ok(cyan > 100)
  assert.ok(violet > 100)
  result.dispose()
})
```

In the reduced-motion test, assert `Data Universe.rotation.y === 0` and `Ambient Dust.rotation.y === 0`; remove the `Core Rings` assertion.

- [ ] **Step 2: Run tests and observe missing new objects**

Run: `node --test tests/scene.test.js tests/visual-review.test.js`
Expected: FAIL on missing `ambientDust`, the centered universe, and removed rings.

- [ ] **Step 3: Implement the final constellation and portal**

Create `src/subjects/constellation.js`:

```js
import { writePoint } from './shared.js'

export function createConstellation(count, random) {
  const positions = new Float32Array(count * 3)
  const radii = [2.1, 3.0, 3.9, 4.75]
  for (let index = 0; index < count; index += 1) {
    const group = index % 4
    const theta = random() * Math.PI * 2
    const cosPhi = random() * 2 - 1
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
    const radius = radii[group] + (random() - 0.5) * 0.18
    const x = Math.cos(theta) * sinPhi * radius
    const y = cosPhi * radius * 0.76
    const z = Math.sin(theta) * sinPhi * radius
    const tilt = (group - 1.5) * 0.22
    writePoint(positions, index, x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt))
  }
  return positions
}
```

Create `src/subjects/portal.js`:

```js
import { writePoint } from './shared.js'

export function createPortal(count, random) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.72) {
      const ring = index % 18
      const angle = random() * Math.PI * 2 + ring * 0.08
      const radius = 1.1 + ring * 0.23 + (random() - 0.5) * 0.07
      const z = -4.8 + ring / 17 * 7.8 + (random() - 0.5) * 0.16
      writePoint(positions, index, Math.cos(angle) * radius, Math.sin(angle) * radius, z)
    } else {
      const t = random()
      const angle = t * Math.PI * 6 + (index % 4) * Math.PI * 0.5
      const radius = 1.1 + t * 4
      writePoint(positions, index, Math.cos(angle) * radius, Math.sin(angle) * radius, -4.8 + t * 7.8)
    }
  }
  return positions
}
```

- [ ] **Step 4: Finish the pure four-target aggregator**

Replace `src/shapes.js` with:

```js
import { createBoy } from './subjects/boy.js'
import { createIndia } from './subjects/india.js'
import { createConstellation } from './subjects/constellation.js'
import { createPortal } from './subjects/portal.js'
import { seededRandom } from './subjects/shared.js'
export { seededRandom } from './subjects/shared.js'

export const SECTION_IDS = ['hero', 'experience', 'skills', 'contact']
export const PARTICLE_COUNT = 20000

export function createSubjectTargets(count = PARTICLE_COUNT) {
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_PARTICLE_COUNT')
  const random = seededRandom(31031)
  const phaseRandom = seededRandom(91031)
  const boy = createBoy(count, random)
  const india = createIndia(count, random)
  return {
    targets: [
      boy.positions,
      india.positions,
      createConstellation(count, random),
      createPortal(count, random),
    ],
    boyRegions: boy.regions,
    indiaOutlineCount: india.outlineCount,
    phases: Float32Array.from({ length: count }, phaseRandom),
  }
}

export function createShapeTargets(count = PARTICLE_COUNT) {
  return createSubjectTargets(count).targets
}
```

- [ ] **Step 5: Replace the scene with two point fields and editable parameters**

Replace `src/scene.js` with:

```js
import * as THREE from 'three'
import { createSubjectTargets, PARTICLE_COUNT } from './shapes.js'
import { seededRandom, sphericalPoint, writePoint } from './subjects/shared.js'
import { enableToneMapping } from './environment/tonemap.js'

function createParticleSprite() {
  const size = 16
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5) / size * 2 - 1
      const dy = (y + 0.5) / size * 2 - 1
      const alpha = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy))
      const offset = (y * size + x) * 4
      data[offset] = data[offset + 1] = data[offset + 2] = 255
      data[offset + 3] = Math.round(alpha * alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  texture.name = 'Particle Portrait · Soft Sprite'
  return texture
}

function createAmbientDust(sprite) {
  const count = 1200
  const random = seededRandom(7031)
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const [x, y, z] = sphericalPoint(random, 7 + random() * 7)
    writePoint(positions, index, x, y * 0.65, z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    name: 'Particle Portrait · Ambient Dust', size: 0.025, map: sprite,
    color: '#6B8798', transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const dust = new THREE.Points(geometry, material)
  dust.name = 'Ambient Dust'
  return dust
}

export function createScene({ asset }) {
  enableToneMapping({ curve: 'aces' })
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#05070B')
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0.2, 18)
  camera.lookAt(0, 0, 0)
  camera.name = 'Main camera · Particle Portrait'

  const settings = { particleSize: 0.075, motionSpeed: 1, flowIntensity: 0.7, cyan: '#00D4FF', violet: '#9D4EDD' }
  const subject = createSubjectTargets(PARTICLE_COUNT)
  const universe = new THREE.Group()
  universe.name = 'Data Universe'
  const sprite = createParticleSprite()
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(subject.targets[0]), 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
  const particleMaterial = new THREE.PointsMaterial({
    name: 'Particle Portrait · Living Points', size: settings.particleSize,
    sizeAttenuation: true, map: sprite, transparent: true, opacity: 0.94,
    blending: THREE.AdditiveBlending, alphaTest: 0.015, depthWrite: false, vertexColors: true,
  })
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  particles.name = 'Particle Field'
  const dust = createAmbientDust(sprite)
  universe.add(particles)
  scene.add(universe, dust, camera)

  asset.register('dataUniverse', universe, { name: 'Data Universe' })
  asset.register('particleField', particles, { name: 'Particle Field', parent: 'dataUniverse' })
  asset.register('ambientDust', dust, { name: 'Ambient Dust' })
  asset.register('camera', camera, { name: 'Main camera' })
  asset.registerParams('dataField', settings, {
    particleSize: { label: 'Particle size', type: 'number', min: 0.02, max: 0.14, step: 0.005 },
  }, { name: 'Data Field' })
  asset.registerParams('dataMotion', settings, {
    motionSpeed: { label: 'Motion speed', type: 'number', min: 0, max: 3, step: 0.1 },
    flowIntensity: { label: 'Flow intensity', type: 'number', min: 0, max: 1.5, step: 0.05 },
  }, { name: 'Data Motion' })
  asset.registerParams('dataPalette', settings, {
    cyan: { label: 'Cyan accent', type: 'color' }, violet: { label: 'Violet accent', type: 'color' },
  }, { name: 'Data Palette' })

  const baseColor = new THREE.Color('#E4EBF0')
  const cyanColor = new THREE.Color()
  const violetColor = new THREE.Color()
  function applyParams() {
    particleMaterial.size = settings.particleSize
    particleMaterial.color.set('#FFFFFF')
    cyanColor.set(settings.cyan)
    violetColor.set(settings.violet)
    const colors = particleGeometry.attributes.color
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      let color
      if (index < subject.indiaOutlineCount) color = index % 5 === 0 ? cyanColor : baseColor
      else {
        const band = index % 17
        color = band < 10 ? baseColor : band < 14 ? cyanColor : violetColor
      }
      colors.setXYZ(index, color.r, color.g, color.b)
    }
    colors.needsUpdate = true
  }
  const unsubscribe = asset.subscribe(({ type }) => { if (type === 'change') applyParams() })
  applyParams()

  return {
    scene,
    camera,
    play: async (context) => {
      const { playPortfolio } = await import('./play.js')
      return playPortfolio(context, {
        universe, particles, dust, camera,
        targets: subject.targets,
        boyRegions: subject.boyRegions,
        indiaOutlineCount: subject.indiaOutlineCount,
        phases: subject.phases,
      }, settings)
    },
    dispose() {
      unsubscribe()
      const resources = new Set()
      scene.traverse((object) => {
        if (object.geometry) resources.add(object.geometry)
        for (const material of [object.material].flat()) {
          if (!material) continue
          resources.add(material)
          for (const value of Object.values(material)) if (value?.isTexture) resources.add(value)
        }
      })
      for (const resource of resources) resource.dispose()
    },
  }
}
```

- [ ] **Step 6: Remove network/ring playback and hold readable chapter poses**

In `src/play.js`, change the object destructuring to:

```js
const { universe, particles, dust, camera, targets } = objects
```

Delete `networkPositions` and every network/core-ring update. Replace `setEmphasis` with:

```js
function setEmphasis(detail = {}) {
  emphasisKind = detail.kind || null
  emphasisIndex = Number.isInteger(detail.index) ? detail.index : 0
  particles.material.color.set(emphasisKind ? '#E9FBFF' : '#FFFFFF')
}
```

Replace `update(dt)` with:

```js
function update(dt) {
  const safeDt = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0))
  if (!reducedMotion.matches) time += safeDt * settings.motionSpeed
  progress = reducedMotion.matches ? targetProgress : damp(progress, targetProgress, 4.2, safeDt)
  sampleMorph(targets, getMorphFrame(progress), positions.array)
  const boyWeight = Math.max(0, 1 - progress)
  const mapWeight = Math.max(0, 1 - Math.abs(progress - 1))
  const skillWeight = Math.max(0, 1 - Math.abs(progress - 2))
  const skillAngle = emphasisKind === 'skill' ? skillWeight * 0.35 : 0
  const skillCos = Math.cos(skillAngle), skillSin = Math.sin(skillAngle)
  const flow = reducedMotion.matches ? 0 : settings.flowIntensity
  const pointerX = pointer.x * 5.5
  const pointerY = pointer.y * 3.8
  const dissolveRadius = 1.25 + settings.flowIntensity * 0.35
  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    let x = positions.array[offset], y = positions.array[offset + 1], z = positions.array[offset + 2]
    if (skillAngle > 0 && index % 4 === emphasisIndex) {
      const rotatedY = y * skillCos - z * skillSin
      z = y * skillSin + z * skillCos
      y = rotatedY
    }
    if (flow > 0) {
      y += Math.sin(time * 0.9 + index * 0.017) * 0.018 * flow
      z += Math.cos(time * 0.7 + index * 0.013) * 0.018 * flow
    }
    if (pointer.active && !reducedMotion.matches) {
      const dx = x - pointerX, dy = y - pointerY
      const distanceSquared = dx * dx + dy * dy + z * z * 0.08
      if (distanceSquared < dissolveRadius * dissolveRadius && distanceSquared > 0.0001) {
        const distance = Math.sqrt(distanceSquared)
        const strength = (1 - distance / dissolveRadius) * settings.flowIntensity * 0.55
        x += dx / distance * strength
        y += dy / distance * strength
        z += strength * 0.35
      }
    }
    positions.array[offset] = x; positions.array[offset + 1] = y; positions.array[offset + 2] = z
  }
  positions.needsUpdate = true
  particles.material.opacity = emphasisKind === 'experience' && mapWeight > 0 && !reducedMotion.matches
    ? 0.9 + (Math.sin(time * 3) + 1) * 0.04 * mapWeight
    : 0.94

  const mobile = !embedded && browserWindow?.innerWidth <= 760
  universe.position.x = damp(universe.position.x, 0, 5, safeDt)
  universe.position.y = damp(universe.position.y, mobile ? 1.7 : 0, 5, safeDt)
  const scale = damp(universe.scale.x, mobile ? 0.68 : 1, 5, safeDt)
  universe.scale.setScalar(scale)
  universe.rotation.y = time * 0.06 * (1 - boyWeight - mapWeight) + Math.sin(time * 0.35) * 0.08 * mapWeight + (emphasisKind === 'experience' ? emphasisIndex * 0.08 : 0)
  universe.rotation.x = Math.sin(time * 0.22) * 0.025 * (1 - boyWeight)
  dust.rotation.y = time * 0.008
  camera.position.x = pointer.active && !reducedMotion.matches ? pointer.x * 0.22 : 0
  camera.position.y = 0.2 + (pointer.active && !reducedMotion.matches ? pointer.y * 0.14 : 0)
  camera.lookAt(0, 0, 0)
}
```

- [ ] **Step 7: Run all tests and commit the scene**

Run: `npm test`
Expected: PASS, 30 tests total; no `Core Ring`, `network`, or `coreRings` reference remains in source/tests.

```bash
git add src/shapes.js src/scene.js src/play.js src/subjects/constellation.js src/subjects/portal.js tests/scene.test.js tests/visual-review.test.js
git commit -m "feat: center immersive particle chapter scenes"
```

---

### Task 5: Full-Screen Edge Typography and Progressive Skill UI

**Files:**
- Replace: `src/styles.css`
- Replace: `src/site.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: the four-chapter HTML from Task 1.
- Produces: `#chapter-progress-fill` updates, `html.js` enhancement marker, and `data-skill-tools` panel collapsing.
- Preserves: `initSite({onSection, onEmphasis}) → {goTo, dispose}` and all `portfolio:*` events.

- [ ] **Step 1: Add the failing progressive-enhancement and edge-layout tests**

Add to `tests/content.test.js`:

```js
test('skill panels are readable before JavaScript and enhanced after initialization', () => {
  const site = readFileSync(new URL('../src/site.js', import.meta.url), 'utf8')
  assert.ok(!/<ul class="skill-tools"[^>]*hidden/.test(html))
  for (let index = 0; index < 4; index += 1) {
    assert.ok(html.includes(`aria-controls="skill-tools-${index}"`))
    assert.ok(html.includes(`data-skill-tools="${index}"`))
  }
  assert.ok(site.includes('panel.hidden = Number(panel.dataset.skillTools) !== index'))
  assert.ok(site.includes("document.documentElement.classList.add('js')"))
})

test('immersive layout uses full viewport scenes and centered-edge composition', () => {
  assert.ok(css.includes('min-height: 100svh'))
  assert.ok(css.includes('left: 50%'))
  assert.ok(css.includes('grid-template-columns: 1fr'))
  assert.ok(css.includes('.experience-list'))
  assert.ok(css.includes('.chapter-progress'))
  assert.ok(!css.includes('min-height: 175svh'))
})
```

Update the old overlay test to assert the new edge colors `rgba(5, 7, 11, 0.82)` and `rgba(5, 7, 11, 0.65)` instead of the old left-panel gradient values. Replace the brittle mobile-status assertion with `assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.scene-status\s*\{[^}]*display:\s*none;/)` so it checks behavior rather than declaration formatting.

- [ ] **Step 2: Run content tests and observe the old layout fail**

Run: `node --test tests/content.test.js`
Expected: FAIL on missing progressive skill behavior and old full-height experience/gradient CSS.

- [ ] **Step 3: Implement navigation, progress, and accessible skill enhancement**

Replace `src/site.js` with:

```js
import { SECTIONS } from './content.js'

export function initSite({ onSection, onEmphasis } = {}) {
  const controller = new AbortController()
  const { signal } = controller
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sections = SECTIONS.map(({ id }) => document.getElementById(id))
  const navLinks = [...document.querySelectorAll('[data-nav-link]')]
  const skillPanels = [...document.querySelectorAll('[data-skill-tools]')]
  const progressFill = document.getElementById('chapter-progress-fill')
  const visibility = SECTIONS.map(() => 0)
  let activeIndex = -1

  function emitSection(index) {
    const detail = { index }
    onSection?.(detail)
    window.dispatchEvent(new CustomEvent('portfolio:section', { detail }))
  }

  function setSkillPanel(index) {
    for (const panel of skillPanels) panel.hidden = Number(panel.dataset.skillTools) !== index
  }

  function setActive(index, force = false) {
    if (!Number.isInteger(index) || index < 0 || index >= SECTIONS.length) return
    if (index === activeIndex && !force) return
    activeIndex = index
    document.body.dataset.section = SECTIONS[index].id
    if (progressFill) progressFill.style.transform = `scaleX(${(index + 1) / SECTIONS.length})`
    for (const link of navLinks) {
      if (Number(link.dataset.navLink) === index) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    emitSection(index)
  }

  function goTo(index) {
    const section = sections[index]
    if (!section) return
    setActive(index, true)
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' })
  }

  for (const link of navLinks) {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      goTo(Number(link.dataset.navLink))
    }, { signal })
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const index = sections.indexOf(entry.target)
      if (index >= 0) visibility[index] = entry.isIntersecting ? entry.intersectionRatio : 0
    }
    let bestIndex = 0
    for (let index = 1; index < visibility.length; index += 1) {
      if (visibility[index] > visibility[bestIndex]) bestIndex = index
    }
    if (visibility[bestIndex] > 0) setActive(bestIndex)
  }, { threshold: [0.15, 0.35, 0.55, 0.75], rootMargin: '-12% 0px -28% 0px' })
  sections.forEach((section) => section && observer.observe(section))

  function bindEmphasis(selector, kind) {
    const items = [...document.querySelectorAll(selector)]
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        const group = kind === 'skill' ? '[data-skill-group]' : '.experience-select'
        for (const candidate of document.querySelectorAll(group)) {
          candidate.classList.toggle('is-active', candidate === item)
          candidate.setAttribute('aria-pressed', String(candidate === item))
          if (kind === 'experience') candidate.closest('.experience-item')?.classList.toggle('is-active', candidate === item)
        }
        if (kind === 'skill') setSkillPanel(index)
        const detail = { kind, index }
        onEmphasis?.(detail)
        window.dispatchEvent(new CustomEvent('portfolio:emphasis', { detail }))
      }, { signal })
    })
  }

  bindEmphasis('[data-skill-group]', 'skill')
  bindEmphasis('.experience-select', 'experience')
  setSkillPanel(0)
  document.documentElement.classList.add('js')
  const year = document.getElementById('current-year')
  if (year) year.textContent = String(new Date().getFullYear())
  setActive(0)

  return {
    goTo,
    dispose() {
      observer.disconnect()
      controller.abort()
      document.documentElement.classList.remove('js')
      for (const panel of skillPanels) panel.hidden = false
    },
  }
}
```

- [ ] **Step 4: Replace the side-panel CSS with the immersive visual system**

Replace `src/styles.css` with the following complete stylesheet:

```css
:root {
  color-scheme: dark;
  --background: #05070b;
  --text: #edf2f4;
  --muted: #94a1ad;
  --faint: #5d6b77;
  --line: rgba(190, 216, 228, 0.18);
  --cyan: #00d4ff;
  --violet: #9d4edd;
  --green: #00ff88;
  --mono: 'Fira Code', monospace;
  --sans: 'Inter', sans-serif;
  --page-padding: clamp(24px, 4.5vw, 76px);
}
* { box-sizing: border-box; }
html { background: var(--background); scroll-behavior: smooth; scrollbar-color: var(--faint) var(--background); }
body { margin: 0; min-width: 320px; overflow-x: hidden; background: var(--background); color: var(--text); font-family: var(--sans); line-height: 1.5; -webkit-font-smoothing: antialiased; }
body::before { position: fixed; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(5, 7, 11, 0.82), transparent 28%, transparent 72%, rgba(5, 7, 11, 0.82)), linear-gradient(180deg, rgba(5, 7, 11, 0.55), transparent 22%, transparent 76%, rgba(5, 7, 11, 0.65)); content: ''; pointer-events: none; }
a { color: inherit; text-decoration: none; }
button { color: inherit; font: inherit; }
button, a[href] { min-height: 44px; -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible { outline: 2px solid var(--cyan); outline-offset: 5px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.skip-link { position: fixed; top: 12px; left: 12px; z-index: 100; padding: 10px 16px; transform: translateY(-160%); background: var(--cyan); color: var(--background); font: 12px var(--mono); }
.skip-link:focus { transform: translateY(0); }
#app { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
#app canvas { display: block; }
.scene-shade { position: fixed; inset: 0; z-index: 1; background: radial-gradient(circle at 50% 46%, transparent 20%, rgba(5, 7, 11, 0.08) 55%, rgba(5, 7, 11, 0.38) 100%); pointer-events: none; }
.chapter-progress { position: fixed; top: 0; right: 0; left: 0; z-index: 40; height: 2px; background: rgba(255, 255, 255, 0.05); pointer-events: none; }
.chapter-progress span { display: block; width: 100%; height: 100%; transform: scaleX(0.25); transform-origin: left; background: linear-gradient(90deg, var(--cyan), var(--violet)); transition: transform 450ms ease; }
.site-header { position: fixed; top: 0; left: 0; z-index: 20; display: flex; width: 100%; align-items: center; justify-content: space-between; padding: 24px var(--page-padding); pointer-events: none; }
.site-header a { pointer-events: auto; }
.brand { display: inline-flex; align-items: center; gap: 12px; }
.brand-mark { display: grid; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(0, 212, 255, 0.48); color: var(--cyan); font: 12px var(--mono); }
.brand-copy { color: var(--muted); font: 8px/1.6 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; }
.section-nav { display: flex; align-items: center; gap: clamp(12px, 2.3vw, 34px); }
.section-nav a { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 8px 0; color: var(--muted); font-size: 10px; transition: color 180ms ease; }
.section-nav a::after { position: absolute; right: 0; bottom: 2px; left: 0; height: 1px; transform: scaleX(0); transform-origin: left; background: var(--cyan); content: ''; transition: transform 220ms ease; }
.section-nav a:hover, .section-nav a[aria-current='page'] { color: var(--text); }
.section-nav a[aria-current='page']::after { transform: scaleX(1); }
.nav-index { color: var(--cyan); font: 9px var(--mono); }
.scene-status { position: fixed; right: var(--page-padding); bottom: 22px; z-index: 10; display: flex; align-items: center; gap: 9px; color: var(--muted); font: 8px var(--mono); letter-spacing: 0.12em; text-transform: uppercase; pointer-events: none; }
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 14px rgba(0, 212, 255, 0.7); animation: status-pulse 2s ease-in-out infinite; }
@keyframes status-pulse { 50% { opacity: 0.35; } }
#portfolio { position: relative; z-index: 2; }
.section { position: relative; display: flex; min-height: 100svh; align-items: center; padding: 100px var(--page-padding) 70px; }
.section-inner { position: relative; width: 100%; max-width: 1800px; min-height: calc(100svh - 170px); margin: 0 auto; }
.chapter-tag { margin: 0; color: var(--cyan); font: 9px var(--mono); letter-spacing: 0.16em; text-transform: uppercase; }
.hero-tag { position: absolute; top: 4%; left: 0; }
.hero-name { position: absolute; bottom: 9%; left: 0; display: flex; margin: 0; flex-direction: column; font-size: clamp(4rem, 6.8vw, 8rem); font-weight: 600; letter-spacing: -0.075em; line-height: 0.82; }
.hero-name span:last-child { color: transparent; -webkit-text-stroke: 1px rgba(237, 242, 244, 0.7); }
.hero-role { position: absolute; top: 9%; right: 0; margin: 0; color: var(--text); font: 11px var(--mono); letter-spacing: 0.16em; text-transform: uppercase; }
.hero-role::before { color: var(--cyan); content: '> '; }
.scroll-cue { position: absolute; bottom: 1%; left: 50%; display: flex; align-items: center; gap: 12px; transform: translateX(-50%); color: var(--muted); font: 8px var(--mono); letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }
.scroll-cue-line { width: 42px; height: 1px; background: var(--line); }
.scroll-cue-line::after { display: block; width: 50%; height: 100%; background: var(--cyan); content: ''; animation: scroll-line 2.4s ease-in-out infinite; }
@keyframes scroll-line { from { transform: translateX(-110%); } to { transform: translateX(220%); } }
.location-heading { position: absolute; top: 7%; left: 0; }
.location-heading h2, .contact .section-heading h2 { margin: 18px 0 0; font-size: clamp(3.2rem, 5.2vw, 6.2rem); font-weight: 500; letter-spacing: -0.065em; line-height: 0.94; }
.location-heading h2 span { color: transparent; -webkit-text-stroke: 1px rgba(237, 242, 244, 0.72); }
.experience-total { position: absolute; top: 8%; right: 0; display: flex; margin: 0; align-items: flex-end; gap: 12px; }
.experience-total strong { font-size: clamp(3rem, 5vw, 5.8rem); font-weight: 300; letter-spacing: -0.07em; line-height: 0.8; }
.experience-total span { max-width: 90px; color: var(--muted); font: 8px/1.6 var(--mono); letter-spacing: 0.1em; text-transform: uppercase; }
.experience-list { display: contents; }
.experience-item { position: absolute; width: min(21vw, 280px); border-top: 1px solid var(--line); transition: border-color 180ms ease; }
.experience-item[data-experience='0'] { bottom: 5%; left: 0; }
.experience-item[data-experience='1'] { right: 0; bottom: 8%; }
.experience-item[data-experience='2'] { top: 43%; left: 0; }
.experience-item[data-experience='3'] { top: 39%; right: 0; }
.experience-item.is-active { border-color: var(--cyan); }
.experience-select { display: flex; width: 100%; min-height: 100px; padding: 14px 0; flex-direction: column; align-items: flex-start; border: 0; background: transparent; text-align: left; cursor: pointer; }
.experience-company { font-size: clamp(18px, 1.8vw, 26px); font-weight: 500; letter-spacing: -0.035em; }
.experience-role { margin-top: 4px; color: var(--muted); font: 9px var(--mono); }
.experience-date { margin-top: 9px; color: var(--faint); font: 8px var(--mono); }
.experience-item.is-active .experience-company { color: var(--cyan); }
.skills-tag { position: absolute; top: 4%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.skill-groups { display: contents; }
.skill-group { position: absolute; display: flex; width: min(20vw, 230px); align-items: center; gap: 14px; padding: 14px 0; border: 0; border-bottom: 1px solid var(--line); background: transparent; font-size: clamp(16px, 1.6vw, 23px); text-align: left; cursor: pointer; }
.skill-group span { color: var(--faint); font: 8px var(--mono); }
.skill-group[data-skill-group='0'] { top: 21%; left: 0; }
.skill-group[data-skill-group='1'] { top: 21%; right: 0; }
.skill-group[data-skill-group='2'] { bottom: 22%; left: 0; }
.skill-group[data-skill-group='3'] { right: 0; bottom: 22%; }
.skill-group.is-active { border-color: var(--cyan); color: var(--cyan); }
.skill-tool-panels { position: absolute; bottom: 1%; left: 50%; display: grid; width: min(900px, 90vw); transform: translateX(-50%); gap: 12px; }
.skill-tools { display: flex; margin: 0; padding: 0; flex-wrap: wrap; justify-content: center; gap: 8px; list-style: none; }
.skill-tools[hidden] { display: none; }
.skill-tools li { padding: 6px 10px; border: 1px solid var(--line); color: var(--text); font: 9px var(--mono); }
.contact .section-heading { position: absolute; top: 9%; left: 0; }
.contact-links { position: absolute; right: 0; bottom: 12%; left: 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.contact-email { border-bottom: 1px solid var(--line); font-size: clamp(1.5rem, 2.7vw, 3.2rem); font-weight: 300; letter-spacing: -0.05em; transition: color 180ms ease, border-color 180ms ease; }
.contact-email:hover { border-color: var(--cyan); color: var(--cyan); }
.contact-github { display: flex; align-items: center; gap: 16px; color: var(--muted); font: 10px var(--mono); }
.contact-github span:last-child { color: var(--text); }
.site-footer { position: absolute; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--line); color: var(--faint); font: 7px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; }
.scene-play-controls { position: absolute; right: 24px; bottom: 24px; left: 24px; display: none; align-items: center; justify-content: center; gap: 8px; pointer-events: none; }
.embedded-mode .scene-play-controls { display: flex; }
.scene-play-controls button { min-height: 44px; padding: 8px 12px; border: 1px solid var(--line); background: rgba(5, 7, 11, 0.88); color: var(--text); font: 10px var(--mono); cursor: pointer; pointer-events: auto; }
.scene-play-controls button[aria-pressed='true'] { border-color: var(--cyan); color: var(--cyan); }
.scene-play-hint { position: absolute; top: 18px; left: 50%; display: none; width: max-content; max-width: calc(100% - 36px); transform: translateX(-50%); color: var(--muted); font: 10px var(--mono); text-align: center; }
.embedded-mode .scene-play-hint { display: block; }
.embedded-mode #portfolio, .embedded-mode .site-header, .embedded-mode .scene-status, .embedded-mode .scene-shade, .embedded-mode .skip-link, .embedded-mode .chapter-progress { display: none; }
body.embedded-mode::before { display: none; }
html[data-webgl='ready'] .status-dot { background: var(--green); }
html[data-webgl='unavailable'] #app { display: none; }
html[data-webgl='unavailable'] body { background-image: linear-gradient(rgba(0, 212, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.025) 1px, transparent 1px); background-size: 56px 56px; }
@media (max-width: 1080px) {
  .section-nav { gap: 16px; }
  .nav-label { display: none; }
  .experience-item, .skill-group { width: min(23vw, 240px); }
}
@media (max-width: 760px) {
  :root { --page-padding: 20px; }
  body::before { background: linear-gradient(180deg, rgba(5, 7, 11, 0.68), transparent 24%, transparent 52%, rgba(5, 7, 11, 0.82) 78%, rgba(5, 7, 11, 0.96)); }
  .site-header { padding-top: 14px; padding-bottom: 14px; }
  .brand-copy { display: none; }
  .section-nav { gap: 12px; }
  .section-nav a { min-width: 24px; justify-content: center; }
  .scene-status { display: none; }
  .section { min-height: 100svh; padding: 82px var(--page-padding) 48px; }
  .section-inner { min-height: calc(100svh - 130px); }
  .hero-tag { top: 0; }
  .hero-name { bottom: 5%; font-size: clamp(3.7rem, 16vw, 6rem); }
  .hero-role { top: 1%; font-size: 9px; }
  .scroll-cue { bottom: 0; }
  .scroll-cue span:last-child { display: none; }
  .location-heading { top: 0; }
  .location-heading h2, .contact .section-heading h2 { margin-top: 12px; font-size: clamp(2.8rem, 12vw, 4.6rem); }
  .experience-total { top: 1%; gap: 7px; }
  .experience-total strong { font-size: 2.8rem; }
  .experience-total span { max-width: 62px; font-size: 6px; }
  .experience-list { position: absolute; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr; }
  .experience-item { position: static; width: 100%; }
  .experience-select { display: grid; min-height: 60px; padding: 9px 0; grid-template-columns: 1fr auto; align-items: center; column-gap: 12px; }
  .experience-company { font-size: 16px; }
  .experience-role { margin: 0; grid-column: 1; font-size: 8px; }
  .experience-date { margin: 0; grid-column: 2; grid-row: 1 / span 2; font-size: 7px; text-align: right; }
  .skills-tag { top: 0; }
  .skill-group { width: 44%; font-size: 15px; }
  .skill-group[data-skill-group='0'], .skill-group[data-skill-group='1'] { top: 12%; }
  .skill-group[data-skill-group='2'], .skill-group[data-skill-group='3'] { bottom: 23%; }
  .skill-tool-panels { bottom: 2%; width: 100%; }
  .skill-tools { gap: 6px; }
  .skill-tools li { padding: 5px 7px; font-size: 8px; }
  .contact .section-heading { top: 2%; }
  .contact-links { bottom: 13%; flex-direction: column; align-items: flex-start; }
  .contact-email { font-size: clamp(1.35rem, 6.5vw, 2rem); }
  .site-footer { flex-direction: column; gap: 6px; font-size: 6px; }
  .embedded-mode .scene-play-controls { right: 10px; bottom: 10px; left: 10px; flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 5: Run all tests and commit the visual layout**

Run: `npm test`
Expected: PASS, 31 tests total.

```bash
git add src/styles.css src/site.js tests/content.test.js
git commit -m "feat: compose immersive edge typography and controls"
```

---

### Task 6: Living Boy Rig, Curved Morphs, Reduced Motion, and Visibility

**Files:**
- Create: `src/boy-motion.js`
- Modify: `src/morph.js:27-34`
- Modify: `src/play.js`
- Test: `tests/boy-motion.test.js`
- Test: `tests/play.test.js`

**Interfaces:**
- Consumes: `boyRegions` and `phases` from `createSubjectTargets`; `BOY_REGION` from the boy generator.
- Produces: `applyBoyMotion(output, regions, time, pointer, weight) → output`.
- Extends: `sampleMorph(targets, frame, output, phases = null)`; omitted phases preserve linear behavior.
- Guarantees: hidden documents return before buffer writes; the first visible frame uses `dt = 0`.

- [ ] **Step 1: Write failing rig, curved-endpoint, and hidden-document tests**

Create `tests/boy-motion.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { applyBoyMotion } from '../src/boy-motion.js'
import { createBoy, BOY_REGION } from '../src/subjects/boy.js'
import { seededRandom } from '../src/subjects/shared.js'

function displacement(a, b, regions, region) {
  let total = 0, count = 0
  for (let index = 0; index < regions.length; index += 1) {
    if (regions[index] !== region) continue
    total += Math.hypot(a[index * 3] - b[index * 3], a[index * 3 + 1] - b[index * 3 + 1], a[index * 3 + 2] - b[index * 3 + 2])
    count += 1
  }
  return total / count
}

test('zero rig weight preserves exact morph endpoints', () => {
  const { positions, regions } = createBoy(1000, seededRandom(31))
  const output = new Float32Array(positions)
  assert.strictEqual(applyBoyMotion(output, regions, 2, { x: 1, active: true }, 0), output)
  assert.deepEqual(output, positions)
})

test('boy rig is deterministic and finite with breathing, wave, and head tracking', () => {
  const { positions, regions } = createBoy(3000, seededRandom(31))
  const a = new Float32Array(positions), b = new Float32Array(positions)
  applyBoyMotion(a, regions, 1.25, { x: 0.5, active: true }, 1)
  applyBoyMotion(b, regions, 1.25, { x: 0.5, active: true }, 1)
  assert.deepEqual(a, b)
  assert.notDeepEqual(a, positions)
  assert.ok(a.every(Number.isFinite))
})

test('raised arm moves more than planted legs', () => {
  const { positions, regions } = createBoy(5000, seededRandom(31))
  const output = new Float32Array(positions)
  applyBoyMotion(output, regions, 1.4, { x: 0, active: false }, 1)
  const arm = displacement(output, positions, regions, BOY_REGION.RAISED_LOWER)
  const leftLeg = displacement(output, positions, regions, BOY_REGION.LEFT_LEG)
  const rightLeg = displacement(output, positions, regions, BOY_REGION.RIGHT_LEG)
  assert.ok(arm > leftLeg * 2, `arm ${arm}, left leg ${leftLeg}`)
  assert.ok(arm > rightLeg * 2, `arm ${arm}, right leg ${rightLeg}`)
})
```

Add to `tests/play.test.js`:

```js
test('curved morphs are bounded and exact at both endpoints', () => {
  const targets = [new Float32Array([0, 0, 0, 1, 1, 1]), new Float32Array([2, 4, 6, 3, 5, 7])]
  const phases = new Float32Array([0, 0.5])
  const output = new Float32Array(6)
  sampleMorph(targets, { from: 0, to: 1, mix: 0 }, output, phases)
  assert.deepEqual(output, targets[0])
  sampleMorph(targets, { from: 0, to: 1, mix: 1 }, output, phases)
  assert.deepEqual(output, targets[1])
  sampleMorph(targets, { from: 0, to: 1, mix: 0.5 }, output, phases)
  assert.ok(output.every(Number.isFinite))
  assert.notDeepEqual([...output], [1, 2, 3, 2, 3, 4])
  assert.ok([...output].every((value) => Math.abs(value) <= 8))
})

test('hidden playback writes nothing and resumes with zero motion delta', async () => {
  const reducedMotion = { matches: false, addEventListener() {} }
  const browserWindow = { matchMedia: () => reducedMotion, addEventListener() {}, innerWidth: 1200, scrollY: 0 }
  const doc = {
    hidden: false,
    body: { classList: { contains: () => true } },
    defaultView: browserWindow,
    createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
    addEventListener() {},
  }
  const context = {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: doc },
    signal: { aborted: false, addEventListener() {} },
  }
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  const particles = result.scene.getObjectByName('Particle Field')
  const dust = result.scene.getObjectByName('Ambient Dust')
  play.update(0)
  const version = particles.geometry.attributes.position.version
  doc.hidden = true
  play.update(1)
  assert.equal(particles.geometry.attributes.position.version, version)
  doc.hidden = false
  play.update(1)
  assert.equal(dust.rotation.y, 0)
  play.update(1)
  assert.ok(dust.rotation.y > 0)
  play.dispose()
  result.dispose()
})
```

- [ ] **Step 2: Run the new tests and observe failure**

Run: `node --test tests/boy-motion.test.js tests/play.test.js`
Expected: FAIL because `boy-motion.js` is missing, curved sampling is not implemented, and hidden playback still writes buffers.

- [ ] **Step 3: Implement the pure articulated boy rig**

Create `src/boy-motion.js`:

```js
import { BOY_REGION } from './subjects/boy.js'

function rotateZ(output, offset, pivotX, pivotY, angle) {
  const x = output[offset] - pivotX, y = output[offset + 1] - pivotY
  const cos = Math.cos(angle), sin = Math.sin(angle)
  output[offset] = pivotX + x * cos - y * sin
  output[offset + 1] = pivotY + x * sin + y * cos
}

function rotateY(output, offset, angle) {
  const x = output[offset], z = output[offset + 2]
  const cos = Math.cos(angle), sin = Math.sin(angle)
  output[offset] = x * cos + z * sin
  output[offset + 2] = -x * sin + z * cos
}

export function applyBoyMotion(output, regions, time, pointer, weight) {
  const amount = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0))
  if (amount === 0) return output
  const safeTime = Number.isFinite(time) ? time : 0
  const wave = Math.sin(safeTime * 2.2) * 0.14 * amount
  const forearmWave = Math.sin(safeTime * 2.2 + 0.55) * 0.12 * amount
  const breath = 1 + Math.sin(safeTime * 1.35) * 0.016 * amount
  const headYaw = pointer?.active ? pointer.x * 0.16 * amount : 0
  const shiftX = Math.sin(safeTime * 0.65) * 0.055 * amount
  const bobY = Math.sin(safeTime * 1.3) * 0.018 * amount

  for (let index = 0; index < regions.length; index += 1) {
    const offset = index * 3
    const region = regions[index]
    if (region === BOY_REGION.TORSO) {
      output[offset] *= breath
      output[offset + 2] *= breath
    }
    if (region === BOY_REGION.RAISED_LOWER) rotateZ(output, offset, -1.45, 2.85, forearmWave)
    if (region === BOY_REGION.RAISED_UPPER || region === BOY_REGION.RAISED_LOWER) rotateZ(output, offset, -0.82, 2.05, wave)
    if (region === BOY_REGION.HEAD) rotateY(output, offset, headYaw)
    output[offset] += shiftX
    output[offset + 1] += bobY
  }
  return output
}
```

- [ ] **Step 4: Add bounded curved sampling with exact endpoints**

Replace `sampleMorph` in `src/morph.js` with:

```js
export function sampleMorph(targets, frame, output, phases = null) {
  const from = targets[frame.from]
  const to = targets[frame.to]
  const mix = frame.mix
  const arc = mix > 0 && mix < 1 ? Math.sin(mix * Math.PI) : 0
  for (let point = 0; point < output.length / 3; point += 1) {
    const offset = point * 3
    output[offset] = from[offset] + (to[offset] - from[offset]) * mix
    output[offset + 1] = from[offset + 1] + (to[offset + 1] - from[offset + 1]) * mix
    output[offset + 2] = from[offset + 2] + (to[offset + 2] - from[offset + 2]) * mix
    if (phases && arc > 0) {
      const phase = phases[point] * Math.PI * 2
      const angle = mix * Math.PI * 2 + phase
      const radius = 0.35 + phases[point] * 0.65
      output[offset] += Math.cos(angle) * arc * 0.55 * radius
      output[offset + 1] += Math.sin(phase) * arc * 0.28
      output[offset + 2] += Math.sin(angle) * arc * 0.95 * radius
    }
  }
  return output
}
```

- [ ] **Step 5: Connect rig, phases, static reduced-motion chapters, and visibility**

In `src/play.js`, add:

```js
import { applyBoyMotion } from './boy-motion.js'
```

Add `boyRegions` and `phases` to the object destructuring. Add `let resumeWithZeroDelta = false` near the other playback state. Change `measure` to snap only for reduced motion:

```js
function measure() {
  if (!browserWindow || sections.length !== SECTIONS.length) return
  offsets = sections.map((section) => section.offsetTop)
  const measured = progressFromOffsets(offsets, browserWindow.scrollY)
  targetProgress = reducedMotion.matches ? Math.round(measured) : measured
}
```

Replace `setProgress` with:

```js
function setProgress(value) {
  const next = Math.max(0, Math.min(3, Number.isFinite(value) ? value : 0))
  targetProgress = reducedMotion.matches ? Math.round(next) : next
  if (reducedMotion.matches) progress = targetProgress
  updateControls()
}
```

Replace `onKeydown` to accept only `1`–`4` and leave editable controls untouched:

```js
function onKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target
  if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return
  if (/^[1-4]$/.test(event.key)) {
    event.preventDefault()
    goTo(Number(event.key) - 1)
  } else if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
    event.preventDefault()
    const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1
    goTo(Math.round(targetProgress) + direction)
  }
}
```

Register visibility handling where other browser listeners are installed:

```js
doc?.addEventListener?.('visibilitychange', () => {
  pointer.active = false
  resumeWithZeroDelta = true
}, { signal })
```

At the start of `update(dt)`, before calculating motion time or writing buffers, use:

```js
if (doc?.hidden) {
  resumeWithZeroDelta = true
  return
}
let safeDt = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0))
if (resumeWithZeroDelta) {
  safeDt = 0
  resumeWithZeroDelta = false
}
```

Change the morph call to:

```js
sampleMorph(targets, getMorphFrame(progress), positions.array, phases)
if (!reducedMotion.matches && progress < 1) {
  applyBoyMotion(positions.array, boyRegions, time, pointer, Math.max(0, 1 - progress))
}
```

Remove the now-duplicate `const safeDt = ...` declaration from the old update body. Keep the existing pointer dissolve after rigging so scattered particles always reconstruct from the freshly sampled target on the next frame.

- [ ] **Step 6: Run the complete suite and commit motion**

Run: `npm test`
Expected: PASS, 36 tests total.

```bash
git add src/boy-motion.js src/morph.js src/play.js tests/boy-motion.test.js tests/play.test.js
git commit -m "feat: animate living portrait and curved morphs"
```

---

### Task 7: Design-Plugin Review, Full-Site Verification, and Delivery

**Files:**
- Modify: `src/project.js`
- Modify: `src/main.js`
- Modify: `src/review.js`
- Modify: `README.md`
- Modify: `docs/design-brief.md`

**Interfaces:**
- Consumes: the completed four-target scene and 36-test suite.
- Preserves: package `edit3d.artifactId`, project id `akshant-data-universe`, and the `preview/` launcher.
- Produces: measured review evidence, current documentation, a pushed feature branch, and a corrected full-site preview.

- [ ] **Step 1: Use the 3D design workflow for actual scene tuning**

Invoke `editor:3d-editor` and follow its scene review/delivery rules. Open the root project as the editable scene, then inspect Boy, India, Skills, and Portal through the four Play controls. Tune only the registered camera, `dataField`, `dataMotion`, and `dataPalette` parameters; restore the approved defaults afterward:

```js
{ particleSize: 0.075, motionSpeed: 1, flowIntensity: 0.7, cyan: '#00D4FF', violet: '#9D4EDD' }
```

Expected visual result: the boy fills the central stage without clipped head/shoes; India remains front-readable with only a slight tilt; the constellation has clear depth; the portal reads as a tunnel. No text is baked into the scene. Run `npm run check` after restoring defaults and expect a passing compile check. Record any unavailable native-editor or capture capability as a limitation instead of claiming it.

- [ ] **Step 2: Run the complete automated and production gate**

Run:

```bash
npm test && npm run check && npm run build && git diff --check
```

Expected: 36/36 tests pass, Edit3D compile passes, Vite production build exits `0`, and diff check exits `0`. The already-known Draco/Basis asset and large-chunk warnings may remain, but a new error or failed test blocks delivery.

- [ ] **Step 3: Verify the real full-site preview at desktop and mobile sizes**

Open the Work preview with project root `/Users/akshant/Documents/kimi/tasks/2026-10-25/20-31-02-02135f3f/portfolio/preview`, not the root embedded scene. Re-resolve the browser tab with `list_tabs` before interacting.

Use this DOM check:

```js
(() => ({
  embedded: document.body.classList.contains('embedded-mode'),
  webgl: document.documentElement.dataset.webgl,
  header: getComputedStyle(document.querySelector('.site-header')).display,
  overflow: document.documentElement.scrollWidth > innerWidth,
  sections: ['hero', 'experience', 'skills', 'contact'].map((id) => ({
    id,
    display: getComputedStyle(document.getElementById(id)).display,
    text: document.getElementById(id).innerText.trim().length > 0,
  })),
}))()
```

Expected: `embedded: false`, `webgl: 'ready'`, a visible header, no overflow, and four non-empty visible sections.

Set a 1440 × 900 viewport with CDP `Emulation.setDeviceMetricsOverride` using `{width: 1440, height: 900, deviceScaleFactor: 1, mobile: false}`. Capture and inspect all four chapters. Verify by clicking each nav link and using keys `1`–`4` plus arrow keys. Check skill selection reveals only the chosen panel, experience selection updates `aria-pressed`, email remains `mailto:akst31@yahoo.com`, and GitHub remains `https://github.com/akshant31`.

Set a 390 × 844 viewport using `{width: 390, height: 844, deviceScaleFactor: 1, mobile: true}`. Capture and inspect all four chapters again. Confirm the boy is not hidden behind the name, all four experience rows are reachable, skill buttons remain tappable, the email does not overflow, and `scrollWidth <= innerWidth`.

Use `Emulation.setEmulatedMedia` with `prefers-reduced-motion: reduce` and confirm static chapter poses plus working navigation. In a separate disposable tab, disable WebGL before page load and confirm `data-webgl="unavailable"`, visible semantic content, and working navigation. Close that disposable tab afterward.

Before every `ReadMediaFile`, check the screenshot's byte size and compress a copy if required by the client limit. If neither the visible Work browser nor local capture tooling can produce a screenshot, record that limitation and do not claim pixel review; DOM checks alone must not be described as visual inspection.

- [ ] **Step 4: Update names, documentation, attribution, and measured review evidence**

In `src/project.js`, preserve `id: 'akshant-data-universe'` but set the project name to `Akshant Kumar · Particle Portrait` and scene name to `Immersive Particle Portrait`. In `src/main.js`, use status text `Particle portrait online` after a successful normal mount and retain `Static portfolio mode` on failure.

Replace `docs/design-brief.md` with a concise current brief containing this chapter table and links to the approved spec:

```md
# Immersive Particle Portrait — Production Design Brief

The approved implementation design is `docs/superpowers/specs/2026-10-26-immersive-particle-portrait-design.md`.

| Chapter | Centered subject | Edge content |
| --- | --- | --- |
| Boy | Articulated living particle figure | Akshant Kumar; Data Engineer |
| India | Filled 3D particle map | Based in India; 7+ years; four concise experience entries |
| Skills | Four-group orbital constellation | Selectable categories and one active tool list |
| Contact | Deep particle portal | Email and GitHub |

The site uses 20,000 main particles, at most 1,200 ambient points, near-black graphite, soft ivory, cyan, and restrained violet. Native scrolling, keyboard, touch, reduced motion, semantic fallback, the editable root scene, and the separate `preview/` website launcher are required. Production remains unchanged.
```

Update README's introduction, chapter table, interaction list, test count, and project structure to match the final modules. Add this attribution exactly:

```md
## Map data

Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com. India geometry is derived from the public-domain 1:50m Admin 0 Countries dataset and bundled locally; `scripts/prepare-india-map.mjs` reproduces the extraction. No map data is fetched at runtime.
```

After Steps 1–3 pass, replace `src/review.js` with measured evidence only. Use this structure and do not retain a check whose corresponding verification was not performed:

```js
export default {
  status: 'passed',
  checks: [
    {
      name: 'Four immersive desktop chapters',
      status: 'passed',
      evidence: '2026-10-26 1440 × 900 capture review: the central boy, India, constellation, and portal were unobstructed; edge copy remained readable with no horizontal overflow.',
    },
    {
      name: 'Four mobile chapters and content accessibility',
      status: 'passed',
      evidence: '2026-10-26 390 × 844 capture review: all four chapters remained readable, experience rows and skill controls were reachable, and contact links did not overflow.',
    },
    {
      name: 'Navigation and living particle interactions',
      status: 'passed',
      evidence: 'Actual browser checks covered four nav links, 1–4 and arrow keys, skill panels, experience emphasis, pointer dissolve/reconstruction, reduced motion, and contact hrefs.',
    },
    {
      name: 'Automated regression and production checks',
      status: 'passed',
      evidence: 'npm test passed 36 of 36 tests; Edit3D compile check and production build passed; git diff --check passed.',
    },
    {
      name: 'Normal website preview and static fallback',
      status: 'passed',
      evidence: 'The non-embedded preview showed four semantic sections with WebGL ready and 20,000 main particles; with WebGL disabled, content and navigation remained available in static portfolio mode.',
    },
  ],
  limitations: ['Native desktop toolbar and IPC integration were not exercised.'],
}
```

If screenshot capture was unavailable, remove the first two checks, list `Desktop/mobile screenshot capture was unavailable; DOM/runtime checks were completed instead.` under `limitations`, and set `status` to `'pending'`. Edit3D accepts only `passed` or `pending`; `pending` keeps the embedded root in content preview and honestly leaves editor review gated. Do not write capture evidence that was not observed, and report the pending editor review in the final response.

- [ ] **Step 5: Re-run verification after evidence and documentation edits**

Run:

```bash
npm test && npm run check && npm run build && git diff --check
```

Expected: the same 36/36 passing result and a clean production build. Confirm `git status --short` contains only the intended Task 7 files.

- [ ] **Step 6: Commit, push, and verify the branch**

```bash
git add src/project.js src/main.js src/review.js README.md docs/design-brief.md
git commit -m "feat: complete immersive particle portrait portfolio"
git push origin feature/3d-data-portfolio
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/feature/3d-data-portfolio
```

Expected: working tree clean; local HEAD and remote branch report the same commit. Do not merge or deploy.

- [ ] **Step 7: Clean up and present the corrected preview**

Close only browser tabs created for this verification. Check for leftover preview processes with:

```bash
pgrep -fl 'portfolio.*(vite|run.mjs|server.mjs|npm)' || true
```

Stop only a positively identified process belonging to this task; never use broad `pkill`. Do not leave a development server running independently.

Present the branch and final commit, the measured verification result, and exactly this preview project path followed by the standard preview link:

```text
/Users/akshant/Documents/kimi/tasks/2026-10-25/20-31-02-02135f3f/portfolio/preview
```

`[Preview immersive 3D portfolio](http://localhost:7100/)`

State that production remains unchanged. Do not claim a screenshot review or editor integration check that was not actually completed.
