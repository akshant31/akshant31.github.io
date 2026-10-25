import * as THREE from 'three'
import { createShapeTargets, PARTICLE_COUNT } from './shapes.js'
import { enableToneMapping } from './environment/tonemap.js'

function createParticleSprite() {
  const size = 16
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5) / size * 2 - 1
      const dy = (y + 0.5) / size * 2 - 1
      const distance = Math.sqrt(dx * dx + dy * dy)
      const alpha = Math.max(0, 1 - distance)
      const offset = (y * size + x) * 4
      data[offset] = 255
      data[offset + 1] = 255
      data[offset + 2] = 255
      data[offset + 3] = Math.round(alpha * alpha * 255)
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  texture.name = 'Data Universe · Soft Particle Sprite'
  return texture
}

function createNetworkIndices(segmentCount, particleCount) {
  const indices = new Uint32Array(segmentCount * 2)
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const start = (segment * 127) % particleCount
    indices[segment * 2] = start
    indices[segment * 2 + 1] = (start + 37 + segment % 13) % particleCount
  }
  return indices
}

export function createScene({ asset }) {
  enableToneMapping({ curve: 'aces' })
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0B0D12')
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0.2, 18)
  camera.lookAt(0, 0, 0)
  camera.name = 'Main camera · Data Universe'

  const settings = {
    particleSize: 0.1,
    motionSpeed: 1,
    flowIntensity: 0.7,
    cyan: '#00D4FF',
    violet: '#9D4EDD',
  }
  const targets = createShapeTargets(PARTICLE_COUNT)
  const universe = new THREE.Group()
  universe.name = 'Data Universe'
  universe.position.set(2.5, 0, 0)

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(targets[0]), 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
  const particleMaterial = new THREE.PointsMaterial({
    name: 'Data Universe · Particle Field',
    size: settings.particleSize,
    sizeAttenuation: true,
    map: createParticleSprite(),
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.015,
    depthWrite: false,
    vertexColors: true,
  })
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  particles.name = 'Particle Field'

  const networkIndices = createNetworkIndices(96, PARTICLE_COUNT)
  const networkGeometry = new THREE.BufferGeometry()
  networkGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(networkIndices.length * 3), 3))
  const networkMaterial = new THREE.LineBasicMaterial({
    name: 'Data Universe · Network Links',
    color: '#4B7891',
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  })
  const network = new THREE.LineSegments(networkGeometry, networkMaterial)
  network.name = 'Network Links'

  const cyanRingMaterial = new THREE.MeshBasicMaterial({
    name: 'Data Universe · Cyan Core Ring',
    color: settings.cyan,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  })
  const violetRingMaterial = new THREE.MeshBasicMaterial({
    name: 'Data Universe · Violet Core Ring',
    color: settings.violet,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  })
  const coreRings = new THREE.Group()
  coreRings.name = 'Core Rings'
  ;[3.1, 3.65, 4.15].forEach((radius, index) => {
    const geometry = new THREE.TorusGeometry(radius, 0.008, 4, 160)
    const ring = new THREE.Mesh(geometry, index === 1 ? violetRingMaterial : cyanRingMaterial)
    ring.name = `Core Ring ${index + 1}`
    ring.rotation.set(index * 0.72 + 0.2, index * 0.55, index * 0.35)
    coreRings.add(ring)
  })

  universe.add(particles, network, coreRings)
  scene.add(universe, camera)
  asset.register('dataUniverse', universe, { name: 'Data Universe' })
  asset.register('particleField', particles, { name: 'Particle Field', parent: 'dataUniverse' })
  asset.register('network', network, { name: 'Network Links', parent: 'dataUniverse' })
  asset.register('coreRings', coreRings, { name: 'Core Rings', parent: 'dataUniverse' })
  asset.register('camera', camera, { name: 'Main camera' })

  asset.registerParams('dataField', settings, {
    particleSize: { label: 'Particle size', type: 'number', min: 0.02, max: 0.12, step: 0.005 },
  }, { name: 'Data Field' })
  asset.registerParams('dataMotion', settings, {
    motionSpeed: { label: 'Motion speed', type: 'number', min: 0, max: 3, step: 0.1 },
    flowIntensity: { label: 'Flow intensity', type: 'number', min: 0, max: 1.5, step: 0.05 },
  }, { name: 'Data Motion' })
  asset.registerParams('dataPalette', settings, {
    cyan: { label: 'Cyan accent', type: 'color' },
    violet: { label: 'Violet accent', type: 'color' },
  }, { name: 'Data Palette' })

  const baseColor = new THREE.Color('#A9BACB')
  const cyanColor = new THREE.Color()
  const violetColor = new THREE.Color()
  function applyParams() {
    particleMaterial.size = settings.particleSize
    networkMaterial.opacity = 0.06 + settings.flowIntensity * 0.1
    for (const [index, ring] of coreRings.children.entries()) {
      ring.material.color.set(index === 1 ? settings.violet : settings.cyan)
    }
    cyanColor.set(settings.cyan)
    violetColor.set(settings.violet)
    const colors = particleGeometry.attributes.color
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const band = index % 11
      const color = band < 4 ? baseColor : band < 8 ? cyanColor : violetColor
      colors.setXYZ(index, color.r, color.g, color.b)
    }
    colors.needsUpdate = true
  }
  const unsubscribe = asset.subscribe(({ type }) => {
    if (type === 'change') applyParams()
  })
  applyParams()

  const networkPositions = networkGeometry.attributes.position
  const sourcePositions = particleGeometry.attributes.position
  for (let segment = 0; segment < networkIndices.length / 2; segment += 1) {
    const a = networkIndices[segment * 2]
    const b = networkIndices[segment * 2 + 1]
    networkPositions.setXYZ(segment * 2, sourcePositions.getX(a), sourcePositions.getY(a), sourcePositions.getZ(a))
    networkPositions.setXYZ(segment * 2 + 1, sourcePositions.getX(b), sourcePositions.getY(b), sourcePositions.getZ(b))
  }
  networkPositions.needsUpdate = true

  return {
    scene,
    camera,
    play: async (context) => {
      const { playPortfolio } = await import('./play.js')
      return playPortfolio(context, {
        universe,
        particles,
        network,
        coreRings,
        camera,
        targets,
        networkIndices,
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
          for (const value of Object.values(material)) {
            if (value?.isTexture) resources.add(value)
          }
        }
      })
      for (const resource of resources) resource.dispose()
    },
  }
}
