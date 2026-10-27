# Full-Screen Particle Composition Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge all four particle chapters with responsive per-chapter framing, replace the full-body opening figure with a bottom-anchored half-body portrait and top-centered name, and derive the India particle silhouette from the user-supplied PDF.

**Architecture:** Keep the existing semantic four-chapter website and one shared Three.js particle buffer. Normalize a manually reviewed main-map SVG trace into a local India ring, generate the half-body procedurally, and isolate responsive framing in a pure module consumed by playback. Validate geometry and framing with Node tests, then review actual desktop/mobile browser captures before recording evidence.

**Tech Stack:** Node.js 22.12+, `node:test`, vanilla HTML/CSS/JavaScript, Three.js 0.186.0, Edit3D SDK/CLI, SVG for the manual source trace, and managed Python with Pillow for deterministic normalization and preview rendering.

## Global Constraints

- Work only on `feature/3d-data-portfolio`; never merge, deploy, alter GitHub Pages, or touch `master`.
- Preserve exactly four chapters: `hero`, `experience`, `skills`, `contact`, with morph indices `0`–`3` and shortcuts `1`–`4`.
- Preserve exactly `20,000` main particles in one Points draw call and at most `1,200` ambient particles in one additional draw call.
- Preserve all existing professional facts, cyan/violet accents, native scrolling, touch, keyboard navigation, reduced-motion behavior, semantic fallback content, and the editable root scene.
- Preserve project id `akshant-data-universe` and artifact id `d655609d-2886-476c-9abe-f9dda9200f2a`.
- Use responsive per-chapter scale and vertical offsets; do not apply one indiscriminate global zoom.
- The hero contains head, torso, and arms only: no legs, feet, shoes, or leg particle regions. Its lower torso is intentionally anchored at or below the viewport bottom.
- `Akshant Kumar` remains one semantic `h1`, horizontally centered near the top below the fixed header safe area on desktop and mobile.
- India uses the primary mainland outer national outline only: no internal state borders, labels, roads, photographs, or page inset. Keep restrained interior particles and north-up/west-left orientation.
- Create India geometry from a manually cleaned, single closed SVG polyline traced against the main map at `2807 × 3974`; do not use the inset or any rejected automatic-extraction candidate.
- India attribution must say `Derived from the user-supplied Indiamap.pdf` and must not claim the PDF is public domain or openly licensed.
- Keep `docs/reference/Indiamap.pdf` local and untracked. Commit only the small manual trace, derived asset, normalization tooling, and contour previews.
- Do not fetch map geometry at runtime and do not copy reference-site assets, source, text, or exact layout.
- Review at `1440 × 900` and `390 × 844`; record only checks actually run.
- Final gate: `npm test && npm run check && npm run build && git diff --check`.

## File Structure

- `src/subjects/boy.js`: procedural half-body positions and retained body-region metadata.
- `src/boy-motion.js`: breathing, arm, head, and whole-upper-body idle motion without leg exceptions.
- `docs/reference/india-mainland-trace.svg`: manually reviewed, single closed source-space polyline; no embedded raster image or internal map detail.
- `scripts/prepare-india-map.py`: SVG polyline validation, north-up normalization, and JS/SVG/PNG generation.
- `scripts/prepare-india-map.mjs`: remove the obsolete Natural Earth downloader.
- `src/data/india-outline.js`: generated single-ring PDF-derived geometry with truthful provenance.
- `docs/reference/india-outline-preview.svg` and `.png`: reviewed normalized contour evidence; the source PDF stays ignored.
- `src/framing.js`: pure target-bounds, camera-view, and per-chapter responsive framing math.
- `src/play.js`: initial/resize framing, smooth chapter-frame interpolation, and reduced-motion snapping.
- `src/styles.css`: top-centered hero name and mobile safe-zone adjustments.
- `tests/boy.test.js`, `tests/boy-motion.test.js`: half-body geometry and rig contracts.
- `tests/india.test.js`: PDF provenance, ring validity, recognizable bounds, interior sampling, and orientation contracts.
- `tests/framing.test.js`: pure responsive scale and bottom-anchor contracts.
- `tests/play.test.js`, `tests/content.test.js`: first-frame integration and hero typography contracts.
- `src/review.js`, `src/main.js`, `src/project.js`, `README.md`, `docs/design-brief.md`: final names, architecture, attribution, and measured review evidence.

---

### Task 1: Half-Body Geometry and Motion

**Files:**
- Modify: `src/subjects/boy.js`
- Modify: `src/boy-motion.js`
- Test: `tests/boy.test.js`
- Test: `tests/boy-motion.test.js`

**Interfaces:**
- Produces: `BOY_REGION = { HEAD: 0, TORSO: 1, RAISED_UPPER: 2, RAISED_LOWER: 3, FREE_UPPER: 4, FREE_LOWER: 5 }`.
- Preserves: `createBoy(count, random) -> { positions: Float32Array, regions: Uint8Array }`.
- Preserves: `applyBoyMotion(output, regions, time, pointer, weight) -> output`.

