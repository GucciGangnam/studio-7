import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import CELLSraw from 'vanta/dist/vanta.cells.min'

// Vanta's UMD dist interops differently across bundlers: the effect may arrive
// as the default export itself, or nested under `.default`. Resolve the callable.
const CELLS =
  typeof CELLSraw === 'function'
    ? CELLSraw
    : (CELLSraw && (CELLSraw.default || CELLSraw.CELLS)) || CELLSraw

/**
 * Thin React wrapper around the Vanta CELLS effect (https://www.vantajs.com).
 * Vanta is built against three r134, which is why the project pins that version.
 * We pass our own THREE instance so Vanta doesn't pull in a second copy.
 */
export function CellsBackground({ color1, color2, size = 4.4, speed = 1.1 }) {
  const elRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    if (!elRef.current) return
    effectRef.current = CELLS({
      el: elRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      color1,
      color2,
      size,
      speed,
    })
    return () => {
      try {
        effectRef.current?.destroy?.()
      } catch {
        /* Vanta occasionally throws during teardown if the GL context is already gone */
      }
      effectRef.current = null
    }
  }, [color1, color2, size, speed])

  return <div ref={elRef} style={{ width: '100%', height: '100%' }} />
}

export default CellsBackground
