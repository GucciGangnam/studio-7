import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ─── primitives ──────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.16em] text-white/30 uppercase block mb-1.5">
      {children}
    </span>
  )
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-10">
      <span className="font-mono text-[11px] text-white/20 tracking-widest">{index}</span>
      <h2 className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">{title}</h2>
      <div className="flex-1 border-t border-white/[0.06] self-center" />
    </div>
  )
}

function Divider() {
  return <div className="border-t border-white/[0.05] my-16" />
}

// ─── color swatches ───────────────────────────────────────────────────────────

function Swatch({ token, hex, textClass = 'text-white/30' }: { token: string; hex: string; textClass?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-10 rounded-[3px] border border-white/[0.06]"
        style={{ backgroundColor: hex }}
      />
      <Label>{token}</Label>
      <span className={`font-mono text-[10px] ${textClass}`}>{hex}</span>
    </div>
  )
}

// ─── spacing bar ─────────────────────────────────────────────────────────────

function SpacingRow({ label, px, cls }: { label: string; px: number; cls: string }) {
  return (
    <div className="flex items-center gap-5">
      <span className="font-mono text-[10px] text-white/30 w-16 text-right">{label}</span>
      <div
        className="h-[1px] bg-white/20"
        style={{ width: px }}
      />
      <span className="font-mono text-[10px] text-white/20">{cls} · {px}px</span>
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function StyleGuide() {
  return (
    <div className="max-w-5xl mx-auto px-10 pt-28 pb-32">

      {/* Page title */}
      <div className="mb-20">
        <Label>studio 7</Label>
        <h1 className="font-mono text-[11px] tracking-[0.2em] text-white/15 uppercase mt-0">
          Design System / Style Reference
        </h1>
      </div>


      {/* ── 01 COLORS ───────────────────────────────────────────────────── */}
      <SectionHeader index="01" title="Colors" />

      {/* Semantic */}
      <Label>Semantic tokens</Label>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-10">
        <Swatch token="background"   hex="#000000" />
        <Swatch token="foreground"   hex="#ffffff" />
        <Swatch token="card"         hex="#080808" />
        <Swatch token="popover"      hex="#0f0f0f" />
        <Swatch token="primary"      hex="#ffffff" />
        <Swatch token="secondary"    hex="#1a1a1a" />
        <Swatch token="muted"        hex="#1a1a1a" />
        <Swatch token="border"       hex="#1a1a1a" />
        <Swatch token="input"        hex="#1a1a1a" />
        <Swatch token="ring"         hex="#e8ff47" />
      </div>

      {/* Accent + SG palette */}
      <Label>Palette — accent</Label>
      <div className="grid grid-cols-6 gap-3 mb-10">
        <Swatch token="accent"        hex="#e8ff47" />
        <Swatch token="accent-dim"    hex="#b8cc2e" />
        <Swatch token="accent-muted"  hex="#2a2e0a" />
        <Swatch token="accent-fg"     hex="#000000" />
        <Swatch token="destructive"   hex="#ff4a4a" />
        <Swatch token="destr-dim"     hex="#7a1a1a" />
      </div>

      <Label>Palette — SG blue</Label>
      <div className="grid grid-cols-6 gap-3 mb-10">
        <Swatch token="sg-blue"       hex="#4a8cff" />
        <Swatch token="sg-blue-dim"   hex="#1a3a7a" />
      </div>

      {/* Grey scale */}
      <Label>Grey scale</Label>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {[
          ['950', '#050505'],
          ['900', '#0a0a0a'],
          ['800', '#141414'],
          ['700', '#1a1a1a'],
          ['600', '#2a2a2a'],
          ['500', '#444444'],
          ['400', '#666666'],
          ['300', '#888888'],
          ['200', '#bbbbbb'],
          ['100', '#eeeeee'],
        ].map(([step, hex]) => (
          <Swatch key={step} token={`grey-${step}`} hex={hex} />
        ))}
      </div>

      <Divider />


      {/* ── 02 TYPOGRAPHY ───────────────────────────────────────────────── */}
      <SectionHeader index="02" title="Typography" />

      {/* Font families */}
      <Label>Font families</Label>
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="p-5 border border-white/[0.07] rounded-[3px]">
          <span className="font-mono text-[10px] tracking-widest text-white/25 block mb-3">--font-sans · Space Grotesk</span>
          <p className="font-sans text-2xl font-light text-white/80">Light 300</p>
          <p className="font-sans text-2xl font-normal text-white/80">Regular 400</p>
          <p className="font-sans text-2xl font-medium text-white/80">Medium 500</p>
          <p className="font-sans text-2xl font-semibold text-white/80">Semibold 600</p>
          <p className="font-sans text-2xl font-bold text-white/80">Bold 700</p>
        </div>
        <div className="p-5 border border-white/[0.07] rounded-[3px]">
          <span className="font-mono text-[10px] tracking-widest text-white/25 block mb-3">--font-mono · Space Mono</span>
          <p className="font-mono text-xl font-normal text-white/80">Regular 400</p>
          <p className="font-mono text-xl font-bold text-white/80">Bold 700</p>
          <p className="font-mono text-xl italic text-white/80">Italic 400</p>
          <p className="font-mono text-xl italic font-bold text-white/80">Italic Bold 700</p>
        </div>
      </div>

      {/* Type scale */}
      <Label>Type scale</Label>
      <div className="space-y-0 border border-white/[0.07] rounded-[3px] overflow-hidden mb-12">
        {[
          { cls: 'text-xs',   size: '12px',  tw: 'text-xs',   sample: 'The quick brown fox' },
          { cls: 'text-sm',   size: '14px',  tw: 'text-sm',   sample: 'The quick brown fox' },
          { cls: 'text-base', size: '16px',  tw: 'text-base', sample: 'The quick brown fox' },
          { cls: 'text-lg',   size: '18px',  tw: 'text-lg',   sample: 'The quick brown fox' },
          { cls: 'text-xl',   size: '20px',  tw: 'text-xl',   sample: 'The quick brown fox' },
          { cls: 'text-2xl',  size: '24px',  tw: 'text-2xl',  sample: 'The quick brown fox' },
          { cls: 'text-3xl',  size: '30px',  tw: 'text-3xl',  sample: 'The quick brown fox' },
          { cls: 'text-4xl',  size: '36px',  tw: 'text-4xl',  sample: 'The quick brown' },
          { cls: 'text-5xl',  size: '48px',  tw: 'text-5xl',  sample: 'The quick brown' },
          { cls: 'text-6xl',  size: '60px',  tw: 'text-6xl',  sample: 'The quick' },
          { cls: 'text-7xl',  size: '72px',  tw: 'text-7xl',  sample: 'Studio 7' },
          { cls: 'text-8xl',  size: '96px',  tw: 'text-8xl',  sample: 'Studio' },
        ].map(({ cls, size, tw, sample }, i) => (
          <div key={cls} className={`flex items-baseline gap-6 px-5 py-3 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
            <span className="font-mono text-[10px] text-white/20 w-16 shrink-0">{cls}</span>
            <span className="font-mono text-[10px] text-white/15 w-10 shrink-0">{size}</span>
            <span className={`${tw} text-white/70 leading-none tracking-tight`}>{sample}</span>
          </div>
        ))}
      </div>

      {/* Heading hierarchy */}
      <Label>Heading hierarchy</Label>
      <div className="p-8 border border-white/[0.07] rounded-[3px] space-y-5 mb-12">
        <div>
          <Label>h1 · text-5xl · bold · tracking-tight</Label>
          <h1 className="text-5xl font-bold tracking-tight leading-tight">Precision by design</h1>
        </div>
        <div>
          <Label>h2 · text-3xl · bold · tracking-tight</Label>
          <h2 className="text-3xl font-bold tracking-tight">What we build</h2>
        </div>
        <div>
          <Label>h3 · text-xl · semibold · tracking-tight</Label>
          <h3 className="text-xl font-semibold tracking-tight">Web Applications</h3>
        </div>
        <div>
          <Label>h4 · text-base · semibold</Label>
          <h4 className="text-base font-semibold">Project Overview</h4>
        </div>
        <div>
          <Label>p · text-base · normal · text-muted-foreground</Label>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            We build software that ships. Fast, precise, and built to last — from concept to
            production in weeks, not months. Every line intentional.
          </p>
        </div>
        <div>
          <Label>small · text-sm · text-muted-foreground</Label>
          <p className="text-sm text-muted-foreground">Supporting copy, captions, helper text</p>
        </div>
        <div>
          <Label>mono label · font-mono · text-xs · tracking-widest</Label>
          <p className="font-mono text-xs tracking-widest text-white/50 uppercase">System label · 01 · Status</p>
        </div>
      </div>

      {/* Letter spacing */}
      <Label>Letter spacing (tracking)</Label>
      <div className="border border-white/[0.07] rounded-[3px] overflow-hidden">
        {[
          { name: 'tightest', val: '-0.04em', cls: 'tracking-tightest' },
          { name: 'tighter',  val: '-0.02em', cls: 'tracking-tighter'  },
          { name: 'tight',    val: '-0.01em', cls: 'tracking-tight'    },
          { name: 'normal',   val: '0em',     cls: 'tracking-normal'   },
          { name: 'wide',     val: '0.05em',  cls: 'tracking-wide'     },
          { name: 'wider',    val: '0.1em',   cls: 'tracking-wider'    },
          { name: 'widest',   val: '0.2em',   cls: 'tracking-widest'   },
        ].map(({ name, val, cls }, i) => (
          <div key={name} className={`flex items-center gap-8 px-5 py-3 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
            <span className="font-mono text-[10px] text-white/25 w-20 shrink-0">{name}</span>
            <span className="font-mono text-[10px] text-white/15 w-16 shrink-0">{val}</span>
            <span className={`${cls} text-sm text-white/60 font-mono`}>STUDIO SEVEN</span>
          </div>
        ))}
      </div>

      <Divider />


      {/* ── 03 SPACING ──────────────────────────────────────────────────── */}
      <SectionHeader index="03" title="Spacing" />
      <div className="space-y-3">
        <SpacingRow label="space-1"  px={4}   cls="1"  />
        <SpacingRow label="space-2"  px={8}   cls="2"  />
        <SpacingRow label="space-3"  px={12}  cls="3"  />
        <SpacingRow label="space-4"  px={16}  cls="4"  />
        <SpacingRow label="space-5"  px={20}  cls="5"  />
        <SpacingRow label="space-6"  px={24}  cls="6"  />
        <SpacingRow label="space-8"  px={32}  cls="8"  />
        <SpacingRow label="space-10" px={40}  cls="10" />
        <SpacingRow label="space-12" px={48}  cls="12" />
        <SpacingRow label="space-16" px={64}  cls="16" />
        <SpacingRow label="space-20" px={80}  cls="20" />
        <SpacingRow label="space-24" px={96}  cls="24" />
        <SpacingRow label="space-32" px={128} cls="32" />
        <SpacingRow label="space-40" px={160} cls="40" />
        <SpacingRow label="space-48" px={192} cls="48" />
      </div>

      <Divider />


      {/* ── 04 RADIUS ───────────────────────────────────────────────────── */}
      <SectionHeader index="04" title="Border Radius" />
      <div className="flex items-end gap-8 flex-wrap">
        {[
          { token: 'radius-xs',  px: '2px',    cls: 'rounded-[2px]',    size: 'h-12 w-12' },
          { token: 'radius-sm',  px: '4px',    cls: 'rounded-[4px]',    size: 'h-14 w-14' },
          { token: 'radius-md',  px: '8px',    cls: 'rounded-[8px]',    size: 'h-16 w-16' },
          { token: 'radius-lg',  px: '16px',   cls: 'rounded-[16px]',   size: 'h-20 w-20' },
          { token: 'radius-full',px: '9999px', cls: 'rounded-full',     size: 'h-20 w-20' },
        ].map(({ token, px, cls, size }) => (
          <div key={token} className="flex flex-col items-center gap-3">
            <div className={`${size} ${cls} border border-white/20 bg-white/[0.04]`} />
            <Label>{token}</Label>
            <span className="font-mono text-[10px] text-white/20">{px}</span>
          </div>
        ))}
      </div>

      <Divider />


      {/* ── 05 BORDERS ──────────────────────────────────────────────────── */}
      <SectionHeader index="05" title="Borders" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'border-border',   cls: 'border border-border'           },
          { label: 'border-white/10', cls: 'border border-white/10'         },
          { label: 'border-white/20', cls: 'border border-white/20'         },
          { label: 'border-accent',   cls: 'border border-accent'           },
        ].map(({ label, cls }) => (
          <div key={label} className={`h-14 rounded-[3px] ${cls} flex items-center justify-center`}>
            <span className="font-mono text-[10px] text-white/30">{label}</span>
          </div>
        ))}
      </div>

      <Divider />


      {/* ── 06 COMPONENTS ───────────────────────────────────────────────── */}
      <SectionHeader index="06" title="Components" />

      {/* Buttons */}
      <Label>Button — variants</Label>
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>

      <Label>Button — sizes</Label>
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <Button size="lg">Large</Button>
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon">⊞</Button>
      </div>

      <Label>Button — accent (custom)</Label>
      <div className="flex flex-wrap items-center gap-3 mb-12">
        <Button className="bg-accent text-accent-foreground hover:bg-accent-dim font-mono tracking-widest text-xs">
          CTA PRIMARY
        </Button>
        <Button variant="outline" className="border-white/15 font-mono tracking-widest text-xs hover:bg-white/[0.04]">
          CTA SECONDARY
        </Button>
      </div>

      {/* Badges */}
      <Label>Badge — variants</Label>
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge className="bg-accent text-accent-foreground font-mono tracking-wider text-[10px]">Accent</Badge>
        <Badge className="bg-white/[0.06] text-white/50 border border-white/10 font-mono tracking-wider text-[10px]">Subtle</Badge>
      </div>

      {/* Input */}
      <Label>Input</Label>
      <div className="grid grid-cols-2 gap-4 max-w-lg mb-12">
        <Input placeholder="Default input" />
        <Input placeholder="Disabled input" disabled />
      </div>

      {/* Cards */}
      <Label>Card</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider">Default card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">bg-card · border-border</p>
          </CardContent>
        </Card>
        <Card className="border-white/15">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider">Elevated border</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">border-white/15</p>
          </CardContent>
        </Card>
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-sm font-mono tracking-wider text-accent">Accent border</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">border-accent/30</p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
