import { cn } from "@/lib/utils"

export function MatchRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const tone = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : "text-muted-foreground"
  return (
    <div className={cn("relative shrink-0", tone)} style={{ width: size, height: size }} role="img" aria-label={`${score} percent match`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className="stroke-secondary" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-foreground">{score}</span>
    </div>
  )
}
