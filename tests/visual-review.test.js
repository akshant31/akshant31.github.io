import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createScene } from '../src/scene.js'

function makeAsset() {
  return {
    register() {},
    registerParams() {},
    subscribe() { return () => {} },
  }
}

function makeContext() {
  return {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: null },
    signal: { aborted: false, addEventListener() {} },
  }
}

test('Play keeps the offset data universe right of center', async () => {
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(makeContext())
  play.update(0)
  const expected = new THREE.Vector3(0, 0, 0).sub(result.camera.position).normalize()
  const actual = result.camera.getWorldDirection(new THREE.Vector3())
  assert.ok(actual.dot(expected) > 0.999999, 'camera should look at the layout origin, not center the offset universe')
  play.dispose()
  result.dispose()
})

test('default particle rendering is legible against the graphite background', () => {
  const result = createScene({ asset: makeAsset() })
  const particles = result.scene.getObjectByName('Particle Field')
  const colors = particles.geometry.attributes.color.array
  const luminance = colors[0] * 0.2126 + colors[1] * 0.7152 + colors[2] * 0.0722
  assert.ok(particles.material.size >= 0.1, `particle size ${particles.material.size} is too small`)
  assert.ok(particles.material.opacity >= 0.95, `particle opacity ${particles.material.opacity} is too low`)
  assert.equal(particles.material.blending, THREE.AdditiveBlending)
  assert.ok(luminance > 0.35, `base-particle luminance ${luminance} is too low`)
  result.dispose()
})

test('particle palette gives cyan and violet data visual weight', () => {
  const result = createScene({ asset: makeAsset() })
  const colors = result.scene.getObjectByName('Particle Field').geometry.attributes.color.array
  assert.equal(colors[4 * 3], 0)
  assert.ok(colors[4 * 3 + 1] > 0.6)
  assert.ok(colors[8 * 3 + 2] - colors[8 * 3] > 0.3)
  result.dispose()
})

test('core rings provide visible accent structure', () => {
  const result = createScene({ asset: makeAsset() })
  assert.ok(result.scene.getObjectByName('Core Ring 1').material.opacity >= 0.35)
  assert.ok(result.scene.getObjectByName('Core Ring 2').material.opacity >= 0.3)
  result.dispose()
})

test('reduced motion freezes ambient 3D rotation', async () => {
  const reducedMotion = { matches: true, addEventListener() {} }
  const browserWindow = { matchMedia: () => reducedMotion, addEventListener() {}, innerWidth: 1200, scrollY: 0 }
  const doc = {
    body: { classList: { contains: () => true } },
    defaultView: browserWindow,
    createElement: () => ({ setAttribute() {}, addEventListener() {}, append() {}, remove() {} }),
  }
  const context = {
    canvas: { addEventListener() {}, focus() {} },
    container: { append() {}, replaceChildren() {}, ownerDocument: doc },
    signal: { aborted: false, addEventListener() {} },
  }
  const result = createScene({ asset: makeAsset() })
  const play = await result.play(context)
  play.update(0.1)
  assert.equal(result.scene.getObjectByName('Data Universe').rotation.y, 0)
  assert.equal(result.scene.getObjectByName('Core Rings').rotation.y, 0)
  play.dispose()
  result.dispose()
})
