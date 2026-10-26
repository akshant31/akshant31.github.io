export const SECTION_IDS = ['hero', 'experience', 'skills', 'contact']
export const PARTICLE_COUNT = 20000

export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function writePoint(target, index, x, y, z) {
  const offset = index * 3
  target[offset] = x
  target[offset + 1] = y
  target[offset + 2] = z
}

function sphericalPoint(random, radius) {
  const theta = random() * Math.PI * 2
  const cosPhi = random() * 2 - 1
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
  return [Math.cos(theta) * sinPhi * radius, cosPhi * radius, Math.sin(theta) * sinPhi * radius]
}

function buildRawCloud(count, random) {
  const target = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.42) {
      const angle = random() * Math.PI * 2
      const radius = 1.75 + random() * 0.35
      const zone = random()
      const y = zone < 0.45
        ? [-1.55, 0, 1.55][Math.floor(random() * 3)] + (random() - 0.5) * 0.12
        : (random() - 0.5) * 3.3
      writePoint(target, index, Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    } else {
      const radius = 2.8 + Math.pow(random(), 0.65) * 2.7
      const [x, y, z] = sphericalPoint(random, radius)
      writePoint(target, index, x, y * 0.8, z)
    }
  }
  return target
}

function buildPipeline(count, random) {
  const target = new Float32Array(count * 3)
  const centers = [-4.1, 0, 4.1]
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.62) {
      const stage = index % 3
      const radius = stage === 1 ? 1.45 : 1.15
      const [x, y, z] = sphericalPoint(random, Math.pow(random(), 0.35) * radius)
      writePoint(target, index, centers[stage] + x, y, z)
    } else {
      const t = random()
      const lane = (index % 5) * 0.22
      const direction = index % 2 === 0 ? t : 1 - t
      const x = -4.2 + direction * 8.4
      const envelope = Math.sin(t * Math.PI)
      const y = Math.sin(t * Math.PI * 4 + lane) * 0.62 * envelope + (random() - 0.5) * 0.14
      const z = Math.cos(t * Math.PI * 4 + lane) * 0.62 * envelope + (random() - 0.5) * 0.14
      writePoint(target, index, x, y, z)
    }
  }
  return target
}

function buildConstellation(count, random) {
  const target = new Float32Array(count * 3)
  const radii = [2.1, 3.05, 4, 4.85]
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.12) {
      const [x, y, z] = sphericalPoint(random, random() * 1.15)
      writePoint(target, index, x, y, z)
    } else {
      const group = index % 4
      const angle = random() * Math.PI * 2
      const tilt = group * Math.PI * 0.25 + 0.2
      const radius = radii[group] + (random() - 0.5) * 0.2
      const horizontal = Math.cos(angle) * radius
      const vertical = Math.sin(angle) * radius
      writePoint(
        target,
        index,
        horizontal + (random() - 0.5) * 0.08,
        vertical * Math.sin(tilt) + (random() - 0.5) * 0.08,
        vertical * Math.cos(tilt) + (random() - 0.5) * 0.08,
      )
    }
  }
  return target
}

function buildHelix(count, random) {
  const target = new Float32Array(count * 3)
  const milestones = [-3.75, -1.25, 1.25, 3.75]
  for (let index = 0; index < count; index += 1) {
    if (index < count * 0.72) {
      const t = random()
      const strand = index % 2 === 0 ? 0 : Math.PI
      const angle = t * Math.PI * 8 + strand
      const radius = 2.15 + (random() - 0.5) * 0.16
      writePoint(target, index, Math.cos(angle) * radius, -4.5 + t * 9, Math.sin(angle) * radius)
    } else {
      const milestone = index % 4
      const angle = random() * Math.PI * 2
      const radius = 2.85 + (random() - 0.5) * 0.22
      writePoint(
        target,
        index,
        Math.cos(angle) * radius,
        milestones[milestone] + (random() - 0.5) * 0.1,
        Math.sin(angle) * radius,
      )
    }
  }
  return target
}

function buildLattice(count, random) {
  const target = new Float32Array(count * 3)
  const levels = [-2.5, -1.67, -0.84, 0, 0.84, 1.67, 2.5]
  for (let index = 0; index < count; index += 1) {
    const axis = index % 3
    const first = levels[Math.floor(random() * levels.length)]
    const second = levels[Math.floor(random() * levels.length)]
    const along = (random() - 0.5) * 8
    const jitter = () => (random() - 0.5) * 0.025
    if (axis === 0) writePoint(target, index, along, first + jitter(), second + jitter())
    else if (axis === 1) writePoint(target, index, first * 1.55 + jitter(), along * 0.62, second + jitter())
    else writePoint(target, index, first * 1.55 + jitter(), second + jitter(), along * 0.62)
  }
  return target
}

export function createShapeTargets(count = PARTICLE_COUNT) {
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_PARTICLE_COUNT')
  const random = seededRandom(31031)
  return [
    buildRawCloud(count, random),
    buildPipeline(count, random),
    buildConstellation(count, random),
    buildLattice(count, random),
  ]
}