- [ ] **Step 1: Replace the full-body geometry tests with half-body contracts**

Replace `tests/boy.test.js` with:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubjectTargets, seededRandom } from '../src/shapes.js'
import { BOY_REGION, createBoy } from '../src/subjects/boy.js'

test('boy exposes every upper-body region with one region per particle', () => {
  const subject = createSubjectTargets(5000)
  assert.equal(subject.targets[0].length, 15000)
  assert.ok(subject.boyRegions instanceof Uint8Array)
  assert.equal(subject.boyRegions.length, 5000)
  assert.deepEqual(Object.keys(BOY_REGION), [
    'HEAD', 'TORSO', 'RAISED_UPPER', 'RAISED_LOWER', 'FREE_UPPER', 'FREE_LOWER',
  ])
  const present = new Set(subject.boyRegions)
  for (const region of Object.values(BOY_REGION)) assert.ok(present.has(region), `missing boy region ${region}`)
})

test('boy has a youthful head, raised hand, torso, arms, and no legs', () => {
  const { positions, regions } = createBoy(5000, seededRandom(31))
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
  let headY = 0
  let headCount = 0
  let raisedMaxY = -Infinity
  for (let index = 0; index < regions.length; index += 1) {
    const point = [positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]]
    point.forEach((value, axis) => {
      bounds.min[axis] = Math.min(bounds.min[axis], value)
      bounds.max[axis] = Math.max(bounds.max[axis], value)
    })
    if (regions[index] === BOY_REGION.HEAD) { headY += point[1]; headCount += 1 }
    if (regions[index] === BOY_REGION.RAISED_LOWER) raisedMaxY = Math.max(raisedMaxY, point[1])
  }
  const size = bounds.max.map((value, axis) => value - bounds.min[axis])
  assert.ok(size[0] > 3 && size[0] < 6, `boy width ${size[0]}`)
  assert.ok(size[1] > 4 && size[1] < 6, `half-body height ${size[1]}`)
  assert.ok(size[2] > 1, `boy depth ${size[2]}`)
  assert.ok(bounds.min[1] > -1 && bounds.max[1] < 5)
  assert.ok(headY / headCount > 2.5)
  assert.ok(raisedMaxY > 3.5)
})

test('boy geometry and region assignments are deterministic', () => {
  const a = createBoy(1000, seededRandom(31031))
  const b = createBoy(1000, seededRandom(31031))
  assert.deepEqual(a.positions, b.positions)
  assert.deepEqual(a.regions, b.regions)
  assert.ok(a.positions.every(Number.isFinite))
})
```

- [ ] **Step 2: Replace planted-leg motion assertions with retained-region assertions**

Replace the final test in `tests/boy-motion.test.js` with:

```js
test('raised arm, torso, and free arm move without leg-region exceptions', () => {
  const { positions, regions } = createBoy(5000, seededRandom(31))
  const output = new Float32Array(positions)
  applyBoyMotion(output, regions, 1.4, { x: 0, active: false }, 1)
  const raised = displacement(output, positions, regions, BOY_REGION.RAISED_LOWER)
  const torso = displacement(output, positions, regions, BOY_REGION.TORSO)
  const free = displacement(output, positions, regions, BOY_REGION.FREE_LOWER)
  assert.ok(raised > 0.001, `raised arm displacement ${raised}`)
  assert.ok(torso > 0.001, `torso displacement ${torso}`)
  assert.ok(free > 0.001, `free arm displacement ${free}`)
  assert.ok(output.every(Number.isFinite))
})
```

- [ ] **Step 3: Run the tests and observe the old full-body contract fail**

Run: `node --test tests/boy.test.js tests/boy-motion.test.js`

Expected: FAIL because `LEFT_LEG` and `RIGHT_LEG` still exist and the current figure exceeds the half-body height bounds.

- [ ] **Step 4: Remove leg regions and geometry while preserving the sampling interface**

In `src/subjects/boy.js`, replace `BOY_REGION` with:

```js
export const BOY_REGION = Object.freeze({
  HEAD: 0,
  TORSO: 1,
  RAISED_UPPER: 2,
  RAISED_LOWER: 3,
  FREE_UPPER: 4,
  FREE_LOWER: 5,
})
```

Replace `createParts()` with the following retained upper-body forms. The existing ellipsoid/capsule samplers redistribute all requested particles across these forms automatically:

```js
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
  ]
}
```

In `src/boy-motion.js`, replace the leg-exception block with unconditional upper-body drift:

```js
    output[offset] += shiftX
    output[offset + 1] += bobY
