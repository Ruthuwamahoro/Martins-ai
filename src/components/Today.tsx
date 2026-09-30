import { useEffect, useState } from "react"
import { ArrowRight, HandHeart, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { findMatches } from "@/lib/ai"
import { appProgress, isNew, nextStep } from "@/lib/progress"
import type { Match, WorkspaceStep } from "@/lib/types"
import { communityTips, greeting, todayLine } from "@/lib/voice"
import { daysUntil } from "@/lib/utils"
import { useApp } from "@/state"
import { DeadlineBadge } from "./DeadlineBadge"
import { MatchRing } from "./MatchRing"

interface Props {
  onOpenApp: (id: string, step?: WorkspaceStep) => void
  onDiscover: (tab?: "all" | "new" | "saved") => void
  onPeople: () => void
}

/** The first thing a student sees. Warm, short, and pointed at one useful thing. */
export function Today({ onOpenApp, onDiscover, onPeople }: Props) {
  const { profile, catalog, apps, essays, people, viewedIds, checkForNew } = useApp()
  const [matches, setMatches] = useState<Match[]>([])
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    findMatches(profile, "", catalog).then(setMatches)
  }, [profile, catalog])

  const active = Object.values(apps)
    .filter((a) => a.status === "drafting")
    .map((a) => ({ a, s: catalog.find((c) => c.id === a.scholarshipId)! }))
    .filter((x) => x.s)
    .sort((x, y) => x.s.deadline.localeCompare(y.s.deadline))

  const soonest = active[0] ? { name: active[0].s.name, days: daysUntil(active[0].s.deadline) } : undefined
  const fresh = matches.filter((m) => isNew(m.scholarship, viewedIds) && !apps[m.scholarship.id]).slice(0, 3)
  const waiting = active.flatMap(({ a, s }) => a.references.filter((r) => r.status === "not_asked").map((r) => ({ s, person: people.find((p) => p.id === r.personId), appId: a.scholarshipId }))).filter((x) => x.person)
  const tip = communityTips[Math.floor(Date.now() / 86_400_000) % communityTips.length]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{greeting(profile.name)}.</h1>
        <p className="mt-2 text-lg text-muted-foreground">{todayLine(active.length, soonest)}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle>Where you left off</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {active.length === 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground">You haven't started an application yet. That's okay. Look at what fits you and choose one.</p>
                  <Button className="mt-3" onClick={() => onDiscover("all")}>Find a scholarship</Button>
                </div>
              ) : (
                active.slice(0, 3).map(({ a, s }) => {
                  const next = nextStep(s, a, essays, people)
                  const pct = appProgress(s, a, essays)
                  return (
                    <div key={s.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{s.name}</h3>
                          <DeadlineBadge iso={s.deadline} />
                        </div>
                        <Button size="sm" onClick={() => onOpenApp(s.id, next.step)}>Continue <ArrowRight /></Button>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={pct} className="max-w-[200px]" aria-label={`${s.name} progress`} />
                        <span className="text-sm text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Next small step: {next.text}</p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>New for you</CardTitle>
              <Button
                variant="outline"
                size="sm"
                disabled={checking}
                onClick={async () => {
                  setChecking(true)
                  const added = await checkForNew()
                  setChecking(false)
                  setNotice(added.length ? `${added.length} newly posted: ${added.map((x) => x.name).join(", ")}.` : "You're up to date.")
                }}
              >
                {checking ? <Loader2 className="animate-spin" /> : <RefreshCw />} Check for new
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p role="status" className="text-sm text-success">{notice}</p>
              {fresh.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing new you haven't looked at. We'll keep watching.</p>
              ) : (
                fresh.map((m) => (
                  <button key={m.scholarship.id} onClick={() => onDiscover("new")} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <MatchRing score={m.score} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="truncate font-medium">{m.scholarship.name}</span><Badge variant="accent">New</Badge></span>
                      <span className="text-sm text-muted-foreground">{m.scholarship.amountLabel}</span>
                    </span>
                    <DeadlineBadge iso={m.scholarship.deadline} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {waiting.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><HandHeart className="size-4" /> Someone to write to</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {waiting.slice(0, 2).map((w) => (
                  <div key={w.appId + w.person!.id} className="text-sm">
                    <p>Ask <strong>{w.person!.name}</strong> for a reference for {w.s.name}.</p>
                    <Button variant="link" className="h-auto p-0" onClick={() => onOpenApp(w.appId, "people")}>Write the message</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4" /> A thought for today</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm leading-relaxed">{tip.text}</blockquote>
              <p className="mt-2 text-xs text-muted-foreground">{tip.from}</p>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={onPeople}>Your people</Button>
        </div>
      </div>
    </div>
  )
}
