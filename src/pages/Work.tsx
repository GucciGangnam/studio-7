import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles,
  Layout,
  Server,
  Database,
  Zap,
  Palette,
  Globe,
  ShieldCheck,
  LineChart,
  Wifi,
  Battery,
  Signal,
  ArrowLeft,
  RotateCcw,
  Share2,
  Monitor,
  Smartphone,
  Terminal,
  CreditCard,
  MessageSquare,
  Users,
  Settings,
  Bot,
  Headphones,
  Lock,
  Check,
  Fingerprint,
  KeyRound,
  FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dock, DockIcon } from "@/components/ui/dock"

// ─── Dock config (unchanged) ──────────────────────────────────────────────────

type Category =
  | "animations"
  | "frontend"
  | "backend"
  | "database"
  | "features"
  | "design"
  | "integrations"
  | "security"
  | "analytics"

interface NavItem {
  id: Category
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "animations", icon: Sparkles, label: "Animations" },
  { id: "frontend",   icon: Layout,   label: "Frontend"   },
  { id: "backend",    icon: Server,   label: "Backend"    },
  { id: "database",   icon: Database, label: "Database"   },
  { id: "features",   icon: Zap,      label: "Features"   },
]

const EXTRA_ITEMS: NavItem[] = [
  { id: "design",       icon: Palette,     label: "Design"       },
  { id: "integrations", icon: Globe,       label: "Integrations" },
  { id: "security",     icon: ShieldCheck, label: "Security"     },
  { id: "analytics",    icon: LineChart,   label: "Analytics"    },
]

// ─── CSS injected for skeleton UI with container queries ─────────────────────

const MOCK_CSS = `
  @keyframes sk-sweep {
    0%   { background-position: -400% 0; }
    100% { background-position:  400% 0; }
  }

  /* skeleton block — shimmer */
  .sk {
    background: linear-gradient(90deg, #313131 25%, #3c3c3c 50%, #313131 75%);
    background-size: 400% 100%;
    animation: sk-sweep 5.5s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
  }
  /* active / accent variant */
  .sk-a {
    background: linear-gradient(90deg, #1e2408 25%, #2a3010 50%, #1e2408 75%);
    background-size: 400% 100%;
    animation: sk-sweep 5.5s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
  }

  /* ── ROOT ── */
  .mcr {
    container-type: inline-size;
    container-name: mock;
    height: 100%;
    overflow: hidden;
    background: #1e1e1e;
    display: flex;
    flex-direction: column;
  }

  /* ── TOP NAV ── */
  .mc-nav {
    background: #232323;
    border-bottom: 1px solid #2f2f2f;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    height: 42px;
    flex-shrink: 0;
  }
  .mc-burger {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-left: auto;
  }
  .mc-burger span {
    display: block;
    width: 14px;
    height: 1.5px;
    background: #454545;
    border-radius: 1px;
  }
  .mc-nav-links { display: none; }
  .mc-nav-pill  { display: none; }

  @container mock (min-width: 480px) {
    .mc-burger    { display: none; }
    .mc-nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: center;
    }
    .mc-nav-pill {
      display: block;
      margin-left: auto;
    }
  }

  /* ── BODY ── */
  .mc-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* ── SIDEBAR (desktop only) ── */
  .mc-sidebar {
    display: none;
  }

  @container mock (min-width: 480px) {
    .mc-sidebar {
      display: flex;
      flex-direction: column;
      width: 164px;
      flex-shrink: 0;
      background: #212121;
      border-right: 1px solid #2d2d2d;
      padding: 12px 10px;
      gap: 3px;
      overflow: hidden;
    }
  }

  .mc-sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border-radius: 6px;
  }
  .mc-sidebar-item.active {
    background: rgba(232,255,71,0.05);
    border: 1px solid rgba(232,255,71,0.08);
  }
  .mc-sidebar-divider {
    height: 1px;
    background: #2d2d2d;
    margin: 6px 8px;
    flex-shrink: 0;
  }

  /* ── MAIN ── */
  .mc-main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  @container mock (min-width: 480px) {
    .mc-main { padding: 14px 16px; gap: 12px; }
  }

  /* search bar */
  .mc-search {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── LIST (mobile) ── */
  .mc-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mc-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #262626;
    border: 1px solid #2f2f2f;
    border-radius: 8px;
  }
  .mc-list-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  /* ── GRID (desktop) ── */
  .mc-grid {
    display: none;
  }
  .mc-card {
    background: #262626;
    border: 1px solid #2f2f2f;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .mc-card-lines {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  @container mock (min-width: 480px) {
    .mc-list { display: none; }
    .mc-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }

  /* ── BOTTOM TAB NAV (mobile only) ── */
  .mc-tabs {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: #232323;
    border-top: 1px solid #2f2f2f;
    padding: 8px 0 10px;
    flex-shrink: 0;
  }
  .mc-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  @container mock (min-width: 480px) {
    .mc-tabs { display: none; }
  }
`

// ─── Skeleton mock content ────────────────────────────────────────────────────

// widths for nav skeleton pills
const NAV_LINK_WIDTHS = [28, 34, 26]
// sidebar items: [iconSize, labelWidth, isActive]
const SIDEBAR_PRIMARY   = [[14, 58, true], [14, 46], [14, 54], [14, 40], [14, 50]]
const SIDEBAR_SECONDARY = [[14, 42], [14, 52], [14, 36]]
// list rows: [avatarSize, line1%, line2%]
const LIST_ROWS = [[32, 58, 42], [32, 72, 50], [32, 48, 66], [32, 64, 38], [32, 54, 58]]
// grid cards: [banner h, title%, desc1%, desc2%]
const GRID_CARDS = [
  [52, 65, 85, 55], [52, 72, 78, 60],
  [52, 58, 90, 48], [52, 68, 72, 64],
  [52, 62, 82, 52], [52, 75, 68, 58],
]

function MockSiteContent() {
  return (
    <>
      <style>{MOCK_CSS}</style>
      <div className="mcr">

        {/* ── Top nav ── */}
        <div className="mc-nav">
          {/* logo block */}
          <div className="sk" style={{ width: 48, height: 9 }} />
          {/* burger (mobile) */}
          <div className="mc-burger"><span/><span/><span/></div>
          {/* nav links (desktop) */}
          <div className="mc-nav-links">
            {NAV_LINK_WIDTHS.map((w, i) => (
              <div key={i} className="sk" style={{ width: w, height: 7 }} />
            ))}
          </div>
          {/* cta pill (desktop) */}
          <div className="mc-nav-pill sk" style={{ width: 62, height: 22, borderRadius: 5 }} />
        </div>

        {/* ── Body ── */}
        <div className="mc-body">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="mc-sidebar">
            {(SIDEBAR_PRIMARY as number[][]).map(([, w, active], i) => (
              <div key={i} className={`mc-sidebar-item${active ? " active" : ""}`}>
                <div className={active ? "sk-a" : "sk"} style={{ width: 14, height: 14, borderRadius: 3 }} />
                <div className={active ? "sk-a" : "sk"} style={{ width: w, height: 7 }} />
              </div>
            ))}
            <div className="mc-sidebar-divider" />
            {(SIDEBAR_SECONDARY as number[][]).map(([, w], i) => (
              <div key={i} className="mc-sidebar-item">
                <div className="sk" style={{ width: 14, height: 14, borderRadius: 3 }} />
                <div className="sk" style={{ width: w, height: 7 }} />
              </div>
            ))}
          </aside>

          {/* ── Main ── */}
          <main className="mc-main">
            {/* search bar */}
            <div className="mc-search">
              <div className="sk" style={{ flex: 1, height: 26, borderRadius: 6 }} />
              <div className="sk" style={{ width: 26, height: 26, borderRadius: 6 }} />
            </div>

            {/* LIST — mobile */}
            <div className="mc-list">
              {LIST_ROWS.map(([av, l1, l2], i) => (
                <div key={i} className="mc-list-item">
                  <div className="sk" style={{ width: av, height: av, borderRadius: "50%" }} />
                  <div className="mc-list-text">
                    <div className="sk" style={{ width: `${l1}%`, height: 8 }} />
                    <div className="sk" style={{ width: `${l2}%`, height: 7 }} />
                  </div>
                  <div className="sk" style={{ width: 20, height: 7, borderRadius: 3 }} />
                </div>
              ))}
            </div>

            {/* GRID — desktop */}
            <div className="mc-grid">
              {GRID_CARDS.map(([bh, t, d1, d2], i) => (
                <div key={i} className="mc-card">
                  <div className="sk" style={{ width: "100%", height: bh, borderRadius: 5 }} />
                  <div className="mc-card-lines">
                    <div className="sk" style={{ width: `${t}%`, height: 9 }} />
                    <div className="sk" style={{ width: `${d1}%`, height: 7 }} />
                    <div className="sk" style={{ width: `${d2}%`, height: 7 }} />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* ── Bottom tabs (mobile only) ── */}
        <div className="mc-tabs">
          {[18, 18, 18, 18].map((s, i) => (
            <div key={i} className="mc-tab">
              <div className="sk" style={{ width: s, height: s, borderRadius: 4 }} />
              <div className="sk" style={{ width: 22, height: 5, borderRadius: 3 }} />
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

// ─── Phone status bar chrome ──────────────────────────────────────────────────

function PhoneChrome() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  )
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
    , 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 22px 6px",
      color: "#f5f5f5",
    }}>
      <span style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600 }}>{time}</span>
      {/* Dynamic island */}
      <div style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: 88,
        height: 26,
        background: "#151515",
        borderRadius: 14,
      }} />
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <Signal size={11} />
        <Wifi size={11} />
        <Battery size={11} />
      </div>
    </div>
  )
}

// ─── Browser chrome ───────────────────────────────────────────────────────────

