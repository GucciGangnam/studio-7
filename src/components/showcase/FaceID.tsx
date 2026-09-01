import { useEffect, useState } from 'react'

/**
 * Face ID tile (auto-animated, not interactive).
 *
 * Loops through the three authentication stages — the face resting in its
 * bracketed frame, a lime beam scanning it, then the face dissolving into a
 * drawn checkmark as it's approved — before resetting. A glyph-only 1×1 tile
 * (the centered frame, no label).
 */

type Stage = 'idle' | 'scanning' | 'success'

// [stage, dwell ms] — the loop timeline
const SEQ: [Stage, number][] = [
  ['idle', 1300],
  ['scanning', 2100],
  ['success', 1900],
]

const CHECK_LEN = 40 // ~path length of the checkmark, for the draw-on animation

export function FaceID() {
  const [stage, setStage] = useState<Stage>('idle')

  useEffect(() => {
    let alive = true
    let timer: number
    let i = 0
    const step = () => {
      if (!alive) return
      const [s, dur] = SEQ[i]
      setStage(s)
      timer = window.setTimeout(() => {
        i = (i + 1) % SEQ.length
        step()
      }, dur)
    }
    step()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [])

  const faceOn = stage !== 'success' // face visible until approved
  const scanning = stage === 'scanning'
  const success = stage === 'success'

  return (
    <div
      className="relative grid h-full w-full select-none place-items-center rounded-[32px] bg-[#242424]"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Glyph */}
      <span className="relative grid h-[104px] w-[104px] shrink-0 place-items-center">
        {/* Approve glow */}
        <div
          className="pointer-events-none absolute inset-2 rounded-2xl transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(232,255,71,0.30), transparent 70%)',
            opacity: success ? 0.9 : scanning ? 0.35 : 0,
          }}
        />

        <svg width="104" height="104" viewBox="0 0 80 80" fill="none">
          {/* Corner brackets — the Face ID frame */}
          <g
            stroke="#e8ff47"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: success ? 'drop-shadow(0 0 5px rgba(232,255,71,0.6))' : 'none',
              transition: 'filter 0.3s',
            }}
          >
            <path d="M16 28 V21 a5 5 0 0 1 5 -5 H28" />
            <path d="M52 16 H59 a5 5 0 0 1 5 5 V28" />
            <path d="M64 52 V59 a5 5 0 0 1 -5 5 H52" />
            <path d="M28 64 H21 a5 5 0 0 1 -5 -5 V52" />
          </g>

          {/* Face features — fade out on approval */}
          <g
            stroke="#e8ff47"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: faceOn ? (scanning ? 0.55 : 1) : 0, transition: 'opacity 0.35s' }}
          >
            {/* eyes */}
            <path d="M31 33 V39" />
            <path d="M49 33 V39" />
            {/* nose */}
            <path d="M40 34 V43 q0 3 3 3" />
            {/* mouth */}
            <path d="M32 50 q8 6 16 0" />
          </g>

          {/* Scan beam — only while scanning */}
          {scanning && (
            <g style={{ animation: 's7-facescan 1.05s ease-in-out infinite' }}>
              <line
                x1="24"
                y1="40"
                x2="56"
                y2="40"
                stroke="#e8ff47"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(232,255,71,0.9))' }}
              />
            </g>
          )}

          {/* Checkmark — draws in on approval */}
          <path
            d="M29 41 l7 8 l15 -18"
            stroke="#e8ff47"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_LEN}
            style={{
              strokeDashoffset: success ? 0 : CHECK_LEN,
              opacity: success ? 1 : 0,
              filter: 'drop-shadow(0 0 4px rgba(232,255,71,0.7))',
              transition: success
                ? 'stroke-dashoffset 0.45s ease-out 0.1s, opacity 0.2s'
                : 'none',
            }}
          />
        </svg>
      </span>
    </div>
  )
}