```

- [ ] **Step 5: Run the half-body tests and full regression suite**

Run: `node --test tests/boy.test.js tests/boy-motion.test.js && npm test`

Expected: the new half-body tests and all existing regression tests PASS.

- [ ] **Step 6: Commit only the half-body revision**

```bash
git add src/subjects/boy.js src/boy-motion.js tests/boy.test.js tests/boy-motion.test.js
git commit -m "feat: reshape portrait as half-body particles"
```

---

### Task 2: Reviewed PDF-Derived India Outline

**Files:**
- Create: `docs/reference/india-mainland-trace.svg`
- Create: `scripts/prepare-india-map.py`
- Delete: `scripts/prepare-india-map.mjs`
- Modify: `.gitignore`
- Generate: `src/data/india-outline.js`
- Generate: `docs/reference/india-outline-preview.svg`
- Generate: `docs/reference/india-outline-preview.png`
- Test: `tests/india.test.js`

**Interfaces:**
- Consumes: `docs/reference/india-mainland-trace.svg`, containing one visible `path#india-mainland` with explicit absolute `M`, `L`, and `Z` commands in the `2807 × 3974` source-render coordinate system.
- Produces: `INDIA_RINGS`, a frozen array containing one closed, normalized mainland ring with height `8` model units.
- Preserves: `createIndia(count, random, rings = INDIA_RINGS) -> { positions, outlineCount }`.
- Provides CLI: `python scripts/prepare-india-map.py`, with no runtime network access or automatic contour selection.

- [ ] **Step 1: Write failing provenance, geometry, and orientation tests**

Replace `tests/india.test.js` with:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { INDIA_RINGS } from '../src/data/india-outline.js'
import { createIndia, pointInPolygon } from '../src/subjects/india.js'
import { createSubjectTargets, seededRandom } from '../src/shapes.js'

const mainRing = INDIA_RINGS[0]

test('local India asset is one closed PDF-derived mainland ring with truthful attribution', () => {
  assert.equal(INDIA_RINGS.length, 1)
  assert.ok(mainRing.length > 80)
  assert.deepEqual(mainRing[0], mainRing[mainRing.length - 1])
  const source = readFileSync(new URL('../src/data/india-outline.js', import.meta.url), 'utf8')
  assert.ok(source.includes('Derived from the user-supplied Indiamap.pdf'))
  assert.ok(source.includes('Source rights were not independently established'))
  assert.ok(!source.includes('Natural Earth'))
  for (let index = 1; index < mainRing.length; index += 1) {
    const a = mainRing[index - 1], b = mainRing[index]
    assert.ok(a.every(Number.isFinite) && b.every(Number.isFinite))
    assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1]) > 0)
  }
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
  assert.ok(width / height > 0.65 && width / height < 1.25, `India aspect ${width / height}`)
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

Run: `node --test tests/india.test.js`

Expected: FAIL on the old multi-ring geometry and Natural Earth attribution.

- [ ] **Step 2: Manually trace and clean the main-map outer contour**

Create `docs/reference/india-mainland-trace.svg` as a vector drawing against `.superpowers/sdd/indiamap-inspect/page-001.png`. The reference image is a tracing aid only and must not be embedded in the committed SVG.

Use these exact drawing constraints:

- SVG root: `width="2807"`, `height="3974"`, and `viewBox="0 0 2807 3974"`.
- One visible path with `id="india-mainland"`, `fill="none"`, and a visible stroke.
- Use explicit absolute `M` for the first point, `L` for every subsequent point, and one final `Z`; do not use transforms, relative commands, curves, or multiple subpaths.
- Use at least 80 line segments. Add points where the coast, northern border, Gujarat, and the northeast change direction; do not simplify away distinguishing features.
- Trace only the main map’s outer national border. Exclude internal state boundaries, roads, labels, photographs, graticules, decorative frames, and the inset at source bounds approximately `x = 1450–2310`, `y = 2650–3625`.
- Do not use the rejected automatic candidates or the cleaner-looking inset as the source. Preserve the main map’s north-up/west-left orientation.
- Add SVG metadata stating `Derived from the user-supplied Indiamap.pdf; manually cleaned main-map outer contour; source rights were not independently established.`

This is a drawing/review step rather than generated code. Save the actual traced points in the SVG and inspect the path at high magnification before continuing.

- [ ] **Step 3: Create the deterministic trace validator, normalizer, and preview renderer**

Create `scripts/prepare-india-map.py` with this complete implementation:

