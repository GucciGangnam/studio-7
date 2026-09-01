import { useEffect, useState } from 'react'
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react'

/**
 * Bottom navigation bar (interactive + animated).
 *
 * An Instagram/Facebook-style tab bar spanning the full grid width. A lime
 * highlight slides between the five tabs; the active tab auto-advances on a loop
 * so it's always moving, and you can also click a tab to jump the highlight.
 */

const ITEMS = [
  { Icon: Home, label: 'Home' },
  { Icon: Search, label: 'Search' },
  { Icon: PlusSquare, label: 'Create' },
  { Icon: Heart, label: 'Activity' },
  { Icon: User, label: 'Profile' },
]

export function BottomNav() {
  const [active, setActive] = useState(0)

  // Auto-advance the active tab so the highlight is always in motion.
  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % ITEMS.length), 1900)
    return () => clearInterval(id)
  }, [])

  const pct = 100 / ITEMS.length

  return (
    <div
      className="relative flex h-full w-full select-none items-center rounded-[32px] bg-[#242424] px-3"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <div className="relative flex w-full">
        {/* Sliding highlight */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 px-2"
          style={{
            left: `${active * pct}%`,
            width: `${pct}%`,
            height: 86,
            transition: 'left 0.45s cubic-bezier(0.34, 1.4, 0.5, 1)',
          }}
        >
          <div
            className="h-full w-full rounded-3xl"
            style={{
              background: 'rgba(232,255,71,0.12)',
              boxShadow: 'inset 0 0 0 1px rgba(232,255,71,0.3)',
            }}
          />
        </div>

        {ITEMS.map(({ Icon, label }, i) => {
          const on = active === i
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-current={on}
              onClick={() => setActive(i)}
              className="relative z-10 flex flex-1 flex-col items-center gap-1.5 py-4 outline-none"
            >
              <Icon
                size={30}
                strokeWidth={2}
                className="transition-colors duration-300"
                style={{
                  color: on ? '#e8ff47' : '#7c7c7c',
                  filter: on ? 'drop-shadow(0 0 6px rgba(232,255,71,0.5))' : 'none',
                }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300"
                style={{ color: on ? '#e8ff47' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
