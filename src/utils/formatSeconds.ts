export default function formatSeconds(s: number | null | undefined): string {
  if (typeof s !== 'number') return 'no timer ⚠️'

  if (s >= 1) return `${s.toFixed(2)}s`
  let ms = s * 1000
  if (ms >= 1) return `${ms.toFixed(2)}ms`
  let us = ms * 1000
  if (us >= 1) return `${us.toFixed(2)}μs`
  let ns = us * 1000
  return `${ns.toFixed(2)}ns`
}
