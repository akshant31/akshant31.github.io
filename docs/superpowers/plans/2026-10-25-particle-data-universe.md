# Particle Data Universe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Akshant Kumar's approved five-section 3D particle portfolio on `feature/3d-data-portfolio`, with a normal website runtime and an editable Edit3D scene.

**Architecture:** Semantic HTML and CSS own the portfolio content. An Edit3D game scene owns one deterministic Three.js particle subject; Play maps DOM section state to precomputed morph targets and pointer interactions. Normal mode uses `mountProjectPreview`, while embedded Work mode uses `mountReviewedProject` and the real scene protocol.

**Tech Stack:** Node >=22.12, native JavaScript modules, Three.js 0.186.0, Edit3D SDK/CLI from the installed editor plugin, Node test runner, semantic HTML, CSS.

## Global Constraints

- Work only on `feature/3d-data-portfolio`; never merge or deploy production.
- Preserve only facts from the approved specification; no invented claims, links, metrics, or employers.
- Use approximately 12,000 deterministic particles, one Points draw call, sparse LineSegments, and no per-frame geometry/material creation.
- Keep all essential content in semantic HTML and retain a no-WebGL fallback.
- Use Inter and Fira Code, graphite `#0B0D12`, cyan `#00D4FF`, and violet `#9D4EDD`.
- Use the installed plugin's `.edit3d/run.mjs` scripts and preserve the generated artifact ID.
- Every new material has a meaningful runtime name.
- Finish one screenshot → defects → fix → re-verify cycle before marking review passed.

---

### Task 1: Attach the approved project scaffold and test harness

**Files:**
- Create: `package.json`, `package-lock.json`, `.edit3d/run.mjs`, `.edit3d/plugin.json`, `.edit3d/edit3d-sdk.tgz`, `.edit3d/edit3d-cli.tgz`
- Create: `tests/shapes.test.js`, `tests/scene.test.js`
- Modify: `package.json` scripts
- Remove after replacement: `script.js`, `style.css`

**Interfaces:**
- Consumes: generated scaffold in `../portfolio-3d`, Node 24.21.0, plugin CLI.
- Produces: `npm test`, `npm run check`, `npm run build`, `npm run dev -- --host localhost --port <port>`.

- [ ] **Step 1: Copy only the scaffold and plugin runtime into the branch**

```bash
rsync -a --exclude node_modules --exclude .git --exclude src --exclude index.html "../portfolio-3d/" ./
npm install
```

Expected: the generated `edit3d.artifactId` is unchanged and dependencies install from the local plugin packages.

- [ ] **Step 2: Add the test script**

```json
{
  "scripts": {
    "dev": "node .edit3d/run.mjs dev",
    "check": "node .edit3d/run.mjs check",
    "build": "node .edit3d/run.mjs build",
    "start": "node dist/server.mjs --data-dir ./data",
    "test": "node --test tests/*.test.js"
  }
}
```

- [ ] **Step 3: Verify the empty test harness fails because tests do not exist**

Run: `npm test`
Expected: FAIL with a missing `tests/*.test.js` path.

- [ ] **Step 4: Commit the runtime setup**

```bash
git add package.json package-lock.json .edit3d
git commit -m "build: attach Edit3D portfolio runtime"
```

### Task 2: Implement deterministic morph targets with tests

**Files:**
- Create: `src/shapes.js`, `src/morph.js`
- Test: `tests/shapes.test.js`

**Interfaces:**
- Produces: `SECTION_IDS = ['hero','about','skills','experience','contact']`.
- Produces: `createShapeTargets(count = 12000): Float32Array[5]`, each containing `count * 3` finite coordinates.
- Produces: `getMorphFrame(progress): { from:number, to:number, mix:number }` for progress in `[0,4]`.
- Produces: `seededRandom(seed): () => number`.

- [ ] **Step 1: Write failing deterministic and boundary tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createShapeTargets, SECTION_IDS } from '../src/shapes.js'
import { getMorphFrame } from '../src/morph.js'

test('five deterministic finite shapes are generated', () => {
  const a = createShapeTargets(120)
  const b = createShapeTargets(120)
  assert.equal(a.length, SECTION_IDS.length)
  a.forEach((shape) => {
    assert.equal(shape.length, 360)
    assert.ok(shape.every(Number.isFinite))
  })
  assert.deepEqual(a, b)
  assert.notDeepEqual(a[0], a[1])
})