function BrowserChrome() {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 14px",
    }}>
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {["#ff5f57","#ffbd2e","#28c840"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>

      {/* URL bar */}
      <div style={{
        flex: 1,
        height: 26,
        background: "#232323",
        borderRadius: 6,
        border: "1px solid #454545",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 7,
        overflow: "hidden",
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
        <span style={{
          fontFamily: "Space Mono",
          fontSize: 10,
          color: "#7c7c7c",
          whiteSpace: "nowrap",
        }}>
          studio7.design
        </span>
      </div>

      {/* Browser actions */}
      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <ArrowLeft size={12} color="#6a6a6a" />
        <RotateCcw size={12} color="#6a6a6a" />
        <Share2 size={12} color="#6a6a6a" />
      </div>
    </div>
  )
}

// ─── App chrome (internal tools) ─────────────────────────────────────────────

function AppChrome() {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      position: "relative",
    }}>
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {["#ff5f57","#ffbd2e","#28c840"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>

      {/* App title — centred */}
      <div style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}>
        <div style={{
          width: 14, height: 14,
          background: "#e8ff47",
          borderRadius: 3,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{ width: 6, height: 6, background: "#1e1e1e", borderRadius: 1 }} />
        </div>
        <span style={{
          fontFamily: "Space Grotesk",
          fontSize: 12,
          fontWeight: 600,
          color: "#999",
          letterSpacing: "0.02em",
        }}>
          Studio OS
        </span>
      </div>

      {/* Toolbar icons (right) */}
      <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
        {[14, 14, 14].map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, background: "#333333", borderRadius: 3 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Internal dashboard mock ──────────────────────────────────────────────────

const MOCK_APP_CSS = `
  @keyframes sk-sweep {
    0%   { background-position: -400% 0; }
    100% { background-position:  400% 0; }
  }
  .sk {
    background: linear-gradient(90deg, #313131 25%, #3c3c3c 50%, #313131 75%);
    background-size: 400% 100%;
    animation: sk-sweep 5.5s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .sk-a {
    background: linear-gradient(90deg, #1e2408 25%, #2a3010 50%, #1e2408 75%);
    background-size: 400% 100%;
    animation: sk-sweep 5.5s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .mca {
    height: 100%;
    overflow: hidden;
    background: #1e1e1e;
    display: flex;
  }

  .mca-nav {
    width: 148px;
    flex-shrink: 0;
    background: #212121;
    border-right: 1px solid #2d2d2d;
    display: flex;
    flex-direction: column;
    padding: 10px 8px;
    gap: 2px;
    overflow: hidden;
  }

  .mca-section-label {
    font-size: 7px;
    letter-spacing: 0.18em;
    color: #3f3f3f;
    padding: 8px 8px 3px;
    font-family: Space Mono, monospace;
    text-transform: uppercase;
  }

  .mca-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border-radius: 5px;
  }

  .mca-item.active {
    background: rgba(232,255,71,0.05);
    border: 1px solid rgba(232,255,71,0.08);
  }

  .mca-divider {
    height: 1px;
    background: #2d2d2d;
    margin: 5px 8px;
    flex-shrink: 0;
  }

  .mca-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
    overflow: hidden;
    min-width: 0;
  }

  .mca-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .mca-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    flex-shrink: 0;
  }

  .mca-kpi {
    background: #262626;
    border: 1px solid #2f2f2f;
    border-radius: 7px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mca-chart {
    background: #262626;
    border: 1px solid #2f2f2f;
    border-radius: 7px;
    padding: 10px 12px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mca-chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 36px;
  }

  .mca-bar {
    flex: 1;
    border-radius: 2px 2px 0 0;
  }

  .mca-table {
    flex: 1;
    background: #262626;
    border: 1px solid #2f2f2f;
    border-radius: 7px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .mca-thead {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border-bottom: 1px solid #2f2f2f;
    background: #212121;
    flex-shrink: 0;
  }

  .mca-trow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-bottom: 1px solid #292929;
    flex-shrink: 0;
  }
`

const APP_NAV_ITEMS   = [{ w: 52, active: true }, { w: 40 }, { w: 48 }, { w: 44 }]
const APP_NAV_SECOND  = [{ w: 38 }, { w: 44 }]
const KPI_CARDS       = [{ val: 36, label: 60, trend: 22 }, { val: 44, label: 56, trend: 26 }, { val: 38, label: 64, trend: 20 }, { val: 52, label: 52, trend: 30 }]
const CHART_BARS      = [40, 62, 55, 78, 70, 88, 58, 72, 45, 84, 52, 92, 66, 74]
const APP_TABLE_ROWS  = [[62, 30, 42, 26], [52, 24, 38, 22], [70, 34, 44, 28], [58, 28, 36, 24], [64, 32, 40, 26]]

function MockAppContent() {
  return (
    <>
      <style>{MOCK_APP_CSS}</style>
      <div className="mca">
        <nav className="mca-nav">
          <div className="mca-section-label">Workspace</div>
          {APP_NAV_ITEMS.map(({ w, active }, i) => (
            <div key={i} className={`mca-item${active ? " active" : ""}`}>
              <div className={active ? "sk-a" : "sk"} style={{ width: 12, height: 12, borderRadius: 3 }} />
              <div className={active ? "sk-a" : "sk"} style={{ width: w, height: 7 }} />
            </div>
          ))}
          <div className="mca-divider" />
          <div className="mca-section-label">System</div>
          {APP_NAV_SECOND.map(({ w }, i) => (
            <div key={i} className="mca-item">
              <div className="sk" style={{ width: 12, height: 12, borderRadius: 3 }} />
              <div className="sk" style={{ width: w, height: 7 }} />
            </div>
          ))}
        </nav>

        <main className="mca-main">
          {/* Toolbar */}
          <div className="mca-toolbar">
            <div className="sk" style={{ flex: 1, height: 24, borderRadius: 5 }} />
            <div className="sk" style={{ width: 60, height: 24, borderRadius: 5 }} />
            <div className="sk-a" style={{ width: 60, height: 24, borderRadius: 5 }} />
          </div>

          {/* KPI row */}
          <div className="mca-kpis">
            {KPI_CARDS.map(({ val, label, trend }, i) => (
              <div key={i} className="mca-kpi">
                <div className="sk" style={{ width: `${label}%`, height: 6 }} />
                <div className="sk" style={{ width: `${val}%`, height: 13 }} />
                <div className="sk" style={{ width: `${trend}%`, height: 5 }} />
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="mca-chart">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="sk" style={{ width: 70, height: 7 }} />
              <div className="sk" style={{ width: 40, height: 7 }} />
            </div>
            <div className="mca-chart-bars">
              {CHART_BARS.map((h, i) => (
                <div key={i} className="mca-bar" style={{
                  height: `${h}%`,
                  background: h >= 88 ? "rgba(232,255,71,0.4)" : "#333333",
                }} />
              ))}
            </div>
          </div>

          {/* Data table */}
          <div className="mca-table">
            <div className="mca-thead">
              <div className="sk" style={{ width: 8, height: 8, borderRadius: 1 }} />
              <div className="sk" style={{ width: "28%", height: 7 }} />
              <div className="sk" style={{ width: "18%", height: 7 }} />
              <div className="sk" style={{ width: "18%", height: 7, marginLeft: "auto" }} />
              <div className="sk" style={{ width: "12%", height: 7 }} />
            </div>
            {APP_TABLE_ROWS.map(([name, status, date, amt], i) => (
              <div key={i} className="mca-trow">
                <div className="sk" style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0 }} />
                <div className="sk" style={{ width: `${name}%`, height: 7 }} />
                <div className="sk" style={{ width: `${status}%`, height: 16, borderRadius: 8, marginLeft: "auto" }} />
                <div className="sk" style={{ width: `${date}%`, height: 7 }} />
                <div className="sk" style={{ width: `${amt}%`, height: 7 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}

// ─── demo scaling ─────────────────────────────────────────────────────────────
// The Frontend / Backend / Analytics demos are laid out at a fixed natural size
// and scaled down to fit. On a tall viewport we reserve DEMO_CHROME for the
// section header, copy and dock so the whole demo lands on one screen.
//
// On a SHORT viewport — a phone in landscape, or a desktop browser window that
// only uses part of the screen height — that reserve leaves almost nothing
// behind and collapses the demo to an illegible thumbnail. So the height budget
// is floored at DEMO_MIN_H: below ~780px tall we stop trying to fit everything
// on one screen, keep the demo readable, and let the page scroll instead.
const DEMO_CHROME = 350
const DEMO_MIN_H = 430

const demoScale = (naturalW: number, naturalH: number) => {
  if (typeof window === "undefined") return 1
  const budgetH = Math.max(window.innerHeight - DEMO_CHROME, DEMO_MIN_H)
  return Math.min(1, (window.innerWidth - 48) / naturalW, budgetH / naturalH)
}

function useDemoScale(naturalW: number, naturalH: number) {
  const [scale, setScale] = useState(() => demoScale(naturalW, naturalH))
  useEffect(() => {
    const recalc = () => setScale(demoScale(naturalW, naturalH))
    window.addEventListener("resize", recalc)
    window.addEventListener("orientationchange", recalc)
    return () => {
      window.removeEventListener("resize", recalc)
      window.removeEventListener("orientationchange", recalc)
    }
  }, [naturalW, naturalH])
  return scale
}

// ─── Phone-to-Desktop demo ────────────────────────────────────────────────────

const EASING = [0.4, 0, 0.2, 1] as const
const DURATION = 1.05

const phoneFrame   = { width: 280, height: 560, borderRadius: 44 }
const desktopFrame = { width: 800, height: 490, borderRadius: 10 }

const phoneScreen   = { left: 4, right: 4, bottom: 18, borderRadius: 38 }
const desktopScreen = { left: 0, right: 0, bottom: 0,  borderRadius: 0  }

// Natural dimensions of the demo content (label + gap + frame)
const DEMO_W = 840
const DEMO_H = 610

type DemoPhase = "mobile" | "web" | "internal"

function PhoneToDesktopDemo() {
  const [phase, setPhase] = useState<DemoPhase>("mobile")
  const scale = useDemoScale(DEMO_W, DEMO_H)

  // initial delay before first transition
  useEffect(() => {
    const first = setTimeout(() => setPhase("web"), 1600)
    return () => clearTimeout(first)
  }, [])

  // cycle: mobile → web → internal → mobile → …
  useEffect(() => {
    const holdMs: Record<DemoPhase, number> = { mobile: 2200, web: 2800, internal: 2600 }
    const next:   Record<DemoPhase, DemoPhase> = { mobile: "web", web: "internal", internal: "mobile" }
    const t = setTimeout(() => setPhase(p => next[p]), holdMs[phase])
    return () => clearTimeout(t)
  }, [phase])

  const isDesktop = phase !== "mobile"

  return (
    <div style={{ width: DEMO_W * scale, height: DEMO_H * scale }}>
    <div style={{ width: DEMO_W, transformOrigin: "top left", transform: `scale(${scale})` }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <p style={{
          fontFamily: "Space Mono",
          fontSize: 10,
          color: "#595959",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Responsive by design
        </p>
        <div style={{ width: 1, height: 10, background: "#3f3f3f" }} />
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "Space Mono",
              fontSize: 10,
              color: "var(--accent-label)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {phase === "mobile"   ? <><Smartphone size={11} /> Mobile</>
           : phase === "web"      ? <><Monitor size={11} /> Web</>
           :                        <><Terminal size={11} /> Internal</>}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Device frame wrapper */}
      <div style={{ position: "relative" }}>

        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          inset: -40,
          background: "radial-gradient(ellipse at 50% 50%, rgba(232,255,71,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Phone side buttons — fade out on desktop */}
        <AnimatePresence>
          {!isDesktop && (
            <motion.div
              key="side-btns"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ position: "absolute", right: -3, top: 110, width: 3, height: 38, background: "#333333", borderRadius: "0 2px 2px 0" }} />
              <div style={{ position: "absolute", left: -3, top: 88,  width: 3, height: 26, background: "#333333", borderRadius: "2px 0 0 2px" }} />
              <div style={{ position: "absolute", left: -3, top: 122, width: 3, height: 26, background: "#333333", borderRadius: "2px 0 0 2px" }} />
              <div style={{ position: "absolute", left: -3, top: 62,  width: 3, height: 18, background: "#333333", borderRadius: "2px 0 0 2px" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main morphing frame ── */}
        <motion.div
          animate={isDesktop ? desktopFrame : phoneFrame}
          transition={{ duration: DURATION, ease: EASING }}
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#292929",
            border: "1px solid #3b3b3b",
            boxShadow: "0 36px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
            zIndex: 1,
          }}
        >
          {/* Top chrome — 44px, content fades between phone / browser / app */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, zIndex: 20, pointerEvents: "none" }}>
            <AnimatePresence mode="wait">
              {phase === "mobile" ? (
                <motion.div key="phone-chrome" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}>
                  <PhoneChrome />
                </motion.div>
              ) : phase === "web" ? (
                <motion.div key="browser-chrome" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 }}>
                  <BrowserChrome />
                </motion.div>
              ) : (
                <motion.div key="app-chrome" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}>
                  <AppChrome />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Screen area */}
          <motion.div
            animate={{ top: 44, ...(isDesktop ? desktopScreen : phoneScreen) }}
            transition={{ duration: DURATION, ease: EASING }}
            style={{ position: "absolute", top: 44, overflow: "hidden" }}
          >
            <AnimatePresence mode="wait">
              {phase === "internal" ? (
                <motion.div key="app-content"
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}>
                  <MockAppContent />
                </motion.div>
              ) : (
                <motion.div key="site-content"
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}>
                  <MockSiteContent />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Home indicator — phone only */}
          <AnimatePresence>
            {!isDesktop && (
              <motion.div
                key="home-bar"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  bottom: 5,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 96, height: 4,
                  background: "#f5f5f5",
                  borderRadius: 2,
                  opacity: 0.3,
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
    </div>
    </div>
  )
}

// ─── Backend flow demo ───────────────────────────────────────────────────────

const BACKEND_W = 760
const BACKEND_H = 580

type BackendPhase = "rest" | "realtime" | "queue"

interface BackendNode { label: string; sub: string }

const BACKEND_NODES: Record<BackendPhase, BackendNode[]> = {
  rest: [
    { label: "Client",            sub: "POST /api/users"      },
    { label: "API Gateway",       sub: "Rate limit · CORS"    },
    { label: "Auth Middleware",   sub: "JWT verify"           },
    { label: "Route Handler",     sub: "Validate · Transform" },
    { label: "Database",          sub: "INSERT users"         },
  ],
  realtime: [
    { label: "Client",            sub: "ws://connect"         },
    { label: "WebSocket Hub",     sub: "Rooms · Presence"     },
    { label: "Pub/Sub Broker",    sub: "Redis channels"       },
    { label: "Event Handler",     sub: "Broadcast · Store"    },
    { label: "All Clients",       sub: "Push update"          },
  ],
  queue: [
    { label: "Trigger",           sub: "API · Cron · Webhook" },
    { label: "Job Queue",         sub: "Prioritise · Retry"   },
    { label: "Worker Pool",       sub: "3 concurrent"         },
    { label: "Processing",        sub: "Transform · Enrich"   },
    { label: "Complete",          sub: "Notify · Webhook"     },
  ],
}

const BACKEND_META: Record<BackendPhase, { title: string; icon: React.ElementType; phaseText: string; response: string }> = {
  rest:     { title: "api.studio7.design",  icon: Server, phaseText: "REST API",  response: "201 Created · 42ms"     },
  realtime: { title: "ws.studio7.design",   icon: Wifi,   phaseText: "Realtime",  response: "Event delivered · <1ms" },
  queue:    { title: "jobs.studio7.design", icon: Zap,    phaseText: "Job Queue", response: "Job complete · 1.2s"    },
}

// ─── Server chrome bar ────────────────────────────────────────────────────────

function ServerChrome({ phase }: { phase: BackendPhase }) {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: "0 14px", position: "relative" }}>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "Space Mono", fontSize: 10, color: "#6a6a6a" }}
          >
            {BACKEND_META[phase].title}
          </motion.span>
        </AnimatePresence>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
        <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#515151" }}>99.9%</span>
      </div>
    </div>
  )
}

// ─── Animated pipeline ────────────────────────────────────────────────────────

const BN_W   = 220
const BN_H   = 52
const BN_GAP = 24
const BN_STR = BN_H + BN_GAP

function BackendPipeline({ phase }: { phase: BackendPhase }) {
  const nodes = BACKEND_NODES[phase]
  const { response } = BACKEND_META[phase]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= nodes.length + 1; i++) {
      ts.push(setTimeout(() => setStep(i), 300 + (i - 1) * 540))
    }
    return () => ts.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalH = nodes.length * BN_H + (nodes.length - 1) * BN_GAP
  const showResponse = step >= nodes.length + 1
  const packetVisible = step >= 1 && step <= nodes.length - 1
  const packetTop = packetVisible ? (step - 1) * BN_STR + BN_H + BN_GAP / 2 - 4 : 0

  return (
    <div style={{ position: "relative", width: BN_W, height: totalH + 44 }}>
      {nodes.map((node, i) => {
        const top = i * BN_STR
        const isActive = i < step
        const isCurrent = i === step - 1
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <motion.div
                animate={{ background: isActive ? "rgba(232,255,71,0.3)" : "#333333" }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  left: BN_W / 2 - 1,
                  top: top - BN_GAP,
                  width: 2,
                  height: BN_GAP,
                  borderRadius: 1,
                }}
              />
            )}
            <motion.div
              animate={{
                borderColor: isCurrent
                  ? "rgba(232,255,71,0.5)"
                  : isActive
                  ? "rgba(232,255,71,0.12)"
                  : "#333333",
                backgroundColor: isCurrent ? "rgba(232,255,71,0.05)" : "#262626",
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                top,
                left: 0,
                width: BN_W,
                height: BN_H,
                borderRadius: 8,
                border: "1px solid #333333",
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600, color: isActive ? "#d0d0d0" : "#515151" }}>
                {node.label}
              </span>
              <span style={{
                fontFamily: "Space Mono", fontSize: 9, letterSpacing: "0.06em",
                color: isCurrent ? "#e8ff47" : isActive ? "#6a6a6a" : "#373737",
              }}>
                {node.sub}
              </span>
            </motion.div>
          </React.Fragment>
        )
      })}

      {/* Traveling packet dot — fresh mount per step position */}
      <AnimatePresence>
        {packetVisible && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute",
              left: BN_W / 2 - 4,
              top: packetTop,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#e8ff47",
              boxShadow: "0 0 10px rgba(232,255,71,0.7)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Response badge */}
      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center" }}
          >
            <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "#28c840", letterSpacing: "0.07em" }}>
              ↑ {response}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── BackendFlowDemo ──────────────────────────────────────────────────────────

