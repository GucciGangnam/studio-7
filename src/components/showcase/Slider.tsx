import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Slider (interactive + animated).
 *
 * Drag the knob (or press anywhere on the track) to set a 0–100 value; a lime
 * fill trails the knob and a mono readout counts alongside. When left alone it
 * drifts gently up and down on its own. Pointer-driven (mouse + touch).
 */

export function Slider() {
  const [value, setValue] = useState(62)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const centreRef = useRef(62) // centre the idle drift settles around

  const setFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - left) / width))
    const v = Math.round(p * 100)
    centreRef.current = v
    setValue(v)
  }, [])

  // Gentle idle drift up and down, paused while dragging.
  useEffect(() => {
    if (dragging) return
    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      const v = centreRef.current + 13 * Math.sin((t - t0) / 1500)
      setValue(Math.round(Math.max(0, Math.min(100, v))))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [dragging])

  // While dragging, follow the pointer anywhere on the page.
  useEffect(() => {
    if (!dragging) return
    const move = (e: PointerEvent) => setFromClientX(e.clientX)
    const up = () => setDragging(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragging, setFromClientX])

  const press = (e: React.PointerEvent) => {
    setDragging(true)
    setFromClientX(e.clientX)
  }

  return (
    <div
      className="relative flex h-full w-full select-none items-center gap-6 rounded-[32px] bg-[#242424] pl-8 pr-9"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
        touchAction: 'none',
      }}
    >
      {/* Track (also the hit area) */}
      <div
        ref={trackRef}
        onPointerDown={press}
        className="relative flex-1 cursor-pointer"
        style={{ height: 44 }}
      >
        {/* Rail */}
        <div className="absolute left-0 right-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-white/10" />
        {/* Fill */}
        <div
          className="absolute left-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-accent"
          style={{
            width: `${value}%`,
            boxShadow: '0 0 10px rgba(232,255,71,0.4)',
          }}
        />
        {/* Knob */}
        <div
          className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{
            left: `${value}%`,
            background: 'radial-gradient(120% 120% at 50% 25%, #333, #1c1c1c)',
            boxShadow: `0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 ${dragging ? 8 : 0}px rgba(232,255,71,0.14)`,
            transition: 'box-shadow 0.15s',
          }}
        >
          <div className="h-4 w-4 rounded-full bg-accent" style={{ boxShadow: '0 0 8px rgba(232,255,71,0.6)' }} />
        </div>
      </div>

      {/* Readout */}
      <span className="w-[52px] text-right font-mono text-[30px] leading-none text-accent tabular-nums">
        {value}
      </span>
    </div>
  )
}
