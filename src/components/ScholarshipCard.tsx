import { Bookmark, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Application, Match } from "@/lib/types"
import { DeadlineBadge } from "./DeadlineBadge"
import { MatchRing } from "./MatchRing"
import { StatusBadge } from "./StatusBadge"

interface Props {
  match: Match
  selected: boolean
  saved: boolean
  isNew: boolean
  app?: Application
  onSelect: () => void
  onToggleSave: () => void
}

export function ScholarshipCard({ match, selected, saved, isNew, app, onSelect, onToggleSave }: Props) {
  const { scholarship: s, score } = match
  const passed = match.checks.filter((c) => c.ok).length

  return (
    <div className={cn("group relative rounded-lg border bg-card transition-colors", selected ? "border-primary ring-1 ring-primary" : "hover:border-primary/40")}>
      <button onClick={onSelect} className="flex w-full items-start gap-4 rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <MatchRing score={score} />
        <div className="min-w-0 flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug">{s.name}</h3>
            {isNew && <Badge variant="accent">New</Badge>}
            {app && <StatusBadge app={app} />}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {s.country} · {s.provider}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={s.fullyFunded ? "success" : "default"}>{s.amountLabel}</Badge>
            <DeadlineBadge iso={s.deadline} />
            <span className="text-xs text-muted-foreground">Meets {passed} of {match.checks.length} criteria</span>
          </div>
        </div>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${s.name} from saved` : `Save ${s.name}`}
      >
        <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
      </Button>
    </div>
  )
}
