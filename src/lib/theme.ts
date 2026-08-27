import { useEffect, useState } from "react"

export type Theme = "dark" | "light"

/** Read the current theme (set pre-paint by the inline script in index.html). */
function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-theme") === "light") return "light"
  }
  try {
    return localStorage.getItem("theme") === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

/**
 * Manual light/dark theme. Defaults to dark (the brand look); the choice is
 * persisted to localStorage and reflected as `data-theme` on <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") root.setAttribute("data-theme", "light")
    else root.removeAttribute("data-theme") // bare :root = dark
    try {
      localStorage.setItem("theme", theme)
    } catch {
      /* storage blocked — theme still applies for this session */
    }
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"))
  return { theme, toggleTheme }
}