function BackendFlowDemo() {
  const [phase, setPhase] = useState<BackendPhase>("rest")
  const scale = useDemoScale(BACKEND_W, BACKEND_H)

  useEffect(() => {
    const hold: Record<BackendPhase, number> = { rest: 4800, realtime: 4500, queue: 5000 }
    const next: Record<BackendPhase, BackendPhase> = { rest: "realtime", realtime: "queue", queue: "rest" }
    const t = setTimeout(() => setPhase(p => next[p]), hold[phase])
    return () => clearTimeout(t)
  }, [phase])

  const meta = BACKEND_META[phase]
  const PhaseIcon = meta.icon

  return (
    <div style={{ width: BACKEND_W * scale, height: BACKEND_H * scale }}>
    <div style={{ width: BACKEND_W, transformOrigin: "top left", transform: `scale(${scale})` }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

      {/* Phase label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <p style={{ fontFamily: "Space Mono", fontSize: 10, color: "#595959", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
          Request lifecycle
        </p>
        <div style={{ width: 1, height: 10, background: "#3f3f3f" }} />
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--accent-label)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}
          >
            <PhaseIcon size={11} />
            {meta.phaseText}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Server frame */}
      <div style={{
        width: BACKEND_W - 80,
        background: "#292929",
        border: "1px solid #3b3b3b",
        borderRadius: 10,
        boxShadow: "0 36px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(ellipse at 50% 50%, rgba(232,255,71,0.05) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        {/* Chrome bar */}
        <div style={{ height: 44, borderBottom: "1px solid #333333", position: "relative", zIndex: 1 }}>
          <ServerChrome phase={phase} />
        </div>
        {/* Pipeline content */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "36px 40px 40px",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BackendPipeline phase={phase} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
    </div>
    </div>
  )
}

// ─── AnalyticsDashboardDemo ───────────────────────────────────────────────────

const ANALYTICS_W = 700
const ANALYTICS_H = 480

type AnalyticsView = "overview" | "funnel" | "events"

const ANALYTICS_META: Record<AnalyticsView, { label: string; text: string }> = {
  overview: { label: "Overview",  text: "MAU growth"         },
  funnel:   { label: "Funnel",    text: "Conversion steps"   },
  events:   { label: "Events",    text: "Traffic breakdown"  },
}

const MAU_DATA = [12400, 18200, 15800, 22600, 19400, 28800, 25200, 34600, 29800, 41200, 38600, 52800]
const MONTHS   = ["J","F","M","A","M","J","J","A","S","O","N","D"]

const EVENT_SOURCES = [
  { label: "Organic",  value: 4820, pct: 100 },
  { label: "Direct",   value: 3210, pct: 67  },
  { label: "Paid",     value: 2890, pct: 60  },
  { label: "Referral", value: 1940, pct: 40  },
  { label: "Social",   value: 1120, pct: 23  },
]

const FUNNEL_STEPS = [
  { label: "Visitors",  value: "52.8k", pct: 100 },
  { label: "Sign-ups",  value: "18.5k", pct: 35  },
  { label: "Activated", value: "8.4k",  pct: 16  },
  { label: "Converted", value: "2.6k",  pct: 5   },
]

function buildLinePath(data: number[], w: number, h: number, padX = 20, padY = 16): string {
  const min = Math.min(...data), max = Math.max(...data)
  const xStep = (w - padX * 2) / (data.length - 1)
  const pts = data.map((v, i): [number, number] => [
    padX + i * xStep,
    padY + ((max - v) / (max - min)) * (h - padY * 2),
  ])
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
  }
  return d
}

function buildAreaPath(data: number[], w: number, h: number, padX = 20, padY = 16): string {
  const min = Math.min(...data), max = Math.max(...data)
  const xStep = (w - padX * 2) / (data.length - 1)
  const pts = data.map((v, i): [number, number] => [
    padX + i * xStep,
    padY + ((max - v) / (max - min)) * (h - padY * 2),
  ])
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
  }
  const lastX = padX + (data.length - 1) * xStep
  d += ` L ${lastX} ${h} L ${padX} ${h} Z`
  return d
}

function useCountUp(target: number, duration = 1400): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function MetricCard({ label, value, delta, up, delay }: {
  label: string; value: string | number; delta: string; up: boolean; delay: number
}) {
  const isNum = typeof value === "number"
  const counted = useCountUp(isNum ? (value as number) : 0, 1400)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{ flex: 1, background: "#262626", border: "1px solid #333333", borderRadius: 8, padding: "14px 16px" }}
    >
      <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 600, color: "#f5f5f5", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        {isNum ? counted.toLocaleString() : value}
      </p>
      <span style={{
        fontFamily: "Space Mono", fontSize: 10,
        color: up ? "#e8ff47" : "#ff4a4a",
        background: up ? "rgba(232,255,71,0.08)" : "rgba(255,74,74,0.08)",
        padding: "2px 7px", borderRadius: 4,
      }}>
        {delta}
      </span>
    </motion.div>
  )
}

function LineChartPanel() {
  const W = 540, H = 148
  const min = Math.min(...MAU_DATA), max = Math.max(...MAU_DATA)
  const xStep = (W - 40) / (MAU_DATA.length - 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ background: "#262626", border: "1px solid #333333", borderRadius: 8, padding: "16px 18px 14px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: 0 }}>
          Monthly Active Users
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {["1M","3M","12M"].map((l, i) => (
            <span key={l} style={{
              fontFamily: "Space Mono", fontSize: 9,
              color: i === 2 ? "#e8ff47" : "#474747",
              background: i === 2 ? "rgba(232,255,71,0.1)" : "transparent",
              padding: "2px 7px", borderRadius: 3, cursor: "pointer",
            }}>{l}</span>
          ))}
        </div>
      </div>
      <svg width={W} height={H + 16} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e8ff47" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#e8ff47" stopOpacity={0}    />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(y => (
          <line key={y} x1={20} y1={y * H} x2={W - 20} y2={y * H} stroke="#2f2f2f" strokeWidth={1} />
        ))}
        <motion.path
          d={buildAreaPath(MAU_DATA, W, H)}
          fill="url(#ag)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.path
          d={buildLinePath(MAU_DATA, W, H)}
          fill="none" stroke="#e8ff47" strokeWidth={2} strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        />
        {MAU_DATA.map((v, i) => {
          const x = 20 + i * xStep
          const y = 16 + ((max - v) / (max - min)) * (H - 32)
          return (
            <motion.circle key={i} cx={x} cy={y} r={3} fill="#e8ff47"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: i === MAU_DATA.length - 1 ? 1 : 0.4 }}
              transition={{ duration: 0.3, delay: 0.2 + (i / MAU_DATA.length) * 1.2 }}
            />
          )
        })}
        {MONTHS.map((m, i) => (
          <text key={i} x={20 + i * xStep} y={H + 14} textAnchor="middle"
            style={{ fontFamily: "Space Mono", fontSize: 9, fill: "#3f3f3f" }}>{m}</text>
        ))}
      </svg>
    </motion.div>
  )
}

function EventSourcesPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ flex: 1, background: "#262626", border: "1px solid #333333", borderRadius: 8, padding: "16px 18px" }}
    >
      <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 14px" }}>
        Events by Source
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {EVENT_SOURCES.map((src, i) => (
          <div key={src.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#6a6a6a" }}>{src.label}</span>
              <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#7c7c7c" }}>{src.value.toLocaleString()}</span>
            </div>
            <div style={{ height: 4, background: "#2f2f2f", borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${src.pct}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 2,
                  background: i === 0 ? "#e8ff47"
                    : i === 1 ? "rgba(232,255,71,0.6)"
                    : i === 2 ? "rgba(232,255,71,0.4)"
                    : "rgba(232,255,71,0.2)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function FunnelPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ flex: 1, background: "#262626", border: "1px solid #333333", borderRadius: 8, padding: "16px 18px" }}
    >
      <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 14px" }}>
        Conversion Funnel
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FUNNEL_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 58, textAlign: "right" as const, flexShrink: 0 }}>
              <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959" }}>{step.label}</span>
            </div>
            <div style={{ flex: 1, height: 26, background: "#2f2f2f", borderRadius: 3, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${step.pct}%` }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.15, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 3,
                  background: i === 3
                    ? "linear-gradient(90deg, #e8ff47, rgba(232,255,71,0.7))"
                    : i === 2
                    ? "linear-gradient(90deg, rgba(232,255,71,0.65), rgba(232,255,71,0.35))"
                    : i === 1
                    ? "linear-gradient(90deg, rgba(232,255,71,0.45), rgba(232,255,71,0.2))"
                    : "linear-gradient(90deg, rgba(232,255,71,0.25), rgba(232,255,71,0.1))",
                  display: "flex", alignItems: "center", paddingLeft: 8,
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  style={{ fontFamily: "Space Mono", fontSize: 9, color: i === 3 ? "#151515" : "#e8ff47", whiteSpace: "nowrap" as const }}
                >
                  {step.value}
                </motion.span>
              </motion.div>
            </div>
            <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#474747", width: 26, textAlign: "right" as const }}>
              {step.pct}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const DAILY_BARS = [40, 62, 55, 78, 70, 88, 58, 72, 45, 84, 52, 92, 66, 74]

const RETENTION_ROWS = [
  [100, 72, 55, 43, 38, 34],
  [100, 68, 52, 40, 35, null],
  [100, 74, 57, 45, null, null],
  [100, 70, 53, null, null, null],
] as (number | null)[][]

function AnalyticsDashboardDemo() {
  const [view, setView] = useState<AnalyticsView>("overview")
  const [looping, setLooping] = useState(true)
  const scale = useDemoScale(ANALYTICS_W, ANALYTICS_H)

  useEffect(() => {
    if (!looping) return
    const next: Record<AnalyticsView, AnalyticsView> = { overview: "funnel", funnel: "events", events: "overview" }
    const t = setTimeout(() => setView(v => next[v]), 5200)
    return () => clearTimeout(t)
  }, [view, looping])

  const analyticsViews: AnalyticsView[] = ["overview", "funnel", "events"]

  return (
    <div style={{ width: ANALYTICS_W * scale, height: ANALYTICS_H * scale }}>
    <div style={{ width: ANALYTICS_W, transformOrigin: "top left", transform: `scale(${scale})` }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

      {/* View label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <p style={{ fontFamily: "Space Mono", fontSize: 10, color: "#595959", letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: 0 }}>
          Analytics
        </p>
        <div style={{ width: 1, height: 10, background: "#3f3f3f" }} />
        <AnimatePresence mode="wait">
          <motion.p
            key={view}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--accent-label)", margin: 0 }}
          >
            {ANALYTICS_META[view].text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Dashboard frame */}
      <div style={{
        width: ANALYTICS_W - 40,
        background: "#292929",
        border: "1px solid #3b3b3b",
        borderRadius: 10,
        boxShadow: "0 36px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(ellipse at 50% 20%, rgba(232,255,71,0.04) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Chrome bar */}
        <div style={{
          height: 40, borderBottom: "1px solid #333333",
          display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57","#ffbd2e","#28c840"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.55 }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {analyticsViews.map(v => (
              <button
                key={v}
                onClick={() => { setView(v); setLooping(false) }}
                style={{
                  fontFamily: "Space Mono", fontSize: 9, letterSpacing: "0.06em",
                  color: view === v ? "#e8ff47" : "#474747",
                  background: view === v ? "rgba(232,255,71,0.1)" : "transparent",
                  border: `1px solid ${view === v ? "rgba(232,255,71,0.25)" : "#333333"}`,
                  borderRadius: 4, padding: "3px 10px", cursor: "pointer",
                  transition: "all 0.15s", textTransform: "capitalize" as const,
                }}
              >
                {ANALYTICS_META[v].label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8ff47" }}
            />
            <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#474747" }}>LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "20px 24px 24px" }}>
          <AnimatePresence mode="wait">

            {view === "overview" && (
              <motion.div key="overview"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <MetricCard label="Monthly Active" value={52800} delta="+24%" up={true}  delay={0}   />
                  <MetricCard label="Avg Session"    value="4m 12s" delta="+8%"  up={true}  delay={0.1} />
                  <MetricCard label="Churn Rate"     value="2.4%"   delta="-0.6%" up={true} delay={0.2} />
                </div>
                <LineChartPanel />
              </motion.div>
            )}

            {view === "funnel" && (
              <motion.div key="funnel"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: "flex", gap: 14 }}>
                  <FunnelPanel />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Signup rate", value: "35%",  trend: "+4.2pts" },
                      { label: "Activation",  value: "45.7%",trend: "+2.1pts" },
                      { label: "Conv. rate",  value: "5.0%", trend: "+0.8pts" },
                      { label: "Avg. LTV",    value: "$840", trend: "+$62"    },
                    ].map((s, i) => (
                      <motion.div key={s.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
                        style={{
                          background: "#262626", border: "1px solid #333333", borderRadius: 6,
                          padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.1em" }}>{s.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "Space Grotesk", fontSize: 17, fontWeight: 600, color: "#dadada" }}>{s.value}</span>
                          <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "#e8ff47" }}>{s.trend}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === "events" && (
              <motion.div key="events"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Daily bar chart */}
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 12px" }}>
                    Daily Events — Last 14 days
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
                    {DAILY_BARS.map((h, i) => (
                      <motion.div key={i}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
                        style={{
                          flex: 1, borderRadius: "2px 2px 0 0",
                          height: `${h}%`,
                          transformOrigin: "bottom",
                          background: i >= 13 ? "#e8ff47"
                            : i >= 11 ? "rgba(232,255,71,0.35)"
                            : "rgba(255,255,255,0.06)",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    {DAILY_BARS.map((_, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" as const }}>
                        <span style={{ fontFamily: "Space Mono", fontSize: 7, color: "#3b3b3b" }}>{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sources + retention heatmap */}
                <div style={{ display: "flex", gap: 12 }}>
                  <EventSourcesPanel />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{ flex: 1, background: "#262626", border: "1px solid #333333", borderRadius: 8, padding: "16px 18px" }}
                  >
                    <p style={{ fontFamily: "Space Mono", fontSize: 9, color: "#595959", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 12px" }}>
                      Weekly Retention
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {RETENTION_ROWS.map((row, ri) => (
                        <div key={ri} style={{ display: "flex", gap: 4 }}>
                          <span style={{ fontFamily: "Space Mono", fontSize: 8, color: "#3f3f3f", width: 28, flexShrink: 0, lineHeight: "18px" }}>
                            Wk {ri + 1}
                          </span>
                          {row.map((v, ci) => (
                            <motion.div key={ci}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: v != null ? 1 : 0, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.35 + (ri * 6 + ci) * 0.03 }}
                              style={{
                                width: 30, height: 18, borderRadius: 2,
                                background: v == null ? "transparent"
                                  : v === 100 ? "#e8ff47"
                                  : `rgba(232,255,71,${(v / 100) * 0.55 + 0.05})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              {v != null && (
                                <span style={{ fontFamily: "Space Mono", fontSize: 7, color: v === 100 ? "#151515" : "#e8ff47" }}>
                                  {v}%
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
    </div>
    </div>
  )
}

// ─── Device scroll intro ──────────────────────────────────────────────────────
// Landing intro for /work. Scroll-driven: an iPhone animates in and scrubs the
// phone (portrait) frame sequence, then morphs into a tablet (iPad) that scrubs
// the tablet (portrait) sequence, then into a desktop browser that scrubs the
// desktop (landscape) sequence. Everything is driven imperatively off
// window.scrollY (no per-tick React re-render); a tall spacer gives scroll room.
//
// Each stage is a <canvas> scrubbed the same way: frames live in public/ as
// `<device>-frames/ezgif-frame-001..NNN.jpg` (plain static JPGs, no build
// optimisation), preloaded by load() and drawn cover-fit via drawCover(). The
// three canvases stack in one screen and cross-fade during the morphs.

const PHONE_FRAMES  = 151   // portrait phone sequence   (/phone-frames)
const TABLET_FRAMES = 151   // portrait tablet sequence  (/tablet-frames)
const DESK_FRAMES   = 103   // landscape desktop sequence (/desktop-frames)
const PX_PER_FRAME  = 7     // scroll distance per frame advance

const ENTER_PX  = 240      // phone animates in over this distance
const MORPH1_PX = 360      // phone → tablet morph distance
const MORPH2_PX = 360      // tablet → desktop morph distance
const OUTRO_PX  = 440      // scroll distance over which the final desktop scrolls up + fades to 0
const OUTRO_UP  = 440      // px the desktop scrolls up across the outro (1:1 with scroll)

const PHONE_PX  = (PHONE_FRAMES  - 1) * PX_PER_FRAME
const TABLET_PX = (TABLET_FRAMES - 1) * PX_PER_FRAME   // tablet scrub distance
const DESK_PX   = (DESK_FRAMES   - 1) * PX_PER_FRAME

// Phase boundaries along window.scrollY.
const B_ENTER  = ENTER_PX
const B_PHONE  = B_ENTER  + PHONE_PX    // phone scrub ends → phone→tablet morph begins
const B_MORPH1 = B_PHONE  + MORPH1_PX   // tablet dwell begins
const B_TABLET = B_MORPH1 + TABLET_PX   // tablet dwell ends → tablet→desktop morph begins
const B_MORPH2 = B_TABLET + MORPH2_PX   // desktop scrub begins
const B_DESK   = B_MORPH2 + DESK_PX     // desktop scrub ends → outro begins
const B_OUTRO  = B_DESK   + OUTRO_PX

const INTRO_SCROLL =
  B_OUTRO + (typeof window !== "undefined" ? window.innerHeight : 800) + 200

// The four intro stages shown by the scroll dots. `target` = a scroll position
// that lands you inside that stage (the last jumps to the outro, which hands off
// to the Frontend). `switchAt` = the scrollY where the active dot flips to this
// stage (the midpoint of each morph / the outro), used to highlight the dot.
const INTRO_DOT_STAGES = [
  { label: "iPhone UI",  target: (B_ENTER  + B_PHONE)  / 2, switchAt: 0 },
  { label: "Tablet UI",  target: (B_MORPH1 + B_TABLET) / 2, switchAt: (B_PHONE  + B_MORPH1) / 2 },
  { label: "Website UI", target: (B_MORPH2 + B_DESK)   / 2, switchAt: (B_TABLET + B_MORPH2) / 2 },
  { label: "Frontend",   target: B_OUTRO,                    switchAt: (B_DESK   + B_OUTRO)  / 2 },
]

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}

// Cover-fit an image into a canvas buffer (VinaHouse's draw()): fill the frame,
// cropping overflow, anchored vertically at `anchorY`.
function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement, anchorY: number) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const cw = canvas.width, ch = canvas.height
  const iw = img.naturalWidth, ih = img.naturalHeight
  if (!iw || !ih) return
  const scale = Math.max(cw / iw, ch / ih)
  const dw = iw * scale, dh = ih * scale
  ctx.clearRect(0, 0, cw, ch)
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) * anchorY, dw, dh)
}

// Intro-local device geometry (independent of PhoneToDesktopDemo's shared frame).
// Phone: thin uniform bezel with the status bar overlaid on the screen (screen
// starts near the top). Tablet: a portrait iPad with a uniform bezel and a small
// camera dot, no chrome bar. Desktop: keeps a 44px browser-chrome bar above the
// screen. The morph runs phone → tablet → desktop across two segments.
const IN_FRAME_PHONE  = { w: 280, h: 560, radius: 34 }
const IN_FRAME_TABLET = { w: 452, h: 588, radius: 30 }  // portrait iPad (~3:4)
const IN_FRAME_DESK   = { w: 800, h: 490, radius: 10 }
const IN_SCREEN_PHONE  = { top: 4,  left: 4,  right: 4,  bottom: 4,  radius: 24 }
const IN_SCREEN_TABLET = { top: 14, left: 14, right: 14, bottom: 14, radius: 18 }
const IN_SCREEN_DESK   = { top: 44, left: 0,  right: 0,  bottom: 0,  radius: 0  }

// ─── Intro copy ───────────────────────────────────────────────────────────────
// Minimal, accent-coloured context for the landing scrub. The eyebrow + headline
// Each of the three device stages carries its own use-case copy, written in the
// home page's house style: a mono eyebrow, a big Space Grotesk headline ending in
// an accent period, and a supporting line. As the device morphs phone → tablet →
// desktop, the blocks cross-fade + float (home-page section transition), so each
// stage highlights a different kind of motion work:
//   phone   — build / progress over time   (construction time-lapse)
//   tablet  — inner detail of a product     (exploded teardown)
//   desktop — bespoke high-production motion (custom brand graphics)
const INTRO_STAGES = [
  {
    eyebrow: "Built · Over · Time",
    headline: "Watch it take shape",
    support: "Time-lapse motion that follows a project from ground to finished build.",
  },
  {
    eyebrow: "Layer · By · Layer",
    headline: "Every detail, revealed",
    support: "Exploded views that show the engineering beneath the surface.",
  },
  {
    eyebrow: "Bespoke · By · Design",
    headline: "Production-grade motion",
    support: "Custom motion graphics, engineered to command attention.",
  },
] as const

// Layout: text and device share the screen. Landscape (and wide enough) puts the
// copy on the left and the device on the right; portrait stacks copy above the
// device. The device's scale is measured off its own pane (see computeScale), so
// this CSS owns the layout and the JS just fits the device into whatever it gets.
const INTRO_COPY_CSS = `
  .s7-intro-stage {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
  }
  .s7-intro-copy {
    flex: 0 0 auto;
    display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
    text-align: center;
    padding: clamp(78px, 12vh, 128px) 24px 0;
    z-index: 4;
  }
  .s7-intro-device {
    position: relative;
    flex: 1 1 auto;
    display: flex; align-items: center; justify-content: center;
    min-width: 0; min-height: 0;
  }
  /* The three stage blocks stack in one grid cell and cross-fade in place. */
  .s7-intro-copy-inner { width: 100%; display: grid; }
  .s7-stage-block { grid-area: 1 / 1; width: 100%; will-change: opacity, transform; }
  .s7-eyebrow {
    font-family: "Space Mono", monospace; font-size: 10px; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--accent); opacity: 0.85; margin: 0 0 16px;
  }
  .s7-headline {
    font-family: "Space Grotesk", sans-serif; font-weight: 700;
    font-size: clamp(26px, 3.3vw, 47px); line-height: 1.06; letter-spacing: -0.035em;
    color: var(--foreground); margin: 0 auto; max-width: 13ch;
  }
  .s7-headline .dot { color: var(--accent); }
  .s7-support {
    font-family: "Space Grotesk", sans-serif; font-size: 13.5px; line-height: 1.55;
    color: color-mix(in srgb, var(--foreground) 58%, transparent);
    margin: 18px auto 0; max-width: 32ch;
  }
  @media (orientation: landscape) and (min-width: 760px) {
    .s7-intro-stage { flex-direction: row; align-items: stretch; }
    .s7-intro-copy {
      flex: 0 0 44%; max-width: 560px;
      justify-content: center; align-items: flex-start; text-align: left;
      padding: 0 clamp(32px, 4.5vw, 76px);
    }
    .s7-intro-device { flex: 1 1 56%; }
    .s7-headline, .s7-support { margin-left: 0; margin-right: 0; }
  }
  @keyframes s7-intro-copy-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .s7-intro-copy-inner {
    animation: s7-intro-copy-in 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
  }
`

function DeviceScrollIntro({ onReachEnd }: { onReachEnd?: () => void }) {
  const enterRef        = useRef<HTMLDivElement>(null)
  const frameRef        = useRef<HTMLDivElement>(null)
  const screenRef       = useRef<HTMLDivElement>(null)
  const phoneChromeRef  = useRef<HTMLDivElement>(null)
  const webChromeRef    = useRef<HTMLDivElement>(null)
  const sideBtnRef      = useRef<HTMLDivElement>(null)
  const tabletCamRef    = useRef<HTMLDivElement>(null)
  const homeRef         = useRef<HTMLDivElement>(null)
  const phoneCanvasRef  = useRef<HTMLCanvasElement>(null)
  const tabletCanvasRef = useRef<HTMLCanvasElement>(null)
  const deskCanvasRef   = useRef<HTMLCanvasElement>(null)
  const devicePaneRef   = useRef<HTMLDivElement>(null)
  const copyRef         = useRef<HTMLDivElement>(null)
  const stage0Ref       = useRef<HTMLDivElement>(null)
  const stage1Ref       = useRef<HTMLDivElement>(null)
  const stage2Ref       = useRef<HTMLDivElement>(null)

  const phoneImgsRef  = useRef<HTMLImageElement[]>([])
  const tabletImgsRef = useRef<HTMLImageElement[]>([])
  const deskImgsRef   = useRef<HTMLImageElement[]>([])
  const lastPhoneIdx  = useRef(-1)
  const lastTabletIdx = useRef(-1)
  const lastDeskIdx   = useRef(-1)
  const layoutScaleRef = useRef(1)
  const hintDomRef = useRef<HTMLDivElement>(null)
  const dotRailRef = useRef<HTMLDivElement>(null)
  const endedRef = useRef(false)
  const renderRef = useRef<() => void>(() => {})

  const onReachEndRef = useRef(onReachEnd)
  useEffect(() => { onReachEndRef.current = onReachEnd }, [onReachEnd])

  const [loaded, setLoaded] = useState(false)
  const [stage, setStage] = useState(0) // active scroll dot (0–3)
  const isTouch =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

  // Track which of the four stages the scroll is in, to light the right dot.
  // Only updates on a stage change, so it re-renders ~3 times across the intro.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      let s = 0
      for (let i = INTRO_DOT_STAGES.length - 1; i >= 0; i--) {
        if (y >= INTRO_DOT_STAGES[i].switchAt) { s = i; break }
      }
      setStage(prev => (prev === s ? prev : s))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fresh start on mount + resize cursor. The backdrop follows the page theme,
  // so the nav uses its normal theme styling (no s7:introdark override).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    document.documentElement.style.cursor = "ns-resize"
    return () => {
      window.scrollTo({ top: 0, behavior: "instant" })
      document.documentElement.style.cursor = ""
    }
  }, [])

  // The core imperative tick — maps window.scrollY to every animated property.
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const computeScale = () => {
      // Fit the device into its own pane (CSS decides how big that is per the
      // two-pane / stacked layout), not the whole viewport.
      const pane = devicePaneRef.current
      const vw = window.innerWidth
      const availW = pane ? pane.clientWidth  : vw
      const availH = pane ? pane.clientHeight : window.innerHeight
      const marginX = vw < 640 ? 28 : 56
      const marginY = 64
      layoutScaleRef.current = Math.max(
        0.2,
        Math.min(1, (availW - marginX) / IN_FRAME_DESK.w, (availH - marginY) / IN_FRAME_DESK.h),
      )
    }

    const render = () => {
      // Once the end is reached we freeze on the final desktop frame while the
      // handoff to the Frontend section plays out — further scroll (including the
      // scroll-to-top on unmount) must not reset the device or re-show the hint.
      // Once the scroll-up is far enough in, we freeze and let the section swap
      // auto-complete the handoff — further scroll must not reset the device.
      if (endedRef.current) return
      const y = window.scrollY

      const enterT  = clamp01(y / ENTER_PX)
      const morph1T = clamp01((y - B_PHONE)  / MORPH1_PX)  // phone → tablet
      const morph2T = clamp01((y - B_TABLET) / MORPH2_PX)  // tablet → desktop
      const outroT  = clamp01((y - B_DESK)   / OUTRO_PX)

      // Centred scroll indicator: fades out as the phone fades in.
      if (hintDomRef.current) hintDomRef.current.style.opacity = String(clamp01(1 - enterT / 0.45))

      // Enter-in, plus the scroll-driven outro: past the last frame the desktop
      // scrolls up (translateY) and fades all the way to 0 — imperatively on this
      // descendant (never a transform on the fixed layer's ancestor, which would
      // snap the fixed positioning).
      const enter = enterRef.current
      if (enter) {
        enter.style.opacity = String(enterT * (1 - outroT))
        const ty = (1 - enterT) * 46 - outroT * OUTRO_UP
        const sc = 0.9 + enterT * 0.1
        enter.style.transform =
          `scale(${layoutScaleRef.current}) translateY(${ty}px) scale(${sc})`
      }

      // Intro copy: visible from the start (mount-fades in via CSS), fades out
      // together with the device across the outro.
      if (copyRef.current) copyRef.current.style.opacity = String(1 - outroT)

      // The scroll dots fade out across the outro too, so they're gone by the
      // time the Frontend section takes over the screen.
      if (dotRailRef.current) dotRailRef.current.style.opacity = String(1 - outroT)

      // Device geometry morph: phone → tablet (morph1) → desktop (morph2). While
      // morph2 is inactive we're on the phone→tablet leg, which rests at full
      // tablet geometry through the dwell (morph1T === 1).
      const onDeskLeg = morph2T > 0
      const fromF = onDeskLeg ? IN_FRAME_TABLET  : IN_FRAME_PHONE
      const toF   = onDeskLeg ? IN_FRAME_DESK    : IN_FRAME_TABLET
      const fromS = onDeskLeg ? IN_SCREEN_TABLET : IN_SCREEN_PHONE
      const toS   = onDeskLeg ? IN_SCREEN_DESK   : IN_SCREEN_TABLET
      const gt    = onDeskLeg ? morph2T : morph1T

      const fw = lerp(fromF.w, toF.w, gt)
      const fh = lerp(fromF.h, toF.h, gt)
      const fr = lerp(fromF.radius, toF.radius, gt)
      const frame = frameRef.current
      if (frame) {
        frame.style.width = `${fw}px`
        frame.style.height = `${fh}px`
        frame.style.borderRadius = `${fr}px`
      }

      const st = lerp(fromS.top,    toS.top,    gt)
      const sl = lerp(fromS.left,   toS.left,   gt)
      const sr = lerp(fromS.right,  toS.right,  gt)
      const sb = lerp(fromS.bottom, toS.bottom, gt)
      const srad = lerp(fromS.radius, toS.radius, gt)
      const screen = screenRef.current
      if (screen) {
        screen.style.top = `${st}px`
        screen.style.left = `${sl}px`
        screen.style.right = `${sr}px`
        screen.style.bottom = `${sb}px`
        screen.style.borderRadius = `${srad}px`
      }

      // Chrome + ornament crossfade. Phone status bar fades out over morph1;
      // browser chrome fades in over morph2 (the tablet stage shows neither).
      if (phoneChromeRef.current) phoneChromeRef.current.style.opacity = String(1 - smooth(0, 0.55, morph1T))
      if (webChromeRef.current)   webChromeRef.current.style.opacity   = String(smooth(0.35, 0.95, morph2T))
      // Phone side buttons: phone only, fade out over morph1.
      if (sideBtnRef.current) sideBtnRef.current.style.opacity = String(1 - smooth(0, 0.4, morph1T))
      // Tablet camera dot: fades in over morph1, back out over morph2.
      if (tabletCamRef.current) tabletCamRef.current.style.opacity = String(smooth(0.5, 1, morph1T) * (1 - smooth(0, 0.5, morph2T)))
      // Home indicator: on phone + tablet, fades out over morph2.
      if (homeRef.current) homeRef.current.style.opacity = String((1 - smooth(0, 0.4, morph2T)) * 0.3)

      // Screen crossfade: phone frames → tablet frames → desktop frames.
      const toTablet = smooth(0.3, 0.7, morph1T)  // 0 on phone, 1 on tablet
      const toDesk   = smooth(0.3, 0.7, morph2T)  // 0 on tablet, 1 on desktop
      const pc = phoneCanvasRef.current
      const tc = tabletCanvasRef.current
      const dc = deskCanvasRef.current
      if (pc) pc.style.opacity = String(1 - toTablet)
      if (tc) tc.style.opacity = String(toTablet * (1 - toDesk))
      if (dc) dc.style.opacity = String(toDesk)

      // Per-stage copy blocks — cross-fade + float in the home-page section style,
      // in lock-step with the device morph (incoming rises from +SHIFT to 0; the
      // outgoing slides up to -SHIFT and fades).
      const SHIFT = 22
      const b0 = stage0Ref.current, b1 = stage1Ref.current, b2 = stage2Ref.current
      if (b0) {
        b0.style.opacity = String(1 - toTablet)
        b0.style.transform = `translateY(${-toTablet * SHIFT}px)`
      }
      if (b1) {
        b1.style.opacity = String(toTablet * (1 - toDesk))
        b1.style.transform = `translateY(${(1 - toTablet) * SHIFT - toDesk * SHIFT}px)`
      }
      if (b2) {
        b2.style.opacity = String(toDesk)
        b2.style.transform = `translateY(${(1 - toDesk) * SHIFT}px)`
      }

      const phoneIdx  = Math.min(PHONE_FRAMES  - 1, Math.max(0, Math.floor((y - B_ENTER)  / PX_PER_FRAME)))
      const tabletIdx = Math.min(TABLET_FRAMES - 1, Math.max(0, Math.floor((y - B_MORPH1) / PX_PER_FRAME)))
      const deskIdx   = Math.min(DESK_FRAMES   - 1, Math.max(0, Math.floor((y - B_MORPH2) / PX_PER_FRAME)))

      // Resize canvas buffers to the current screen size (changes during morph).
      const screenW = fw - sl - sr
      const screenH = fh - st - sb
      const bw = Math.max(1, Math.round(screenW * dpr))
      const bh = Math.max(1, Math.round(screenH * dpr))
      let resized = false
      if (pc && tc && dc && (pc.width !== bw || pc.height !== bh)) {
        pc.width = bw; pc.height = bh
        tc.width = bw; tc.height = bh
        dc.width = bw; dc.height = bh
        resized = true
      }

      const pImg = phoneImgsRef.current[phoneIdx]
      if (pc && pImg && pImg.complete && (resized || phoneIdx !== lastPhoneIdx.current)) {
        drawCover(pc, pImg, 0.42)
        lastPhoneIdx.current = phoneIdx
      }
      const tImg = tabletImgsRef.current[tabletIdx]
      if (tc && tImg && tImg.complete && (resized || tabletIdx !== lastTabletIdx.current)) {
        drawCover(tc, tImg, 0.5)
        lastTabletIdx.current = tabletIdx
      }
      const dImg = deskImgsRef.current[deskIdx]
      if (dc && dImg && dImg.complete && (resized || deskIdx !== lastDeskIdx.current)) {
        drawCover(dc, dImg, 0.5)
        lastDeskIdx.current = deskIdx
      }

      // Fully scrolled through the outro (desktop faded to 0): freeze and hand off.
      // handleIntroEnd mounts the Frontend and unmounts this intro, so the user
      // cannot scroll back up into the landing animation.
      if (outroT >= 1 && !endedRef.current) { endedRef.current = true; onReachEndRef.current?.() }
    }

    const recomputeAndRender = () => {
      computeScale()
      lastPhoneIdx.current = -1
      lastTabletIdx.current = -1
      lastDeskIdx.current = -1
      render()
    }

    computeScale()
    render()
    renderRef.current = render

    const onScroll = () => render()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", recomputeAndRender)

    // Measure the device pane off its own laid-out size — a ResizeObserver fires
    // once with the settled size (fixing the mount-time race where the flex/media
    // layout hasn't applied yet) and again on every layout/orientation change.
    const ro = new ResizeObserver(recomputeAndRender)
    if (devicePaneRef.current) ro.observe(devicePaneRef.current)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", recomputeAndRender)
      ro.disconnect()
    }
  }, [])

  // Preload all three sequences. Phone frames gate the loader; tablet and desktop
  // frames decode in the background so they're ready by the time the user scrubs
  // into them.
  useEffect(() => {
    const load = (
      dir: string,
      n: number,
      targetRef: React.MutableRefObject<HTMLImageElement[]>,
      onFirst?: () => void,
      onAll?: () => void,
    ) => {
      const imgs: HTMLImageElement[] = new Array(n)
      let count = 0
      for (let i = 0; i < n; i++) {
        const img = new Image()
        img.decoding = "async"
        const done = () => {
          count++
          if (i === 0) onFirst?.()
          if (count === n) onAll?.()
        }
        img.onload = done
        img.onerror = done
        img.src = `${dir}/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`
        imgs[i] = img
      }
      targetRef.current = imgs
    }

    load("/phone-frames", PHONE_FRAMES, phoneImgsRef,
      () => { lastPhoneIdx.current = -1; renderRef.current() },
      () => setLoaded(true))
    load("/tablet-frames", TABLET_FRAMES, tabletImgsRef,
      () => { lastTabletIdx.current = -1; renderRef.current() })
    load("/desktop-frames", DESK_FRAMES, deskImgsRef,
      () => { lastDeskIdx.current = -1; renderRef.current() })
  }, [])

  return (
    <>
      {/* Fixed visual layer — pointer-events off so the body scrolls natively. */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "var(--background)", pointerEvents: "none", overflow: "hidden",
        }}
      >
        <style>{INTRO_COPY_CSS}</style>

        {/* Two-pane stage: copy + device (row on wide landscape, stacked otherwise) */}
        <div className="s7-intro-stage">

          {/* ── Copy pane — per-stage use-case blocks (stacked, cross-fade) ── */}
          <div className="s7-intro-copy" ref={copyRef} style={{ opacity: 1 }}>
            <div className="s7-intro-copy-inner">
              {INTRO_STAGES.map((s, i) => (
                <div
                  key={i}
                  className="s7-stage-block"
                  ref={[stage0Ref, stage1Ref, stage2Ref][i]}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="s7-eyebrow">{s.eyebrow}</p>
                  <h2 className="s7-headline">{s.headline}<span className="dot">.</span></h2>
                  <p className="s7-support">{s.support}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Device pane (scaled to fit this box) ── */}
          <div className="s7-intro-device" ref={devicePaneRef}>
          <div ref={enterRef} style={{
            transformOrigin: "center center",
            willChange: "transform, opacity",
            opacity: 0,
          }}>
            <div style={{ position: "relative" }}>
              {/* Ambient glow */}
              <div style={{
                position: "absolute", inset: -40,
                background: "radial-gradient(ellipse at 50% 50%, rgba(232,255,71,0.06) 0%, transparent 65%)",
                pointerEvents: "none", zIndex: 0,
              }} />

              {/* Phone side buttons — sit outside the frame, fade out on morph */}
              <div ref={sideBtnRef} style={{ zIndex: 2 }}>
                <div style={{ position: "absolute", right: -3, top: 110, width: 3, height: 38, background: "#333333", borderRadius: "0 2px 2px 0" }} />
                <div style={{ position: "absolute", left: -3, top: 88,  width: 3, height: 26, background: "#333333", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: -3, top: 122, width: 3, height: 26, background: "#333333", borderRadius: "2px 0 0 2px" }} />
                <div style={{ position: "absolute", left: -3, top: 62,  width: 3, height: 18, background: "#333333", borderRadius: "2px 0 0 2px" }} />
              </div>

              {/* Morphing device frame */}
              <div ref={frameRef} style={{
                position: "relative",
                overflow: "hidden",
                width: IN_FRAME_PHONE.w,
                height: IN_FRAME_PHONE.h,
                borderRadius: IN_FRAME_PHONE.radius,
                background: "#292929",
                border: "1px solid #3b3b3b",
                boxShadow: "0 36px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
                zIndex: 1,
              }}>
                {/* Top chrome band — phone status bar crossfades to browser chrome */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, zIndex: 20, pointerEvents: "none" }}>
                  <div ref={phoneChromeRef} style={{ position: "absolute", inset: 0 }}>
                    <PhoneChrome />
                  </div>
                  <div ref={webChromeRef} style={{ position: "absolute", inset: 0, opacity: 0 }}>
                    <BrowserChrome />
                  </div>
                </div>

                {/* Screen — hosts the three crossfading frame canvases (phone → tablet → desktop) */}
                <div ref={screenRef} style={{
                  position: "absolute", top: IN_SCREEN_PHONE.top,
                  left: IN_SCREEN_PHONE.left, right: IN_SCREEN_PHONE.right, bottom: IN_SCREEN_PHONE.bottom,
                  borderRadius: IN_SCREEN_PHONE.radius,
                  overflow: "hidden", background: "#0d0d0d",
                }}>
                  <canvas ref={phoneCanvasRef}  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
                  <canvas ref={tabletCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0 }} />
                  <canvas ref={deskCanvasRef}   style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0 }} />
                </div>

                {/* Tablet camera dot — fades in on the tablet stage, out into desktop */}
                <div ref={tabletCamRef} style={{
                  position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#0d0d0d", border: "1px solid #3f3f3f",
                  opacity: 0, zIndex: 20,
                }} />

                {/* Home indicator — phone + tablet */}
                <div ref={homeRef} style={{
                  position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
                  width: 96, height: 4, background: "#f5f5f5", borderRadius: 2,
                  opacity: 0.3, zIndex: 20,
                }} />
              </div>
            </div>
          </div>

          {/* Loading overlay — centred in the device pane */}
          {!loaded && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Space Mono", fontSize: 13, color: "var(--muted-foreground)", zIndex: 1,
            }}>
              loading frames…
            </div>
          )}

        {/* Scroll indicator — centred, theme accent-green, fades out (opacity set
            imperatively in render) as the phone fades in. */}
        {loaded && (
          <div
            ref={hintDomRef}
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              zIndex: 3, pointerEvents: "none", color: "var(--accent)", opacity: 1,
              willChange: "opacity",
            }}
          >
            {isTouch ? (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="28" height="40" viewBox="0 0 28 40" fill="none">
                  <rect x="10" y="14" width="8" height="18" rx="4" stroke="currentColor" strokeOpacity={0.85} strokeWidth="1.5"/>
                  <path d="M6 20 C6 10 22 10 22 20" stroke="currentColor" strokeOpacity={0.5} strokeWidth="1.2" strokeDasharray="2 2"/>
                </svg>
              </motion.div>
            ) : (
              <div style={{ position: "relative", width: 26, height: 40 }}>
                <svg width="26" height="40" viewBox="0 0 26 40" fill="none">
                  <rect x="1" y="1" width="24" height="38" rx="12" stroke="currentColor" strokeOpacity={0.8} strokeWidth="1.5"/>
                </svg>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                    width: 2, height: 7, borderRadius: 1, background: "currentColor", opacity: 0.9,
                  }}
                />
              </div>
            )}
            <span style={{
              fontFamily: "Space Mono", fontSize: 9, color: "currentColor", opacity: 0.75,
              letterSpacing: "0.14em",
            }}>
              {isTouch ? "SWIPE" : "SCROLL"}
            </span>
          </div>
        )}

          </div>{/* .s7-intro-device */}
        </div>{/* .s7-intro-stage */}
      </div>

      {/* Section dots — the four stages (iPhone → Tablet → Website → Frontend).
          Portalled to <body> so `fixed` resolves against the viewport (the
          section's framer-motion wrapper carries a transform that would
          otherwise capture it). They fade with the outro (above) and unmount
          with the intro at the hand-off. */}
      {loaded && createPortal(
        <div
          ref={dotRailRef}
          className="fixed top-1/2 right-8 z-50 -translate-y-1/2 flex flex-col gap-3"
        >
          {INTRO_DOT_STAGES.map((d, i) => (
            <button
              key={d.label}
              onClick={() => window.scrollTo({ top: d.target, behavior: "smooth" })}
              aria-label={`Go to ${d.label}`}
              className="group grid place-items-center h-4 w-4"
            >
              <span
                className="rounded-full transition-all duration-300"
                style={{
                  width: stage === i ? 9 : 6,
                  height: stage === i ? 9 : 6,
                  background: stage === i ? "var(--accent)" : "var(--foreground)",
                  opacity: stage === i ? 1 : 0.28,
                }}
              />
            </button>
          ))}
        </div>,
        document.body,
      )}

      {/* Scroll spacer in normal flow — makes the body tall enough for the scrub. */}
      <div style={{ height: INTRO_SCROLL }} />
    </>
  )
}

