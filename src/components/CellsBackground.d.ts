/**
 * Type declaration for the Vanta CELLS wrapper (implemented in
 * ./CellsBackground.jsx — kept as untyped JS so the untyped vanta/three imports
 * don't need ambient declarations; this gives TS consumers a typed shape).
 */
export interface CellsBackgroundProps {
  /** First cell colour (hex number, e.g. 0xe8ff47). */
  color1: number
  /** Second cell colour (hex number). */
  color2: number
  /** Cell size. */
  size?: number
  /** Animation speed. */
  speed?: number
}

export declare const CellsBackground: (props: CellsBackgroundProps) => import('react').JSX.Element
declare const _default: (props: CellsBackgroundProps) => import('react').JSX.Element
export default _default