```python
#!/usr/bin/env python3
import json
import math
from pathlib import Path
import re
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/reference/india-mainland-trace.svg'
OUTPUT = ROOT / 'src/data/india-outline.js'
PREVIEW = ROOT / 'docs/reference/india-outline-preview'
TOKEN = re.compile(r'[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?')


def read_trace():
    root = ET.parse(SOURCE).getroot()
    if root.attrib.get('viewBox') != '0 0 2807 3974':
        raise RuntimeError('Trace must use viewBox 0 0 2807 3974')
    for element in root.iter():
        if 'transform' in element.attrib:
            raise RuntimeError('Trace transforms are not supported; use source coordinates')
    paths = [element for element in root.iter() if element.tag.endswith('path') and element.attrib.get('id') == 'india-mainland']
    if len(paths) != 1:
        raise RuntimeError('Exactly one path#india-mainland is required')
    tokens = TOKEN.findall(paths[0].attrib.get('d', ''))
    points, index, closed = [], 0, False
    while index < len(tokens):
        command = tokens[index]
        index += 1
        if command == 'Z':
            closed = True
            break
        if command not in {'M', 'L'} or index + 1 >= len(tokens):
            raise RuntimeError('Use explicit absolute M/L points followed by Z')
        if command == 'M' and points:
            raise RuntimeError('Multiple subpaths are not allowed')
        if command == 'L' and not points:
            raise RuntimeError('Trace must start with M')
        points.append([float(tokens[index]), float(tokens[index + 1])])
        index += 2
    if not closed or index != len(tokens):
        raise RuntimeError('Trace must contain one closed path ending in Z')
    if points[0] != points[-1]:
        points.append(points[0])
    if len(points) < 81:
        raise RuntimeError('At least 80 line segments are required')
    for index, point in enumerate(points):
        if not all(math.isfinite(value) for value in point):
            raise RuntimeError('Trace contains non-finite coordinates')
        if index and math.dist(point, points[index - 1]) <= 1e-7:
            raise RuntimeError('Trace contains a degenerate segment')
    return points


def normalize(points):
    north_up = [[x, -y] for x, y in points]
    xs, ys = [point[0] for point in north_up], [point[1] for point in north_up]
    width, height = max(xs) - min(xs), max(ys) - min(ys)
    aspect = width / height
    if not 0.65 < aspect < 1.25:
        raise RuntimeError(f'Trace aspect {aspect:.3f} is outside India review bounds')
    center_x, center_y, scale = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, 8 / height
    ring = []
    for x, y in north_up:
        point = [round((x - center_x) * scale, 5), round((y - center_y) * scale, 5)]
        if not ring or point != ring[-1]:
            ring.append(point)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    if len(ring) < 81:
        raise RuntimeError('Normalization collapsed too many trace segments')
    return ring


def write_outputs(ring):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    header = (
        '// Derived from the user-supplied Indiamap.pdf. Source rights were not independently established.\n'
        '// Manually cleaned main-map outer contour; inset and internal boundaries excluded.\n'
        '// Generated by scripts/prepare-india-map.py; no runtime network request.\n'
    )
    OUTPUT.write_text(header + 'export const INDIA_RINGS = Object.freeze(' + json.dumps([ring], separators=(',', ':')) + '.map((ring) => Object.freeze(ring.map((point) => Object.freeze(point)))))\n')
    svg_points = ' '.join(f'{450 + x * 95:.2f},{450 - y * 95:.2f}' for x, y in ring)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900"><rect width="900" height="900" fill="#05070B"/><polygon points="{svg_points}" fill="#00D4FF18" stroke="#00D4FF" stroke-width="3"/></svg>\n'
    PREVIEW.with_suffix('.svg').write_text(svg)
    image = Image.new('RGB', (900, 900), '#05070B')
    draw = ImageDraw.Draw(image)
    line = [(450 + x * 95, 450 - y * 95) for x, y in ring]
    draw.polygon(line, fill='#09252D')
    draw.line(line, fill='#00D4FF', width=3)
    image.save(PREVIEW.with_suffix('.png'))


ring = normalize(read_trace())
write_outputs(ring)
print(f'India: 1 manually reviewed ring, {len(ring)} points; review {PREVIEW.with_suffix(".png")}')
```

Add this line to `.gitignore` so the source cannot be staged accidentally:

```gitignore
docs/reference/Indiamap.pdf
```

- [ ] **Step 4: Generate and visually compare the normalized outline**

Run:

```bash
python scripts/prepare-india-map.py
stat -f '%N %z bytes' docs/reference/india-outline-preview.png
```

Expected: one ring is generated and the preview is well below 3 MB. Open `docs/reference/india-outline-preview.png` and compare it with the main map in `Indiamap.pdf`, not the inset.

Confirm north is up, west is left, Gujarat and the northeast are recognizable, the southern tip is intact, and there are no internal divisions, labels, roads, photographs, graticules, or inset geometry. If any check fails, correct only the manual `path#india-mainland` trace and rerun Step 4; do not patch the normalized JavaScript coordinates by hand.

- [ ] **Step 5: Run map tests and the full suite**

Run: `node --test tests/india.test.js tests/shapes.test.js && npm test`

Expected: PASS with one PDF-derived ring, finite 20,000-point aggregate targets, interior points inside the reviewed ring, and no Natural Earth attribution. Remove `scripts/prepare-india-map.mjs`.

- [ ] **Step 6: Commit only the reviewed map assets and tooling**

