import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 480,
          height: 200,
          background: 'radial-gradient(ellipse at center, rgba(232,255,71,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-[10px] tracking-[0.35em] text-foreground/20 uppercase mb-8 relative z-10"
      >
        // error
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        className="text-[96px] font-semibold tracking-[-0.04em] text-foreground leading-none relative z-10"
      >
        4<span className="text-accent">0</span>4
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-4 font-mono text-[11px] tracking-[0.22em] text-foreground/35 uppercase relative z-10"
      >
        This page doesn't exist
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 mt-9"
      >
        <Link
          to="/"
          className="px-5 py-[9px] rounded-full border border-foreground/[0.09] bg-foreground/[0.03] backdrop-blur-md font-mono text-[11px] tracking-[0.14em] uppercase text-foreground/65 hover:text-foreground/95 hover:border-foreground/20 hover:bg-foreground/[0.05] transition-colors duration-150"
        >
          Back home
        </Link>
      </motion.div>
    </div>
  )
}
