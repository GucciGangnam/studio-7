import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ArrowRight, Smartphone, Monitor, Code2, Database, User, Bot, Cloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedBeam } from '@/components/ui/animated-beam'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const ACCENT = '#e8ff47'
const N_LABEL   = 'rgba(255,255,255,0.28)'
const N_CHECK   = 'rgba(255,255,255,0.20)'
const N_PRICE_MVP    = 'rgba(255,255,255,0.50)'
const N_PRICE_CUSTOM = 'rgba(255,255,255,0.40)'
const N_CTA_BG     = 'rgba(255,255,255,0.04)'
const N_CTA_TEXT   = 'rgba(255,255,255,0.50)'
const N_CTA_BORDER = 'rgba(255,255,255,0.09)'

const BEAM_DUR = 0.5

/** Returns cascade transition: delays only on the way IN, instant on the way OUT */
function ct(isActive: boolean, delay: number) {
  return { duration: 0.3, delay: isActive ? delay : 0 }
}

function useCardAnimation(mountDelay: number) {
  const [isHovered, setIsHovered] = useState(false)
  const [mountActive, setMountActive] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setMountActive(true), mountDelay)
    const t2 = setTimeout(() => setMountActive(false), mountDelay + 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isActive: isHovered || mountActive,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }
}

function CardBg() {
  return (
    <>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#161616] via-[#0f0f0f] to-[#080808] border border-foreground/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.5)]" />
      <div className="absolute bottom-0 left-20 right-20 h-px bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent" />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)',
        }}
      />
    </>
  )
}

// ─── Custom Card Back ──────────────────────────────────────────────────────────

type FeatureIcon = React.FC<{ size?: number; strokeWidth?: number }>

// Interleaved: existing (0,2,4) always lime; new features (1,3) start blue, S7 builds
const featureIcons: FeatureIcon[] = [Monitor, Bot, Smartphone, Cloud, Database]
const EXISTING_IDX = [0, 2, 4]
const NEW_IDX      = [1, 3]

type BeamState = {
  fromRef: RefObject<HTMLDivElement | null>
  toRef:   RefObject<HTMLDivElement | null>
  reverse: boolean
  id:      number
}