```bash
git rm scripts/prepare-india-map.mjs
git add .gitignore scripts/prepare-india-map.py src/data/india-outline.js \
  docs/reference/india-mainland-trace.svg docs/reference/india-outline-preview.svg \
  docs/reference/india-outline-preview.png tests/india.test.js
git diff --cached --check
git status --short
git commit -m "feat: trace India particles from supplied map"
```

Expected: `docs/reference/Indiamap.pdf` is ignored and absent from the commit; the trace and both previews are included.

---

### Task 3: Responsive Per-Chapter Framing

**Files:**
- Create: `src/framing.js`
- Modify: `src/play.js`
- Test: `tests/framing.test.js`
- Test: `tests/play.test.js`

**Interfaces:**
- Produces: `getTargetBounds(target) -> { min: number[3], max: number[3] }`.
- Produces: `getViewSize({ width, height, fov = 42, cameraZ = 18 }) -> { halfWidth, halfHeight }`.
- Produces: `createChapterFrames(targets, viewport) -> Array<{ x: 0, y: number, scale: number }>` with four frames.
- Consumes: existing `targets`, `camera`, `universe`, `getMorphFrame(progress)`, and `damp()` in playback.

- [ ] **Step 1: Write failing pure framing tests**

Create `tests/framing.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createShapeTargets } from '../src/shapes.js'
import { createChapterFrames, getTargetBounds, getViewSize } from '../src/framing.js'

const targets = createShapeTargets(4000)

function projectedY(frame, target, edge) {
  const bounds = getTargetBounds(target)
  const value = edge === 'min' ? bounds.min[1] : bounds.max[1]
  return frame.y + value * frame.scale
}

test('desktop frames enlarge later chapters independently', () => {
  const frames = createChapterFrames(targets, { width: 1440, height: 900 })
  assert.equal(frames.length, 4)
  for (const frame of frames) {
    assert.equal(frame.x, 0)
    assert.ok(Number.isFinite(frame.y) && Number.isFinite(frame.scale) && frame.scale > 0)
  }
  assert.ok(frames[1].scale > 1 && frames[2].scale > 1 && frames[3].scale > 1)
  assert.notEqual(frames[1].scale, frames[2].scale)
})

test('hero bottom is anchored and its head stays below the name safe zone', () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const frames = createChapterFrames(targets, viewport)
    const view = getViewSize(viewport)
    const bottom = projectedY(frames[0], targets[0], 'min')
    const top = projectedY(frames[0], targets[0], 'max')
    assert.ok(bottom <= -view.halfHeight * 0.98, `hero bottom ${bottom}`)
    assert.ok(top < view.halfHeight * 0.56, `hero top ${top}`)
  }
})

test('mobile and desktop use different responsive chapter frames', () => {
  const desktop = createChapterFrames(targets, { width: 1440, height: 900 })
  const mobile = createChapterFrames(targets, { width: 390, height: 844 })
  assert.notDeepEqual(desktop, mobile)
  assert.ok(mobile[1].scale < desktop[1].scale)
  assert.ok(mobile[1].y > desktop[1].y)
})

test('framing rejects malformed inputs', () => {
  assert.throws(() => createChapterFrames(targets.slice(0, 3), { width: 1440, height: 900 }), /FOUR_TARGETS_REQUIRED/)
  assert.throws(() => createChapterFrames(targets, { width: 0, height: 900 }), /INVALID_VIEWPORT/)
})
```

Run: `node --test tests/framing.test.js`

Expected: FAIL because `src/framing.js` does not exist.

- [ ] **Step 2: Implement pure responsive framing**

Create `src/framing.js`:

```js
const DESKTOP = Object.freeze([
  Object.freeze({ bottom: -1.06, top: 0.50, width: 0.42 }),
  Object.freeze({ bottom: -0.78, top: 0.80, width: 0.54 }),
  Object.freeze({ bottom: -0.76, top: 0.78, width: 0.66 }),
  Object.freeze({ bottom: -0.78, top: 0.78, width: 0.68 }),
])

const MOBILE = Object.freeze([
  Object.freeze({ bottom: -1.08, top: 0.48, width: 0.90 }),
  Object.freeze({ bottom: -0.25, top: 0.70, width: 0.90 }),
  Object.freeze({ bottom: -0.36, top: 0.64, width: 0.94 }),
  Object.freeze({ bottom: -0.40, top: 0.62, width: 0.94 }),
])

export function getTargetBounds(target) {
  if (!(target instanceof Float32Array) || target.length === 0 || target.length % 3 !== 0) throw new Error('INVALID_TARGET')
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let offset = 0; offset < target.length; offset += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = target[offset + axis]
      if (!Number.isFinite(value)) throw new Error('INVALID_TARGET')
      min[axis] = Math.min(min[axis], value)
      max[axis] = Math.max(max[axis], value)
    }
  }
  return { min, max }
}

export function getViewSize({ width = 1440, height = 900, fov = 42, cameraZ = 18 } = {}) {
  if (![width, height, fov, cameraZ].every(Number.isFinite) || width <= 0 || height <= 0 || fov <= 0 || cameraZ <= 0) {
    throw new Error('INVALID_VIEWPORT')
  }
  const halfHeight = Math.tan(fov * Math.PI / 360) * cameraZ
  return { halfWidth: halfHeight * width / height, halfHeight }
}

export function createChapterFrames(targets, { width = 1440, height = 900, fov = 42, cameraZ = 18, mobile = false } = {}) {
  if (!Array.isArray(targets) || targets.length !== 4) throw new Error('FOUR_TARGETS_REQUIRED')
  const view = getViewSize({ width, height, fov, cameraZ })
  const profiles = mobile ? MOBILE : DESKTOP
  return targets.map((target, index) => {
    const { min, max } = getTargetBounds(target)
    const profile = profiles[index]
    const localWidth = max[0] - min[0]
    const localHeight = max[1] - min[1]
    if (localWidth <= 0 || localHeight <= 0) throw new Error('INVALID_TARGET')
    const heightScale = (profile.top - profile.bottom) * view.halfHeight / localHeight
    const widthScale = profile.width * 2 * view.halfWidth / localWidth
    const scale = Math.min(heightScale, widthScale)
    const y = index === 0
      ? profile.bottom * view.halfHeight - min[1] * scale
      : (profile.top + profile.bottom) * 0.5 * view.halfHeight - (min[1] + max[1]) * 0.5 * scale
    return { x: 0, y, scale }
  })
}
```

