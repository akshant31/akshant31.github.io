import { INDIA_RINGS } from '../data/india-outline.js'
import { writePoint } from './shared.js'

export function pointInPolygon(point, ring) {
  const [x, y] = point
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [xi, yi] = ring[index]
    const [xj, yj] = ring[previous]
    const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi)
    if (intersects) inside = !inside
  }
  return inside
}

function buildOutline(rings) {
  const segments = []
  const cumulative = []
  let total = 0
  for (const ring of rings) {
    for (let index = 1; index < ring.length; index += 1) {
      const a = ring[index - 1], b = ring[index]
      const length = Math.hypot(b[0] - a[0], b[1] - a[1])
      if (length < 1e-6) continue
      total += length
      segments.push({ a, b })
      cumulative.push(total)
    }
  }
  return { segments, cumulative, total }
}

function sampleOutline(outline, random) {
  const value = random() * outline.total
  let low = 0, high = outline.cumulative.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (value <= outline.cumulative[middle]) high = middle
    else low = middle + 1
  }
  const segment = outline.segments[low]
  const t = random()
  return [
    segment.a[0] + (segment.b[0] - segment.a[0]) * t,
    segment.a[1] + (segment.b[1] - segment.a[1]) * t,
  ]
}

export function createIndia(count, random, rings = INDIA_RINGS) {
  const positions = new Float32Array(count * 3)
  const outlineCount = Math.floor(count * 0.28)
  const outline = buildOutline(rings)
  const mainland = rings.reduce((largest, ring) => ring.length > largest.length ? ring : largest)
  const xs = mainland.map((point) => point[0]), ys = mainland.map((point) => point[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)

  function sampleInterior() {
    for (let attempt = 0; attempt < 256; attempt += 1) {
      const point = [minX + random() * (maxX - minX), minY + random() * (maxY - minY)]
      if (pointInPolygon(point, mainland)) return point
    }
    return sampleOutline(outline, random)
  }

  for (let index = 0; index < count; index += 1) {
    const isOutline = index < outlineCount
    const [x, y] = isOutline ? sampleOutline(outline, random) : sampleInterior()
    const z = isOutline ? 0.08 + (random() - 0.5) * 0.12 : (random() - 0.5) * 0.32
    writePoint(positions, index, x, y, z)
  }
  return { positions, outlineCount }
}
