import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HoldToDelete } from '@/components/showcase/HoldToDelete'
import { VoiceRecording } from '@/components/showcase/VoiceRecording'
import { OnOffToggle } from '@/components/showcase/OnOffToggle'
import { FaceID } from '@/components/showcase/FaceID'
import { UploadFile } from '@/components/showcase/UploadFile'
import { Slider } from '@/components/showcase/Slider'
import { HabitTracker } from '@/components/showcase/HabitTracker'
import { Financial } from '@/components/showcase/Financial'
import { PlayPause } from '@/components/showcase/PlayPause'
import { BottomNav } from '@/components/showcase/BottomNav'

/**
 * /components — a self-contained "reel" of the design system, built to be screen
 * recorded on a phone (e.g. for Instagram).
 *
 * A full-screen stage scales the whole bento to fit the viewport with padding,
 * centered. On a loop it: cascades the tiles in, holds ~4s while they animate
 * live, crossfades the background light→dark, cascades the tiles out, and lands
 * the S7 logo dead centre — then resets and repeats so any cycle records clean.
 *
 * Grid: each cell is a {@link CELL}px square; spans read true to shape (2×1 =
 * 2:1, 2×2 = square). Tiles fill their cell edge-to-edge.
 */

const CELL = 150
const GAP = 20
const COLS = 4

type Tile = { node: React.ReactNode; w: number; h: number }

const tiles: Tile[] = [
  { node: <VoiceRecording />, w: 2, h: 1 },
  { node: <HoldToDelete />, w: 2, h: 1 },
  { node: <FaceID />, w: 1, h: 1 },
  { node: <PlayPause />, w: 1, h: 1 },
  { node: <UploadFile />, w: 2, h: 2 },
  { node: <Financial />, w: 2, h: 2 },
  { node: <OnOffToggle />, w: 2, h: 1 },
  { node: <Slider />, w: 2, h: 1 },
  { node: <HabitTracker />, w: 2, h: 1 },
  { node: <BottomNav />, w: 4, h: 1 },
]

// Loop timeline (ms). "in" starts after a beat so the light bg has settled.
const T = {
  in: 700,
  dark: 5200, // theme switch — ~4.5s after the cascade begins
  out: 6200,
  logoIn: 7100,
  logoOut: 9400,
  loop: 9900,
}

const LIGHT_BG = '#f4f4f2'
const DARK_BG = '#151515'

export default function Components() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [tilesIn, setTilesIn] = useState(false)
  const [bgDark, setBgDark] = useState(false)
  const [logoIn, setLogoIn] = useState(false)

  // Scale the bento to fit the viewport with a comfortable margin, centered.
  useLayoutEffect(() => {
    const fit = () => {
      const el = gridRef.current
      if (!el) return
      const s = Math.min(
        (window.innerWidth * 0.86) / el.offsetWidth,
        (window.innerHeight * 0.9) / el.offsetHeight,
      )
      setScale(s)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // The reel timeline, looping.
  useEffect(() => {
    let timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))
    const cycle = () => {
      timers.forEach(clearTimeout)
      timers = []
      setTilesIn(false)
      setLogoIn(false)
      setBgDark(false)
      at(T.in, () => setTilesIn(true))
      at(T.dark, () => setBgDark(true))
      at(T.out, () => setTilesIn(false))
      at(T.logoIn, () => setLogoIn(true))
      at(T.logoOut, () => setLogoIn(false))
      at(T.loop, cycle)
    }
    cycle()
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgDark ? DARK_BG : LIGHT_BG, transition: 'background-color 0.9s ease' }}
    >
      {/* Scaled bento */}
      <div
        style={{
          transform: `scale(${scale || 1})`,
          transformOrigin: 'center',
          opacity: scale ? 1 : 0,
        }}
      >
        <div
          ref={gridRef}
          // surface-dark pins the dark palette so tile text stays light in both bgs.
          className="surface-dark"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridAutoRows: `${CELL}px`,
            gap: GAP,
          }}
        >
          {tiles.map((t, i) => (
            <div
              key={i}
              style={{
                gridColumn: `span ${t.w}`,
                gridRow: `span ${t.h}`,
                opacity: tilesIn ? 1 : 0,
                transform: tilesIn ? 'translateY(0) scale(1)' : 'translateY(34px) scale(0.9)',
                transition: 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                // cascade top→bottom on the way in, bottom→top on the way out
                transitionDelay: `${(tilesIn ? i : tiles.length - 1 - i) * 55}ms`,
              }}
            >
              {t.node}
            </div>
          ))}
        </div>
      </div>

      {/* S7 logo — lands dead centre at the end */}
      <div
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{
          opacity: logoIn ? 1 : 0,
          transform: `scale(${logoIn ? 1 : 0.82})`,
          transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div
          className="flex select-none items-baseline font-mono font-semibold"
          style={{ fontSize: 'min(132px, 26vw)', lineHeight: 1, letterSpacing: '0.04em' }}
        >
          <span style={{ color: '#ffffff' }}>S</span>
          <span style={{ color: '#e8ff47', marginLeft: 6 }}>7</span>
        </div>
      </div>
    </div>
  )
}
