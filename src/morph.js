export function getMorphFrame(progress) {
  const value = Math.max(0, Math.min(4, Number.isFinite(progress) ? progress : 0))
  if (value === 0) return { from: 0, to: 0, mix: 0 }
  if (value === 4) return { from: 4, to: 4, mix: 0 }
  const from = Math.floor(value)
  return { from, to: from + 1, mix: value - from }
}