test('morph frames clamp and interpolate at section boundaries', () => {
  assert.deepEqual(getMorphFrame(-1), { from: 0, to: 0, mix: 0 })
  assert.deepEqual(getMorphFrame(1.5), { from: 1, to: 2, mix: 0.5 })
  assert.deepEqual(getMorphFrame(9), { from: 4, to: 4, mix: 0 })
})
```

- [ ] **Step 2: Run tests to verify missing-module failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../src/shapes.js'`.

- [ ] **Step 3: Implement pure morph math**

```js
export function getMorphFrame(progress) {
  const value = Math.max(0, Math.min(4, Number.isFinite(progress) ? progress : 0))
  if (value === 0) return { from: 0, to: 0, mix: 0 }
  if (value === 4) return { from: 4, to: 4, mix: 0 }
  const from = Math.floor(value)
  return { from, to: from + 1, mix: value - from }
}
```

- [ ] **Step 4: Implement the five seeded shape generators**

Use `seededRandom(31031)` and write each point into `Float32Array(count * 3)`:

```js
export const SECTION_IDS = ['hero', 'about', 'skills', 'experience', 'contact']

export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function createShapeTargets(count = 12000) {
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_PARTICLE_COUNT')
  const random = seededRandom(31031)
  return [
    buildRawCloud(count, random),
    buildPipeline(count, random),
    buildConstellation(count, random),
    buildHelix(count, random),
    buildLattice(count, random),
  ]
}
```

The five builders produce these exact forms: a spherical cloud with a three-tier cylindrical core; three clusters joined by two streams; four orbital shells; a four-turn vertical helix; and a rounded three-dimensional grid. Each builder returns a filled `Float32Array` and uses only deterministic random values.

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS for deterministic shapes and all morph boundaries.

- [ ] **Step 6: Commit**

```bash
git add src/shapes.js src/morph.js tests/shapes.test.js
git commit -m "feat: add deterministic data morph targets"
```

### Task 3: Build the Edit3D scene and parameter contract

**Files:**
- Create: `src/scene.js`, `src/environment/tonemap.js`, `src/kit/edit3d.js`
- Test: `tests/scene.test.js`

**Interfaces:**
- Consumes: `createShapeTargets()` and `playPortfolio()` from Task 5.
- Produces: `createScene({ asset }): { scene, camera, play, dispose }`.
- Produces registered IDs `dataUniverse`, `particleField`, `network`, `coreRings`, and `camera`.
- Produces parameter groups `dataField`, `dataMotion`, and `dataPalette`.

- [ ] **Step 1: Copy only the verified helpers from the installed plugin**

```bash
mkdir -p src/environment src/kit
cp "../portfolio-3d/node_modules/@edit3d/sdk/README.md" /dev/null 2>/dev/null || true
cp "/Users/akshant/Library/Application Support/kimi-desktop/daimon-share/daimon/runtime/kimi-code/home/plugins/managed/editor/skills/3d-editor/environment/tonemap.js" src/environment/tonemap.js
cp "/Users/akshant/Library/Application Support/kimi-desktop/daimon-share/daimon/runtime/kimi-code/home/plugins/managed/editor/skills/3d-editor/kits/edit3d.js" src/kit/edit3d.js
```

The `/dev/null` copy is a no-op guard and does not affect project files.

- [ ] **Step 2: Write the failing scene contract test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createScene } from '../src/scene.js'

function makeAsset() {
  const objects = new Map()
  const params = new Map()
  return {
    objects, params,
    register(id, object) { objects.set(id, object) },
    registerParams(id, settings, schema) { params.set(id, { settings, schema }) },
    subscribe() { return () => {} },
  }
}

test('scene registers named materials and working settings', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  assert.ok(asset.objects.has('dataUniverse'))
  assert.ok(asset.params.has('dataField'))
  assert.ok(asset.params.has('dataMotion'))
  assert.ok(asset.params.has('dataPalette'))
  const materials = new Set()
  result.scene.traverse((object) => {
    if (object.material) materials.add(object.material)
  })
  for (const material of materials) assert.ok(material.name.trim().length > 0)
  assert.equal(typeof result.play, 'function')
  result.dispose()
})
```

- [ ] **Step 3: Run the scene test to verify missing-module failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../src/scene.js'`.

- [ ] **Step 4: Implement scene materials and registration**

Create `THREE.PointsMaterial` named `Data Universe · Particle Field`, `THREE.LineBasicMaterial` named `Data Universe · Network Links`, and `THREE.MeshBasicMaterial` instances named `Data Universe · Cyan Core Ring` and `Data Universe · Violet Core Ring`. Use a 42° perspective camera at `[0, 0.2, 18]`, background `#0B0D12`, and no lights or shadows.

Register these exact settings:

