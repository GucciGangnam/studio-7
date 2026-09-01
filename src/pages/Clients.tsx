import { useEffect, useRef, useState } from 'react'
import { Plane, FlaskConical, HardHat, Megaphone, type LucideIcon } from 'lucide-react'
import GradientWaves from '@/components/GradientWaves'
import { GravityStarsBackground } from '@/components/GravityStarsBackground'
import CellsBackground from '@/components/CellsBackground'
import Scanner from '@/components/Scanner'
import { useTheme } from '@/lib/theme'

/** Clamp a scroll position into a 0→1 progress value. */
const ep = (v: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (v - start) / (end - start)))

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Half-width of each page's fade in/out (in 0→1 track progress), as a fraction
 * of the inter-page spacing. Below 0.5 so a short blank gap always sits between
 * pages — the outgoing page (content AND its background) fades fully out before
 * the incoming one fades in, never overlaying — regardless of how many pages
 * there are. The actual half-width is `FADE_RATIO / last` (see `fadeHalf`).
 */
const FADE_RATIO = 0.4

/**
 * Three full-screen sections that cross-fade as the user scrolls, instead of
 * scrolling past one another. A tall outer track gives the scroll distance; the
 * viewport is pinned (sticky) and the sections are stacked on top of each other.
 * As progress advances, each upper layer fades in over the one beneath — so the
 * previous page fades out under the next, with no background bleed.
 */
// Soft theme-green corner glows (behind the effect canvas) to keep Pages 2 & 4
// from reading as mostly white/empty. Offset ellipses — not centred exactly in
// the corner — with a smooth multi-stop falloff, over the page background. The
// colour tracks the theme via var(--accent) + color-mix.
const cornerGlow = (x: number, y: number) =>
  `radial-gradient(ellipse 92% 80% at ${x}% ${y}%,` +
  ` color-mix(in srgb, var(--accent) 42%, transparent) 0%,` +
  ` color-mix(in srgb, var(--accent) 15%, transparent) 40%,` +
  ` transparent 72%), var(--background)`

const sections = [
  { n: '01', title: 'Aviation',        tint: 'var(--background)' },
  { n: '02', title: 'Health & Safety', tint: cornerGlow(15, 90) }, // bottom-left
  { n: '03', title: 'Biotech',         tint: 'var(--background)' },
  { n: '04', title: 'Advertising',     tint: cornerGlow(85, 90) }, // bottom-right
]

/**
 * A left-aligned case-study block for a single (anonymized) project — matching
 * the understated, column-left style of the Work sections and the home page.
 */
