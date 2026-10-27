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
