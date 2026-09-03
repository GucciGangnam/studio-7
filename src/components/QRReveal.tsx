import { useEffect, useRef } from 'react'

/**
 * QR matrix for https://www.studio7.software (v3, ECC level M — 29×29 modules).
 * Pre-generated at build time so there is no runtime QR dependency and nothing
 * is a rasterised image; each string is a row, '1' = dark module. Regenerate
 * with `npx qrcode` if the URL changes.
 */
const QR = [
  '11111110110110011110001111111',
  '10000010100000001101001000001',
  '10111010110110011010101011101',
  '10111010010010001101101011101',
  '10111010110010111101001011101',
  '10000010011010011100101000001',
  '11111110101010101010101111111',
  '00000000011111011010100000000',
  '10011111110001000101110010111',
  '10011101001011001001010110110',
  '01011011110111011000110100100',
  '11010101001011001101110001001',
  '11101110100011011000101100001',
  '10011000100011101010111011111',
  '10100111010101001011101100101',
  '01101001010100010001001110101',
  '00001111100100101000000001000',
  '11101100101111101101010010110',
  '11011010011010010011001001001',
  '11100101000010100010010111100',
  '11101011010111111100111111110',
  '00000000111010100010100011000',
  '11111110110110100101101011000',
  '10000010111100110101100010001',
  '10111010100101100111111111000',
  '10111010110010000110110100010',
  '10111010000000010101110110111',
  '10000010001010101110011101101',
  '11111110111010010101110011000',
]
const SIZE = QR.length

// Module colour: the exact midpoint between the dark (#151515) and light
// (#f4f4f2) theme backgrounds, so the code reads as the same neutral gray in
// either theme and never looks like a pasted-in black-on-white image.
const INK = 'color-mix(in srgb, #151515 50%, #f4f4f2 50%)'

/**
 * Full-screen QR takeover. As the page content flies forward past the viewer,
 * the QR rushes in from far away (tiny) to full size — coming toward the user
 * on the Z axis. Sits directly on the app background: no panel, no image chrome.
 */
export function QRReveal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useRef(false)
  useEffect(() => {
    reduced.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }, [])

  // Escape closes (belt-and-braces alongside the trigger's blur/leave).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className="hidden sm:flex fixed inset-0 z-[65] items-center justify-center"
      // Purely visual: never captures the pointer, so hovering the (smaller)
      // trigger button underneath keeps working — move off it to restore.
      style={{ pointerEvents: 'none', perspective: '1200px' }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          // Rushes in from far (tiny) to the viewer (full). translateZ via scale
          // keeps it cheap and composited.
          transform: open ? 'scale(1)' : 'scale(0.04)',
          opacity: open ? 1 : 0,
          // Transform timing MUST match App.tsx's zoom stage exactly (same 0.55s
          // snappy ease-out, no delay) so the QR snaps in at the same speed the
          // page snaps out — reaching their final states together. Opacity fades
          // a touch quicker so the QR is visible while it's still approaching.
          transition: reduced.current
            ? 'none'
            : open
              ? 'transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.33s ease-out'
              : 'transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease-in',
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            width: 'clamp(216px, 42vmin, 340px)',
            aspectRatio: '1',
            // The screen-wide background is itself the QR quiet zone.
          }}
        >
          {QR.flatMap((row, r) =>
            row.split('').map((bit, c) =>
              bit === '1' ? (
                <span
                  key={`${r}-${c}`}
                  style={{ background: INK, borderRadius: '20%' }}
                />
              ) : (
                <span key={`${r}-${c}`} />
              )
            )
          )}
        </div>

        {/* Caption — sits on the bare background, matching the minimal look. */}
        <p className="mt-7 font-mono text-[11px] tracking-[0.14em] text-foreground/45 text-center">
          Scan to visit{' '}
          <span className="text-foreground/90">
            www.studio7<span className="text-accent">.software</span>
          </span>{' '}
          on your phone
        </p>
      </div>
    </div>
  )
}
