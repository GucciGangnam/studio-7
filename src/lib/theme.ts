import { useEffect, useState } from "react"

export type Theme = "dark" | "light"

/** The user's stored choice, or null if they've never picked one. */
function storedTheme(): Theme | null {
  try {
    const t = localStorage.getItem("theme")
    return t === "light" || t === "dark" ? t : null
  } catch {
    return null
  }
}

/** True if the OS currently prefers a light UI. */
function systemPrefersLight(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  )
}

/**
 * Initial theme (mirrors the pre-paint script in index.html): the saved choice
 * wins; with no saved choice, follow the OS preference — default dark.
 */
function getInitialTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light") {
    return "light"
  }
  return storedTheme() ?? (systemPrefersLight() ? "light" : "dark")
}

/**
 * Light/dark theme. With no saved choice it follows the OS preference (and keeps
 * tracking live OS changes); the first manual toggle persists to localStorage and
 * from then on wins over the OS. Reflected as `data-theme` on <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Reflect to <html>. Deliberately does NOT persist — persisting only happens on
  // an explicit toggle, so an unchosen theme keeps following the OS.
  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") root.setAttribute("data-theme", "light")
    else root.removeAttribute("data-theme") // bare :root = dark
  }, [theme])

  // Follow the OS while the user hasn't made an explicit choice.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = (e: MediaQueryListEvent) => {
      if (storedTheme()) return // user has chosen — stop tracking the OS
      setTheme(e.matches ? "light" : "dark")
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const toggleTheme = () =>
    setTheme(t => {
      const next: Theme = t === "light" ? "dark" : "light"
      try {
        localStorage.setItem("theme", next) // explicit choice — now wins over the OS
      } catch {
        /* storage blocked — choice still applies for this session */
      }
      return next
    })

  return { theme, toggleTheme }
}
