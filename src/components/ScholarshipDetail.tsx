import { ArrowLeft, Bookmark, Check, CircleAlert, ExternalLink, Sparkles, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Application, Match } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"
import { DeadlineBadge } from "./DeadlineBadge"
import { MatchRing } from "./MatchRing"
import { StatusBadge } from "./StatusBadge"

interface Props {
  match: Match
  saved: boolean
  app?: Application
  onBack: () => void
  onToggleSave: () => void
  onApply: () => void
}

export function ScholarshipDetail({ match, saved, app, onBack, onToggleSave, onApply }: Props) {
  const { scholarship: s, score, checks } = match
  const gaps = checks.filter((c) => !c.ok)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit lg:hidden" onClick={onBack}>
          <ArrowLeft /> Back to results
        </Button>
        <div className="flex items-start gap-4">
          <MatchRing score={score} size={64} />
          <div>
            <CardTitle className="text-xl">{s.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{s.provider}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={s.fullyFunded ? "success" : "default"}>{s.amountLabel}</Badge>
          <DeadlineBadge iso={s.deadline} />
          {app && <StatusBadge app={app} />}
          <span className="text-xs text-muted-foreground">Deadline {formatDate(s.deadline)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button className="flex-1" variant={app ? "secondary" : "accent"} onClick={onApply}>
            {app ? (app.status === "drafting" ? "Continue application" : "Open application") : "Start application"}
          </Button>
          <Button variant="outline" size="icon" className="size-10" onClick={onToggleSave} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save"}>
            <Bookmark className={cn(saved && "fill-primary text-primary")} />
          </Button>
        </div>

        <section aria-labelledby="why">
          <h4 id="why" className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
            <Sparkles className="size-4 text-accent-foreground" /> How you compare
          </h4>
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                <span>
                  <span className="font-medium">{c.label}.</span> <span className="text-muted-foreground">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          {gaps.length > 0 && (
            <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              {gaps.length === 1 ? "One thing to check" : `${gaps.length} things to check`} before you invest time here. Some of these are guides, not hard rules, so confirm with the provider.
            </p>
          )}
        </section>

        <section>
          <h4 className="mb-1 font-display text-sm font-semibold">About</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{s.about}</p>
        </section>

        <section>
          <h4 className="mb-2 font-display text-sm font-semibold">What it covers</h4>
          <div className="flex flex-wrap gap-2">
            {s.coverage.map((c) => (
              <Badge key={c} variant="outline">{c}</Badge>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-2 font-display text-sm font-semibold">You will need</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {s.documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Users className="mt-0.5 size-4 shrink-0" />
            <span>
              {s.referencesNeeded} {s.referencesNeeded === 1 ? "person" : "people"} to write a reference for you. Worth asking soon: people say yes more warmly when they have time.
            </span>
          </p>
        </section>

        <Button variant="link" asChild className="h-auto p-0">
          <a href={s.url} target="_blank" rel="noreferrer">
            Official page <ExternalLink />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
