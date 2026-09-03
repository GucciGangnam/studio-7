/**
 * Type declaration for the React Bits Grainient component
 * (implemented in ./Grainient.jsx — kept as untyped JS so the upstream source can
 * be updated verbatim; this file gives TS consumers a typed shape).
 */
export interface GrainientProps {
  /** Primary light color used in the gradient blend. */
  color1?: string
  /** Secondary accent color used in the gradient blend. */
  color2?: string
  /** Deep base color used in the gradient blend. */
  color3?: string
  /** Animation speed multiplier for the gradient motion. */
  timeSpeed?: number
  /** Shifts the palette balance toward dark or lighter tones. */
  colorBalance?: number
  /** Strength of the wave warp distortion (0 = none). */
  warpStrength?: number
  /** Frequency of the wave warp. */
  warpFrequency?: number
  /** Speed multiplier for the warp animation. */
  warpSpeed?: number
  /** Base amplitude for the warp distortion. */
  warpAmplitude?: number
  /** Rotation angle for the color blend axis (degrees). */
  blendAngle?: number
  /** Softens the blend edges between color layers. */
  blendSoftness?: number
  /** Rotation amount driven by noise. */
  rotationAmount?: number
  /** Scales the noise frequency that drives rotation. */
  noiseScale?: number
  /** Amount of film grain applied to the gradient. */
  grainAmount?: number
  /** Scale of the grain pattern. */
  grainScale?: number
  /** Animate grain over time. */
  grainAnimated?: boolean
  /** Overall contrast applied to the final color. */
  contrast?: number
  /** Gamma correction for the final color. */
  gamma?: number
  /** Saturation amount for the final color. */
  saturation?: number
  /** Horizontal offset of the gradient center. */
  centerX?: number
  /** Vertical offset of the gradient center. */
  centerY?: number
  /** Zoom level for the gradient field. */
  zoom?: number
  /** Remaps the palette to a light-on-white wash (for light theme). */
  lightMode?: boolean
  /** Additional CSS classes applied to the container. */
  className?: string
}

declare const Grainient: (props: GrainientProps) => import('react').JSX.Element
export default Grainient
