import { useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'

/**
 * Play / pause button (interactive + animated).
 *
 * A circular media button. Playing shows the pause glyph, a lime arc sweeping
 * the ring, and a soft glow; paused shows the play glyph on a calm dim ring. It
 * auto-toggles on a loop so it's always animating, and you can click it too.
 * Sized 1×1.
 */

export function PlayPause() {
  const [playing, setPlaying] = useState(true)

  // Auto-toggle so the tile is always in motion.
  useEffect(() => {
    const id = window.setInterval(() => setPlaying((v) => !v), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      aria-pressed={playing}
      onClick={() => setPlaying((v) => !v)}
      className="group relative grid h-full w-full select-none place-items-center rounded-[32px] bg-[#242424] outline-none ring-accent/50 focus-visible:ring-2"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <span className="relative grid h-[96px] w-[96px] place-items-center">
        {/* Soft glow while playing */}
        <div
          className="pointer-events-none absolute inset-1 rounded-full transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(232,255,71,0.28), transparent 70%)',
            opacity: playing ? 1 : 0,
          }}
        />

        {/* Dim base ring */}
        <div className="absolute inset-0 rounded-full border-2 border-accent/30" />

        {/* Sweeping "playhead" arc — spins only while playing */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 96 96"
          style={{
            animation: playing ? 'spin 2.4s linear infinite' : 'none',
            opacity: playing ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <circle
            cx="48"
            cy="48"
            r="47"
            fill="none"
            stroke="#e8ff47"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="70 225"
            style={{ filter: 'drop-shadow(0 0 4px rgba(232,255,71,0.6))' }}
          />
        </svg>

        {/* Dark button face */}
        <div
          className="relative grid h-[76px] w-[76px] place-items-center rounded-full"
          style={{
            background: 'radial-gradient(120% 120% at 50% 25%, #333, #1c1c1c)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Icons crossfade + spring */}
          <Pause
            size={34}
            strokeWidth={0}
            className="absolute text-accent transition-all duration-200"
            fill="currentColor"
            style={{
              opacity: playing ? 1 : 0,
              transform: playing ? 'scale(1)' : 'scale(0.6)',
            }}
          />
          <Play
            size={34}
            strokeWidth={0}
            className="absolute text-accent transition-all duration-200"
            fill="currentColor"
            style={{
              opacity: playing ? 0 : 1,
              transform: playing ? 'scale(0.6)' : 'scale(1)',
              marginLeft: 3, // optically centre the triangle
            }}
          />
        </div>
      </span>
    </button>
  )
}
