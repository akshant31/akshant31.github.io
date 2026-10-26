import * as THREE from 'three'
import { createSubjectTargets, PARTICLE_COUNT } from './shapes.js'
import { seededRandom, sphericalPoint, writePoint } from './subjects/shared.js'
import { enableToneMapping } from './environment/tonemap.js'

function createParticleSprite() {
  const size = 16
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5) / size * 2 - 1
      const dy = (y + 0.5) / size * 2 - 1
      const alpha = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy))
      const offset = (y * size + x) * 4
      data[offset] = data[offset + 1] = data[offset + 2] = 255
      data[offset + 3] = Math.round(alpha * alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  texture.name = 'Particle Portrait · Soft Sprite'
  return texture
}

function createAmbientDust(sprite) {
  const count = 1200
  const random = seededRandom(7031)
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const [x, y, z] = sphericalPoint(random, 7 + random() * 7)
    writePoint(positions, index, x, y * 0.65, z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    name: 'Particle Portrait · Ambient Dust', size: 0.025, map: sprite,
    color: '#6B8798', transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const dust = new THREE.Points(geometry, material)
  dust.name = 'Ambient Dust'
  return dust
}

export function createScene({ asset }) {
  enableToneMapping({ curve: 'aces' })
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#05070B')
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0.2, 18)
  camera.lookAt(0, 0, 0)
  camera.name = 'Main camera · Particle Portrait'

  const settings = { particleSize: 0.075, motionSpeed: 1, flowIntensity: 0.7, cyan: '#00D4FF', violet: '#9D4EDD' }
  const subject = createSubjectTargets(PARTICLE_COUNT)
  const universe = new THREE.Group()
  universe.name = 'Data Universe'
  const sprite = createParticleSprite()
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(subject.targets[0]), 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
  const particleMaterial = new THREE.PointsMaterial({
    name: 'Particle Portrait · Living Points', size: settings.particleSize,
    sizeAttenuation: true, map: sprite, transparent: true, opacity: 0.94,
    blending: THREE.AdditiveBlending, alphaTest: 0.015, depthWrite: false, vertexColors: true,
  })
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  particles.name = 'Particle Field'
  const dust = createAmbientDust(sprite)
  universe.add(particles)
  scene.add(universe, dust, camera)

  asset.register('dataUniverse', universe, { name: 'Data Universe' })
  asset.register('particleField', particles, { name: 'Particle Field', parent: 'dataUniverse' })
  asset.register('ambientDust', dust, { name: 'Ambient Dust' })
  asset.register('camera', camera, { name: 'Main camera' })
  asset.registerParams('dataField', settings, {
    particleSize: { label: 'Particle size', type: 'number', min: 0.02, max: 0.14, step: 0.005 },
  }, { name: 'Data Field' })
  asset.registerParams('dataMotion', settings, {
    motionSpeed: { label: 'Motion speed', type: 'number', min: 0, max: 3, step: 0.1 },
    flowIntensity: { label: 'Flow intensity', type: 'number', min: 0, max: 1.5, step: 0.05 },
  }, { name: 'Data Motion' })
  asset.registerParams('dataPalette', settings, {
    cyan: { label: 'Cyan accent', type: 'color' }, violet: { label: 'Violet accent', type: 'color' },
  }, { name: 'Data Palette' })

  const baseColor = new THREE.Color('#E4EBF0')
  const cyanColor = new THREE.Color()
  const violetColor = new THREE.Color()
  function applyParams() {
    particleMaterial.size = settings.particleSize
    particleMaterial.color.set('#FFFFFF')
    cyanColor.set(settings.cyan)
    violetColor.set(settings.violet)
    const colors = particleGeometry.attributes.color
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      let color
      if (index < subject.indiaOutlineCount) color = index % 5 === 0 ? cyanColor : baseColor
      else {
        const band = index % 17
        color = band < 10 ? baseColor : band < 14 ? cyanColor : violetColor
      }
      colors.setXYZ(index, color.r, color.g, color.b)
    }
    colors.needsUpdate = true
  }
  const unsubscribe = asset.subscribe(({ type }) => { if (type === 'change') applyParams() })
  applyParams()

  return {
    scene,
    camera,
    play: async (context) => {
      const { playPortfolio } = await import('./play.js')
      return playPortfolio(context, {
        universe, particles, dust, camera,
        targets: subject.targets,
        boyRegions: subject.boyRegions,
        indiaOutlineCount: subject.indiaOutlineCount,
        phases: subject.phases,
      }, settings)
    },
    dispose() {
      unsubscribe()
      const resources = new Set()
      scene.traverse((object) => {
        if (object.geometry) resources.add(object.geometry)
        for (const material of [object.material].flat()) {
          if (!material) continue
          resources.add(material)
          for (const value of Object.values(material)) if (value?.isTexture) resources.add(value)
        }
      })
      for (const resource of resources) resource.dispose()
    },
  }
}
