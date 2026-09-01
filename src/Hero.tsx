import { forwardRef, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Code2, Mail, Smartphone, Globe, Server, Lightbulb, Palette, ShieldCheck, Rocket, Wrench, User, Sparkles, MessageSquare, BarChart2, Settings, ArrowUpRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedBeam } from '@/components/ui/animated-beam'

// ─── data ─────────────────────────────────────────────────────────────────────

const FONT_SIZE = 'clamp(72px, 11.5vw, 180px)'
const FONT_STYLE: React.CSSProperties = {
  fontSize: FONT_SIZE,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  fontWeight: 700,
}

const pages = [
  { label: 'Work',     to: '/work',     Icon: Layers    },
  { label: 'Services', to: '/services', Icon: Code2     },
  { label: 'Contact',  to: '/contact',  Icon: Mail      },
]

const platforms = [
  { label: 'Mobile',   desc: 'iOS & Android',         Icon: Smartphone },
  { label: 'Web',      desc: 'Full-stack platforms',   Icon: Globe      },
  { label: 'Internal', desc: 'Desktop & local systems', Icon: Server    },
]

const ddd = ['Design', 'Develop', 'Deploy'] as const


const sidebarItems = [
  { label: 'Overview',   Icon: Layers,        active: false },
  { label: 'AI',         Icon: Sparkles,      active: true  },
  { label: 'Analytics',  Icon: BarChart2,     active: false },
  { label: 'Support',    Icon: MessageSquare, active: false },
  { label: 'Settings',   Icon: Settings,      active: false },
]

const chartBars = [28, 40, 33, 55, 42, 68, 52, 74, 62, 82, 71, 100]

// ─── beam diagram ─────────────────────────────────────────────────────────────

const BeamCircle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn('z-10 flex size-11 items-center justify-center rounded-full border border-foreground/[0.12] bg-foreground/[0.04]', className)}
    >
      {children}
    </div>
  )
)
BeamCircle.displayName = 'BeamCircle'

const phaseNodes = [
  { Icon: Lightbulb,   label: 'Concept',  delay: 0.0 },
  { Icon: Palette,     label: 'Design',   delay: 0.5 },
  { Icon: Code2,       label: 'Build',    delay: 1.0 },
  { Icon: ShieldCheck, label: 'QA',       delay: 1.5 },
  { Icon: Rocket,      label: 'Launch',   delay: 2.0 },
  { Icon: Wrench,      label: 'Maintain', delay: 2.5 },
]

// ─── snap points (scrollP units) — fully-rendered state of each section ──────
const SNAP_POINTS = [0, 1.58, 2.88, 3.95]

// ─── scroll helpers ───────────────────────────────────────────────────────────

/** Normalised 0→1 within a scroll window */
const ep = (sp: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (sp - start) / (end - start)))

/**
 * Section 2 — scroll-driven entry AND exit.
 * Entry: float up into place. Exit: slide up and fade out (top-down stagger).
 */
const s2 = (sp: number, eStart: number, eEnd: number, xStart: number, xEnd: number): React.CSSProperties => {
  if (sp >= xStart) {
    const p = ep(sp, xStart, xEnd)
    return { opacity: 1 - p, transform: `translateY(${-p * 24}px)`, pointerEvents: p > 0.95 ? 'none' : 'auto' }
  }
  const p = ep(sp, eStart, eEnd)
  return { opacity: p, transform: `translateY(${(1 - p) * 24}px)`, pointerEvents: p < 0.05 ? 'none' : 'auto' }
}

/** Section 2.5 — slide in from the right, exit to the left. */
const s25 = (sp: number, eStart: number, eEnd: number, xStart: number, xEnd: number): React.CSSProperties => {
  if (sp >= xStart) {
    const p = ep(sp, xStart, xEnd)
    return { opacity: 1 - p, transform: `translateX(${-p * 48}px)`, pointerEvents: p > 0.95 ? 'none' : 'auto' }
  }
  const p = ep(sp, eStart, eEnd)
  return { opacity: p, transform: `translateX(${(1 - p) * 48}px)`, pointerEvents: p < 0.05 ? 'none' : 'auto' }
}