// ─── Database showcase ────────────────────────────────────────────────────────

interface TableField { name: string; type: string; tag?: "PK" | "FK" }
interface SchemaTable { name: string; fields: TableField[] }

const SCHEMA_TABLES: SchemaTable[] = [
  {
    name: "users",
    fields: [
      { name: "id",         type: "uuid",        tag: "PK" },
      { name: "email",      type: "text"                   },
      { name: "name",       type: "text"                   },
      { name: "role",       type: "enum"                   },
      { name: "created_at", type: "timestamptz"            },
    ],
  },
  {
    name: "projects",
    fields: [
      { name: "id",         type: "uuid",        tag: "PK" },
      { name: "owner_id",   type: "uuid",        tag: "FK" },
      { name: "name",       type: "text"                   },
      { name: "status",     type: "enum"                   },
      { name: "updated_at", type: "timestamptz"            },
    ],
  },
  {
    name: "events",
    fields: [
      { name: "id",         type: "uuid",        tag: "PK" },
      { name: "user_id",    type: "uuid",        tag: "FK" },
      { name: "project_id", type: "uuid",        tag: "FK" },
      { name: "type",       type: "text"                   },
      { name: "payload",    type: "jsonb"                  },
      { name: "ts",         type: "timestamptz"            },
    ],
  },
]

