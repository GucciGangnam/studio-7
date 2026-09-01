import { Mic } from 'lucide-react'

/**
 * Voice-recording pill (animated, not interactive).
 *
 * A live lime waveform ripples on the left as if a voice were being captured;
 * on the right, a mic sits inside a dim accent ring with a pulsing "rec" tick.
 * Purely a showcase piece — no audio, no state.
 *
 * The waveform is pure CSS: each bar loops `s7-voicewave` (scaleY about centre)
 * on `alternate` with its own duration/delay so the bars drift out of phase into
 * an organic, speech-like motion. Heights are hand-tuned for a centred, tapering
 * envelope like the reference.
 */

// [full height (px), resting fraction, loop seconds, phase offset seconds]
const bars: [number, number, number, number][] = [
  [18, 0.55, 0.62, -0.05],
  [30, 0.4, 0.74, -0.32],
  [46, 0.3, 0.68, -0.6],
  [66, 0.28, 0.82, -0.15],
  [84, 0.32, 0.9, -0.5],
  [54, 0.35, 0.7, -0.2],
  [40, 0.4, 0.66, -0.45],
  [30, 0.45, 0.6, -0.1],
  [24, 0.5, 0.72, -0.55],
  [36, 0.38, 0.78, -0.28],
  [20, 0.55, 0.64, -0.4],
]

export function VoiceRecording() {
  return (
    <div
      className="relative flex h-full w-full select-none items-center justify-between rounded-[32px] bg-[#242424] pl-9 pr-4"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Waveform */}
      <div className="flex h-[92px] items-center gap-[6px]">
        {bars.map(([h, lo, dur, delay], i) => (
          <span
            key={i}
            className="w-[7px] rounded-full bg-accent"
            style={
              {
                height: h,
                '--lo': lo,
                transformOrigin: 'center',
                animation: `s7-voicewave ${dur}s ease-in-out ${delay}s infinite alternate`,
                boxShadow: '0 0 8px rgba(232,255,71,0.35)',
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Mic in a pulsing ring */}
      <div className="relative grid h-[100px] w-[100px] shrink-0 place-items-center">
        {/* Dim base ring */}
        <div className="absolute inset-0 rounded-full border-2 border-accent/35" />

        {/* Rotating "rec" tick — a short bright arc that sweeps the ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#4a8cff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="11 297"
          />
        </svg>

        {/* Soft breathing glow */}
        <div
          className="absolute inset-2 rounded-full animate-[pulse_1.8s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, rgba(232,255,71,0.18), transparent 70%)' }}
        />

        <Mic size={32} strokeWidth={2} className="relative text-accent" />
      </div>
    </div>
  )
}
