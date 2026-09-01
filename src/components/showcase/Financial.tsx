import { useEffect, useRef } from 'react'

/**
 * Financial tile (animated, not interactive).
 *
 * A live balance card. New points stream in on the right and the whole chart
 * scrolls smoothly left via requestAnimationFrame — the path, dot, balance and
 * change-badge are all updated imperatively per frame (no React re-render), so
 * the motion is continuous rather than stepping at an interval. The series is a
 * mean-reverting random walk, so it wanders up and down and up. Sized 2×2.
 */

const N = 40 // points across the visible width
const W = 288
const H = 152
const PAD = 14 // vertical breathing room
const STEP_MS = 780 // time for one new point to arrive (one column of scroll)

const walk = (v: number) => v + (Math.random() - 0.5) * 8 + (100 - v) * 0.045

const seed = () => {
  const out = [100]
  for (let i = 1; i < N + 2; i++) out.push(walk(out[i - 1]))
  return out
}

const money = (v: number) =>
  (v * 128).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function Financial() {
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const balRef = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const vals = seed() // length N+2 (one spare each side)
    const ref0 = vals[1] // baseline for the % change
    // smoothed display state
    const d = { min: Math.min(...vals), max: Math.max(...vals), bal: vals[N] }
    const stepW = W / (N - 1)

    let raf = 0
    let lastStep = performance.now()

    const frame = (t: number) => {
      // advance the series one column at a time
      while (t - lastStep >= STEP_MS) {
        vals.shift()
        vals.push(walk(vals[vals.length - 1]))
        lastStep += STEP_MS
      }
      const frac = (t - lastStep) / STEP_MS // 0→1 between columns

      // ease the vertical scale so it doesn't jitter as min/max change
      const tMin = Math.min(...vals)
      const tMax = Math.max(...vals)
      d.min += (tMin - d.min) * 0.06
      d.max += (tMax - d.max) * 0.06
      const span = Math.max(1, d.max - d.min)

      const x = (i: number) => (i - 1) * stepW - frac * stepW
      const y = (v: number) => H - PAD - ((v - d.min) / span) * (H - PAD * 2)

      let line = ''
      for (let i = 0; i < vals.length; i++) {
        line += `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(vals[i]).toFixed(1)} `
      }
      lineRef.current?.setAttribute('d', line)
      areaRef.current?.setAttribute('d', `${line}L${x(vals.length - 1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z`)

      const di = vals.length - 2 // rightmost fully-visible point
      dotRef.current?.setAttribute('cx', x(di).toFixed(1))
      dotRef.current?.setAttribute('cy', y(vals[di]).toFixed(1))

      // ease the readout toward the newest value
      d.bal += (vals[di] - d.bal) * 0.08
      if (balRef.current) balRef.current.textContent = money(d.bal)

      const pct = ((d.bal - ref0) / ref0) * 100
      const up = pct >= 0
      if (pctRef.current) pctRef.current.textContent = `${up ? '+' : ''}${pct.toFixed(2)}%`
      if (arrowRef.current) arrowRef.current.textContent = up ? '▲' : '▼'
      if (badgeRef.current) {
        badgeRef.current.style.color = up ? '#e8ff47' : '#ff6b6b'
        badgeRef.current.style.backgroundColor = up ? 'rgba(232,255,71,0.1)' : 'rgba(255,107,107,0.12)'
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className="relative flex h-full w-full select-none flex-col justify-between overflow-hidden rounded-[32px] bg-[#242424] p-7"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Header */}
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Balance
        </div>
        <span
          ref={balRef}
          className="mt-1 block font-mono text-[32px] font-medium leading-none tabular-nums text-foreground"
        >
          $12,800.00
        </span>
        <div
          ref={badgeRef}
          className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[13px] tabular-nums"
          style={{ color: '#e8ff47', backgroundColor: 'rgba(232,255,71,0.1)' }}
        >
          <span ref={arrowRef}>▲</span>
          <span ref={pctRef}>+0.00%</span>
        </div>
      </div>

      {/* Live chart */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[152px] w-full">
        <defs>
          <linearGradient id="s7-fin-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(232,255,71,0.32)" />
            <stop offset="1" stopColor="rgba(232,255,71,0)" />
          </linearGradient>
        </defs>
        <path ref={areaRef} fill="url(#s7-fin-area)" />
        <path
          ref={lineRef}
          fill="none"
          stroke="#e8ff47"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 4px rgba(232,255,71,0.5))' }}
        />
        <circle ref={dotRef} r="4" fill="#e8ff47" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