function SchemaCard({ table }: { table: SchemaTable }) {
  return (
    <div style={{ background: "#212121", border: "1px solid #333333", borderRadius: 6, overflow: "hidden", flex: 1, minWidth: 0 }}>
      <div style={{ padding: "7px 12px", borderBottom: "1px solid #2b2b2b", background: "#262626" }}>
        <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "#9a9a9a", letterSpacing: "0.06em" }}>{table.name}</span>
      </div>
      {table.fields.map(f => (
        <div key={f.name} style={{ display: "flex", alignItems: "center", padding: "4px 12px", gap: 8 }}>
          <span style={{
            fontFamily: "Space Mono", fontSize: 7, letterSpacing: "0.04em",
            color: f.tag === "PK" ? "#888" : f.tag === "FK" ? "rgba(232,255,71,0.5)" : "transparent",
            width: 14, flexShrink: 0,
          }}>
            {f.tag ?? "  "}
          </span>
          <span style={{
            fontFamily: "Space Mono", fontSize: 9, flex: 1,
            color: f.tag === "PK" ? "#c4c4c4" : f.tag === "FK" ? "rgba(232,255,71,0.85)" : "#8f8f8f",
          }}>
            {f.name}
          </span>
          <span style={{ fontFamily: "Space Mono", fontSize: 7, color: "#6e6e6e" }}>{f.type}</span>
        </div>
      ))}
    </div>
  )
}

