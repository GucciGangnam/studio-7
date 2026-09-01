import { useState } from 'react'
import { Power } from 'lucide-react'

/**
 * On/off toggle (interactive, but wired to nothing).
 *
 * Click to flip. ON — lime track, dark power-knob parked left, bold "on" to the
 * right; OFF — the knob slides right onto a muted track and "off" fades in on the
 * left. The knob glide and colour crossfade are plain CSS transitions.
 */

const PAD = 14
const KNOB = 122 // knob diameter (fits the shared 150px row height)

export function OnOffToggle() {
  const [on, setOn] = useState(true)

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Power"
      onClick={() => setOn((v) => !v)}
      className="relative h-full w-full select-none rounded-[32px] outline-none ring-accent/50 transition-colors duration-300 focus-visible:ring-2"
      style={{
        backgroundColor: on ? '#e8ff47' : '#2f2f2f',
        boxShadow: on
          ? '0 0 0 1px rgba(232,255,71,0.5), 0 8px 30px rgba(232,255,71,0.22), inset 0 1px 0 rgba(255,255,255,0.25)'
          : 'inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Labels — crossfade on the side opposite the knob */}
      <span
        className="absolute inset-y-0 flex items-center font-sans text-[40px] font-bold lowercase leading-none transition-opacity duration-200"
        style={{ right: 40, color: '#151515', opacity: on ? 1 : 0 }}
      >
        on
      </span>
      <span
        className="absolute inset-y-0 flex items-center font-sans text-[40px] font-bold lowercase leading-none transition-opacity duration-200"
        style={{ left: 40, color: 'rgba(255,255,255,0.35)', opacity: on ? 0 : 1 }}
      >
        off
      </span>

      {/* Knob — glides via `left` so it works at any tile width */}
      <span
        className="absolute grid place-items-center rounded-[24px]"
        style={{
          top: PAD,
          left: on ? PAD : `calc(100% - ${KNOB + PAD}px)`,
          width: KNOB,
          height: KNOB,
          background: 'radial-gradient(120% 120% at 50% 25%, #2e2e2e, #1c1c1c)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'left 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Power
          size={46}
          strokeWidth={2.75}
          className="transition-colors duration-300"
          style={{ color: on ? '#e8ff47' : '#7c7c7c' }}
        />
      </span>
    </button>
  )
}
