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

test('default particle rendering is legible against the graphite background', () => {
  const result = createScene({ asset: makeAsset() })
  const particles = result.scene.getObjectByName('Particle Field')
  const colors = particles.geometry.attributes.color.array
  const luminance = colors[3] * 0.2126 + colors[4] * 0.7152 + colors[5] * 0.0722
  assert.ok(particles.material.size >= 0.07, `particle size ${particles.material.size} is too small`)
  assert.ok(particles.material.opacity >= 0.9, `particle opacity ${particles.material.opacity} is too low`)
  assert.equal(particles.material.blending, THREE.AdditiveBlending)
  assert.ok(luminance > 0.55, `base-particle luminance ${luminance} is too low`)
  result.dispose()
})

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

test('scene renders primary and ambient depth as point fields only', () => {
  const result = createScene({ asset: makeAsset() })
  const renderables = []
  result.scene.traverse((object) => {
    if (object.material) renderables.push(object)
  })
  assert.equal(renderables.length, 2)
  assert.ok(renderables.every((object) => object instanceof THREE.Points))
  assert.deepEqual(renderables.map((object) => object.name).sort(), ['Ambient Dust', 'Particle Field'])
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
  assert.equal(result.scene.getObjectByName('Ambient Dust').rotation.y, 0)
  play.dispose()
  result.dispose()
})
