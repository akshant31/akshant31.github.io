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
    const frames = createChapterFrames(targets, { ...viewport, mobile: viewport.width <= 820 })
    const view = getViewSize(viewport)
    const bottom = projectedY(frames[0], targets[0], 'min')
    const top = projectedY(frames[0], targets[0], 'max')
    assert.ok(bottom <= -view.halfHeight * 0.98, `hero bottom ${bottom}`)
    assert.ok(top < view.halfHeight * 0.56, `hero top ${top}`)
  }
})

test('mobile and desktop use different responsive chapter frames', () => {
  const desktop = createChapterFrames(targets, { width: 1440, height: 900, mobile: false })
  const mobile = createChapterFrames(targets, { width: 390, height: 844, mobile: true })
  assert.notDeepEqual(desktop, mobile)
  assert.ok(mobile[1].scale < desktop[1].scale)
  assert.notEqual(mobile[1].y, desktop[1].y)
})

test('mobile subjects fit reserved vertical stages at narrow and tablet sizes', () => {
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const frames = createChapterFrames(targets, { ...viewport, mobile: true })
    const view = getViewSize(viewport)
    assert.ok(projectedY(frames[0], targets[0], 'max') <= view.halfHeight * 0.26 + 0.001, `hero enters text zone at ${viewport.width}`)
    const stages = [{ top: 0.32, bottom: -0.34 }, { top: 0.28, bottom: -0.40 }, { top: 0.24, bottom: -0.26 }]
    stages.forEach((stage, index) => {
      const top = projectedY(frames[index + 1], targets[index + 1], 'max')
      const bottom = projectedY(frames[index + 1], targets[index + 1], 'min')
      assert.ok(top <= stage.top * view.halfHeight + 0.001, `chapter ${index + 1} top escaped stage`)
      assert.ok(bottom >= stage.bottom * view.halfHeight - 0.001, `chapter ${index + 1} bottom escaped stage`)
    })
  }
})

test('framing rejects malformed inputs', () => {
  assert.throws(() => createChapterFrames(targets.slice(0, 3), { width: 1440, height: 900 }), /FOUR_TARGETS_REQUIRED/)
  assert.throws(() => createChapterFrames(targets, { width: 0, height: 900 }), /INVALID_VIEWPORT/)
})
