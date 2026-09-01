/**
 * Type declaration for the React Bits Scanner component
 * (implemented in ./Scanner.jsx — kept as untyped JS so the upstream source can
 * be updated verbatim; this file gives TS consumers a typed shape).
 */
export interface ScannerProps {
  /** Base color of the scanning field. */
  color1?: string
  /** Color of the interference bands. */
  color2?: string
  /** Color used for the brightest signal peaks. */
  color3?: string
  /** Overall animation speed of the signal. */
  speed?: number
  /** Rate of the scan band travelling across the field. */
  sweepSpeed?: number
  /** Spacing between successive scan bands. */
  sweepWidth?: number
  /** How tightly the sweep concentrates; higher = narrower band. */
  sweepFalloff?: number
  /** Zoom level of the signal field. */
  scale?: number
  /** Spatial frequency of the underlying signal that bends the scan lines. */
  frequency?: number
  /** How strongly the signal bends the scan lines out of straight. */
  ripple?: number
  /** Number of scan lines packed across the field. */
  bandDensity?: number
  /** Thins the scan lines into a crisp trace; lower = soft glow. */
  lineSharpness?: number
  /** Soft fill between the lines, giving the band volume. */
  glow?: number
  /** Direction of the scan. */
  scanDirection?: 'vertical' | 'horizontal' | 'diagonal'
  /** Amount of chromatic separation between channels. */
  colorSpread?: number
  /** Overall brightness of the field. */
  brightness?: number
  /** Contrast between the base tone and the bright peaks. */
  contrast?: number
  /** Anti-alias rolloff; higher = calmer shimmer. */
  softness?: number
  /** Strength of the edge fade around the field. */
  vignette?: number
  /** Overlays fine CRT raster lines across the field. */
  scanline?: boolean
  /** Adds a subtle animated grain. */
  grain?: boolean
  /** Amplitude of the grain overlay. 0 disables it. */
  grainIntensity?: number
  /** Overall opacity of the effect. */
  opacity?: number
  /** Enables the soft scan focus that follows the pointer. */
  mouseInteraction?: boolean
  /** Radius of the pointer focus region. */
  mouseRadius?: number
  /** Strength of the pointer focus brightening. */
  mouseStrength?: number
  /** Additional CSS classes applied to the container. */
  className?: string
}

declare const Scanner: (props: ScannerProps) => import('react').JSX.Element
export default Scanner