```js
const settings = {
  particleSize: 0.055,
  motionSpeed: 1,
  flowIntensity: 0.7,
  cyan: '#00D4FF',
  violet: '#9D4EDD',
}
```

Register `particleSize` in `dataField` with range `0.02–0.12`; `motionSpeed` in `dataMotion` with range `0–3`; `flowIntensity` in `dataMotion` with range `0–1.5`; and `cyan`/`violet` as color parameters in `dataPalette`. Subscribe with `asset.subscribe(({ type }) => { if (type === 'change') applyParams() })`, call `applyParams()` once, and unsubscribe in `dispose()`.

- [ ] **Step 5: Run scene tests**

Run: `npm test`
Expected: PASS for registration, material names, Play contract, and disposal.

- [ ] **Step 6: Commit**

```bash
git add src/scene.js src/environment src/kit tests/scene.test.js
git commit -m "feat: build editable 3D data universe"
```

### Task 4: Implement semantic portfolio content and responsive design

**Files:**
- Replace: `index.html`
- Create: `src/styles.css`, `src/site.js`, `src/content.js`
- Remove: `script.js`, `style.css`
- Modify: `README.md`

**Interfaces:**
- Produces DOM sections `#hero`, `#about`, `#skills`, `#experience`, `#contact` with `data-morph="0"` through `data-morph="4"`.
- Produces `initSite({ onSection, onEmphasis }): { dispose(), goTo(index) }`.
- Produces custom events `portfolio:section` and `portfolio:emphasis` consumed by Play.

- [ ] **Step 1: Write the semantic document shell**

Use this exact structure and fill each section with the corresponding approved source content:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Akshant Kumar — Data Engineer building reliable pipelines, real-time systems, and cloud data architectures.">
  <meta name="theme-color" content="#0B0D12">
  <title>Akshant Kumar — Data Engineer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  <a class="skip-link" href="#hero">Skip to portfolio</a>
  <div id="app" aria-hidden="true"></div>
  <header class="site-header"><nav aria-label="Portfolio sections"></nav></header>
  <main id="portfolio">
    <section id="hero" data-morph="0"><h1>Akshant Kumar</h1></section>
    <section id="about" data-morph="1"><h2>About</h2></section>
    <section id="skills" data-morph="2"><h2>Skills &amp; Tools</h2></section>
    <section id="experience" data-morph="3"><h2>Experience</h2></section>
    <section id="contact" data-morph="4"><h2>Get in touch</h2></section>
  </main>
  <script id="edit3d-state" type="application/json">null</script>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

Populate the five nav links; the real hero summary and CTAs; the `about_me.py` terminal, two real summary paragraphs and three counters; all four real skill groups; all four real experience entries and tags; and the real email/GitHub links. Set the footer year with `new Date().getFullYear()`.

- [ ] **Step 2: Implement the visual system**

Define CSS custom properties for all approved colors; use `Inter` for body/display and `Fira Code` for labels. The canvas mount is fixed behind content. Sections are at least `100svh`, with responsive safe zones, 44 px minimum interactive targets, visible `:focus-visible` rings, and `@media (prefers-reduced-motion: reduce)` disabling nonessential transitions. At `max-width: 760px`, reduce scene opacity, stack content, and prevent horizontal overflow.

- [ ] **Step 3: Implement site navigation and emphasis events**

`initSite` uses native `scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })`, an IntersectionObserver for active nav state, and click handlers on `[data-skill-group]` and `[data-experience]`. Dispatch:

```js
window.dispatchEvent(new CustomEvent('portfolio:section', { detail: { index } }))
window.dispatchEvent(new CustomEvent('portfolio:emphasis', { detail: { kind, index } }))
```

The returned `dispose()` disconnects the observer and aborts listeners.

- [ ] **Step 4: Replace legacy documentation**

Document `npm install`, `npm run dev`, `npm test`, `npm run check`, `npm run build`, the five morph states, branch safety, accessibility, and the fact that `master` is unchanged.

- [ ] **Step 5: Verify content integrity**

Run: `npm test && git diff --check`
Expected: tests PASS and no whitespace errors. Manually compare every date, employer, email, and skill against the approved specification before committing.

- [ ] **Step 6: Commit**

```bash
git add index.html src/styles.css src/site.js src/content.js README.md
git rm script.js style.css
git commit -m "feat: redesign semantic data engineer portfolio"
```

### Task 5: Implement Play, dual runtime, and fallback

**Files:**
- Create: `src/play.js`, `src/main.js`, `src/review.js`
- Modify: `src/scene.js` to call `playPortfolio(context, objects, settings)`

