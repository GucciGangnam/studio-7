/**
 * Type declaration for the React Bits GradientWaves component
 * (implemented in ./GradientWaves.jsx — kept as untyped JS so the upstream
 * source can be updated verbatim; this file gives TS consumers a typed shape).
 */
export interface GradientWavesProps {
  /** Distant haze color the waves fade into. */
  horizonColor?: string
  /** Mid color of the rolling wave bodies. */
  waveColor?: string
  /** Highlight color of the nearest wave crests. */
  crestColor?: string
  /** Animation speed of the undulating wave field. */
  speed?: number
  /** Height of the sine-plasma waves. */
  amplitude?: number
  /** Overall spatial frequency of the waves. */
  waveScale?: number
  /** Ratio between the short and long wavelength components. */
  waveRatio?: number
  /** Large-scale horizontal swell distortion. */
  swell?: number
  /** Large-scale cross-flow turbulence distortion. */
  turbulence?: number
  /** Camera pitch toward the horizon (radians). */
  tilt?: number
  /** Field-of-view zoom into the wave field. */
  zoom?: number
  /** Vertical offset of the horizon line. */
  height?: number
  /** Distance over which the waves fade into haze and transparency. */
  fogDepth?: number
  /** Raymarch quality tier. */
  detail?: 'low' | 'medium' | 'high'
  /** Overall brightness multiplier for the final color. */
  brightness?: number
  /** Global opacity of the effect. */
  opacity?: number
  /** Enable subtle pointer-driven camera parallax. */
  mouseInteraction?: boolean
  /** Strength of the cursor parallax drift. */
  parallaxStrength?: number
  /** Overlay a whisper-subtle animated film grain on the effect. */
  grain?: boolean
  /** Amplitude of the grain overlay. 0 disables it entirely. */
  grainIntensity?: number
  /** Additional CSS classes applied to the container. */
  className?: string
}

declare const GradientWaves: (props: GradientWavesProps) => import('react').JSX.Element
export default GradientWaves
