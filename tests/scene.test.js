import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createScene } from '../src/scene.js'
import { PARTICLE_COUNT } from '../src/shapes.js'

function makeAsset() {
  const objects = new Map()
  const params = new Map()
  const listeners = new Set()
  return {
    objects,
    params,
    register(id, object) { objects.set(id, object) },
    registerParams(id, settings, schema) { params.set(id, { settings, schema }) },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    change() { for (const listener of listeners) listener({ type: 'change' }) },
    listenerCount() { return listeners.size },
  }
}

test('scene registers the complete data universe and named materials', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  for (const id of ['dataUniverse', 'particleField', 'ambientDust', 'camera']) {
    assert.ok(asset.objects.has(id), `missing registered object ${id}`)
  }
  for (const id of ['dataField', 'dataMotion', 'dataPalette']) {
    assert.ok(asset.params.has(id), `missing parameter group ${id}`)
  }
  const particles = asset.objects.get('particleField')
  assert.ok(particles instanceof THREE.Points)
  assert.equal(particles.geometry.attributes.position.count, PARTICLE_COUNT)
  assert.ok(particles.material.map instanceof THREE.DataTexture)
  const materials = new Set()
  result.scene.traverse((object) => {
    if (object.material) materials.add(object.material)
  })
  assert.equal(materials.size, 2)
  for (const material of materials) assert.ok(material.name.trim().length > 0)
  assert.equal(typeof result.play, 'function')
  result.dispose()
})

test('parameter subscriptions update particle size and accent colors', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  const particles = asset.objects.get('particleField')
  asset.params.get('dataField').settings.particleSize = 0.09
  asset.params.get('dataPalette').settings.cyan = '#ffffff'
  asset.change()
  assert.equal(particles.material.size, 0.09)
  assert.equal(particles.geometry.attributes.color.array[10 * 3], 1)
  assert.equal(particles.geometry.attributes.color.array[10 * 3 + 1], 1)
  assert.equal(particles.geometry.attributes.color.array[10 * 3 + 2], 1)
  assert.equal(asset.listenerCount(), 1)
  result.dispose()
  assert.equal(asset.listenerCount(), 0)
})

test('ambient dust is a separate secondary point field', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  const particles = asset.objects.get('particleField')
  const dust = asset.objects.get('ambientDust')
  assert.ok(dust instanceof THREE.Points)
  assert.equal(dust.geometry.attributes.position.count, 1200)
  assert.ok(dust.material.opacity < particles.material.opacity)
  assert.ok(dust.material.size < particles.material.size)
  assert.ok(dust.material.name.trim().length > 0)
  result.dispose()
})
