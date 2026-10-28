import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createScene } from '../src/scene.js'

function makeAsset() {
  const listeners = new Set()
  return {
    params: new Map(),
    register() {},
    registerParams(id, settings, schema) { this.params.set(id, { settings, schema }) },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}

test('light theme recolors and reblends the same buffers, then restores dark exactly', () => {
  const asset = makeAsset()
  const result = createScene({ asset })
  const particles = result.scene.getObjectByName('Particle Field')
  const dust = result.scene.getObjectByName('Ambient Dust')
  const geometry = particles.geometry
  const positions = geometry.attributes.position.array
  const darkColors = geometry.attributes.color.array.slice()
  result.setTheme('light')
  assert.equal(result.scene.getObjectByName('Particle Field'), particles)
  assert.equal(particles.geometry, geometry)
  assert.equal(particles.geometry.attributes.position.array, positions)
  assert.equal(particles.geometry.attributes.position.count, 20000)
  assert.equal(dust.geometry.attributes.position.count, 1200)
  assert.equal(particles.material.blending, THREE.NormalBlending)
  assert.equal(dust.material.blending, THREE.NormalBlending)
  assert.equal(result.scene.background.getHexString(), 'f6f3ec')
  assert.equal(particles.userData.baseOpacity, 0.88)
  assert.notDeepEqual(geometry.attributes.color.array, darkColors)
  assert.equal(asset.params.get('dataPalette').settings.cyan, '#00D4FF')
  assert.equal(asset.params.get('dataPalette').settings.violet, '#9D4EDD')
  result.setTheme('dark')
  assert.equal(particles.material.blending, THREE.AdditiveBlending)
  assert.deepEqual(geometry.attributes.color.array, darkColors)
  result.dispose()
})

test('invalid theme input falls back to dark without adding renderables', () => {
  const result = createScene({ asset: makeAsset(), theme: 'light' })
  result.setTheme('invalid')
  assert.equal(result.scene.background.getHexString(), '05070b')
  let renderables = 0
  result.scene.traverse((object) => { if (object.material) renderables += 1 })
  assert.equal(renderables, 2)
  result.dispose()
})
