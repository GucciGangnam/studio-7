import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Hero from './Hero'
import StyleGuide from './StyleGuide'
import Work from './pages/Work'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Dev from './pages/Dev'

const navItems = [
  { label: 'Work',     to: '/work'     },
  { label: 'Services', to: '/services' },
  { label: 'Contact',  to: '/contact'  },
]

const TAB_SHADOW = '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'

const LOGO_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** Clamp a scroll position into a 0→1 progress value */
const ep = (sp: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (sp - start) / (end - start)))

/**
 * Per-item scroll-driven progress for nav entry on home page.
 * Mirrors the hero exit stagger: Contact (i=3) enters first, Work (i=0) last.
 */
const navItemP = (heroScrollP: number, i: number) =>
  ep(heroScrollP, 0.08 + (3 - i) * 0.03, 0.24 + (3 - i) * 0.03)

function Nav({ heroScrollP }: { heroScrollP: number }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [logoHovered, setLogoHovered] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openMenu = () => { setMobileMenuOpen(true); setLogoHovered(true) }
  const closeMenu = () => { setMobileMenuOpen(false); setLogoHovered(false) }

  const itemStyle = (i: number): React.CSSProperties => {
    if (!isHome) {
      return {
        boxShadow: TAB_SHADOW,
        animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${i * 55}ms`,
      }
    }
    // Scroll-driven: fade + slide down from above, matching hero exit direction
    const p = navItemP(heroScrollP, i)
    return {
      boxShadow: TAB_SHADOW,
      animation: 'none',
      opacity: p,
      transform: `translateY(${(1 - p) * -10}px)`,
      pointerEvents: p < 0.05 ? 'none' : 'auto',
    }
  }

  const auxP = ep(heroScrollP, 0.20, 0.34)
  const auxStyle: React.CSSProperties = isHome
    ? { animation: 'none', opacity: auxP, transform: `translateY(${(1 - auxP) * -10}px)`, pointerEvents: auxP < 0.05 ? 'none' : 'auto' }
    : { animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${navItems.length * 55}ms` }

  const guideP = ep(heroScrollP, 0.22, 0.36)
  const guideStyle: React.CSSProperties = isHome
    ? { boxShadow: TAB_SHADOW, animation: 'none', opacity: guideP, transform: `translateY(${(1 - guideP) * -10}px)`, pointerEvents: guideP < 0.05 ? 'none' : 'auto' }
    : { boxShadow: TAB_SHADOW, animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${(navItems.length + 1) * 55}ms` }

  return (
    <>
      {/* Logo — lifts above overlay when menu is open */}
      <div className={`fixed top-7 left-8 ${mobileMenuOpen ? 'z-[70]' : 'z-50'}`}>
        <Link
          to="/"
          className="flex items-baseline select-none"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => { if (!mobileMenuOpen) setLogoHovered(false) }}
          onClick={() => { if (mobileMenuOpen) closeMenu() }}
        >
          <span className="font-mono text-[13px] font-semibold tracking-[0.18em] text-white/90">
            S
          </span>
          {/* "TUDIO" expands on hover — same max-width + mask technique as the hero */}
          <span
            className="font-mono text-[13px] font-semibold tracking-[0.18em] text-white/90 overflow-hidden whitespace-nowrap"
            style={{
              display: 'inline-block',
              maxWidth: logoHovered ? '5em' : '0',
              '--tudio-clip': logoHovered ? '5em' : '0px',
              maskImage: 'linear-gradient(to right, black 0, black calc(var(--tudio-clip) * 0.75), transparent var(--tudio-clip))',
              WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(var(--tudio-clip) * 0.75), transparent var(--tudio-clip))',
              transition: `max-width 0.55s ${LOGO_EASE}, --tudio-clip 0.55s ${LOGO_EASE}`,
            } as React.CSSProperties}
          >
            TUDIO
          </span>
          <span
            className="font-mono text-[13px] font-semibold text-accent"
            style={{
              marginLeft: logoHovered ? '6px' : '3px',
              transition: `margin-left 0.55s ${LOGO_EASE}`,
            }}
          >
            7
          </span>
        </Link>
      </div>

      {/* Hamburger — mobile only */}
      <button
        className="sm:hidden fixed top-[18px] right-8 z-50 p-1.5 text-white/60 hover:text-white/90 transition-colors"
        onClick={openMenu}
        aria-label="Open menu"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5"
          style={{ background: 'rgba(4,4,4,0.97)', backdropFilter: 'blur(12px)', animation: 'fade-in 0.18s ease both' }}
        >
          {/* Close */}
          <button
            className="absolute top-[22px] right-8 p-1.5 text-white/35 hover:text-white/80 transition-colors"
            style={{ animation: 'fade-in 0.3s ease both 0.12s' }}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Nav links — cascading fade-up */}
          {navItems.map(({ label, to }, i) => (
            <Link
              key={to}
              to={to}
              className={[
                'px-6 py-3 border rounded-full',
                'font-mono text-[12px] tracking-[0.14em]',
                'transition-colors duration-150',
                pathname === to
                  ? 'border-white/20 bg-white/[0.06] text-white/90'
                  : 'border-white/[0.07] bg-white/[0.02] text-white/60',
              ].join(' ')}
              style={{ animation: `fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both ${55 + i * 60}ms` }}
              onClick={closeMenu}
            >
              {label.toUpperCase()}
            </Link>
          ))}

          {/* Divider */}
          <div
            className="w-6 h-px bg-white/[0.08]"
            style={{ animation: `fade-in 0.4s ease both ${55 + navItems.length * 60 - 30}ms` }}
          />

          {/* Guide */}
          <Link
            to="/guide"
            className={[
              'px-6 py-3 border rounded-full',
              'font-mono text-[12px] tracking-[0.14em]',
              'transition-colors duration-150',
              pathname === '/guide'
                ? 'border-accent/40 bg-accent/[0.06] text-accent/80'
                : 'border-white/[0.07] bg-white/[0.02] text-white/40',
            ].join(' ')}
            style={{ animation: `fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both ${55 + navItems.length * 60}ms` }}
            onClick={closeMenu}
          >
            GUIDE
          </Link>
        </div>
      )}

      {/* Floating nav tabs — hidden on mobile */}
      <nav className="hidden sm:flex fixed top-5 right-8 z-50 items-center gap-1">
        {navItems.map(({ label, to }, i) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={[
                'px-3.5 py-[7px] border rounded-full',
                'font-mono text-[11px] tracking-[0.14em]',
                'transition-colors duration-150',
                active
                  ? 'border-white/20 bg-white/[0.06] text-white/90'
                  : 'border-white/[0.07] bg-white/[0.02] backdrop-blur-md text-white/65 hover:text-white/95 hover:border-white/20 hover:bg-white/[0.04]',
              ].join(' ')}
              style={itemStyle(i)}
            >
              {label.toUpperCase()}
            </Link>
          )
        })}

        <div className="w-px h-4 bg-white/[0.08] mx-1" style={auxStyle} />

        <Link
          to="/guide"
          className={[
            'px-3.5 py-[7px] border rounded-full',
            'font-mono text-[11px] tracking-[0.14em]',
            'transition-colors duration-150',
            pathname === '/guide'
              ? 'border-accent/40 bg-accent/[0.06] text-accent/80'
              : 'border-white/[0.07] bg-white/[0.02] backdrop-blur-md text-white/45 hover:text-white/70 hover:border-white/15',
          ].join(' ')}
          style={guideStyle}
        >
          GUIDE
        </Link>
      </nav>
    </>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppInner() {
  const [heroScrollP, setHeroScrollP] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <ScrollToTop />
      <Nav heroScrollP={heroScrollP} />
      <Routes>
        <Route path="/"         element={<Hero onScrollChange={setHeroScrollP} />} />
        <Route path="/work"     element={<Work />}       />
        <Route path="/services" element={<Services />}   />
        <Route path="/contact"  element={<Contact />}    />
        <Route path="/guide"    element={<StyleGuide />} />
        <Route path="/dev"      element={<Dev />}        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
