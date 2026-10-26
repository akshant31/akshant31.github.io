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