function CaseStudy({
  Icon,
  iconClassName,
  n,
  label,
  heading,
  body,
  stats,
}: {
  Icon: LucideIcon
  iconClassName?: string
  n: string
  label: string
  heading: string
  body: React.ReactNode
  stats: [string, string][]
}) {
  return (
    <div className="w-full max-w-2xl text-left">
      {/* Industry mark */}
      <Icon
        size={28}
        strokeWidth={1.5}
        className={`mb-6 ${iconClassName ?? ''}`}
        style={{ color: 'var(--accent-label)' }}
      />

      {/* Section header — number · label · rule, matching the Work sections. */}
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] tracking-widest text-foreground/25">{n}</span>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-foreground/45">
          {label}
        </span>
        <div className="flex-1 border-t border-foreground/[0.08] self-center" />
      </div>

      <h2
        className="mt-7 font-sans font-medium text-foreground"
        style={{ fontSize: 'clamp(1.8rem, 4.2vw, 3rem)', letterSpacing: '-0.025em', lineHeight: 1.04 }}
      >
        {heading}
      </h2>

      <p className="mt-5 text-sm text-foreground/45 leading-relaxed max-w-xl">{body}</p>

      <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
        {stats.map(([value, statLabel]) => (
          <div key={value} className="min-w-0">
            <div
              className="font-sans font-medium text-foreground"
              style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', letterSpacing: '-0.02em' }}
            >
              {value}
            </div>
            <div className="mt-1.5 font-mono text-[9px] tracking-[0.16em] uppercase text-foreground/40 max-w-[18ch]">
              {statLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Clients() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0) // 0→1 scroll progress across the whole track
  const { theme } = useTheme()

  // Page 1's wave background is keyed to the active theme (values mirror the
  // index.css tokens). The wave features — the horizon glow and the crests —
  // both use the "accent as it reads on the page" (like --accent-label); the
  // troughs (wave bodies) use the page background. Crest ≠ trough is what gives
  // the waves their definition, and matching the horizon to the crest keeps the
  // whole field high-contrast:
  //   • dark  → bright lime features over near-black troughs (huge contrast)
  //   • light → a neon lime-green over cream troughs. It's lighter than the
  //     near-black dark-mode value, but the taller waves (amp, below) keep the
  //     crest/trough definition so it still reads while looking vivid/neon.
  const featureHex = theme === 'light' ? '#8fd600' : '#e8ff47'
  const backgroundHex = theme === 'light' ? '#f4f4f2' : '#151515'

  // Wave height. The crest tint is driven by wave height (pos.z in the shader):
  // the crest↔trough mix factor is ~pos.z·0.08 + 0.5, so shallow waves keep it
  // pinned near 0.5 and every pixel becomes a flat 50/50 blend of trough and
  // crest — a muddy wash with no ridge definition. Taller waves let the factor
  // swing to both extremes so crests and troughs actually separate. Both themes
  // need this; 2.6 reads well in each.
  const amp = 2.6

  // Page 3 Vanta CELLS colours (hex numbers). Dark mode: bright accent cells on
  // the near-black page background — high contrast, the look we want. Light mode:
  // the cell shading darkens toward the cell colour, so a mid-tone accent turns
  // the crevices near-black and fights the (black) text. So in light mode we use
  // a pale lime on white — the whole field stays light and the text stays legible.
  const cellsColor1 = theme === 'light' ? 0xbfe85a : 0xe8ff47
  const cellsColor2 = theme === 'light' ? 0xf3f8e2 : 0x151515

  // Page 4 Scanner colours: a green scan field. color1 = base, color2 = the
  // accent bands, color3 = the bright peaks. Light mode stays pale/green (peaks
  // near-white) so the black text reads; dark mode gets vivid lime on near-black.
  const scanColor1 = theme === 'light' ? '#dceeb4' : '#264a0a'
  const scanColor2 = theme === 'light' ? '#8fd600' : '#e8ff47'
  const scanColor3 = theme === 'light' ? '#f7fbe8' : '#ffffff'

  useEffect(() => {
    // Read the track's position straight from each scroll event. It's a single
    // cheap layout read, and updating synchronously (rather than deferring to
    // requestAnimationFrame) keeps the cross-fade tracking the scrollbar exactly
    // and avoids a stuck rAF handle stalling updates if a frame is ever dropped.
    const update = () => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      setP(distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Snap the window to each page's centre while this page is mounted — scoped to
  // Clients so other routes scroll normally. `mandatory` means the scroll always
  // settles on a page, never in the blank gap between them (paired with
  // scroll-snap-stop: always on the anchors so a hard scroll can't skip a page).
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollSnapType
    root.style.scrollSnapType = 'y mandatory'
    return () => {
      root.style.scrollSnapType = prev
    }
  }, [])

  const last = sections.length - 1
  const active = Math.round(p * last)
  // Fade half-width scaled to the page count so the blank gap survives any number
  // of pages (spacing between centres is 1/last; FADE_RATIO keeps below half).
  const fadeHalf = FADE_RATIO / last

  // Scroll a given section to full presence when its dot is clicked.
  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const distance = el.scrollHeight - window.innerHeight
    window.scrollTo({ top: el.offsetTop + (distance * i) / last, behavior: 'smooth' })
  }

  return (
    // Tall track: one viewport per section gives room for the cross-fades.
    <div ref={trackRef} className="relative" style={{ height: `${sections.length * 100}vh` }}>
      {/* Snap anchors — one per page, spaced one viewport apart so the window
          settles with each page centred (scroll positions 0, 1×100vh, 2×100vh…).
          scroll-snap-stop: always makes every page a hard stop, so a fast scroll
          advances one page at a time and can't skip from page 1 to page 3. */}
      {sections.map((s, i) => (
        <div
          key={`snap-${s.n}`}
          aria-hidden
          style={{
            position: 'absolute',
            top: `${i * 100}vh`,
            left: 0,
            width: 1,
            height: 1,
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
          }}
        />
      ))}
      {/* Pinned viewport holding the stacked sections. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {sections.map((s, i) => {
          // Each page fades fully out before the next fades in, leaving a brief
          // blank gap (see fadeHalf) — so no two pages, or their backgrounds,
          // are ever visible at once. `center` is this page's snap position.
          const center = i / last
          const dist = p - center
          const opacity = clamp(1 - Math.abs(dist) / fadeHalf, 0, 1)
          // Content drifts up as we scroll past its centre, in from below before.
          const contentY = -clamp(dist / fadeHalf, -1, 1) * 24

          return (
            <section
              key={s.n}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity,
                zIndex: i + 1,
                background: s.tint,
                pointerEvents: opacity > 0.5 ? 'auto' : 'none',
              }}
              aria-hidden={active !== i}
            >
              {/* Page 1 gets its own animated wave background (behind content). */}
              {i === 0 && (
                <div className="absolute inset-0" style={{ zIndex: 0 }}>
                  <GradientWaves
                    horizonColor={featureHex}
                    waveColor={backgroundHex}
                    crestColor={featureHex}
                    speed={0.65}
                    amplitude={amp}
                    waveScale={0.75}
                    waveRatio={0.3}
                    swell={40}
                    turbulence={60}
                    tilt={1.3}
                    zoom={1.15}
                    height={2}
                    fogDepth={21}
                    detail="high"
                    brightness={1.05}
                    opacity={1.0}
                    mouseInteraction={true}
                    parallaxStrength={0.4}
                    grain={false}
                    grainIntensity={0.16}
                  />
                </div>
              )}
              {/* Page 2 gets the gravity-stars background (behind content). The
                  stars take their colour from the element's CSS `color`, so
                  --accent-label keeps them theme-green and legible in both
                  themes (it re-reads every frame, so it follows theme flips). */}
              {i === 1 && (
                <div className="absolute inset-0" style={{ zIndex: 0, color: 'var(--accent-label)' }}>
                  <GravityStarsBackground />
                </div>
              )}
              {/* Page 3 gets the Vanta CELLS background (behind content). */}
              {i === 2 && (
                <div className="absolute inset-0" style={{ zIndex: 0 }}>
                  <CellsBackground color1={cellsColor1} color2={cellsColor2} size={5} speed={0.5} />
                </div>
              )}
              {/* Page 4 gets the Scanner background (behind content). */}
              {i === 3 && (
                <div className="absolute inset-0" style={{ zIndex: 0 }}>
                  <Scanner
                    color1={scanColor1}
                    color2={scanColor2}
                    color3={scanColor3}
                    speed={0.16}
                    sweepSpeed={0.07}
                    sweepWidth={1.6}
                    sweepFalloff={6}
                    scale={1.5}
                    frequency={2}
                    ripple={0.22}
                    bandDensity={11}
                    lineSharpness={4.5}
                    glow={0.22}
                    scanDirection="vertical"
                    colorSpread={0}
                    brightness={0.85}
                    contrast={1.15}
                    softness={2.0}
                    vignette={0.45}
                    scanline
                    grain
                    grainIntensity={0.05}
                    opacity={0.4}
                    mouseInteraction
                    mouseRadius={0.5}
                    mouseStrength={0.5}
                  />
                </div>
              )}
              <div
                className="relative z-10 flex flex-col items-center px-6 text-center"
                style={{ transform: `translateY(${contentY}px)` }}
              >
                {i === 0 ? (
                  <CaseStudy
                    Icon={Plane}
                    iconClassName="-rotate-45"
                    n="01"
                    label="Aviation Industry"
                    heading="We shipped the MVP. They built the business."
                    stats={[
                      ['12', 'weeks to a shipped MVP'],
                      ['3', 'systems — front end, back end, payments'],
                      ['500+', 'caterers in their network today'],
                    ]}
                    body={
                      <>
                        A private-aviation venture came to us to build their catering platform. We
                        worked closely with their team — weekly through discovery — then shipped the
                        full MVP in twelve weeks: the entire front end, the back-end systems, and the
                        Stripe payment integration, delivered as a website and PWA. They took what we
                        handed over and built it into a network now over 500 caterers strong.
                      </>
                    }
                  />
                ) : i === 2 ? (
                  <CaseStudy
                    Icon={FlaskConical}
                    n="03"
                    label="Biotech"
                    heading="Live telemetry, built to scale."
                    stats={[
                      ['5s', 'live telemetry, per tank'],
                      ['100k+', 'readings a minute, by design'],
                      ['Hot + cold', 'real-time + full history'],
                    ]}
                    body={
                      <>
                        An Australian biotech grows algae at scale — in sensor-fitted tanks that
                        stream telemetry to clients worldwide. From their hardware docs, we built the
                        full pipeline: five-second readings ingested over MQTT into a hot-and-cold
                        back end (live to the dashboards, archived in full), with pagination and
                        roll-ups, engineered for hundreds of thousands of readings a minute. We built
                        their multi-tenant dashboards too — organizations, teams, and role-based
                        control from anywhere — then handed the whole stack over for them to build on
                        and grow.
                      </>
                    }
                  />
                ) : i === 1 ? (
                  <CaseStudy
                    Icon={HardHat}
                    n="02"
                    label="Health & Safety"
                    heading="Rescued and rebuilt in two weeks."
                    stats={[
                      ['2 wks', 'from scratch to shipped'],
                      ['0 bugs', 'at handover'],
                      ['Full rebuild', 'front end, back end, subscriptions'],
                    ]}
                    body={
                      <>
                        Another agency had taken a health &amp; safety directory well over time and
                        budget, and left it riddled with issues. We stepped in — working directly
                        with the client to rebuild trust and pin down what actually needed to ship —
                        then rebuilt the entire product from scratch: front end, back end, and a
                        complex subscription payment model, delivered in two weeks and handed over
                        bug-free. It&apos;s now one of the largest health &amp; safety directories
                        around, with a growing base of paying members.
                      </>
                    }
                  />
                ) : (
                  <CaseStudy
                    Icon={Megaphone}
                    n="04"
                    label="Advertising"
                    heading="From listing to handshake to payout."
                    stats={[
                      ['Full-stack', 'discovery, design, front & back end'],
                      ['2 rails', 'card & bank · full or milestone'],
                      ['Milestones', 'proof-backed payouts & disputes'],
                    ]}
                    body={
                      <>
                        Another agency contracted us as the senior leads on an advertising
                        marketplace for their Italian client — a big, shifting, full-stack build.
                        They supplied a relationship manager to liaise with the client in Italian;
                        we owned everything technical, end to end. Space owners list inventory;
                        advertisers discover it and open proposals that carry media, move through
                        negotiation, and close on a virtual handshake — then settle by card or bank
                        transfer, in full or across proof-backed milestones, with a dispute flow
                        spanning the app and the back-office team behind it. We drove it through
                        discovery and constant change with tight stakeholder management and rigorous
                        QA, and layered in multi-asset packs for the industry&apos;s biggest players.
                      </>
                    }
                  />
                )}
              </div>
            </section>
          )
        })}
      </div>

      {/* Progress dots — fixed to the viewport, one per section. */}
      <div className="fixed top-1/2 right-8 z-50 -translate-y-1/2 flex flex-col gap-3">
        {sections.map((s, i) => (
          <button
            key={s.n}
            onClick={() => goTo(i)}
            aria-label={`Go to ${s.title}`}
            className="group grid place-items-center h-4 w-4"
          >
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? 9 : 6,
                height: active === i ? 9 : 6,
                background: active === i ? 'var(--accent)' : 'var(--foreground)',
                opacity: active === i ? 1 : 0.28,
              }}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint — fades out once the user starts scrolling. */}
      <div
        className="fixed bottom-9 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 1 - ep(p, 0, 0.08), pointerEvents: 'none' }}
      >
        <span className="font-mono text-[10px] tracking-[0.24em] text-foreground/45">SCROLL</span>
        <span className="block h-8 w-px bg-foreground/25" />
      </div>
    </div>
  )
}
