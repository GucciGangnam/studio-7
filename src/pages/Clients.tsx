import { useEffect, useRef, useState } from 'react'
import { Plane, FlaskConical, HardHat, Megaphone, type LucideIcon } from 'lucide-react'
import Grainient from '@/components/Grainient'
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
// All four sections now share a single animated Grainient field (rendered once,
// behind the pinned viewport). The sections themselves are transparent so that
// one continuous background reads through every page — only their content
// cross-fades as you scroll.
const sections = [
  { n: '01', title: 'Aviation' },
  { n: '02', title: 'Health & Safety' },
  { n: '03', title: 'Biotech' },
  { n: '04', title: 'Advertising' },
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
  const isLight = theme === 'light'

  // The single Grainient field is keyed to the active theme (values mirror the
  // index.css tokens). Three colours feed the gradient blend — a lime accent, a
  // mid tone, and the page background — so the field stays inside the theme's
  // tonal range and the (foreground-coloured) text keeps its contrast:
  //   • dark  → lime highlights sweeping across a near-black field
  //   • light → a lime-and-cream wash (lightMode remaps the palette toward white)
  //     so the near-black text stays legible.
  // The two are tuned to meet in the middle. Dark is a muted lime glow over a
  // mostly-dark field. Light needs care: lightMode paints each pixel white→colour
  // by its *chroma*, so a saturated palette (or saturation > 1) makes it paint
  // MORE green, not a lighter green. So light keeps two of the three stops pale
  // (cream) with only the middle stop carrying the lime, and saturation stays
  // below 1 — a cream field with a lime sweep, not a wall of green.
  const grainColor1 = isLight ? '#eef2df' : '#c6da38' // pale cream / muted lime
  const grainColor2 = isLight ? '#a9d23e' : '#1c2607' // lime sweep / deep olive
  const grainColor3 = isLight ? '#e7efc9' : '#121212' // pale lime / near-black

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
        {/* One shared Grainient field behind every page. It lives in the pinned
            viewport (not per-section), so a single continuous background reads
            across all four case studies while their content cross-fades. */}
        <div className="absolute inset-0" style={{ zIndex: 0, background: 'var(--background)' }}>
          <Grainient
            color1={grainColor1}
            color2={grainColor2}
            color3={grainColor3}
            lightMode={isLight}
            timeSpeed={0.4}
            colorBalance={isLight ? 0.1 : 0.2}
            warpStrength={1.0}
            warpFrequency={5.0}
            warpSpeed={1.4}
            warpAmplitude={55.0}
            blendSoftness={0.06}
            rotationAmount={500.0}
            noiseScale={2.0}
            grainAmount={0.08}
            grainScale={2.0}
            contrast={isLight ? 1.1 : 1.1}
            saturation={isLight ? 0.8 : 0.82}
            zoom={0.9}
          />
        </div>
        {/* Legibility scrim: a soft centre-weighted wash of the page background
            so the centred text keeps its contrast over the moving gradient. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              'radial-gradient(ellipse 70% 62% at 50% 50%,' +
              ' color-mix(in srgb, var(--background) 48%, transparent) 0%,' +
              ' color-mix(in srgb, var(--background) 20%, transparent) 45%,' +
              ' transparent 78%)',
          }}
        />
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
                // Above the shared Grainient field (z0) and its scrim (z1).
                zIndex: i + 2,
                pointerEvents: opacity > 0.5 ? 'auto' : 'none',
              }}
              aria-hidden={active !== i}
            >
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
      <div className="fixed top-1/2 right-2 sm:right-8 z-50 -translate-y-1/2 flex flex-col gap-3">
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
