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
