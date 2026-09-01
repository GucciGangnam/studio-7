import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Upload-file tile (interactive, wired to nothing).
 *
 * The tile *is* a folder — a dark folder silhouette that fills its 2×2 cell.
 * Idle shows a lime "+"; click to "upload" and an arrow bounces up into the
 * folder while a progress bar fills, then a checkmark draws in and it glows.
 * Auto-resets so it's replayable.
 *
 * Everything lives in one 320×320 SVG (a square, matching a 2×2 tile), so the
 * folder shape and its contents scale together as one coordinate space.
 */

type Stage = 'idle' | 'uploading' | 'done'

const UPLOAD_MS = 1600
const DONE_MS = 1100

// Folder centre (inside the body) — anchors the plus / arrow / check.
const CX = 160
const CY = 200

// Folder silhouette path, drawn in the 320×320 viewBox.
const FOLDER =
  'M38 64 H150 L178 104 H282 Q308 104 308 130 V270 Q308 296 282 296 H38 Q12 296 12 270 V90 Q12 64 38 64 Z'

export function UploadFile() {
  const [stage, setStage] = useState<Stage>('idle')
  const timers = useRef<number[]>([])

  const stageRef = useRef(stage)
  stageRef.current = stage

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clear, [])

  const start = useCallback(() => {
    if (stageRef.current !== 'idle') return
    setStage('uploading')
    timers.current.push(
      window.setTimeout(() => setStage('done'), UPLOAD_MS),
      window.setTimeout(() => setStage('idle'), UPLOAD_MS + DONE_MS),
    )
  }, [])

  // Auto-run the upload cycle on a loop so the tile is always animating.
  useEffect(() => {
    const id = window.setInterval(start, UPLOAD_MS + DONE_MS + 1600)
    return () => clearInterval(id)
  }, [start])

  const uploading = stage === 'uploading'
  const done = stage === 'done'
  const idle = stage === 'idle'

  return (
    <button
      type="button"
      aria-label="Upload file"
      onClick={start}
      className="group relative block h-full w-full select-none rounded-2xl outline-none ring-accent/50 focus-visible:ring-2"
      style={{ cursor: idle ? 'pointer' : 'default' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 320"
        fill="none"
        className="block"
        style={{ filter: 'drop-shadow(0 20px 44px rgba(0,0,0,0.5))' }}
      >
        <defs>
          <linearGradient id="s7-folderfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2b2b" />
            <stop offset="1" stopColor="#202020" />
          </linearGradient>
          <radialGradient id="s7-folderglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(232,255,71,0.35)" />
            <stop offset="1" stopColor="rgba(232,255,71,0)" />
          </radialGradient>
        </defs>

        {/* Folder body */}
        <path
          d={FOLDER}
          fill="url(#s7-folderfill)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          style={{
            filter: done ? 'drop-shadow(0 0 10px rgba(232,255,71,0.35))' : 'none',
            transition: 'filter 0.3s',
          }}
        />

        {/* Approve glow */}
        <circle
          cx={CX}
          cy={CY}
          r="92"
          fill="url(#s7-folderglow)"
          style={{ opacity: done ? 1 : uploading ? 0.4 : 0, transition: 'opacity 0.3s' }}
        />

        {/* Plus — idle only */}
        <g
          stroke="#e8ff47"
          strokeWidth="11"
          strokeLinecap="round"
          style={{ opacity: idle ? 1 : 0, transition: 'opacity 0.2s' }}
        >
          <line x1={CX - 36} y1={CY} x2={CX + 36} y2={CY} />
          <line x1={CX} y1={CY - 36} x2={CX} y2={CY + 36} />
        </g>

        {/* Uploading arrow — bounces up into the folder */}
        {uploading && (
          <g
            stroke="#e8ff47"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 's7-uploadarrow 0.9s ease-out infinite' }}
          >
            <line x1={CX} y1={CY + 28} x2={CX} y2={CY - 28} />
            <path d={`M${CX - 17} ${CY - 11} L${CX} ${CY - 28} L${CX + 17} ${CY - 11}`} />
          </g>
        )}

        {/* Progress bar — fills while uploading, full when done */}
        {(uploading || done) && (
          <>
            <rect x={CX - 82} y={CY + 58} width="164" height="9" rx="4.5" fill="rgba(255,255,255,0.12)" />
            <rect
              x={CX - 82}
              y={CY + 58}
              width="164"
              height="9"
              rx="4.5"
              fill="#e8ff47"
              style={{
                transformOrigin: `${CX - 82}px ${CY + 62.5}px`,
                transform: done ? 'scaleX(1)' : undefined,
                animation: uploading ? `s7-uploadfill ${UPLOAD_MS}ms linear forwards` : 'none',
              }}
            />
          </>
        )}

        {/* Checkmark — draws in on done */}
        {done && (
          <path
            d={`M${CX - 38} ${CY} l20 23 l40 -50`}
            stroke="#e8ff47"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="95"
            style={
              {
                '--len': '95',
                filter: 'drop-shadow(0 0 5px rgba(232,255,71,0.7))',
                animation: 's7-drawstroke 0.45s ease-out 0.05s both',
              } as React.CSSProperties
            }
          />
        )}
      </svg>
    </button>
  )
}
