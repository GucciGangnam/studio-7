export default function Dev() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex items-baseline justify-center" style={{ width: 200, height: 200 }}>
        <span
          className="font-mono font-semibold text-foreground/90 select-none"
          style={{ fontSize: 96, lineHeight: 1, letterSpacing: '0.05em' }}
        >
          S
        </span>
        <span
          className="font-mono font-semibold text-accent select-none"
          style={{ fontSize: 96, lineHeight: 1, marginLeft: 4 }}
        >
          7
        </span>
      </div>
    </div>
  )
}
