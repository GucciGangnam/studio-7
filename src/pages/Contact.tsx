import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_FLIP = [0.4, 0, 0.2, 1] as const

// Full logo — TUDIO expands after the card entry
function CardLogo() {
  return (
    <div className="flex items-baseline select-none">
      <span className="font-mono text-[13px] font-semibold tracking-[0.18em] text-white/80">S</span>
      <motion.span
        initial={{ maxWidth: 0 }}
        animate={{ maxWidth: '5em' }}
        transition={{ delay: 0.85, duration: 0.55, ease: EASE_OUT }}
        className="font-mono text-[13px] font-semibold tracking-[0.18em] text-white/80 overflow-hidden whitespace-nowrap inline-block"
        style={{ maskImage: 'linear-gradient(to right, black 0, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 0, black 80%, transparent 100%)' }}
      >
        TUDIO
      </motion.span>
      <motion.span
        initial={{ marginLeft: '3px' }}
        animate={{ marginLeft: '6px' }}
        transition={{ delay: 0.85, duration: 0.55, ease: EASE_OUT }}
        className="font-mono text-[13px] font-semibold text-accent"
      >
        7
      </motion.span>
    </div>
  )
}

function ContactRow({ icon, value }: { icon: 'mail' | 'phone'; value: string }) {
  const Icon = icon === 'mail' ? Mail : Phone
  return (
    <div className="flex items-center gap-2">
      <Icon size={11} className="text-accent shrink-0" />
      <span className="font-mono text-[12px] tracking-[0.04em] text-white/40">{value}</span>
    </div>
  )
}

