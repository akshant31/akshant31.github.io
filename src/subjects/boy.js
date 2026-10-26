import { sphericalPoint, writePoint } from './shared.js'

export const BOY_REGION = Object.freeze({
  HEAD: 0,
  TORSO: 1,
  RAISED_UPPER: 2,
  RAISED_LOWER: 3,
  FREE_UPPER: 4,
  FREE_LOWER: 5,
  LEFT_LEG: 6,
  RIGHT_LEG: 7,
})

const ellipsoid = (center, radii, region, weight) => ({ type: 'ellipsoid', center, radii, region, weight })
const capsule = (a, b, radius, region, weight) => ({ type: 'capsule', a, b, radius, region, weight })
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normalize = (v) => { const length = Math.hypot(...v); return v.map((value) => value / length) }

function sampleCapsule(part, random) {
  const axis = normalize(part.b.map((value, index) => value - part.a[index]))
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const side = normalize(cross(axis, helper))
  const up = normalize(cross(side, axis))
  const angle = random() * Math.PI * 2
  const radial = side.map((value, index) => value * Math.cos(angle) + up[index] * Math.sin(angle))
  const t = random()
  const radius = part.radius * (0.94 + random() * 0.1)
  return part.a.map((value, index) => value + (part.b[index] - value) * t + radial[index] * radius)
}

function samplePart(part, random) {
  if (part.type === 'capsule') return sampleCapsule(part, random)
  const direction = sphericalPoint(random, 1)
  const surface = 0.94 + random() * 0.1
  return part.center.map((value, index) => value + direction[index] * part.radii[index] * surface)
}

function createParts() {
  const R = BOY_REGION
  return [
    ellipsoid([0, 3.3, 0], [0.82, 0.95, 0.72], R.HEAD, 1.5),
    ellipsoid([0, 3.68, -0.03], [0.86, 0.62, 0.76], R.HEAD, 0.65),
    ellipsoid([-0.81, 3.3, 0], [0.14, 0.23, 0.16], R.HEAD, 0.15),
    ellipsoid([0.81, 3.3, 0], [0.14, 0.23, 0.16], R.HEAD, 0.15),
    ellipsoid([0, 3.25, 0.69], [0.15, 0.18, 0.18], R.HEAD, 0.15),
    capsule([0, 2.25, 0], [0, 2.58, 0], 0.28, R.TORSO, 0.3),
    ellipsoid([0, 1.35, 0], [0.95, 1.25, 0.48], R.TORSO, 2.4),
    ellipsoid([0, 0.2, 0], [0.75, 0.55, 0.45], R.TORSO, 1.1),
    capsule([-0.82, 2.05, 0], [-1.45, 2.85, 0], 0.27, R.RAISED_UPPER, 0.7),
    capsule([-1.45, 2.85, 0], [-1.2, 3.85, 0.05], 0.22, R.RAISED_LOWER, 0.6),
    ellipsoid([-1.18, 4.05, 0.05], [0.25, 0.35, 0.18], R.RAISED_LOWER, 0.35),
    capsule([0.82, 2.05, 0], [1.25, 0.95, 0.1], 0.28, R.FREE_UPPER, 0.7),
    capsule([1.25, 0.95, 0.1], [1.15, -0.05, 0.18], 0.22, R.FREE_LOWER, 0.6),
    ellipsoid([1.15, -0.22, 0.18], [0.23, 0.34, 0.18], R.FREE_LOWER, 0.3),
    capsule([-0.43, -0.05, 0], [-0.5, -1.85, 0.05], 0.34, R.LEFT_LEG, 1.1),
    capsule([-0.5, -1.85, 0.05], [-0.55, -3.55, 0], 0.27, R.LEFT_LEG, 1.0),
    capsule([0.43, -0.05, 0], [0.5, -1.85, 0.05], 0.34, R.RIGHT_LEG, 1.1),
    capsule([0.5, -1.85, 0.05], [0.55, -3.55, 0], 0.27, R.RIGHT_LEG, 1.0),
    ellipsoid([-0.55, -3.85, 0.18], [0.36, 0.25, 0.65], R.LEFT_LEG, 0.5),
    ellipsoid([0.55, -3.85, 0.18], [0.36, 0.25, 0.65], R.RIGHT_LEG, 0.5),
  ]
}

export function createBoy(count, random) {
  const positions = new Float32Array(count * 3)
  const regions = new Uint8Array(count)
  const parts = createParts()
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0)
  for (let index = 0; index < count; index += 1) {
    let selection = random() * totalWeight
    let part = parts[parts.length - 1]
    for (const candidate of parts) {
      selection -= candidate.weight
      if (selection <= 0) { part = candidate; break }
    }
    const [x, y, z] = samplePart(part, random)
    writePoint(positions, index, x, y, z)
    regions[index] = part.region
  }
  return { positions, regions }
}
