import { useEffect, useState } from 'react'

/**
 * Habit tracker (animated, not interactive).
 *
 * A GitHub-style contribution heatmap — 7 rows × {@link COLS} weeks of cells,
 * each tinted by an activity level 0–4. It stays alive: every tick a few random
 * cells brighten and a few fade, so the grid keeps shimmering. Sized 2×1.
 */

const COLS = 20
const ROWS = 7
const N = COLS * ROWS
const CELL = 11
const GAP = 3

// Level → colour. 0 is an empty cell; 1–4 ramp up the lime.
const LEVELS = [
  'rgba(255,255,255,0.06)',
  'rgba(232,255,71,0.28)',
  'rgba(232,255,71,0.5)',
  'rgba(232,255,71,0.75)',
  '#e8ff47',
]

const seed = (): number[] =>
  Array.from({ length: N }, () => {
    const r = Math.random()
    return r > 0.82 ? 4 : r > 0.68 ? 3 : r > 0.5 ? 2 : r > 0.3 ? 1 : 0
  })

export function HabitTracker() {
  const [levels, setLevels] = useState<number[]>(seed)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLevels((prev) => {
        const next = [...prev]
        // brighten a few, fade a few — keeps the total roughly steady
        for (let k = 0; k < 4; k++) {
          const i = Math.floor(Math.random() * N)
          next[i] = Math.min(4, next[i] + 1)
        }
        for (let k = 0; k < 3; k++) {
          const i = Math.floor(Math.random() * N)
          next[i] = Math.max(0, next[i] - 1)
        }
        return next
      })
    }, 550)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative grid h-full w-full select-none place-items-center rounded-[32px] bg-[#242424]"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          gridAutoFlow: 'column', // fill top-to-bottom per week, like GitHub
          gap: GAP,
        }}
      >
        {levels.map((lvl, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 3,
              backgroundColor: LEVELS[lvl],
              boxShadow: lvl >= 3 ? '0 0 6px rgba(232,255,71,0.45)' : 'none',
              transition: 'background-color 0.5s ease, box-shadow 0.5s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
