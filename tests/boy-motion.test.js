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
  for (let index = 0; index < regions.length; index += 1) {
    if (regions[index] !== BOY_REGION.LEFT_LEG && regions[index] !== BOY_REGION.RIGHT_LEG) continue
    const offset = index * 3
    assert.equal(output[offset], positions[offset])
    assert.equal(output[offset + 1], positions[offset + 1])
    assert.equal(output[offset + 2], positions[offset + 2])
  }
})
