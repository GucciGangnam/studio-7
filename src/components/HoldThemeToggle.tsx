import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'
import type { Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Hold-and-release theme toggle.
 *
 * The user must press and hold for {@link HOLD_MS} to flip the theme. While held,
 * a "liquid" fills the button from the bottom up; releasing early drains it back
 * down (more slowly). The liquid is `--foreground` — white in dark mode, near-black
 * in light — and a mirror copy of the icon/label painted in `--background` is
 * revealed only within the risen liquid, so the content always stays legible.
 *
 * Fill is driven imperatively via refs + rAF (no per-frame React state) so the
 * animation stays smooth and cheap.
 */

const HOLD_MS = 700 // hold this long to commit the toggle
const DRAIN_MS = 1300 // full-height drain rate on release (slower than the fill)

// Ease-out for the visual fill: the liquid shoots up fast then eases toward the
// brim, so even a quick tap produces an obvious rise (feedback that it's a hold),
// while the commit still lands exactly at HOLD_MS. Applied to the rendered height
// only — the progress clock underneath stays linear so timing is unaffected.
const fillEase = (p: number) => 1 - Math.pow(1 - p, 3)

type Props = {
  theme: Theme
  toggleTheme: () => void
  variant?: 'icon' | 'pill'
  className?: string
  style?: React.CSSProperties
}

export function HoldThemeToggle({ theme, toggleTheme, variant = 'icon', className, style }: Props) {
  const waterRef = useRef<HTMLDivElement>(null)
  const invertRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const progressRef = useRef(0) // 0 → empty, 1 → full
  const holdingRef = useRef(false)

  const paint = (p: number) => {
    const y = (1 - fillEase(p)) * 100
    if (waterRef.current) waterRef.current.style.transform = `translateY(${y}%)`
    // Counter-translate the mirrored content so it stays pinned to the button
    // while the water (its clipping parent) slides.
    if (invertRef.current) invertRef.current.style.transform = `translateY(${-y}%)`
  }

  const stop = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    lastTsRef.current = 0
  }

  const loop = useCallback(
    (ts: number) => {
      const dt = ts - (lastTsRef.current || ts)
      lastTsRef.current = ts

      if (holdingRef.current) {
        progressRef.current = Math.min(1, progressRef.current + dt / HOLD_MS)
      } else {
        progressRef.current = Math.max(0, progressRef.current - dt / DRAIN_MS)
      }
      paint(progressRef.current)

      // Filled to the brim while still held → commit once, then let it drain back.
      if (holdingRef.current && progressRef.current >= 1) {
        holdingRef.current = false
        toggleTheme()
      }

      if (holdingRef.current || progressRef.current > 0) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        stop()
      }
    },
    [toggleTheme],
  )

  const kick = () => {
    if (rafRef.current == null) {
      lastTsRef.current = 0
      rafRef.current = requestAnimationFrame(loop)
    }
  }

  const press = () => {
    holdingRef.current = true
    kick()
  }
  const release = () => {
    holdingRef.current = false
    kick() // ensure the drain loop is running even if it had settled
  }

  // Own the fill transform imperatively. It is deliberately NOT in the JSX style
  // prop: this Nav re-renders on every scroll frame, and React would otherwise
  // reset the transform each render and fight the rAF-driven fill.
  useLayoutEffect(() => paint(0), [])
  useEffect(() => stop, []) // cancel any in-flight rAF on unmount

  const label = theme === 'dark' ? 'Light' : 'Dark'
  const Icon = theme === 'dark' ? Sun : Moon
  const iconSize = 13

  // Icon + optional label — rendered identically in the base and mirror layers
  // so the two align pixel-for-pixel as the liquid reveals the mirror.
  const content = (
    <span className="inline-flex items-center gap-2">
      <Icon size={iconSize} strokeWidth={1.75} />
      {variant === 'pill' && (
        <span className="font-mono text-[12px] tracking-[0.14em] uppercase">{label}</span>
      )}
    </span>
  )

  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Hold to switch to light mode' : 'Hold to switch to dark mode'}
      title="Hold to switch"
      onPointerDown={e => {
        e.preventDefault()
        // Capture so we still get pointerup if the finger/cursor drifts off the
        // button mid-hold. Guarded — not all environments allow it.
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          /* capture unavailable — pointerup on the element still covers the common case */
        }
        press()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          press()
        }
      }}
      onKeyUp={e => {
        if (e.key === ' ' || e.key === 'Enter') release()
      }}
      className={cn(
        'relative isolate inline-flex items-center justify-center overflow-hidden rounded-full',
        'select-none cursor-pointer text-foreground/65 transition-colors duration-150',
        className,
      )}
      style={{
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...style,
      }}
    >
      {/* Base layer — what shows through the empty (un-filled) button */}
      <span className="relative z-0 inline-flex">{content}</span>

      {/* Liquid — rises from the bottom; clips the mirrored content to its surface */}
      <div
        ref={waterRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        style={{ background: 'var(--foreground)', willChange: 'transform' }}
      >
        {/* Faint meniscus at the liquid surface */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '1.5px', background: 'color-mix(in srgb, var(--background) 28%, transparent)' }}
        />
        {/* Mirror content, painted in the contrasting colour, kept pinned by paint() */}
        <div
          ref={invertRef}
          className="absolute inset-0 inline-flex items-center justify-center text-background"
          style={{ willChange: 'transform' }}
        >
          {content}
        </div>
      </div>
    </button>
  )
}