Run: `node --test tests/framing.test.js`

Expected: PASS. The first target is bottom anchored; later targets are centered in their own safe zones.

- [ ] **Step 3: Add a failing first-frame playback test**

Add this test to `tests/play.test.js` and add the framing import shown below:

```js
import { createChapterFrames } from '../src/framing.js'

test('Play applies the responsive hero frame on its first update', async () => {
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(makeContext())
  const targets = createShapeTargets(PARTICLE_COUNT)
  const expected = createChapterFrames(targets, { width: 1440, height: 900 })[0]
  const universe = result.scene.getObjectByName('Data Universe')
  play.update(0)
  assert.equal(universe.position.y, expected.y)
  assert.equal(universe.scale.x, expected.scale)
  play.dispose()
  result.dispose()
})
```

Run: `node --test tests/play.test.js`

Expected: FAIL because playback still starts at scale `1` and applies the old mobile-only offsets.

- [ ] **Step 4: Integrate chapter frames with playback and resizing**

In `src/play.js`, add:

```js
import { createChapterFrames } from './framing.js'
```

Add these state variables beside the existing playback state:

```js
  let chapterFrames = []
  let framingInitialized = false
```

At the start of `measure()`, before its section-count early return, add:

```js
    const width = browserWindow?.innerWidth || container.clientWidth || 1440
    const height = browserWindow?.innerHeight || container.clientHeight || 900
    chapterFrames = createChapterFrames(targets, {
      width,
      height,
      fov: camera.fov,
      cameraZ: camera.position.z,
      mobile: !embedded && width <= 760,
    })
```

Immediately after `sampleMorph(...)` in `update(dt)`, derive the interpolated frame:

```js
    const morphFrame = getMorphFrame(progress)
    sampleMorph(targets, morphFrame, positions.array, phases)
    const fromFrame = chapterFrames[morphFrame.from]
    const toFrame = chapterFrames[morphFrame.to]
    const desiredY = fromFrame.y + (toFrame.y - fromFrame.y) * morphFrame.mix
    const desiredScale = fromFrame.scale + (toFrame.scale - fromFrame.scale) * morphFrame.mix
    if (!framingInitialized || reducedMotion.matches) {
      universe.position.y = desiredY
      universe.scale.setScalar(desiredScale)
      framingInitialized = true
    } else {
      universe.position.y = damp(universe.position.y, desiredY, 5, safeDt)
      const scale = damp(universe.scale.x, desiredScale, 5, safeDt)
      universe.scale.setScalar(scale)
    }
    universe.position.x = 0
```

Use the shown `morphFrame` version to replace the existing separate `sampleMorph(targets, getMorphFrame(progress), ...)` call; do not sample twice. Remove the old `mobile`, `universe.position.x/y` damping, and single-scale lines near the end of `update(dt)`. Keep rotations, dust, camera parallax, pointer behavior, and all motion code unchanged.

Before the final `update(0)`, ensure frames exist in non-browser test/editor contexts:

```js
  if (chapterFrames.length !== 4) measure()
  update(0)
```

- [ ] **Step 5: Run framing, playback, reduced-motion, and full tests**

Run: `node --test tests/framing.test.js tests/play.test.js tests/visual-review.test.js && npm test`

Expected: PASS, including exact first-frame positioning, static reduced-motion targets, and unchanged editable-scene behavior.

- [ ] **Step 6: Commit the framing revision**

```bash
git add src/framing.js src/play.js tests/framing.test.js tests/play.test.js
git commit -m "feat: scale particle chapters responsively"
```

