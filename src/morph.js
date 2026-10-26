export function getMorphFrame(progress) {
  const value = Math.max(0, Math.min(3, Number.isFinite(progress) ? progress : 0))
  if (value === 0) return { from: 0, to: 0, mix: 0 }
  if (value === 3) return { from: 3, to: 3, mix: 0 }
  const from = Math.floor(value)
  return { from, to: from + 1, mix: value - from }
}

export function damp(current, target, smoothing, dt) {
  return current + (target - current) * (1 - Math.exp(-smoothing * dt))
}

export function progressFromOffsets(offsets, scrollY) {
  if (!Array.isArray(offsets) || offsets.length < 2 || offsets.some((value, index) => {
    return !Number.isFinite(value) || (index > 0 && value <= offsets[index - 1])
  })) throw new Error('INVALID_SECTION_OFFSETS')
  const position = Number.isFinite(scrollY) ? scrollY : 0
  if (position <= offsets[0]) return 0
  for (let index = 0; index < offsets.length - 1; index += 1) {
    if (position < offsets[index + 1]) {
      return index + (position - offsets[index]) / (offsets[index + 1] - offsets[index])
    }
  }
  return offsets.length - 1
}

export function sampleMorph(targets, frame, output, phases = null) {
  const from = targets[frame.from]
  const to = targets[frame.to]
  const mix = frame.mix
  const arc = mix > 0 && mix < 1 ? Math.sin(mix * Math.PI) : 0
  for (let point = 0; point < output.length / 3; point += 1) {
    const offset = point * 3
    output[offset] = from[offset] + (to[offset] - from[offset]) * mix
    output[offset + 1] = from[offset + 1] + (to[offset + 1] - from[offset + 1]) * mix
    output[offset + 2] = from[offset + 2] + (to[offset + 2] - from[offset + 2]) * mix
    if (phases && arc > 0) {
      const phase = phases[point] * Math.PI * 2
      const angle = mix * Math.PI * 2 + phase
      const radius = 0.35 + phases[point] * 0.65
      output[offset] += Math.cos(angle) * arc * 0.55 * radius
      output[offset + 1] += Math.sin(phase) * arc * 0.28
      output[offset + 2] += Math.sin(angle) * arc * 0.95 * radius
    }
  }
  return output
}