function CustomCardBack({ onBack }: { onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const userRef      = useRef<HTMLDivElement>(null)
  const s7Ref        = useRef<HTMLDivElement>(null)
  const f0Ref        = useRef<HTMLDivElement>(null)
  const f1Ref        = useRef<HTMLDivElement>(null)
  const f2Ref        = useRef<HTMLDivElement>(null)
  const f3Ref        = useRef<HTMLDivElement>(null)
  const f4Ref        = useRef<HTMLDivElement>(null)

  const [newLit, setNewLit]   = useState<Set<number>>(new Set())
  const [ctaReady, setCtaReady] = useState(false)
  const [userBeam, setUserBeam] = useState<BeamState | null>(null)
  const [s7Beam,   setS7Beam]   = useState<BeamState | null>(null)

  useEffect(() => {
    let cancelled = false
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const beamMs = BEAM_DUR * 1000
    const featureRefs = [f0Ref, f1Ref, f2Ref, f3Ref, f4Ref]

    // Loop A: User ↔ existing icons — continuous random beams both directions
    async function loopUser() {
      await wait(400)
      while (!cancelled) {
        const i       = EXISTING_IDX[Math.floor(Math.random() * EXISTING_IDX.length)]
        const toUser  = Math.random() > 0.5
        setUserBeam({
          fromRef: userRef,
          toRef:   featureRefs[i],
          reverse: !toUser,   // true = user→icon, false = icon→user
          id:      Date.now(),
        })
        await wait(beamMs)
        if (cancelled) return
        setUserBeam(null)
        await wait(100 + Math.random() * 300)
      }
    }

    // Loop B: S7 → Bot → back → S7 → Cloud → back → repeat
    async function loopS7() {
      await wait(1000)
      let first = true
      while (!cancelled) {
        for (const i of NEW_IDX) {
          if (cancelled) return
          // S7 → feature
          setS7Beam({ fromRef: s7Ref, toRef: featureRefs[i], reverse: true, id: Date.now() })
          await wait(beamMs)
          if (cancelled) return
          setNewLit(p => new Set([...p, i]))
          setS7Beam(null)
          await wait(120)
          if (cancelled) return
          // feature → S7 return
          setS7Beam({ fromRef: s7Ref, toRef: featureRefs[i], reverse: false, id: Date.now() })
          await wait(beamMs)
          if (cancelled) return
          setS7Beam(null)
          await wait(380)
        }
        if (first) { setCtaReady(true); first = false }
        await wait(800)
      }
    }

    loopUser()
    loopS7()
    return () => { cancelled = true }
  }, [])

  return (
    <div ref={containerRef} className="surface-dark relative h-full rounded-2xl overflow-hidden">
      <CardBg />
      <div className="relative h-full flex flex-col">

        {/* Header */}
        <div className="pt-8 px-9">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-accent/60">
            custom engagement
          </p>
          <p className="mt-1.5 text-[16px] font-semibold text-foreground/80 tracking-[-0.02em]">
            We plug in. You move forward.
          </p>
          <p className="mt-4 text-[13px] font-sans leading-relaxed text-foreground/38">
            We integrate directly into your existing infrastructure and team — no
            rip-and-replace. Just new features and custom solutions built on top of
            what you already have.
          </p>
        </div>

        {/* Diagram: User | icons | S7 — centered */}
        <div className="flex-1 flex items-center justify-center px-9">
          <div className="flex items-center justify-between" style={{ width: 280 }}>

            {/* LEFT: User */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                ref={userRef}
                className="rounded-full border flex items-center justify-center shrink-0"
                style={{
                  width: 46,
                  height: 46,
                  borderColor: 'rgba(232,255,71,0.45)',
                  backgroundColor: 'rgba(232,255,71,0.07)',
                  boxShadow: '0 0 20px rgba(232,255,71,0.14)',
                }}
              >
                <User size={18} strokeWidth={1.5} className="text-accent" />
              </div>
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-foreground/30 text-center leading-tight">
                your<br />infra
              </span>
            </div>

            {/* CENTER: Feature icons */}
            <div className="flex flex-col gap-3">
              {([f0Ref, f1Ref, f2Ref, f3Ref, f4Ref] as RefObject<HTMLDivElement | null>[]).map((ref, i) => {
                const isNew   = NEW_IDX.includes(i)
                const isBuilt = !isNew || newLit.has(i)
                const Icon    = featureIcons[i]
                return (
                  <motion.div
                    key={i}
                    ref={ref}
                    animate={{
                      borderColor:     isBuilt ? '#e8ff47'                        : 'rgba(96,165,250,0.40)',
                      backgroundColor: isBuilt ? 'rgba(232,255,71,0.07)'          : 'rgba(96,165,250,0.06)',
                      boxShadow:       isBuilt ? '0 0 12px rgba(232,255,71,0.22)' : '0 0 8px rgba(96,165,250,0.10)',
                    }}
                    transition={{ duration: 0.32 }}
                    className="rounded-full border flex items-center justify-center shrink-0"
                    style={{ width: 36, height: 36 }}
                  >
                    <motion.div
                      animate={{ color: isBuilt ? '#e8ff47' : 'rgba(96,165,250,0.70)' }}
                      transition={{ duration: 0.32 }}
                    >
                      <Icon size={14} strokeWidth={1.5} />
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* RIGHT: S7 */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                ref={s7Ref}
                className="rounded-full border flex items-center justify-center shrink-0"
                style={{
                  width: 46,
                  height: 46,
                  borderColor: 'rgba(232,255,71,0.45)',
                  backgroundColor: 'rgba(232,255,71,0.07)',
                  boxShadow: '0 0 20px rgba(232,255,71,0.14)',
                }}
              >
                <span className="font-mono text-[11px] font-bold text-accent tracking-[-0.02em]">S7</span>
              </div>
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-foreground/30 text-center leading-tight">
                new<br />features
              </span>
            </div>

          </div>
        </div>

        {/* CTA + back */}
        <div className="pb-7 px-9 flex flex-col gap-3">
          <Link
            to="/contact"
            className={`w-full flex items-center justify-center gap-2 py-[11px] rounded-xl border font-mono text-[11px] tracking-[0.18em] uppercase font-bold transition-colors duration-500 ${
              ctaReady
                ? 'border-accent bg-accent/10 text-accent hover:bg-accent hover:text-black'
                : 'border-foreground/[0.09] bg-foreground/[0.04] text-foreground/25 pointer-events-none'
            }`}
          >
            Get in touch
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
          <button
            onClick={onBack}
            className="font-mono text-[11px] tracking-[0.18em] text-foreground/30 hover:text-foreground/60 uppercase transition-colors text-center"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Beam overlays */}
      {userBeam && (
        <AnimatedBeam
          key={userBeam.id}
          containerRef={containerRef as RefObject<HTMLElement | null>}
          fromRef={userBeam.fromRef as RefObject<HTMLElement | null>}
          toRef={userBeam.toRef as RefObject<HTMLElement | null>}
          reverse={userBeam.reverse}
          duration={BEAM_DUR}
          repeat={0}
          pathColor="rgba(255,255,255,0.06)"
          pathWidth={1.5}
          gradientStartColor="#e8ff47"
          gradientStopColor="#e8ff47"
        />
      )}
      {s7Beam && (
        <AnimatedBeam
          key={s7Beam.id}
          containerRef={containerRef as RefObject<HTMLElement | null>}
          fromRef={s7Beam.fromRef as RefObject<HTMLElement | null>}
          toRef={s7Beam.toRef as RefObject<HTMLElement | null>}
          reverse={s7Beam.reverse}
          duration={BEAM_DUR}
          repeat={0}
          pathColor="rgba(255,255,255,0.06)"
          pathWidth={1.5}
          gradientStartColor="#e8ff47"
          gradientStopColor="#e8ff47"
        />
      )}
    </div>
  )
}

// ─── MVP Card Back ─────────────────────────────────────────────────────────────

type InfraKey = 'mobile' | 'monitor' | 'code' | 'db'
type AnyKey   = InfraKey | 'user'

const infraItems: { key: InfraKey; Icon: React.FC<{ size?: number; strokeWidth?: number }>; label: string }[] = [
  { key: 'mobile',  Icon: Smartphone, label: 'Mobile'   },
  { key: 'monitor', Icon: Monitor,    label: 'Web'      },
  { key: 'code',    Icon: Code2,      label: 'Backend'  },
  { key: 'db',      Icon: Database,   label: 'Database' },
]

function MvpCardBack({ onBack }: { onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const s7Ref        = useRef<HTMLDivElement>(null)
  const mobileRef    = useRef<HTMLDivElement>(null)
  const monitorRef   = useRef<HTMLDivElement>(null)
  const codeRef      = useRef<HTMLDivElement>(null)
  const dbRef        = useRef<HTMLDivElement>(null)
  const userRef      = useRef<HTMLDivElement>(null)

  const [lit, setLit] = useState<Set<AnyKey>>(new Set())
  const [animDone, setAnimDone] = useState(false)
  const [beamState, setBeamState] = useState<{
    fromRef: RefObject<HTMLDivElement | null>
    toRef:   RefObject<HTMLDivElement | null>
    reverse: boolean
    id:      number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const dur = BEAM_DUR * 1000
    const items: [InfraKey, RefObject<HTMLDivElement | null>][] = [
      ['mobile',  mobileRef],
      ['monitor', monitorRef],
      ['code',    codeRef],
      ['db',      dbRef],
    ]

    async function run() {
      await wait(1000) // let flip finish before beams start

      // user → S7
      setBeamState({ fromRef: userRef, toRef: s7Ref, reverse: true, id: Date.now() })
      await wait(dur * 0.75)  // fire S7→icons before beam fully ends — no gap at S7
      if (cancelled) return

      for (const [key, ref] of items) {
        if (cancelled) return
        // S7 → icon (arrives: light up icon, immediately begin return)
        setBeamState({ fromRef: s7Ref, toRef: ref, reverse: true, id: Date.now() })
        await wait(dur)
        if (cancelled) return
        setLit(p => new Set([...p, key]))
        // icon → S7 (no pause — fires immediately)
        setBeamState({ fromRef: s7Ref, toRef: ref, reverse: false, id: Date.now() })
        await wait(dur)
        if (cancelled) return
      }

      // S7 → user (arrives: light up user)
      setBeamState({ fromRef: s7Ref, toRef: userRef, reverse: false, id: Date.now() })
      await wait(dur)
      if (cancelled) return
      setLit(p => new Set([...p, 'user']))
      setBeamState(null)
      setAnimDone(true)
    }

    run()
    return () => { cancelled = true }
  }, [])

  const isLit = (k: AnyKey) => lit.has(k)

  return (
    <div ref={containerRef} className="surface-dark relative h-full rounded-2xl overflow-hidden">
      <CardBg />
      <div className="relative h-full flex flex-col">

        {/* Header */}
        <div className="pt-8 px-9">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-accent/60">
            What S7 builds
          </p>
          <p className="mt-1.5 text-[16px] font-semibold text-foreground/80 tracking-[-0.02em]">
            Every layer. Handed to you.
          </p>
          <p className="mt-4 text-[13px] font-sans leading-relaxed text-foreground/38">
            Lean on our expertise to shape your concept and design your software.
            We handle every layer — from discovery and architecture through to a
            fully deployed stack — then hand it all over as one complete,
            production-ready MVP. Yours to keep.
          </p>
        </div>

        {/* Diagram */}
        <div className="flex-1 flex items-center justify-center px-9">
          <div className="grid grid-cols-3 items-center w-full" style={{ maxWidth: 340 }}>

            {/* Left: infra icons */}
            <div className="flex flex-col gap-3 items-center">
              {infraItems.map(({ key, Icon }) => (
                <motion.div
                  key={key}
                  ref={key === 'mobile' ? mobileRef : key === 'monitor' ? monitorRef : key === 'code' ? codeRef : dbRef}
                  animate={{
                    borderColor: isLit(key) ? '#e8ff47' : 'rgba(255,255,255,0.09)',
                    backgroundColor: isLit(key) ? 'rgba(232,255,71,0.07)' : 'rgba(255,255,255,0.03)',
                    boxShadow: isLit(key) ? '0 0 14px rgba(232,255,71,0.25)' : '0 0 0px rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 0.35 }}
                  className="rounded-full border flex items-center justify-center shrink-0"
                  style={{ width: 40, height: 40 }}
                >
                  <motion.div
                    animate={{ color: isLit(key) ? '#e8ff47' : 'rgba(255,255,255,0.28)' }}
                    transition={{ duration: 0.35 }}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Center: S7 hub */}
            <div className="flex justify-center">
              <div
                ref={s7Ref}
                className="rounded-full border border-accent/50 flex items-center justify-center shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: 'rgba(232,255,71,0.07)',
                  boxShadow: '0 0 24px rgba(232,255,71,0.18)',
                }}
              >
                <span className="font-mono text-[12px] font-bold text-accent tracking-[-0.02em]">S7</span>
              </div>
            </div>

            {/* Right: user */}
            <div className="flex justify-center">
              <motion.div
                ref={userRef}
                animate={{
                  borderColor: isLit('user') ? '#e8ff47' : 'rgba(255,255,255,0.09)',
                  backgroundColor: isLit('user') ? 'rgba(232,255,71,0.07)' : 'rgba(255,255,255,0.03)',
                  boxShadow: isLit('user') ? '0 0 20px rgba(232,255,71,0.35)' : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.4 }}
                className="rounded-full border flex items-center justify-center shrink-0"
                style={{ width: 40, height: 40 }}
              >
                <motion.div
                  animate={{ color: isLit('user') ? '#e8ff47' : 'rgba(255,255,255,0.28)' }}
                  transition={{ duration: 0.4 }}
                >
                  <User size={16} strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA + back */}
        <div className="pb-7 px-9 flex flex-col gap-3">
          <Link
            to="/contact"
            className={`w-full flex items-center justify-center gap-2 py-[11px] rounded-xl border font-mono text-[11px] tracking-[0.18em] uppercase font-bold transition-colors duration-500 ${
              animDone
                ? 'border-accent bg-accent/10 text-accent hover:bg-accent hover:text-black'
                : 'border-foreground/[0.09] bg-foreground/[0.04] text-foreground/25'
            }`}
          >
            Get in touch
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
          <button
            onClick={onBack}
            className="font-mono text-[11px] tracking-[0.18em] text-foreground/30 hover:text-foreground/60 uppercase transition-colors text-center"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Beam overlay */}
      {beamState && (
        <AnimatedBeam
          key={beamState.id}
          containerRef={containerRef as RefObject<HTMLElement | null>}
          fromRef={beamState.fromRef as RefObject<HTMLElement | null>}
          toRef={beamState.toRef as RefObject<HTMLElement | null>}
          reverse={beamState.reverse}
          duration={BEAM_DUR}
          repeat={0}
          pathColor="rgba(255,255,255,0.06)"
          pathWidth={1.5}
          gradientStartColor="#e8ff47"
          gradientStopColor="#e8ff47"
        />
      )}
    </div>
  )
}

// ─── ServiceCard ───────────────────────────────────────────────────────────────

function ServiceCard({
  delay,
  isActive,
  children,
}: {
  delay: number
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative h-full">
      {/* ① Border line expands from centre — neutral base + accent overlay */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay, duration: 0.4, ease: EASE_OUT }}
        className="absolute top-0 left-12 right-12 h-px z-10"
        style={{ transformOrigin: '50% 0' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
        <motion.div
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/55 to-transparent"
        />
      </motion.div>

      {/* ② Card sweeps down via clipPath */}
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0 round 16px)' }}
        animate={{ clipPath: 'inset(0 0 0% 0 round 16px)' }}
        transition={{ delay: delay + 0.3, duration: 0.7, ease: EASE_OUT }}
        className="surface-dark h-full rounded-2xl relative overflow-hidden"
      >
        <CardBg />
        <div className="relative h-full">{children}</div>
      </motion.div>
    </div>
  )
}

const mvpFeatures = [
  'Dedicated relationship manager',
  'Scheduled weekly 1-on-1 sync calls',
  'Discovery & alignment walkthrough',
  'Dedicated team of developers',
  'Complete front-end, server & database code',
  'Deployed cloud infrastructure',
  'Full IP & code ownership on handover',
  'Post-launch support window',
]

const customFeatures = [
  'Application performance optimisation',
  'Complete UI & UX redesign',
  'Infrastructure overhaul & migration',
  'Feature development on existing apps',
  'Bespoke in-house software builds',
  'Full-stack consulting & advisory',
  'Ongoing support & maintenance',
  'Flexible engagement model',
]

export default function Services() {
  const [activeCard, setActiveCard] = useState<'mvp' | 'custom' | null>(null)
  const [flipped, setFlipped] = useState(false)

  const mvp    = useCardAnimation(1250)
  const custom = useCardAnimation(1800)

  function handleReveal(card: 'mvp' | 'custom') {
    if (activeCard) return
    setActiveCard(card)
    setTimeout(() => setFlipped(true), 520)
  }

  function handleBack() {
    if (!flipped) return
    setFlipped(false)
    setTimeout(() => setActiveCard(null), 900)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-28 pb-28">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 700,
          height: 300,
          background: 'radial-gradient(ellipse at center, rgba(232,255,71,0.055) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="text-center mb-20 max-w-[520px] relative z-10"
      >
        <p className="font-mono text-[10px] tracking-[0.35em] text-foreground/20 uppercase mb-5">
          // services
        </p>
        <h1 className="text-[48px] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
          What we <span className="text-accent">build</span>
        </h1>
        <p className="mt-5 text-[15px] text-foreground/38 font-sans leading-relaxed">
          From a concept to a complete product, or elevating what you already
          have — we craft digital products with precision and care.
        </p>
      </motion.div>

      {/* Cards */}
      <div
        className={`w-full max-w-[980px] relative z-10 ${
          activeCard
            ? 'flex justify-center'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch'
        }`}
      >
        <AnimatePresence mode="popLayout">

          {/* ── Card 1: Build & Handover ── */}
          {(!activeCard || activeCard === 'mvp') && (
            <motion.div
              key="mvp"
              layout
              exit={{ opacity: 0, scale: 0.88, x: -70, filter: 'blur(4px)' }}
              transition={{
                layout: { duration: 0.55, ease: EASE_OUT },
                duration: 0.35,
                ease: EASE_OUT,
              }}
              className={`h-full ${activeCard === 'mvp' ? 'w-full max-w-[490px]' : ''}`}
            >
              <div className="h-full" style={{ perspective: '1200px' }}>
                <motion.div
                  animate={{ rotateY: activeCard === 'mvp' && flipped ? 180 : 0 }}
                  transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
                  className="relative h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className="h-full"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    onMouseEnter={mvp.onMouseEnter}
                    onMouseLeave={mvp.onMouseLeave}
                  >
                    <ServiceCard delay={0.15} isActive={mvp.isActive}>
                      <div className="px-9 py-9 flex flex-col h-full">
                        <div className="flex flex-col gap-7">
                          <div>
                            <motion.p
                              animate={{ color: mvp.isActive ? ACCENT : N_LABEL }}
                              transition={ct(mvp.isActive, 0.05)}
                              className="font-mono text-[10px] tracking-[0.32em] uppercase mb-3"
                            >
                              MVP Package
                            </motion.p>
                            <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-foreground leading-tight">
                              Build &amp; Handover
                            </h2>
                            <p className="mt-2.5 text-[13px] text-foreground/38 font-sans leading-relaxed">
                              You bring the concept. We build, deploy, and hand over a
                              complete production-ready MVP — front to back, yours to keep.
                            </p>
                          </div>
                          <ul className="flex flex-col gap-2.5">
                            {mvpFeatures.map((f, i) => (
                              <li key={f} className="flex items-center gap-2.5">
                                <motion.span
                                  animate={{ color: mvp.isActive ? ACCENT : N_CHECK }}
                                  transition={ct(mvp.isActive, 0.11 + i * 0.028)}
                                  className="inline-flex shrink-0"
                                >
                                  <Check size={10} strokeWidth={3} />
                                </motion.span>
                                <span className="font-mono text-[12px] tracking-[0.025em] text-foreground/52">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto pt-7">
                          <div className="h-px bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/22 uppercase mb-1.5">
                              Starting from
                            </p>
                            <motion.p
                              animate={{ color: mvp.isActive ? ACCENT : N_PRICE_MVP }}
                              transition={ct(mvp.isActive, 0.36)}
                              className="text-[44px] font-semibold tracking-[-0.035em] leading-none"
                            >
                              $6,000
                            </motion.p>
                            <p className="mt-2 font-mono text-[11px] tracking-[0.1em] text-foreground/25">
                              complete package · full code & infrastructure handover
                            </p>
                          </div>
                          <motion.button
                            animate={{
                              backgroundColor: mvp.isActive ? ACCENT : N_CTA_BG,
                              color: mvp.isActive ? '#000000' : N_CTA_TEXT,
                              borderColor: mvp.isActive ? ACCENT : N_CTA_BORDER,
                            }}
                            transition={ct(mvp.isActive, 0.40)}
                            onClick={() => handleReveal('mvp')}
                            className="w-full flex items-center justify-center gap-2 py-[11px] rounded-xl border font-mono text-[11px] tracking-[0.18em] uppercase font-bold"
                          >
                            See what this looks like
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </div>
                    </ServiceCard>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {activeCard === 'mvp' && flipped ? (
                      <MvpCardBack onBack={handleBack} />
                    ) : (
                      <div className="surface-dark relative h-full rounded-2xl overflow-hidden">
                        <CardBg />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Card 2: Tailored Solutions ── */}
          {(!activeCard || activeCard === 'custom') && (
            <motion.div
              key="custom"
              layout
              exit={{ opacity: 0, scale: 0.88, x: 70, filter: 'blur(4px)' }}
              transition={{
                layout: { duration: 0.55, ease: EASE_OUT },
                duration: 0.35,
                ease: EASE_OUT,
              }}
              className={`h-full ${activeCard === 'custom' ? 'w-full max-w-[490px]' : ''}`}
            >
              <div className="h-full" style={{ perspective: '1200px' }}>
                <motion.div
                  animate={{ rotateY: activeCard === 'custom' && flipped ? 180 : 0 }}
                  transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
                  className="relative h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className="h-full"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    onMouseEnter={custom.onMouseEnter}
                    onMouseLeave={custom.onMouseLeave}
                  >
                    <ServiceCard delay={0.6} isActive={custom.isActive}>
                      <div className="px-9 py-9 flex flex-col h-full">
                        <div className="flex flex-col gap-7">
                          <div>
                            <motion.p
                              animate={{ color: custom.isActive ? ACCENT : N_LABEL }}
                              transition={ct(custom.isActive, 0.05)}
                              className="font-mono text-[10px] tracking-[0.32em] uppercase mb-3"
                            >
                              Custom Engagement
                            </motion.p>
                            <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-foreground leading-tight">
                              Tailored Solutions
                            </h2>
                            <p className="mt-2.5 text-[13px] text-foreground/38 font-sans leading-relaxed">
                              Already have a product? We work within your existing stack to
                              optimise, redesign, and extend — scoped entirely around you.
                            </p>
                          </div>
                          <ul className="flex flex-col gap-2.5">
                            {customFeatures.map((f, i) => (
                              <li key={f} className="flex items-center gap-2.5">
                                <motion.span
                                  animate={{ color: custom.isActive ? ACCENT : N_CHECK }}
                                  transition={ct(custom.isActive, 0.11 + i * 0.028)}
                                  className="inline-flex shrink-0"
                                >
                                  <Check size={10} strokeWidth={3} />
                                </motion.span>
                                <span className="font-mono text-[12px] tracking-[0.025em] text-foreground/52">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto pt-7">
                          <div className="h-px bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/22 uppercase mb-1.5">
                              Pricing
                            </p>
                            <motion.p
                              animate={{ color: custom.isActive ? ACCENT : N_PRICE_CUSTOM }}
                              transition={ct(custom.isActive, 0.36)}
                              className="text-[30px] font-semibold tracking-[-0.025em] leading-none"
                            >
                              Scoped to your needs
                            </motion.p>
                            <p className="mt-2 font-mono text-[11px] tracking-[0.1em] text-foreground/25">
                              every project is unique · let's scope it together
                            </p>
                          </div>
                          <motion.button
                            animate={{
                              backgroundColor: custom.isActive ? ACCENT : N_CTA_BG,
                              color: custom.isActive ? '#000000' : N_CTA_TEXT,
                              borderColor: custom.isActive ? ACCENT : N_CTA_BORDER,
                            }}
                            transition={ct(custom.isActive, 0.40)}
                            onClick={() => handleReveal('custom')}
                            className="w-full flex items-center justify-center gap-2 py-[11px] rounded-xl border font-mono text-[11px] tracking-[0.18em] uppercase"
                          >
                            See what this looks like
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </div>
                    </ServiceCard>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {activeCard === 'custom' && flipped ? (
                      <CustomCardBack onBack={handleBack} />
                    ) : (
                      <div className="surface-dark relative h-full rounded-2xl overflow-hidden"><CardBg /></div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="mt-16 font-mono text-[10px] tracking-[0.28em] text-foreground/12 uppercase relative z-10"
      >
        Not sure which fits? Just reach out.
      </motion.p>
    </div>
  )
}
