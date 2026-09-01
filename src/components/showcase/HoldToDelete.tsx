import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Trash2, Check } from 'lucide-react'

/**
 * Hold-to-delete pill.
 *
 * Press and hold the trash button for {@link HOLD_MS}; a lime progress ring
 * sweeps clockwise around the icon while the label counts you in. Release early
 * and the ring drains back down. Hold to the brim and it commits — the ring
 * snaps full, the icon flips to a check, the pill flashes, and after a beat it
 * resets so you can play with it again. (Showcase only — nothing is deleted.)
 *
 * The ring + icon tint are driven imperatively via refs + rAF so the sweep stays
 * smooth and cheap; React state only marks the coarse phase transitions.
 */

const HOLD_MS = 1400 // hold this long to commit
const DRAIN_MS = 600 // full-sweep drain rate on release (snappier than the fill)
const DONE_MS = 1600 // how long the "deleted" state lingers before auto-reset

const R = 33 // ring radius (80px cluster, centre 40)
const C = 2 * Math.PI * R // circumference

// Ease-out for the visual sweep: shoots forward then eases toward the top, so
// even a quick tap gives obvious feedback. Progress clock underneath stays linear
// so the commit still lands exactly at HOLD_MS.
const ease = (p: number) => 1 - Math.pow(1 - p, 3)

// Blend the icon from muted grey → lime as the ring fills.
const mix = (p: number) => {
  const from = [124, 124, 124] // grey-400
  const to = [232, 255, 71] // accent
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * p))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

type Phase = 'idle' | 'holding' | 'done'

export function HoldToDelete() {
  const ringRef = useRef<SVGCircleElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const progressRef = useRef(0) // 0 → empty, 1 → full
  const holdingRef = useRef(false)
  const doneRef = useRef(false)

  const [phase, setPhase] = useState<Phase>('idle')

  const paint = (p: number) => {
    const e = ease(p)
    if (ringRef.current) ringRef.current.style.strokeDashoffset = `${C * (1 - e)}`
    if (iconRef.current) iconRef.current.style.color = mix(e)
    if (glowRef.current) glowRef.current.style.opacity = `${e * 0.9}`
  }

  const stop = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    lastTsRef.current = 0
  }

  const commit = useCallback(() => {
    doneRef.current = true
    holdingRef.current = false
    setPhase('done')
    // Linger, then drain back to idle.
    window.setTimeout(() => {
      doneRef.current = false
      setPhase('idle')
      kick() // drain the ring back down
    }, DONE_MS)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loop = useCallback(
    (ts: number) => {
      const dt = ts - (lastTsRef.current || ts)
      lastTsRef.current = ts

      if (holdingRef.current) {
        progressRef.current = Math.min(1, progressRef.current + dt / HOLD_MS)
      } else if (!doneRef.current) {
        progressRef.current = Math.max(0, progressRef.current - dt / DRAIN_MS)
      }

      // While "done", pin the ring full; otherwise track the clock.
      paint(doneRef.current ? 1 : progressRef.current)

      if (holdingRef.current && progressRef.current >= 1 && !doneRef.current) {
        commit()
      }

      if (holdingRef.current || (progressRef.current > 0 && !doneRef.current)) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        stop()
      }
    },
    [commit],
  )

  const kick = useCallback(() => {
    if (rafRef.current == null) {
      lastTsRef.current = 0
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [loop])

  const press = () => {
    if (doneRef.current) return
    holdingRef.current = true
    setPhase('holding')
    kick()
  }
  const release = () => {
    if (doneRef.current) return
    holdingRef.current = false
    if (progressRef.current > 0) setPhase('idle')
    kick() // ensure the drain loop is running
  }

  useLayoutEffect(() => paint(0), [])
  useEffect(() => stop, []) // cancel any in-flight rAF on unmount

  // Auto-demo: run the hold on a loop so the tile is always animating. A user
  // press takes over (the guard skips a tick while holding / mid-cycle).
  useEffect(() => {
    let alive = true
    let t: number
    const tick = () => {
      if (!alive) return
      if (!holdingRef.current && !doneRef.current && progressRef.current < 0.02) {
        holdingRef.current = true
        setPhase('holding')
        kick()
      }
      t = window.setTimeout(tick, HOLD_MS + DONE_MS + 1500)
    }
    t = window.setTimeout(tick, 1200)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [kick])

  // All three labels share one grid cell, so the pill reserves the widest
  // ("Keep holding…") at all times and never reflows as the text changes.
  const labels: { key: Phase; text: string }[] = [
    { key: 'idle', text: 'Hold to delete' },
    { key: 'holding', text: 'Keep holding…' },
    { key: 'done', text: 'Deleted' },
  ]

  return (
    <button
      type="button"
      aria-label="Hold to delete"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className="group relative flex h-full w-full select-none items-center justify-start gap-3 rounded-[32px] bg-[#242424] pl-4 pr-6 text-left outline-none ring-accent/50 transition-shadow focus-visible:ring-2"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Success flash — lime wash that fades in on commit */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] transition-opacity duration-300"
        style={{
          background: 'radial-gradient(120% 120% at 12% 50%, rgba(232,255,71,0.14), transparent 60%)',
          opacity: phase === 'done' ? 1 : 0,
        }}
      />

      {/* Ring + icon cluster — sized to match the voice tile's mic ring (100px) */}
      <span className="relative grid h-[100px] w-[100px] shrink-0 place-items-center">
        {/* Soft glow that intensifies with progress */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232,255,71,0.28), transparent 70%)',
            opacity: 0,
          }}
        />

        <svg width="100" height="100" viewBox="0 0 80 80" className="absolute -rotate-90">
          {/* Track */}
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="3" />
          {/* Progress */}
          <circle
            ref={ringRef}
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="#e8ff47"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C}
            style={{
              filter: 'drop-shadow(0 0 5px rgba(232,255,71,0.55))',
              transition: phase === 'done' ? 'stroke-dashoffset 0.25s ease-out' : 'none',
            }}
          />
        </svg>

        {/* Icon — trash, flips to check on commit */}
        <span
          ref={iconRef}
          className="relative grid h-10 w-10 place-items-center"
          style={{ color: mix(0) }}
        >
          <Trash2
            size={38}
            strokeWidth={1.75}
            className="absolute transition-all duration-300"
            style={{
              opacity: phase === 'done' ? 0 : 1,
              transform: phase === 'done' ? 'scale(0.6) rotate(-12deg)' : 'scale(1)',
            }}
          />
          <Check
            size={38}
            strokeWidth={2.25}
            className="absolute text-accent transition-all duration-300"
            style={{
              opacity: phase === 'done' ? 1 : 0,
              transform: phase === 'done' ? 'scale(1)' : 'scale(0.6) rotate(12deg)',
            }}
          />
        </span>
      </span>

      {/* Label — all variants stacked in one cell so the width is fixed */}
      <span className="grid justify-items-center font-mono text-[19px] tracking-[-0.01em]">
        {labels.map(({ key, text }) => (
          <span
            key={key}
            aria-hidden={phase !== key}
            className="col-start-1 row-start-1 whitespace-nowrap text-center transition-opacity duration-200"
            style={{
              opacity: phase === key ? 1 : 0,
              color: key === 'done' ? '#e8ff47' : 'rgba(255,255,255,0.42)',
            }}
          >
            {text}
          </span>
        ))}
      </span>
    </button>
  )
}
