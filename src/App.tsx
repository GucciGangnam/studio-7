import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Hero from './Hero'
import StyleGuide from './StyleGuide'
import Work from './pages/Work'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'

const navItems = [
  { label: 'Work',     to: '/work'     },
  { label: 'Services', to: '/services' },
  { label: 'About',    to: '/about'    },
  { label: 'Contact',  to: '/contact'  },
]

const TAB_SHADOW = '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'

const LOGO_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

function Nav() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <>
      {/* Logo — always visible */}
      <div className="fixed top-7 left-8 z-50">
        <Link
          to="/"
          className="flex items-baseline select-none"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
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

      {/* Floating nav tabs — hidden on home, cascade in on every other page */}
      {!isHome && (
        <nav className="fixed top-5 right-8 z-50 flex items-center gap-1">
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
                style={{
                  boxShadow: TAB_SHADOW,
                  animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${i * 55}ms`,
                }}
              >
                {label.toUpperCase()}
              </Link>
            )
          })}

          <div
            className="w-px h-4 bg-white/[0.08] mx-1"
            style={{ animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${navItems.length * 55}ms` }}
          />

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
            style={{
              boxShadow: TAB_SHADOW,
              animation: `nav-item-in 0.35s cubic-bezier(0.16,1,0.3,1) both ${(navItems.length + 1) * 55}ms`,
            }}
          >
            GUIDE
          </Link>
        </nav>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <Routes>
          <Route path="/"         element={<Hero />}       />
          <Route path="/work"     element={<Work />}       />
          <Route path="/services" element={<Services />}   />
          <Route path="/about"    element={<About />}      />
          <Route path="/contact"  element={<Contact />}    />
          <Route path="/guide"    element={<StyleGuide />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