// Shared card shell (background, lines, texture)
function CardShell({ hasError = false }: { hasError?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#161616] via-[#0f0f0f] to-[#080808] border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.5)]" />
      {/* Top border line — cross-fades between accent and destructive */}
      <div className="absolute top-0 left-12 right-12 h-px">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/55 to-transparent"
          animate={{ opacity: hasError ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4a4a]/70 to-transparent"
          animate={{ opacity: hasError ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="absolute bottom-0 left-20 right-20 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
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

// Tapered comet that travels the card border once on mount, then disappears
function CardBeam() {
  const perim = 1461 // perimeter of 480×264 rect with rx=16
  const dash = 80   // comet tail length

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 480 264"
      fill="none"
      style={{ zIndex: 2 }}
    >
      <defs>
        <filter id="beam-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.rect
        x="1" y="1" width="478" height="262" rx="16" ry="16"
        stroke="#e8ff47"
        strokeOpacity={0.6}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${perim - dash}`}
        filter="url(#beam-glow)"
        initial={{ strokeDashoffset: -223, opacity: 0 }}
        animate={{ strokeDashoffset: -(223 + perim), opacity: [0, 1, 1, 0] }}
        transition={{
          strokeDashoffset: { duration: 0.8, delay: 0.9, ease: 'linear' },
          opacity: { duration: 0.8, delay: 0.9, times: [0, 0.05, 0.9, 1] },
        }}
      />
    </motion.svg>
  )
}

const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-[13px] font-sans text-white/85 placeholder:text-white/22 outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-colors duration-150'

const inputErrCls =
  'w-full bg-[#ff4a4a]/[0.04] border border-[#ff4a4a]/50 rounded-lg px-3.5 py-2 text-[13px] font-sans text-white/85 placeholder:text-[#ff4a4a]/40 outline-none focus:border-[#ff4a4a]/70 transition-colors duration-150'

type Errors = { name: boolean; email: boolean; message: boolean }

export default function Contact() {
  const [flipped, setFlipped] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({ name: false, email: false, message: false })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)

  // After the flip animation finishes (~650ms), expand the form
  useEffect(() => {
    if (!flipped) { setExpanded(false); return }
    const t = setTimeout(() => setExpanded(true), 700)
    return () => clearTimeout(t)
  }, [flipped])

  const hasAnyError = errors.name || errors.email || errors.message

  async function handleSend() {
    const newErrors: Errors = {
      name: !name.trim(),
      email: !email.trim(),
      message: !message.trim(),
    }
    setErrors(newErrors)
    if (newErrors.name || newErrors.email || newErrors.message) return

    setSending(true)
    setSendError(false)
    const { error } = await supabase
      .from('contacts')
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() })
    setSending(false)

    if (error) {
      setSendError(true)
      return
    }
    setSubmitted(true)
  }

  function handleBack() {
    setFlipped(false)
    // Reset form state when going back
    setName('')
    setEmail('')
    setMessage('')
    setErrors({ name: false, email: false, message: false })
    setSubmitted(false)
    setSendError(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 480,
          height: 200,
          background: 'radial-gradient(ellipse at center, rgba(232,255,71,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="font-mono text-[10px] tracking-[0.35em] text-white/20 uppercase mb-10 relative z-10"
      >
        // contact
      </motion.p>

      {/* Perspective wrapper — owns the animated height */}
      <motion.div
        style={{ perspective: '1100px' }}
        className="relative z-10 w-[480px] max-w-[90vw] h-[264px]"
        animate={{ height: expanded ? 340 : 264 }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
      >
        <motion.div
          initial={{ rotateY: -90, opacity: 0, scale: 0.96 }}
          animate={{ rotateY: flipped ? 180 : 0, opacity: 1, scale: 1 }}
          transition={
            flipped
              ? { duration: 0.65, ease: EASE_FLIP }
              : { duration: 0.8, ease: EASE_OUT, delay: 0.1 }
          }
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* ─── FRONT FACE ─── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardShell />
            <CardBeam />
            <div className="relative px-10 py-8 h-full flex flex-col justify-between">
              {/* Top row: name + tagline LEFT | logo RIGHT */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: EASE_OUT }}
                className="flex items-start justify-between"
              >
                <div>
                  <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-white leading-none">
                    Studio 7
                  </h1>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.22em] text-white/28 uppercase">
                    Design · Develop · Deploy
                  </p>
                </div>
                <CardLogo />
              </motion.div>

              {/* Bottom row: contact LEFT | CTA circle RIGHT */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.45 }}
                className="flex items-end justify-between"
              >
                <div className="flex flex-col gap-2">
                  <ContactRow icon="mail" value="hello@studio7.co" />
                  <ContactRow icon="phone" value="+1 (000) 000-0000" />
                </div>

                {/* CTA arrow */}
                <button
                  onClick={() => setFlipped(true)}
                  className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0 hover:scale-110 active:scale-95 transition-transform duration-150"
                  aria-label="Open contact form"
                >
                  <ArrowRight size={16} className="text-black" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* ─── BACK FACE ─── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CardShell hasError={hasAnyError} />
            <div className="relative px-10 py-7 h-full flex flex-col">
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="flex-1 flex flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
                    >
                      <CheckCircle size={42} className="text-accent" strokeWidth={1.5} />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="font-mono text-[11px] tracking-[0.22em] text-white/45 uppercase text-center"
                    >
                      Thank you for contacting us
                    </motion.p>
                  </motion.div>
                ) : (
                  /* ── Form state ── */
                  <motion.div
                    key="form"
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2.5 flex-1"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-mono text-[10px] tracking-[0.28em] text-white/30 uppercase">
                        Say hello
                      </p>
                      <button
                        onClick={handleBack}
                        className="w-7 h-7 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                        aria-label="Back to card"
                      >
                        <ArrowLeft size={12} className="text-white/45" />
                      </button>
                    </div>

                    {/* Name */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => {
                          setName(e.target.value)
                          if (errors.name && e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }))
                        }}
                        className={errors.name ? inputErrCls : inputCls}
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.1em] text-[#ff4a4a]/70 uppercase pointer-events-none"
                          >
                            required
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Email or phone"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value)
                          if (errors.email && e.target.value.trim()) setErrors(prev => ({ ...prev, email: false }))
                        }}
                        className={errors.email ? inputErrCls : inputCls}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.1em] text-[#ff4a4a]/70 uppercase pointer-events-none"
                          >
                            required
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <motion.textarea
                        placeholder="Message"
                        value={message}
                        onChange={e => {
                          setMessage(e.target.value)
                          if (errors.message && e.target.value.trim()) setErrors(prev => ({ ...prev, message: false }))
                        }}
                        className={`${errors.message ? inputErrCls : inputCls} resize-none overflow-hidden`}
                        initial={{ height: 54 }}
                        animate={{ height: expanded ? 108 : 54 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.1em] text-[#ff4a4a]/70 uppercase pointer-events-none"
                          >
                            required
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Send */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full py-[9px] rounded-lg bg-accent text-black font-mono text-[11px] tracking-[0.18em] uppercase font-bold hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Sending…' : 'Send'}
                      </button>
                      <AnimatePresence>
                        {sendError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-mono text-[9px] tracking-[0.12em] text-[#ff4a4a]/70 uppercase text-center"
                          >
                            Something went wrong — please try again
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-12 font-mono text-[10px] tracking-[0.22em] text-grey-500 uppercase relative z-10"
      >
        We'd love to hear from you
      </motion.p>
    </div>
  )
}