---

### Task 4: Top-Centered Hero Typography and Safe Zones

**Files:**
- Modify: `src/styles.css`
- Test: `tests/content.test.js`

**Interfaces:**
- Preserves: existing `<h1 class="hero-name" id="hero-title"><span>Akshant</span><span>Kumar</span></h1>`.
- Produces: base and mobile `.hero-name` rules with `top`, `left: 50%`, horizontal centering, and no `bottom` positioning.

- [ ] **Step 1: Add failing hero alignment tests**

Add to `tests/content.test.js`:

```js
test('hero name stays top centered in base and mobile rules', () => {
  const rules = css.match(/\.hero-name\s*\{[^}]*\}/g) || []
  assert.ok(rules.length >= 2, 'missing base or mobile hero-name rule')
  for (const rule of rules) {
    assert.match(rule, /top:\s*0;/)
    assert.match(rule, /left:\s*50%;/)
    assert.match(rule, /translateX\(-50%\)/)
    assert.doesNotMatch(rule, /bottom:/)
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.ok(html.includes('<h1 class="hero-name" id="hero-title"><span>Akshant</span><span>Kumar</span></h1>'))
})
```

Run: `node --test tests/content.test.js`

Expected: FAIL because the current base and mobile rules use `bottom` and lack the complete top-center transform.

- [ ] **Step 2: Implement the desktop hero lockup**

Replace the base `.hero-name` and `.hero-role` rules in `src/styles.css` with:

```css
.hero-name { position: absolute; top: 0; left: 50%; display: flex; width: min(92vw, 1200px); margin: 0; align-items: center; justify-content: center; gap: 0.18em; transform: translateX(-50%); font-size: clamp(3.4rem, 6vw, 7rem); font-weight: 600; letter-spacing: -0.075em; line-height: 0.9; text-align: center; white-space: nowrap; }
.hero-role { position: absolute; top: 6%; right: 0; margin: 0; color: var(--text); font: 11px var(--mono); letter-spacing: 0.16em; text-transform: uppercase; }
```

Keep `.hero-name span:last-child` unchanged so the existing typographic outline accent remains.

- [ ] **Step 3: Implement mobile centering without restoring lower-left placement**

Inside `@media (max-width: 760px)`, replace `.hero-name` and `.hero-role` with:

```css
  .hero-name { top: 0; left: 50%; flex-direction: column; gap: 0; transform: translateX(-50%); font-size: clamp(3.2rem, 14vw, 5rem); line-height: 0.84; white-space: normal; }
  .hero-role { top: auto; right: 0; bottom: 8%; font-size: 9px; }
```

- [ ] **Step 4: Run content and full regression tests**

Run: `node --test tests/content.test.js && npm test`

Expected: PASS with one semantic `h1`, four chapters, preserved professional facts, and top-centered base/mobile rules.

- [ ] **Step 5: Commit the hero layout revision**

```bash
git add src/styles.css tests/content.test.js
git commit -m "feat: center hero name above particle portrait"
```

---

### Task 5: Visual Review, Interaction Regression, and Documentation

**Files:**
- Modify: `src/review.js`
- Modify: `src/main.js`
- Modify: `src/project.js`
- Modify: `README.md`
- Modify: `docs/design-brief.md`
- Modify: `docs/superpowers/specs/2026-10-27-particle-composition-revision-design.md`
- Create: `.superpowers/sdd/final-review/` screenshots and machine-check output; do not commit this review scratch directory unless it is already intentionally tracked.

**Interfaces:**
- Preserves all runtime APIs and identifiers.
- Produces final measured evidence only; no stale five-chapter, 12,000-particle, 23-test, or Natural Earth claims.

- [ ] **Step 1: Run the complete automated gate before recording evidence**

Run:

```bash
npm test && npm run check && npm run build && git diff --check
```

Expected: all tests PASS, Edit3D compilation succeeds, production build succeeds, and diff check succeeds. Record the exact test count and any warnings. Do not convert known non-fatal warnings into claims of failure or claim they were fixed.

- [ ] **Step 2: Review every chapter at desktop size**

Use the normal `preview/` launcher, not the embedded scene-only URL. If a preview process already exists, verify its command line and working directory before using it; do not stop an unknown process. Use an available local port and stop any temporary server owned by this task before final delivery.

Call `InAppBrowser list_tabs` and re-resolve the normal portfolio tab. Set the viewport to `1440 × 900`. Capture and inspect `hero`, `experience`, `skills`, and `contact` into `.superpowers/sdd/final-review/`.

Confirm all of the following from actual pixels and DOM measurements:

- The half-body boy has no legs and its lower torso meets or crosses the bottom edge.
- The boy’s head does not collide with the centered name or fixed header.
- India matches the reviewed PDF contour, with no internal divisions or source-page artifacts.
- India, Skills, and Contact are visibly larger than the pre-revision composition and do not leave the old small central subject.
- Essential text and controls are unobstructed; `document.documentElement.scrollWidth <= window.innerWidth`.