/** Section 2.5 mock UI feature cards — pop up from below, staggered. Exit handled by parent. */
const featureCard = (sp: number, i: number): React.CSSProperties => {
  const p = ep(sp, 2.38 + i * 0.14, 2.56 + i * 0.14)
  return { opacity: p, transform: `translateY(${(1 - p) * 12}px)` }
}

/** Section 2.5 capability cards — scale up on entry, slide left on exit. */

/** Section 3 — slide in from the left. No exit. */
const s3 = (sp: number, start: number, end: number): React.CSSProperties => {
  const p = ep(sp, start, end)
  return { opacity: p, transform: `translateX(${(1 - p) * -48}px)`, pointerEvents: p < 0.05 ? 'none' : 'auto' }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Hero({ onScrollChange }: { onScrollChange?: (sp: number) => void }) {
  const [scrollP, setScrollP] = useState(0)
  const neverScrolled = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    onScrollChange?.(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Uncapped scroll tracking — scrollP drives every section animation and the
    // nav. Snapping itself is now handled by native CSS scroll-snap (below).
    const onScroll = () => {
      if (window.scrollY > 0) neverScrolled.current = false
      const sp = window.scrollY / window.innerHeight
      setScrollP(sp)
      onScrollChange?.(sp)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Firm scroll snapping between sections — matches the Clients page, scoped to
  // the home page. `mandatory` never rests between sections; scroll-snap-stop on
  // the anchors makes each a hard stop, so a fast scroll advances one at a time.
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollSnapType
    root.style.scrollSnapType = 'y mandatory'
    return () => { root.style.scrollSnapType = prev }
  }, [])

  /**
   * Section 1 — entry via CSS animation at rest; scroll-driven exit once moving.
   * We must set animation:'none' when taking over because CSS animations sit
   * above inline styles in the cascade.
   * neverScrolled prevents re-triggering entry animations when user scrolls back to top.
   */
  const ss = (
    sp: number,
    entryAnim: string,
    exitStart: number,
    exitEnd: number,
  ): React.CSSProperties => {
    if (sp === 0 && neverScrolled.current) return { animation: entryAnim }
    const p = ep(sp, exitStart, exitEnd)
    return { animation: 'none', opacity: 1 - p, transform: `translateY(${-p * 22}px)` }
  }

  const atStart = scrollP === 0 && neverScrolled.current
  const titleP = ep(scrollP, 0.32, 0.70)

  // Section 3 beam refs
  const beamContainerRef = useRef<HTMLDivElement>(null)
  const phaseRef1 = useRef<HTMLDivElement>(null)
  const phaseRef2 = useRef<HTMLDivElement>(null)
  const phaseRef3 = useRef<HTMLDivElement>(null)
  const phaseRef4 = useRef<HTMLDivElement>(null)
  const phaseRef5 = useRef<HTMLDivElement>(null)
  const phaseRef6 = useRef<HTMLDivElement>(null)
  const studioHubRef = useRef<HTMLDivElement>(null)
  const clientNodeRef = useRef<HTMLDivElement>(null)
  const phaseRefs = [phaseRef1, phaseRef2, phaseRef3, phaseRef4, phaseRef5, phaseRef6]

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Landscape on a mobile device: width < 1024 but wider than tall (phone rotated)
  const [isLandscape, setIsLandscape] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth > window.innerHeight && window.innerWidth < 1024)
  useEffect(() => {
    const update = () =>
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  // On mobile portrait show 4 nodes; landscape/desktop show all 6
  const activePhaseNodes = isMobile && !isLandscape ? phaseNodes.slice(0, 4) : phaseNodes

  // Section dots (right rail). Active = nearest snap point to the current scroll.
  const activeSnap = SNAP_POINTS.reduce(
    (best, sp, i) => (Math.abs(sp - scrollP) < Math.abs(SNAP_POINTS[best] - scrollP) ? i : best),
    0
  )
  const goToSection = (i: number) =>
    window.scrollTo({ top: SNAP_POINTS[i] * window.innerHeight, behavior: 'smooth' })

  return (
    // 500vh = 400vh of scroll travel, giving scrollP max ≈ 4.0
    // s1 exits ~0.75; s2 fully in ~1.54; s2 exits ~2.1
    // s2.5 enters ~2.08; s2.5 exits ~3.18; s3 fully in ~3.93
    <div style={{ height: '500vh', position: 'relative' }}>
      {/* Snap anchors — one per section at its fully-rendered scroll position.
          With mandatory snap + scroll-snap-stop, the window always rests on a
          section and a fast scroll advances one section at a time. */}
      {SNAP_POINTS.map((sp, i) => (
        <div
          key={i}
          aria-hidden
          style={{ position: 'absolute', top: `${sp * 100}vh`, left: 0, width: 1, height: 1, scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        />
      ))}
      <section className="sticky top-0 h-screen overflow-hidden relative">

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — Studio 7 hero
        ══════════════════════════════════════════════════════ */}
        <div className={cn('absolute inset-0 flex px-10 md:px-16 justify-center', isLandscape ? 'flex-row items-center' : 'flex-col lg:flex-row lg:items-center')}>

          {/* Left: text */}
          <div className={cn('flex flex-col', isLandscape ? 'flex-1 pt-10' : 'lg:flex-1 pt-24 lg:pt-0')}>

            <div style={ss(scrollP, 'fade-up 0.5s ease both 0.1s', 0.52, 0.75)}>
              <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/50 uppercase">
                Digital Product Studio
              </span>
            </div>

            {/* S7 → Studio 7 */}
            <div
              className="mt-5 flex items-baseline select-none"
              style={atStart
                ? { animation: 'fade-in 0.25s ease both 0.25s' }
                : { animation: 'none', opacity: 1 - titleP }
              }
            >
              <span className="text-foreground font-sans" style={FONT_STYLE}>S</span>
              <span
                className="text-foreground font-sans overflow-hidden whitespace-nowrap"
                style={{
                  ...FONT_STYLE,
                  display: 'block',
                  maskImage: 'linear-gradient(to right, black 0, black calc(var(--tudio-clip) * 0.80), transparent var(--tudio-clip))',
                  WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(var(--tudio-clip) * 0.80), transparent var(--tudio-clip))',
                  ...(atStart
                    ? { maxWidth: 0, animation: 'tudio-expand 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both' }
                    : { animation: 'none', maxWidth: `${(1 - titleP) * 60}vw`, '--tudio-clip': `${(1 - titleP) * 60}vw` } as React.CSSProperties
                  ),
                }}
              >
                tudio
              </span>
              <span className="text-accent font-sans" style={{ ...FONT_STYLE, paddingLeft: '0.06em' }}>7</span>
            </div>

            <p
              className="mt-10 text-xl md:text-2xl font-medium text-foreground/90 tracking-tight max-w-2xl leading-snug"
              style={ss(scrollP, 'fade-up 0.7s ease both 2.1s', 0.20, 0.44)}
            >
              Premium software. Built for those who accept nothing less.
            </p>

            <p
              className="mt-5 text-[15px] text-foreground/65 max-w-lg leading-relaxed"
              style={ss(scrollP, 'fade-up 0.7s ease both 2.35s', 0.10, 0.33)}
            >
              Studio 7 is a boutique engineering studio dedicated to crafting exceptional
              digital products. Every solution is 100% bespoke — purpose-built for the
              client, engineered without compromise, and delivered to the highest standard.
              No templates. No shortcuts.
            </p>

            {/* Mobile icon row — hidden in landscape (desktop grid shows instead) */}
            <div className={cn('grid grid-cols-3 gap-x-6 gap-y-8', isLandscape ? 'hidden' : 'lg:hidden mt-14')}>
              {pages.map(({ label, to, Icon }, i) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex flex-col items-start gap-3"
                  style={ss(scrollP, `fade-up 0.5s ease both ${2.65 + i * 0.08}s`, (3-i)*0.025, 0.18+(3-i)*0.025)}
                >
                  <Icon size={18} className="text-foreground/30 group-hover:text-accent transition-colors duration-200" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] tracking-[0.18em] text-foreground/40 group-hover:text-foreground/80 uppercase transition-colors duration-200">{label}</span>
                  <div className="h-px w-8 bg-foreground/[0.06] group-hover:bg-accent/50 transition-colors duration-200" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: 2×2 desktop grid — also visible in landscape.
              In landscape the column is only ~half a phone-width wide, so the
              cards go fluid (square, sharing the row) instead of keeping their
              fixed 160px width, which used to overflow and overlap. */}
          <div className={cn('items-center justify-center', isLandscape ? 'flex flex-1 min-w-0' : 'hidden lg:flex lg:flex-1')}>
            <div className={cn('grid grid-cols-3', isLandscape ? 'w-full max-w-[420px] gap-2' : 'gap-3')}>
              {pages.map(({ label, to, Icon }, i) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'group flex flex-col justify-between border border-foreground/[0.07] rounded-[4px] hover:border-foreground/15 hover:bg-foreground/[0.02] transition-[border-color,background-color] duration-200',
                    isLandscape ? 'min-w-0 w-full aspect-square p-3.5' : 'p-6 w-40 h-40',
                  )}
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    ...ss(scrollP, `fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both ${2.55 + i * 0.07}s`, (3-i)*0.025, 0.18+(3-i)*0.025),
                  }}
                >
                  <Icon size={isLandscape ? 17 : 20} className="text-foreground/25 group-hover:text-accent transition-colors duration-200" strokeWidth={1.5} />
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className={cn('font-mono text-foreground/40 group-hover:text-foreground/80 uppercase transition-colors duration-200 truncate', isLandscape ? 'text-[9px] tracking-[0.12em]' : 'text-[10px] tracking-[0.18em]')}>{label}</span>
                    <div className="h-px w-8 bg-foreground/[0.08] group-hover:bg-accent/50 group-hover:w-full transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — Design. Develop. Deploy.
            Absolutely overlays section 1; invisible until s1 exits.
        ══════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16" style={{ pointerEvents: 'none', visibility: scrollP >= 2.15 ? 'hidden' : 'visible' }}>

          {/* Label */}
          <div style={s2(scrollP, 0.78, 0.96, 1.65, 1.80)}>
            <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/50 uppercase">
              Full Stack · End to End
            </span>
          </div>

          {/* Display words — staggered cascade */}
          <div className={cn('flex flex-col', isLandscape ? 'mt-3' : 'mt-6')} style={{ gap: '0.05em' }}>
            {ddd.map((word, i) => (
              <div key={word} style={s2(scrollP, 0.86 + i * 0.09, 1.06 + i * 0.09, 1.70 + i * 0.05, 1.85 + i * 0.05)}>
                <span
                  style={{
                    fontSize: isLandscape ? 'clamp(32px, 5vw, 80px)' : 'clamp(52px, 7.5vw, 120px)',
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.0,
                    display: 'block',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {word}
                  {i === 2 && <span style={{ color: 'var(--accent)' }}>.</span>}
                  {i !== 2 && <span style={{ color: 'color-mix(in srgb, var(--foreground) 25%, transparent)' }}>.</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Copy */}
          <p
            className={cn('text-[15px] text-foreground/65 max-w-xl leading-relaxed', isLandscape ? 'hidden' : 'mt-8')}
            style={s2(scrollP, 1.10, 1.30, 1.85, 2.00)}
          >
            We take your concept through the complete product lifecycle — requirements,
            architecture, design, build, test, and deployment — then hand back a tailored
            solution that's entirely yours. From first conversation to final handover,
            every decision is made with your product's long-term success in mind.
          </p>

          {/* Platform tiles + CTA tile */}
          <div className={cn('flex flex-wrap gap-0', isLandscape ? 'mt-4' : 'mt-10')}>
            {platforms.map(({ label, desc, Icon }, i) => (
              <div
                key={label}
                className="flex flex-col gap-3 pr-10 mr-10 border-r border-foreground/[0.06]"
                style={s2(scrollP, 1.20 + i * 0.07, 1.40 + i * 0.07, 1.88 + i * 0.03, 2.03 + i * 0.03)}
              >
                <Icon size={18} className="text-foreground/35" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-foreground/75 uppercase font-medium">{label}</p>
                  <p className="text-[13px] text-foreground/40 mt-1 leading-relaxed">{desc}</p>
                </div>
                <div className="h-px w-8 bg-foreground/[0.08]" />
              </div>
            ))}

            {/* CTA tile */}
            <Link
              to="/services"
              className="group flex flex-col gap-3"
              style={s2(scrollP, 1.41, 1.58, 1.94, 2.09)}
            >
              <ArrowUpRight size={18} className="text-accent/50 group-hover:text-accent transition-colors duration-200" strokeWidth={1.5} />
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-accent/60 group-hover:text-accent uppercase font-medium transition-colors duration-200">All Services</p>
                <p className="text-[13px] text-foreground/35 mt-1 leading-relaxed group-hover:text-foreground/55 transition-colors duration-200">See the full suite</p>
              </div>
              <div className="h-px w-8 bg-accent/25 group-hover:w-full group-hover:bg-accent/50 transition-all duration-500" />
            </Link>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2.5 — Unique to You
            Enters from right; exits to left. Cards scale in.
        ══════════════════════════════════════════════════════ */}
        <div className={cn('absolute inset-0 flex px-10 md:px-16 overflow-hidden', isLandscape ? 'flex-row items-center gap-8' : 'flex-col lg:flex-row lg:items-center gap-4 lg:gap-16')} style={{ pointerEvents: 'none' }}>

          {/* Left: text */}
          <div className={cn('flex flex-col', isLandscape ? 'flex-1 pt-0' : 'lg:flex-1 pt-16 lg:pt-0')}>

            <div style={s25(scrollP, 2.08, 2.24, 3.00, 3.15)}>
              <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/50 uppercase">
                Bespoke · Tailored · Yours
              </span>
            </div>

            <div className={isLandscape ? 'mt-3' : 'mt-6'} style={s25(scrollP, 2.15, 2.35, 3.02, 3.18)}>
              <span style={{
                fontSize: isLandscape ? 'clamp(32px, 4.5vw, 60px)' : 'clamp(44px, 6vw, 92px)',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.0,
                display: 'block',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-sans)',
              }}>
                Built for<br />you<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </div>

            <p
              className={cn('text-[15px] text-foreground/65 max-w-lg leading-relaxed', isLandscape ? 'mt-4 text-[13px]' : 'mt-8')}
              style={s25(scrollP, 2.26, 2.46, 3.05, 3.20)}
            >
              Whatever you need, we build it. AI integration, customer support systems,
              analytics dashboards, payment flows — every feature is purpose-built around
              your vision, not retrofitted from a template.
            </p>

            {/* CTA — View our work */}
            <Link
              to="/work"
              className="group flex flex-col gap-2.5 mt-8"
              style={s25(scrollP, 2.38, 2.58, 3.07, 3.22)}
            >
              <ArrowUpRight size={16} className="text-accent/50 group-hover:text-accent transition-colors duration-200" strokeWidth={1.5} />
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-accent/60 group-hover:text-accent uppercase font-medium transition-colors duration-200">View our work</p>
                <p className="text-[13px] text-foreground/35 mt-1 group-hover:text-foreground/55 transition-colors duration-200">See what we've built</p>
              </div>
              <div className="h-px w-8 bg-accent/25 group-hover:w-full group-hover:bg-accent/50 transition-all duration-500" />
            </Link>

          </div>

          {/* Right: mock app UI shell */}
          <div
            className={cn('flex items-center justify-center', isLandscape ? 'flex-1' : 'lg:flex-1 w-full')}
            style={s25(scrollP, 2.15, 2.38, 3.02, 3.18)}
          >
            <div
              className="surface-dark relative w-full max-w-[390px] lg:max-w-[390px] rounded-lg overflow-hidden border border-foreground/[0.08]"
              style={{
                background: 'rgba(28,28,28,0.96)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.85)',
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-foreground/[0.06]" style={{ background: 'rgba(255,255,255,0.015)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/40" />
                  <div className="w-2 h-2 rounded-full bg-green-500/35" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-foreground/[0.06] bg-foreground/[0.02]">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                    <span className="font-mono text-[9px] text-foreground/20 tracking-wider">yourapp.io</span>
                  </div>
                </div>
              </div>

              {/* App body */}
              <div className={cn('flex', isLandscape ? 'h-[180px]' : 'h-[220px] lg:h-[300px]')}>

                {/* Sidebar */}
                <div
                  className="flex flex-col w-[126px] shrink-0 border-r border-foreground/[0.06] py-3 px-2 gap-0.5"
                  style={{ background: 'rgba(255,255,255,0.008)' }}
                >
                  {sidebarItems.map(({ label, Icon, active }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-[4px] ${active ? 'bg-accent/[0.12]' : ''}`}
                    >
                      <Icon
                        size={12}
                        strokeWidth={active ? 2.5 : 1.5}
                        className={active ? 'text-accent' : 'text-foreground/18'}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: active ? 'rgba(232,255,71,0.9)' : 'rgba(255,255,255,0.18)' }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden">

                  {/* Feature card 1 — AI chat */}
                  <div
                    className="shrink-0 rounded-[6px] border border-foreground/[0.07] p-3 flex flex-col gap-2"
                    style={{ background: 'rgba(255,255,255,0.02)', ...featureCard(scrollP, 0) }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={11} strokeWidth={1.5} className="text-accent/80" />
                      <span className="font-mono text-[9px] tracking-[0.14em] text-foreground/35 uppercase">AI Assistant</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="self-end max-w-[82%] px-2.5 py-1.5 rounded-[4px] bg-foreground/[0.06]">
                        <p className="text-[10px] text-foreground/55 leading-snug">Summarise last month's orders</p>
                      </div>
                      <div className="self-start max-w-[92%] px-2.5 py-1.5 rounded-[4px] border border-accent/[0.15] bg-accent/[0.07]">
                        <p className="text-[10px] text-foreground/55 leading-snug">Of course! Here's a breakdown of your 1,204 orders, totalling $48.2k...</p>
                      </div>
                      <div className="self-start flex items-center gap-1 px-1.5 py-0.5">
                        {[0, 0.2, 0.4].map((d, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-accent/50 animate-pulse"
                            style={{ animationDelay: `${d}s`, animationDuration: '1.2s' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feature card 2 — Analytics */}
                  <div
                    className="shrink-0 rounded-[6px] border border-foreground/[0.07] p-2.5 flex flex-col gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.02)', ...featureCard(scrollP, 1) }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BarChart2 size={11} strokeWidth={1.5} className="text-accent/80" />
                        <span className="font-mono text-[9px] tracking-[0.14em] text-foreground/35 uppercase">Revenue</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[12px] font-semibold text-foreground/75">$48.2k</span>
                        <span className="font-mono text-[9px] text-accent">↑ 24%</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-px h-7">
                      {chartBars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: i === chartBars.length - 1
                              ? 'var(--accent)'
                              : i >= chartBars.length - 3
                              ? 'rgba(232,255,71,0.35)'
                              : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Feature card 3 — Support queue */}
                  <div
                    className="shrink-0 rounded-[6px] border border-foreground/[0.07] p-2.5 flex flex-col gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.02)', ...featureCard(scrollP, 2) }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={11} strokeWidth={1.5} className="text-accent/80" />
                        <span className="font-mono text-[9px] tracking-[0.14em] text-foreground/35 uppercase">Support</span>
                      </div>
                      <span className="font-mono text-[9px] text-foreground/22">3 open · avg 4m</span>
                    </div>
                    {[
                      { label: 'Cannot access the dashboard',   time: '2m',  hot: true  },
                      { label: 'Export to CSV not working',     time: '14m', hot: false },
                    ].map(({ label, time, hot }) => (
                      <div key={label} className="flex items-center gap-2 pt-1.5 border-t border-foreground/[0.04]">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${hot ? 'bg-accent' : 'bg-foreground/[0.14]'}`} />
                        <p className="flex-1 text-[10px] leading-none truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>{label}</p>
                        <span className="font-mono text-[8px] shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }}>{time} ago</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — Full Stack Management
        ══════════════════════════════════════════════════════ */}
        <div className={cn('absolute inset-0 flex px-10 md:px-16', isLandscape ? 'flex-row items-center gap-8' : 'flex-col lg:flex-row lg:items-center gap-6 lg:gap-16')} style={{ pointerEvents: 'none' }}>

          {/* Left: text */}
          <div className={cn('flex flex-col', isLandscape ? 'flex-1 pt-0' : 'lg:flex-1 pt-16 lg:pt-0')}>

            <div style={s3(scrollP, 3.38, 3.52)}>
              <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/50 uppercase">
                Lifecycle · Handover · Maintenance
              </span>
            </div>

            <div className={isLandscape ? 'mt-3' : 'mt-6'} style={s3(scrollP, 3.44, 3.63)}>
              <span style={{
                fontSize: isLandscape ? 'clamp(32px, 4.5vw, 60px)' : 'clamp(44px, 6vw, 92px)',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.0,
                display: 'block',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-sans)',
              }}>
                Full stack<br />management<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </div>

            <p
              className={cn('mt-8 text-[15px] text-foreground/65 max-w-lg leading-relaxed', isLandscape ? 'hidden' : 'hidden lg:block')}
              style={s3(scrollP, 3.54, 3.72)}
            >
              We take complete ownership of your product — from initial discovery
              through architecture, design, build, and launch. At completion you
              receive a full handover of everything: code, documentation, and
              assets. For those who want us to stay involved, ongoing maintenance
              packages keep your product running and evolving long after delivery.
            </p>

            <div className="mt-6 lg:mt-10 flex flex-col gap-3 lg:gap-4">
              {[
                { label: 'Lifecycle ownership', desc: 'Concept through delivery' },
                { label: 'Complete handover',   desc: 'Code, docs & assets'      },
                { label: 'Maintenance plans',   desc: 'Ongoing support & updates' },
              ].map(({ label, desc }, i) => (
                <div
                  key={label}
                  className="flex items-start gap-4"
                  style={s3(scrollP, 3.63 + i * 0.07, 3.79 + i * 0.07)}
                >
                  <div className="mt-2 h-px w-4 bg-accent/60 shrink-0" />
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-foreground/75 uppercase font-medium">{label}</p>
                    <p className="text-[13px] text-foreground/40 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA — Contact */}
            <Link
              to="/contact"
              className="group flex flex-col gap-2.5 mt-6 lg:mt-8"
              style={s3(scrollP, 3.84, 3.98)}
            >
              <ArrowUpRight size={16} className="text-accent/50 group-hover:text-accent transition-colors duration-200" strokeWidth={1.5} />
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-accent/60 group-hover:text-accent uppercase font-medium transition-colors duration-200">Start a project</p>
                <p className="text-[13px] text-foreground/35 mt-1 group-hover:text-foreground/55 transition-colors duration-200">Get in touch today</p>
              </div>
              <div className="h-px w-8 bg-accent/25 group-hover:w-full group-hover:bg-accent/50 transition-all duration-500" />
            </Link>

          </div>

          {/* Right: animated beam diagram */}
          <div
            className="flex lg:flex-1 items-center justify-start"
            style={s3(scrollP, 3.60, 3.84)}
          >
            <div
              ref={beamContainerRef}
              className={cn('relative flex w-full max-w-xs items-center justify-center overflow-hidden', isLandscape ? 'h-[clamp(260px,74vh,330px)]' : 'h-[300px] lg:h-[500px]')}
            >
              <div className="flex size-full flex-row items-stretch justify-between px-4">

                {/* Phase nodes */}
                <div className="flex flex-col justify-between py-2">
                  {activePhaseNodes.map(({ Icon, label }, i) => (
                    <BeamCircle key={label} ref={phaseRefs[i]} className={isLandscape ? 'size-9' : undefined}>
                      <Icon size={isLandscape ? 13 : 15} className="text-foreground/35" strokeWidth={1.5} />
                    </BeamCircle>
                  ))}
                </div>

                {/* Studio 7 hub */}
                <div className="flex flex-col justify-center">
                  <BeamCircle ref={studioHubRef} className={cn('border-accent/25 bg-accent/[0.06]', isLandscape ? 'size-14' : 'size-16')}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: isLandscape ? '15px' : '17px', color: 'var(--accent)', letterSpacing: '-0.02em' }}>S7</span>
                  </BeamCircle>
                </div>

                {/* Client node */}
                <div className="flex flex-col justify-center">
                  <BeamCircle ref={clientNodeRef} className={isLandscape ? 'size-9' : undefined}>
                    <User size={isLandscape ? 13 : 15} className="text-foreground/35" strokeWidth={1.5} />
                  </BeamCircle>
                </div>
              </div>

              {/* Beams: phases → S7 (forward) */}
              {activePhaseNodes.map(({ delay }, i) => (
                <AnimatedBeam
                  key={`fwd-${i}`}
                  containerRef={beamContainerRef}
                  fromRef={phaseRefs[i]}
                  toRef={studioHubRef}
                  pathColor="color-mix(in srgb, var(--foreground) 10%, transparent)"
                  pathWidth={1.5}
                  gradientStartColor="#e8ff47"
                  gradientStopColor="color-mix(in srgb, var(--foreground) 50%, transparent)"
                  duration={1.5 + i * 0.1}
                  delay={delay}
                />
              ))}

              {/* Beams: S7 → phases (reverse) */}
              {activePhaseNodes.map(({ delay }, i) => (
                <AnimatedBeam
                  key={`rev-${i}`}
                  containerRef={beamContainerRef}
                  fromRef={phaseRefs[i]}
                  toRef={studioHubRef}
                  reverse
                  pathColor="color-mix(in srgb, var(--foreground) 10%, transparent)"
                  pathWidth={1.5}
                  gradientStartColor="#e8ff47"
                  gradientStopColor="color-mix(in srgb, var(--foreground) 50%, transparent)"
                  duration={1.5 + i * 0.1}
                  delay={delay + 0.75}
                />
              ))}

              {/* Beam: S7 → client (forward) */}
              <AnimatedBeam
                containerRef={beamContainerRef}
                fromRef={studioHubRef}
                toRef={clientNodeRef}
                pathColor="color-mix(in srgb, var(--foreground) 10%, transparent)"
                pathWidth={1.5}
                gradientStartColor="#e8ff47"
                gradientStopColor="color-mix(in srgb, var(--foreground) 50%, transparent)"
                duration={1.5}
              />

              {/* Beam: client → S7 (reverse) */}
              <AnimatedBeam
                containerRef={beamContainerRef}
                fromRef={studioHubRef}
                toRef={clientNodeRef}
                reverse
                pathColor="color-mix(in srgb, var(--foreground) 10%, transparent)"
                pathWidth={1.5}
                gradientStartColor="#e8ff47"
                gradientStopColor="color-mix(in srgb, var(--foreground) 50%, transparent)"
                duration={1.5}
                delay={0.75}
              />
            </div>
          </div>

        </div>

        {/* Scroll indicator — fades in late, cascades out as user scrolls */}
        {(() => {
          const atRest = scrollP === 0 && neverScrolled.current
          const labelP = ep(scrollP, 0, 0.10)
          const chevronP = ep(scrollP, 0.04, 0.16)
          return (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
              <span
                className="font-mono text-[9px] tracking-[0.28em] text-foreground/30 uppercase"
                style={atRest
                  ? { animation: 'fade-up 0.6s ease both 3.2s' }
                  : { animation: 'none', opacity: 1 - labelP, transform: `translateY(${labelP * 10}px)` }
                }
              >
                Scroll
              </span>
              {/* Wrapper drives entry + exit; ChevronDown bounces independently at rest */}
              <div
                style={atRest
                  ? { animation: 'fade-up 0.6s ease both 3.35s' }
                  : { animation: 'none', opacity: 1 - chevronP, transform: `translateY(${chevronP * 10}px)` }
                }
              >
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={cn('text-foreground/25', atRest && 'animate-bounce')}
                />
              </div>
            </div>
          )
        })()}

      </section>

      {/* Section dots — right rail, one per snap point; click to jump. Replaces
          the old bottom progress bar (mirrors the Clients page). */}
      <div className="fixed top-1/2 right-8 z-50 -translate-y-1/2 flex flex-col gap-3">
        {SNAP_POINTS.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSection(i)}
            aria-label={`Go to section ${i + 1}`}
            className="group grid place-items-center h-4 w-4"
          >
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: activeSnap === i ? 9 : 6,
                height: activeSnap === i ? 9 : 6,
                background: activeSnap === i ? 'var(--accent)' : 'var(--foreground)',
                opacity: activeSnap === i ? 1 : 0.28,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
