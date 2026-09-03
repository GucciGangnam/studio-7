import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Take scroll into our own hands. Several routes (home, /work, /clients) are
// tall scroll-driven scenes whose section is derived from window.scrollY, so
// the browser restoring a previous scroll position on back/forward would land
// the page mid-scene (e.g. /clients opening on the wrong case study). We reset
// to the top on every navigation ourselves (see ScrollToTop).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