If any check fails, fix the responsible geometry, framing, or CSS task and rerun its tests plus this visual step. Do not document a pass before the corrected capture is reviewed.

- [ ] **Step 3: Review mobile composition and all interactions**

Set the viewport to `390 × 844` and capture all four chapters. Confirm the name remains top centered, the portrait remains bottom anchored, the map remains north-up, experience rows remain reachable, and no horizontal overflow or blocked control appears.

Exercise and record the actual results for:

- Native scrolling and all four header links.
- Shortcuts `1`–`4` and adjacent-chapter arrow keys.
- Each skill category and each experience selection.
- Pointer dissolution and damped return.
- `mailto:akst31@yahoo.com` and `https://github.com/akshant31` hrefs without navigating away during inspection.
- Reduced motion: static chapter buffers, no idle rigging/ambient rotation, and exact chapter-frame snapping.
- WebGL-disabled mode: all four semantic chapters and contact links remain readable.
- Editable root scene: registered objects and parameter groups still load; particle size, motion, and palette controls still affect the scene.

- [ ] **Step 4: Update runtime names and project identity without changing ids**

In `src/main.js`, replace the normal-ready status with:

```js
      if (status) status.textContent = 'Particle portrait online'
```

In `src/project.js`, use these display names while preserving the existing ids:

```js
    name: 'Akshant Kumar · Particle Portrait',
    defaultSceneId: 'main',
    scenes: [{ id: 'main', name: 'Immersive Particle Portrait', createScene }],
```

Update `README.md` and `docs/design-brief.md` to describe four chapters, 20,000 main particles plus 1,200 ambient particles, the half-body bottom-anchored hero, top-centered name, per-chapter framing, and PDF-derived single-ring India geometry. Replace Natural Earth attribution with `Derived from the user-supplied Indiamap.pdf; source rights were not independently established.` Document the approved manual SVG trace → `python scripts/prepare-india-map.py` validation/normalization → SVG/PNG visual comparison workflow. State that rejected automatic candidates and scratch extraction directories are not inputs. Do not claim the source PDF is committed or redistributable.

Change the written spec’s status line only after its approved requirements have been implemented and reviewed:

```markdown
Status: Visual direction, written specification, and manual-trace amendment approved by the user on 2026-10-27; implementation and measured review recorded in src/review.js
```

- [ ] **Step 5: Replace stale review evidence with measured results**

Replace the default export in `src/review.js` with the checks actually completed in Steps 1–3. Each entry must have a specific `name`, a truthful `status`, and an `evidence` string containing the measured viewport, command result, interaction result, or reviewed capture. Include the exact final automated test count from Step 1. Remove every old five-chapter, 12,000-particle, 23-test, Raw/Lattice, and Natural Earth statement.

Use `status: 'passed'` only when every required check passed. If a capture or integration surface is unavailable, use `status: 'limited'`, retain successful measured checks, and name the unavailable surface in `limitations`; never infer a pass from source inspection.

- [ ] **Step 6: Rerun the gate and commit final documentation**

Run:

```bash
npm test && npm run check && npm run build && git diff --check
```

Expected: the same passing gate after documentation and runtime-name changes. Confirm `git status --short` shows only intended files plus ignored scratch artifacts.

```bash
git add src/review.js src/main.js src/project.js README.md docs/design-brief.md \
  docs/superpowers/specs/2026-10-27-particle-composition-revision-design.md
git commit -m "docs: record immersive portfolio revision review"
```

---

### Task 6: Feature-Branch Delivery

**Files:**
- No further source changes unless a verification failure requires returning to the responsible task.

- [ ] **Step 1: Verify repository and branch state**

Run:

```bash
git status --short --branch
git diff --check
git log --oneline --decorate -10
git rev-parse HEAD
git rev-parse master
```

Expected: no uncommitted intended files, the current branch is `feature/3d-data-portfolio`, and `master` remains unchanged. The large PDF is ignored rather than committed.

- [ ] **Step 2: Push only the feature branch and verify the remote id**

```bash
git push origin feature/3d-data-portfolio
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git ls-remote origin refs/heads/feature/3d-data-portfolio | cut -f1)
test "$LOCAL" = "$REMOTE" && printf 'Verified feature branch: %s\n' "$LOCAL"
```

Expected: local and remote feature-branch commit ids match. Do not push `master`, merge a pull request, or deploy GitHub Pages.

- [ ] **Step 3: Stop temporary validation servers and provide the preview**

Confirm any temporary server started by this task is stopped. Leave Kimi Work’s persistent preview lifecycle to the client. Deliver the feature branch, verified commit id, measured test/visual results, and any real limitations, followed by exactly:

`/Users/akshant/Documents/kimi/tasks/2026-10-25/20-31-02-02135f3f/portfolio/preview`

`[Preview immersive 3D portfolio](http://localhost:7100/)`
