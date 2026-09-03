// Post-build prerender for the Studio 7 SPA.
//
// Vite emits a single dist/index.html shell. Crawlers and AI assistants that
// don't execute JavaScript would otherwise see the same generic page for every
// route. This script reads that shell and writes a real static HTML file per
// route with:
//   • route-specific <title>, description, canonical, Open Graph & Twitter tags
//   • JSON-LD structured data
//   • a crawlable, on-brand content shell inside #root
//
// The app still hydrates normally: main.tsx calls createRoot().render(), which
// clears #root and mounts the live React app over the prerendered content.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ROUTES, SITE, NAME, TAGLINE } from './seo-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const abs = (path) => `${SITE}${path === '/' ? '/' : path}`

// --- <head> generation ------------------------------------------------------

function head(r) {
  const url = abs(r.path)
  const t = esc(r.title)
  const d = esc(r.description)
  const img = r.ogImage
  const alt = esc(r.ogAlt)
  const jsonLd = JSON.stringify(r.jsonLd).replace(/</g, '\\u003c')

  return `<title>${t}</title>
    <meta name="description" content="${d}" />
    <meta name="author" content="${NAME}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${url}" />

    <!-- Open Graph / social sharing -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${alt}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:image:alt" content="${alt}" />

    <script type="application/ld+json">${jsonLd}</script>`
}

// --- Crawlable body shell ---------------------------------------------------
// Rendered inside #root. Visible only until React mounts (and as a graceful
// no-JS fallback). Inline styles keep it on-brand without waiting for the app
// stylesheet, and mirror the Space Grotesque dark theme.

function shell(r) {
  const navLinks = ROUTES.filter((x) => x.path !== r.path)
    .map((x) => `<a href="${x.path}" style="color:#8a8a8a;text-decoration:none">${esc(x.eyebrow)}</a>`)
    .join('<span style="color:#333"> · </span>')

  const bullets = r.bullets
    .map((b) => `<li style="margin:0 0 10px;padding-left:18px;position:relative;line-height:1.6"><span style="position:absolute;left:0;color:#e8ff47">›</span>${esc(b)}</li>`)
    .join('')

  return `<div id="prerender-shell" style="min-height:100vh;background:#040404;color:#f5f5f5;font-family:'Space Grotesk',system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:40px clamp(24px,6vw,80px)">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <a href="/" style="font-family:'Space Mono',monospace;font-size:13px;font-weight:600;letter-spacing:0.18em;color:#f5f5f5;text-decoration:none">STUDIO<span style="color:#e8ff47">7</span></a>
        <nav style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">${navLinks}</nav>
      </header>
      <main style="flex:1;display:flex;flex-direction:column;justify-content:center;max-width:760px;margin:48px 0">
        <p style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#e8ff47;margin:0 0 18px">${esc(r.eyebrow)}</p>
        <h1 style="font-size:clamp(30px,5vw,52px);line-height:1.1;font-weight:600;letter-spacing:-0.03em;margin:0 0 20px">${esc(r.h1)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#a3a3a3;margin:0 0 28px;max-width:620px">${esc(r.intro)}</p>
        <ul style="list-style:none;padding:0;margin:0;font-size:14px;color:#c4c4c4;max-width:620px">${bullets}</ul>
      </main>
      <footer style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#595959">${esc(NAME)} — ${esc(TAGLINE)} · <a href="${SITE}" style="color:#595959;text-decoration:none">studio7.software</a></footer>
    </div>`
}

// --- Emit -------------------------------------------------------------------

async function run() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  const seoRe = /<!-- SEO:START[\s\S]*?SEO:END -->/
  if (!seoRe.test(template)) {
    throw new Error('SEO marker block not found in dist/index.html — check index.html markers.')
  }
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('Empty <div id="root"></div> not found in dist/index.html.')
  }

  for (const r of ROUTES) {
    let html = template.replace(seoRe, head(r))
    html = html.replace('<div id="root"></div>', `<div id="root">${shell(r)}</div>`)

    const outDir = r.path === '/' ? DIST : join(DIST, r.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, 'index.html'), html, 'utf8')
    console.log(`  prerendered ${r.path.padEnd(12)} → ${outDir.replace(DIST, 'dist')}/index.html`)
  }

  console.log(`\n✓ Prerendered ${ROUTES.length} routes for ${SITE}`)
}

run().catch((err) => {
  console.error('✗ Prerender failed:', err)
  process.exit(1)
})
