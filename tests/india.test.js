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

test('northern Ladakh reaches the reviewed outer PDF stroke without changing the map contract', () => {
  const trace = readFileSync(new URL('../docs/reference/india-mainland-trace.svg', import.meta.url), 'utf8')
  const points = [...trace.matchAll(/[ML] (\d+) (\d+)/g)].map((match) => [Number(match[1]), Number(match[2])])
  const northern = points.filter(([x, y]) => x >= 500 && x <= 1230 && y <= 820)
  const ladakhEdge = points.filter(([x, y]) => x >= 1150 && x <= 1220 && y >= 540 && y <= 660)
  assert.ok(Math.min(...northern.map((point) => point[1])) <= 350, 'northern edge remains trimmed')
  assert.ok(Math.max(...ladakhEdge.map((point) => point[0])) >= 1210, 'right Ladakh edge remains trimmed')
  assert.ok(trace.includes('viewBox="0 0 2807 3974"'))
  assert.equal((trace.match(/id="india-mainland"/g) || []).length, 1)
  assert.ok(Math.max(...mainRing.map((point) => point[0])) >= 3.51, 'far-northeastern extent regressed')
})
