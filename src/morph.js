export function getMorphFrame(progress) {
  const value = Math.max(0, Math.min(4, Number.isFinite(progress) ? progress : 0))
  if (value === 0) return { from: 0, to: 0, mix: 0 }
  if (value === 4) return { from: 4, to: 4, mix: 0 }
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

export function sampleMorph(targets, frame, output) {
  const from = targets[frame.from]
  const to = targets[frame.to]
  for (let index = 0; index < output.length; index += 1) {
    output[index] = from[index] + (to[index] - from[index]) * frame.mix
  }
  return output
}