function DatabaseShowcase() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {SCHEMA_TABLES.map(table => (
          <SchemaCard key={table.name} table={table} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start", maxWidth: 580 }}>
      {SCHEMA_TABLES.map((table, i) => (
        <React.Fragment key={table.name}>
          {i > 0 && (
            <div style={{ display: "flex", alignItems: "center", paddingTop: 34, flexShrink: 0 }}>
              <div style={{ width: 20, height: 1, background: "color-mix(in srgb, var(--accent-label) 50%, transparent)" }} />
              <div style={{
                width: 0, height: 0,
                borderLeft: "4px solid color-mix(in srgb, var(--accent-label) 50%, transparent)",
                borderTop: "3px solid transparent",
                borderBottom: "3px solid transparent",
              }} />
            </div>
          )}
          <SchemaCard table={table} />
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Features showcase ────────────────────────────────────────────────────────

type SidebarItem = {
  id: string
  Icon: React.ElementType
  label: string
  isNew: boolean
}

const SIDEBAR_BASE: SidebarItem[] = [
  { id: "dashboard", Icon: Layout,      label: "Dashboard", isNew: false },
  { id: "users",     Icon: Users,       label: "Users",     isNew: false },
  { id: "billing",   Icon: CreditCard,  label: "Billing",   isNew: false },
  { id: "settings",  Icon: Settings,    label: "Settings",  isNew: false },
]

function FeaturesShowcase() {
  const [items, setItems] = useState<SidebarItem[]>(SIDEBAR_BASE)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const clearAll = () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timersRef.current.push(id)
    }

    const run = () => {
      clearAll()
      setItems([...SIDEBAR_BASE])

      // AI Chatbot squeezes in after "users"
      t(() => {
        setItems(prev => {
          const idx = prev.findIndex(i => i.id === "users")
          const next = [...prev]
          next.splice(idx + 1, 0, { id: "ai-chat", Icon: Bot, label: "AI Chatbot", isNew: true })
          return next
        })
      }, 1200)

      // Live Support squeezes in after "dashboard"
      t(() => {
        setItems(prev => {
          const idx = prev.findIndex(i => i.id === "dashboard")
          const next = [...prev]
          next.splice(idx + 1, 0, { id: "support", Icon: Headphones, label: "Live Support", isNew: true })
          return next
        })
      }, 2600)

      t(run, 5200)
    }

    t(run, 600)
    return clearAll
  }, [])

  return (
    <div style={{ width: 220, minHeight: 268 }}>
      {/* Sidebar header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingBottom: 12, marginBottom: 6,
        borderBottom: "1px solid #262626",
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: "#232323", border: "1px solid #333333",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Layout size={11} color="#515151" />
        </div>
        <span style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600, color: "#3f3f3f" }}>
          your-app
        </span>
      </div>

      {/* Nav items */}
      <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                layout: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
                opacity: { duration: 0.22 },
                height: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
              }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px",
                borderRadius: 8,
                background: item.isNew ? "rgba(232,255,71,0.05)" : "transparent",
                border: `1px solid ${item.isNew ? "rgba(232,255,71,0.14)" : "transparent"}`,
              }}>
                <item.Icon size={13} color={item.isNew ? "#8a9820" : "#454545"} />
                <span style={{
                  fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 500,
                  color: item.isNew ? "#8a9820" : "#454545",
                  flex: 1,
                }}>
                  {item.label}
                </span>
                {item.isNew && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18, duration: 0.2 }}
                    style={{
                      fontFamily: "Space Mono", fontSize: 6.5, letterSpacing: "0.1em",
                      color: "#e8ff47", background: "rgba(232,255,71,0.08)",
                      border: "1px solid rgba(232,255,71,0.14)",
                      padding: "1px 5px", borderRadius: 3,
                    }}
                  >
                    NEW
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── Design showcase ──────────────────────────────────────────────────────────

function DesignShowcase() {
  const palette = [
    { token: "background", hex: "#151515" },
    { token: "card",       hex: "#1c1c1c" },
    { token: "border",     hex: "#2f2f2f" },
    { token: "muted",      hex: "#595959" },
    { token: "foreground", hex: "#ffffff" },
    { token: "accent",     hex: "#e8ff47" },
  ]

  const labelStyle: React.CSSProperties = {
    fontFamily: "Space Mono", fontSize: 9, color: "var(--color-grey-400)",
    letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 14px",
  }

  const components = [
    <button key="primary" style={{
      background: "#e8ff47", color: "#151515", border: "none",
      fontFamily: "Space Mono", fontSize: 10, letterSpacing: "0.1em",
      padding: "9px 20px", borderRadius: 7, cursor: "pointer", fontWeight: 700,
    }}>PRIMARY</button>,
    <button key="secondary" style={{
      background: "transparent", color: "#6a6a6a", border: "1px solid #333333",
      fontFamily: "Space Mono", fontSize: 10, letterSpacing: "0.1em",
      padding: "9px 20px", borderRadius: 7, cursor: "pointer",
    }}>SECONDARY</button>,
    <span key="badge" style={{
      fontFamily: "Space Mono", fontSize: 8, letterSpacing: "0.08em",
      color: "var(--accent-label)", background: "rgba(232,255,71,0.08)",
      padding: "5px 11px", borderRadius: 5, border: "1px solid rgba(232,255,71,0.12)",
    }}>Badge</span>,
    <div key="input" style={{
      background: "#212121", border: "1px solid #333333",
      borderRadius: 7, padding: "9px 14px",
      fontFamily: "Space Grotesk", fontSize: 11, color: "var(--color-grey-400)",
    }}>Input field</div>,
  ]

  return (
    <div style={{ maxWidth: 700, width: "100%", display: "flex", flexDirection: "column", gap: 26 }}>

      {/* Color tokens — cascade in from left with bounce */}
      <div>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          style={labelStyle}
        >
          Colour tokens
        </motion.p>
        <div style={{ display: "flex", gap: 8 }}>
          {palette.map(({ token, hex }, i) => (
            <motion.div
              key={token}
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 15, delay: i * 0.07 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}
            >
              <div style={{ height: 64, borderRadius: 10, background: hex, border: "1px solid rgba(255,255,255,0.05)" }} />
              <div>
                <span style={{ fontFamily: "Space Mono", fontSize: 7, color: "var(--color-grey-500)", letterSpacing: "0.05em", display: "block" }}>{token}</span>
                <span style={{ fontFamily: "Space Mono", fontSize: 6.5, color: "var(--color-grey-500)", letterSpacing: "0.04em", display: "block", marginTop: 2 }}>{hex}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Type hierarchy — stagger in from left */}
      <div style={{ borderTop: "1px solid #232323", paddingTop: 22 }}>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: 0.38 }}
          style={labelStyle}
        >
          Type scale
        </motion.p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            <p key="h" style={{ fontFamily: "Space Grotesk", fontSize: 30, fontWeight: 700, color: "var(--color-grey-200)", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1 }}>
              Precision by design
            </p>,
            <p key="b" style={{ fontFamily: "Space Grotesk", fontSize: 13, color: "var(--color-grey-300)", lineHeight: 1.6, margin: 0 }}>
              Every decision documented and ready to hand off.
            </p>,
            <p key="l" style={{ fontFamily: "Space Mono", fontSize: 9, color: "var(--color-grey-500)", letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: 0 }}>
              System label · 01 · Active
            </p>,
          ].map((el, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.44 + i * 0.08 }}
            >
              {el}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Components — cascade in from right */}
      <div style={{ borderTop: "1px solid #232323", paddingTop: 22 }}>
        <motion.p
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: 0.62 }}
          style={labelStyle}
        >
          Components
        </motion.p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {components.map((el, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.68 + i * 0.07 }}
            >
              {el}
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ─── Integrations showcase ────────────────────────────────────────────────────

const INTEGRATION_TILES: { name: string; category: string; Icon: React.ElementType }[] = [
  { name: "Stripe",     category: "Payments",    Icon: CreditCard    },
  { name: "Supabase",   category: "Database",    Icon: Database      },
  { name: "Resend",     category: "Email",       Icon: MessageSquare },
  { name: "Twilio",     category: "SMS / Voice", Icon: Smartphone    },
  { name: "Vercel",     category: "Deployment",  Icon: Monitor       },
  { name: "OpenAI",     category: "AI / LLM",    Icon: Sparkles      },
  { name: "Zapier",     category: "Automation",  Icon: Zap           },
  { name: "GitHub",     category: "Source",      Icon: Terminal      },
  { name: "Cloudflare", category: "Edge / CDN",  Icon: Globe         },
]

function IntegrationsShowcase() {
  const [current, setCurrent] = useState<number | null>(null)
  const [connected, setConnected] = useState<Set<number>>(new Set())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const shuffle = (arr: number[]) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    let seq = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])
    let pos = 0

    const next = () => {
      if (pos < seq.length) {
        const idx = seq[pos]
        setCurrent(idx)
        setConnected(prev => new Set([...prev, idx]))
        pos++
        timeoutRef.current = setTimeout(next, 480)
      } else {
        setCurrent(null)
        timeoutRef.current = setTimeout(() => {
          setConnected(new Set())
          seq = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])
          pos = 0
          timeoutRef.current = setTimeout(next, 300)
        }, 1400)
      }
    }

    timeoutRef.current = setTimeout(next, 500)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 500 }}>
      {INTEGRATION_TILES.map(({ name, category, Icon }, i) => {
        const isCurrent  = current === i
        const isConnected = connected.has(i)
        return (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{
              // Once connected, a tile stays LIT (not dimmed) so by the end of
              // the sequence every integration is lit before the loop resets.
              background:  isCurrent ? "#1c1c06" : isConnected ? "#171703" : "#212121",
              border:     `1px solid ${isCurrent ? "rgba(232,255,71,0.4)" : isConnected ? "rgba(232,255,71,0.22)" : "#2f2f2f"}`,
              borderRadius: 7,
              padding: "13px 14px", display: "flex", alignItems: "center", gap: 10,
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <div style={{ flexShrink: 0, color: isCurrent ? "#e8ff47" : isConnected ? "#c2d63a" : "#454545", transition: "color 0.3s" }}>
              <Icon size={14} />
            </div>
            <div>
              <p style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600, color: isCurrent ? "#f5f5f5" : isConnected ? "#cfcfcf" : "#515151", margin: "0 0 1px", transition: "color 0.3s" }}>{name}</p>
              <p style={{ fontFamily: "Space Mono", fontSize: 8, color: isCurrent ? "#8a8a8a" : isConnected ? "#6a6a6a" : "#3f3f3f", margin: 0, letterSpacing: "0.04em", transition: "color 0.3s" }}>{category}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Security showcase ────────────────────────────────────────────────────────

const SECURITY_CHECKS = [
  { label: "Transport",      detail: "TLS 1.3 · HSTS",         Icon: Globe       },
  { label: "Authentication", detail: "OAuth 2.0 · MFA",        Icon: Fingerprint },
  { label: "Authorization",  detail: "RBAC · row-level rules", Icon: Lock        },
  { label: "Encryption",     detail: "AES-256 · bcrypt",       Icon: KeyRound    },
  { label: "Audit",          detail: "Logs · compliance",      Icon: FileCheck   },
]

function SecurityShowcase() {
  const [scanning, setScanning] = useState(-1)
  const [passed, setPassed] = useState<Set<number>>(new Set())
  const [complete, setComplete] = useState(false)

  // Below ~620px the fixed 520 card can't fit inside the page padding. The demo
  // wrapper (a justify-center flex item) won't shrink a definite-width child, so
  // we go fluid (100%) on narrow screens and keep the intended 520 on desktop.
  const [fluid, setFluid] = useState(() => typeof window !== "undefined" && window.innerWidth < 620)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 619px)")
    const onChange = (e: MediaQueryListEvent) => setFluid(e.matches)
    mq.addEventListener("change", onChange)
    setFluid(mq.matches)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const run = async () => {
      while (!cancelled) {
        setPassed(new Set()); setComplete(false); setScanning(-1)
        await wait(700)
        for (let i = 0; i < SECURITY_CHECKS.length; i++) {
          if (cancelled) return
          setScanning(i)
          await wait(560)
          if (cancelled) return
          setPassed(prev => new Set([...prev, i]))
          setScanning(-1)
          await wait(150)
        }
        if (cancelled) return
        setComplete(true)
        await wait(2800)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const passedCount = passed.size
  const progress = (passedCount / SECURITY_CHECKS.length) * 100

  return (
    <div style={{
      width: fluid ? "100%" : 520, maxWidth: "100%",
      background: "#1c1c1c", border: "1px solid #333333",
      borderRadius: 12, overflow: "hidden",
    }}>
      {/* Chrome header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #2b2b2b", background: "#212121" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <ShieldCheck size={13} color="#e8ff47" strokeWidth={2} />
          <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "#d0d0d0", letterSpacing: "0.02em" }}>security · audit</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={complete ? "secure" : "scan"}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.2 }}
              style={{
                fontFamily: "Space Mono", fontSize: 8.5, letterSpacing: "0.14em", padding: "3px 9px", borderRadius: 20,
                fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5,
                color: complete ? "#0d0d0d" : "#e8ff47",
                background: complete ? "#e8ff47" : "rgba(232,255,71,0.1)",
                border: `1px solid ${complete ? "#e8ff47" : "rgba(232,255,71,0.25)"}`,
              }}
            >
              {complete ? (
                <><ShieldCheck size={9} strokeWidth={3} /> SECURE</>
              ) : (
                <><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#e8ff47", display: "inline-block" }} /> SCANNING</>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "13px 16px", display: "flex", flexDirection: "column", gap: 11 }}>
        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { k: "Checks passed", v: `${passedCount}/${SECURITY_CHECKS.length}`, lit: complete },
            { k: "Threats",       v: "0",                                        lit: true      },
            { k: "Score",         v: complete ? "A+" : "—",                      lit: complete  },
          ].map(({ k, v, lit }) => (
            <div key={k} style={{ background: "#212121", border: "1px solid #2f2f2f", borderRadius: 8, padding: "9px 11px" }}>
              <p style={{ fontFamily: "Space Mono", fontSize: 7.5, color: "#7c7c7c", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 5px" }}>{k}</p>
              <p style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 700, color: lit ? "#e8ff47" : "#e8e8e8", margin: 0, lineHeight: 1 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Scan progress */}
        <div style={{ height: 3, background: "#2b2b2b", borderRadius: 2, overflow: "hidden" }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ height: "100%", background: "#e8ff47", boxShadow: "0 0 8px rgba(232,255,71,0.5)" }} />
        </div>

        {/* Check rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SECURITY_CHECKS.map(({ label, detail, Icon }, i) => {
            const isPassed = passed.has(i)
            const isScanning = scanning === i
            const active = isPassed || isScanning
            return (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "7px 12px", borderRadius: 7,
                background: active ? "rgba(232,255,71,0.05)" : "#212121",
                border: `1px solid ${isPassed ? "rgba(232,255,71,0.2)" : isScanning ? "rgba(232,255,71,0.4)" : "#2b2b2b"}`,
                transition: "background 0.3s, border-color 0.3s",
              }}>
                <div style={{ color: active ? "#e8ff47" : "#595959", transition: "color 0.3s", flexShrink: 0 }}>
                  <Icon size={14} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 600, color: active ? "#f2f2f2" : "#8f8f8f", margin: 0, transition: "color 0.3s" }}>{label}</p>
                  <p style={{ fontFamily: "Space Mono", fontSize: 8.5, color: active ? "#8a8a8a" : "#595959", margin: "1px 0 0", letterSpacing: "0.03em", transition: "color 0.3s" }}>{detail}</p>
                </div>
                <div style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isPassed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      style={{ width: 16, height: 16, borderRadius: "50%", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={10} strokeWidth={3.5} color="#0d0d0d" />
                    </motion.div>
                  ) : isScanning ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid rgba(232,255,71,0.25)", borderTopColor: "#e8ff47" }} />
                  ) : (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3f3f3f" }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Section data ─────────────────────────────────────────────────────────────

interface WorkSection {
  id: Category
  icon: React.ElementType
  label: string
  copy: string
  Demo: React.ComponentType
}

const WORK_SECTIONS: WorkSection[] = [
  {
    id:   "animations",
    icon: Sparkles,
    label: "Animations",
    copy: "Fluid transitions, scroll-driven motion, and micro-interactions that feel deliberate, not decorative. Every animated element is tuned for performance and purpose — guiding attention without getting in the way.",
    Demo: DeviceScrollIntro,
  },
  {
    id:   "frontend",
    icon: Layout,
    label: "Frontend",
    copy: "Responsive websites and apps that adapt across every screen size, native iOS and Android applications built from the ground up, and purpose-built desktop software for internal company operations and teams.",
    Demo: PhoneToDesktopDemo,
  },
  {
    id:   "backend",
    icon: Server,
    label: "Backend",
    copy: "Scalable APIs, authentication systems, real-time data pipelines, and background job queues — server infrastructure built to perform under load and adapt as your product grows.",
    Demo: BackendFlowDemo,
  },
  {
    id:   "database",
    icon: Database,
    label: "Database",
    copy: "Schemas designed for scale, migrations that never break production, and query patterns that stay fast as your data grows. PostgreSQL, Redis, and vector stores — modelled for the product you're building.",
    Demo: DatabaseShowcase,
  },
  {
    id:   "features",
    icon: Zap,
    label: "Features",
    copy: "Think of it as a pick-and-mix. You tell us what your product needs — an AI chatbox, a live support portal, real-time analytics — and we build it in. No bloated templates, no features you'll never touch. Just purposeful functionality, scoped and shipped.",
    Demo: FeaturesShowcase,
  },
  {
    id:   "design",
    icon: Palette,
    label: "Design",
    copy: "We work from centralised design systems and hold to best practices at every step — so your product stays consistent across every screen, every component, every update. Already have an established brand? We build around it. Starting from scratch? We bring the expertise to define your style and make it something worth owning.",
    Demo: DesignShowcase,
  },
  {
    id:   "integrations",
    icon: Globe,
    label: "Integrations",
    copy: "Payment processors, communication platforms, data providers, and internal tools — connected cleanly and maintained as APIs evolve. OAuth flows, webhooks, and SDK wrappers handled end to end.",
    Demo: IntegrationsShowcase,
  },
  {
    id:   "security",
    icon: ShieldCheck,
    label: "Security",
    copy: "Authentication, role-based access control, and encrypted data at rest and in transit. Security considered from architecture through deployment — with audits, dependency scanning, and compliance-ready documentation.",
    Demo: SecurityShowcase,
  },
  {
    id:   "analytics",
    icon: LineChart,
    label: "Analytics",
    copy: "Custom event pipelines, retention funnels, and dashboards built on real instrumentation. Capture what matters without flooding your data warehouse — and surface insights your team will actually act on.",
    Demo: AnalyticsDashboardDemo,
  },
]

// ─── Work page ────────────────────────────────────────────────────────────────

export default function Work() {
  const [active, setActive] = useState<Category>("animations")
  // The intro "video" (Animations) plays first with no dock. Once the user
  // scrolls to its end, the dock is revealed — minus the Animations icon,
  // since that section has now been seen.
  const [animationDone, setAnimationDone] = useState(false)
  // When the intro reaches its end, it auto-fades out and hands off to the
  // Frontend section (dock icon focused, PhoneToDesktopDemo auto-mounting from its
  // iPhone/mobile phase) — so the user never lands on a dead blank/white screen.
  const handleIntroEnd = () => {
    setActive("frontend")
    setAnimationDone(true)
  }
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Short viewport — a phone in landscape, or a browser window using only part
  // of the screen height. The demos overflow and the page scrolls there, so the
  // surrounding chrome tightens up to give them as much of the screen as it can.
  const [isShort, setIsShort] = useState(() => typeof window !== 'undefined' && window.innerHeight < 700)
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 699px)')
    const handler = (e: MediaQueryListEvent) => setIsShort(e.matches)
    mq.addEventListener('change', handler)
    setIsShort(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const section = WORK_SECTIONS.find(s => s.id === active)!
  const index   = WORK_SECTIONS.findIndex(s => s.id === active)

  // Dock is hidden while the intro video is still playing.
  const dockVisible  = active !== "animations" || animationDone
  // Drop the already-seen Animations icon from the dock.
  const dockNavItems = NAV_ITEMS.filter(i => i.id !== "animations")

  // One dock icon with a CSS-only hover tooltip. Pure :hover is used instead
  // of Radix here because Radix's JS hover-intent doesn't fire reliably in
  // Safari while the icon magnifies under the cursor. Tooltip is desktop-only
  // (no hover on touch).
  const dockIcon = (item: NavItem) => (
    <DockIcon key={item.id}>
      <button
        aria-label={item.label}
        onClick={() => setActive(item.id)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group relative size-12 rounded-full transition-colors",
          active === item.id
            ? "bg-accent text-grey-900 hover:bg-accent"
            : "text-grey-300 hover:text-grey-100 hover:bg-grey-700"
        )}
      >
        <item.icon className="size-5" />
        {!isMobile && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-popover-foreground/85 opacity-0 shadow-md transition duration-150 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {item.label}
          </span>
        )}
      </button>
    </DockIcon>
  )

  return (
    <>
      <div className={cn(
        "min-h-screen flex flex-col justify-center px-10 pt-20 sm:pt-8",
        isShort ? "pb-24" : "pb-32",
      )}>
        <div className="max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                // The intro fades/scrolls itself out imperatively (in DeviceScrollIntro),
                // so its section exit is opacity-only — NO transform, which would snap
                // the intro's fixed layer. Other sections keep the small y cross-fade.
                active === "animations"
                  ? { opacity: 0, transition: { duration: 0.3 } }
                  : { opacity: 0, y: -8 }
              }
              transition={{ duration: 0.4 }}
            >
              {/* Section header — guide style */}
              <div className={cn("flex items-baseline gap-5", isShort ? "mb-5" : "mb-10")}>
                <span className="font-mono text-[11px] text-foreground/20 tracking-widest">
                  {/* Dock sections are numbered 01–08 (Frontend…Analytics). The
                      Animations intro is index 0 and its header is hidden behind
                      the full-screen intro overlay, so its "00" is never seen. */}
                  {String(index).padStart(2, "0")}
                </span>
                <h2 className="font-mono text-[11px] tracking-[0.18em] text-foreground/50 uppercase">
                  {section.label}
                </h2>
                <div className="flex-1 border-t border-foreground/[0.06] self-center" />
              </div>

              {/* Copy */}
              <p className={cn("text-sm text-foreground/40 leading-relaxed max-w-xl", isShort ? "mb-6" : "mb-12")}>
                {section.copy}
              </p>

              {/* Demo / showcase — dark-scoped so the device mockups read as
                  dark product screenshots regardless of page theme. */}
              <div className={active === "design" || active === "animations" ? "flex justify-center" : "surface-dark flex justify-center"}>
                {active === "animations"
                  ? <DeviceScrollIntro onReachEnd={handleIntroEnd} />
                  : <div className={active === "design" ? undefined : "demo-lift"}><section.Demo /></div>}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dock — fixed bottom. Hidden during the intro video; slides up once
          it ends (Animations icon dropped, as it's already been seen). */}
      <AnimatePresence>
        {dockVisible && (
        <motion.div
          className="fixed bottom-6 left-0 right-0 flex justify-center px-2 z-[50]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className={isMobile ? "overflow-x-auto" : ""} style={{ scrollbarWidth: 'none', maxWidth: isMobile ? '98vw' : '100%' }}>
          <Dock direction="middle" iconSize={isMobile ? 28 : 44} iconMagnification={isMobile ? 44 : 66} disableMagnification={isMobile} className={isMobile ? "px-6 gap-3" : ""}>
            {dockNavItems.map(dockIcon)}

            <Separator orientation="vertical" className="h-full bg-grey-600" />

            {EXTRA_ITEMS.map(dockIcon)}
          </Dock>
        </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