**Interfaces:**
- Consumes: `getMorphFrame`, shape targets, DOM section events, and scene settings.
- Produces: `playPortfolio({ canvas, container, signal }, objects, settings): { update(dt), dispose() }`.
- Produces normal mode `mountProjectPreview(...).play()` and embedded mode `mountReviewedProject({ review, ... })`.

- [ ] **Step 1: Implement Play state and controls**

Maintain `progress`, `targetProgress`, `pointer`, and `emphasis`. Listen to scroll, pointer, `portfolio:section`, `portfolio:emphasis`, and keyboard using `{ signal }`. Add five embedded buttons labeled Raw, Pipeline, Skills, Timeline, Lattice with shortcuts `1`–`5`, plus the hint `Scroll or use 1–5 to transform the data · move the pointer to dissolve`.

In `update(dt)`, compute `getMorphFrame(targetProgress)`, interpolate the two target arrays into the existing position attribute, apply bounded pointer repulsion only when reduced motion is off, update existing line positions, and mark attributes dirty. Reuse all arrays/vectors; create no geometry, material, or texture inside `update`.

- [ ] **Step 2: Implement dual-mode mounting**

```js
const embedded = new URLSearchParams(location.search).has('kimiScene') ||
  new URLSearchParams(location.search).has('edit')
document.body.classList.toggle('embedded-mode', embedded)
```

Normal mode creates the project with content phase through `mountProjectPreview`, starts Play, and leaves semantic content visible. Embedded mode imports `review` and calls `mountReviewedProject` with `createHttpPersistence()`, the real container, and project. Catch initialization errors, set `document.documentElement.dataset.webgl = 'unavailable'`, hide only the canvas mount, and retain all HTML content.

- [ ] **Step 3: Add the pending review record**

```js
export default {
  status: 'pending',
  checks: [],
  limitations: ['Runtime visual and interaction review has not yet been recorded.'],
}
```

- [ ] **Step 4: Run static checks**

Run: `npm test && npm run check && npm run build`
Expected: tests PASS, compilation succeeds, and `dist/` contains the Edit3D service output.

- [ ] **Step 5: Commit**

```bash
git add src/play.js src/main.js src/review.js src/scene.js
git commit -m "feat: connect particle motion to portfolio navigation"
```

### Task 6: Runtime review, repair, and delivery

**Files:**
- Create outside the repository: `../verification/` screenshots and logs
- Modify: `src/review.js`, any files containing verified defects
- Modify: `README.md` with final verification summary

**Interfaces:**
- Consumes: final normal and embedded runtimes.
- Produces: recorded review evidence and a clean feature branch ready to push.

- [ ] **Step 1: Record existing preview resources**

Run InAppBrowser `list_tabs`; record only tabs/services created for this verification. Confirm `package.json` contains `sceneProtocol: 1` and use its real artifact ID.

- [ ] **Step 2: Verify normal portfolio visuals and interactions**

Open the normal local project at desktop width. Capture all five sections and test scroll, direct nav, skill selection, experience selection, keyboard navigation, email/GitHub hrefs, reduced motion, and no-WebGL fallback. Capture a mobile-width view and check for overflow.

- [ ] **Step 3: Complete the mandatory visual repair loop**

Write concrete defects with selectors/variables and before/after values into `../verification/review.md`. Fix the highest-impact subject/composition/readability issues first, then rerun the affected screenshots and interactions.

- [ ] **Step 4: Verify embedded scene contracts**

Open `http://localhost:7100/?kimiScene=1&artifactId=<real-id>` offscreen with the real project path. Confirm `offscreen-validation`, inspect a four-view `contactSheet`, run `framingReport`, read `asset.getMaterials()`, and check material display names. Test `particleSize` and `cyan` through `asset.updateCustomParam`, inspect console output, test undo/redo and save/restore, then restore defaults.

- [ ] **Step 5: Record only evidence actually obtained**

Set `src/review.js` to `status: 'passed'` only when every listed check has a concrete passed result and evidence path. Otherwise leave it pending and list the exact unverified limitation.

- [ ] **Step 6: Run final gates**

Run: `npm test && npm run check && npm run build && git diff --check`
Expected: all commands PASS and no generated verification files enter the repository.

- [ ] **Step 7: Commit and push the feature branch**

```bash
git add src README.md docs
git commit -m "feat: complete interactive 3D data portfolio"
git push -u origin feature/3d-data-portfolio
```

Expected: GitHub returns the new branch URL. Do not merge or open a pull request.

- [ ] **Step 8: Clean verification resources and deliver**

Close only newly created verification tabs, stop only services started in this task, confirm their ports are released, and deliver the absolute project path, local preview link, GitHub branch link, actual verification results, and any honest limitations.
