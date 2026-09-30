import { useState } from "react"
import { ArrowRight, Bookmark, Check, FileText, HeartHandshake, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { appProgress, nextStep } from "@/lib/progress"
import type { Application, Outcome, Scholarship, WorkspaceStep } from "@/lib/types"
import { empty, outcomeMessage, thankYouMessage } from "@/lib/voice"
import { formatDate } from "@/lib/utils"
import { useApp } from "@/state"
import { DeadlineBadge } from "./DeadlineBadge"
import { MessageComposer } from "./MessageComposer"
import { StatusBadge } from "./StatusBadge"

type TabId = "all" | "saved" | "drafting" | "submitted" | "completed"

export function ApplicationsView({ onOpen, onDiscover }: { onOpen: (id: string, step?: WorkspaceStep) => void; onDiscover: () => void }) {
  const { apps, saved, catalog } = useApp()
  const [tab, setTab] = useState<TabId>("all")

  const byId = (id: string) => catalog.find((s) => s.id === id)
  const appList = Object.values(apps)
    .map((a) => ({ a, s: byId(a.scholarshipId) }))
    .filter((x): x is { a: Application; s: Scholarship } => !!x.s)
  const savedOnly = catalog.filter((s) => saved.includes(s.id) && !apps[s.id])

  const groups = {
    saved: savedOnly.map((s) => ({ s, a: undefined as Application | undefined })),
    drafting: appList.filter((x) => x.a.status === "drafting"),
    submitted: appList.filter((x) => x.a.status === "submitted"),
    completed: appList.filter((x) => x.a.status === "completed"),
  }
  const total = groups.saved.length + appList.length

  if (total === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <FileText className="mx-auto mb-4 size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{empty.applications.title}</h1>
        <p className="mt-2 text-muted-foreground">{empty.applications.body}</p>
        <Button className="mt-6" onClick={onDiscover}>Find scholarships</Button>
      </div>
    )
  }

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All", count: total },
    { id: "saved", label: "Saved", count: groups.saved.length },
    { id: "drafting", label: "In progress", count: groups.drafting.length },
    { id: "submitted", label: "Submitted", count: groups.submitted.length },
    { id: "completed", label: "Completed", count: groups.completed.length },
  ]

  const rowsFor = (id: TabId) => (id === "all" ? [...groups.drafting, ...groups.submitted, ...groups.saved, ...groups.completed] : groups[id])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Your applications</h1>
      <p className="mt-1 text-muted-foreground">Everything you've saved, started, sent and finished, in one place.</p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="mt-6">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
              <span className="rounded-full bg-background/60 px-1.5 text-xs">{t.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="space-y-3">
            {rowsFor(t.id).length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t.id === "completed" ? "Nothing finished yet. When you hear back from a scholarship, record it here." : t.id === "submitted" ? "Nothing sent yet. When you submit one, it'll wait here while you hear back." : "Nothing here yet."}
              </p>
            ) : (
              rowsFor(t.id).map(({ s, a }) => <Row key={s.id} s={s} a={a} onOpen={onOpen} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function Row({ s, a, onOpen }: { s: Scholarship; a?: Application; onOpen: (id: string, step?: WorkspaceStep) => void }) {
  const { essays, people, startApp, toggleSave, reopenApp } = useApp()

  // Saved, not started
  if (!a) {
    return (
      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Bookmark className="size-4 fill-primary text-primary" />
            <h3 className="font-semibold">{s.name}</h3>
            <DeadlineBadge iso={s.deadline} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{s.provider}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => toggleSave(s.id)}>Remove</Button>
          <Button variant="accent" onClick={() => { startApp(s); onOpen(s.id) }}>Start application</Button>
        </div>
      </Card>
    )
  }

  if (a.status === "drafting") {
    const pct = appProgress(s, a, essays)
    const next = nextStep(s, a, essays, people)
    return (
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{s.name}</h3>
              <StatusBadge app={a} />
              <DeadlineBadge iso={s.deadline} />
            </div>
            {a.why.trim() && <p className="mt-2 max-w-xl text-sm italic text-muted-foreground">“{a.why.trim()}”</p>}
          </div>
          <Button onClick={() => onOpen(s.id, next.step)}>Continue <ArrowRight /></Button>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="max-w-xs" aria-label={`${s.name} progress`} />
          <span className="text-sm text-muted-foreground">{pct}%</span>
        </div>
        <p className="flex items-start gap-2 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-foreground" /> <span><span className="font-medium">Next small step:</span> {next.text}</span></p>
      </Card>
    )
  }

  if (a.status === "submitted") return <SubmittedRow s={s} a={a} onOpen={onOpen} />

  // completed
  const msg = a.outcome ? outcomeMessage(a.outcome, s.name) : null
  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{s.name}</h3>
          <StatusBadge app={a} />
        </div>
        <Button variant="ghost" size="sm" onClick={() => reopenApp(s.id)}>Reopen</Button>
      </div>
      {msg && (
        <div className="rounded-md bg-secondary/70 p-3">
          <p className="font-display font-semibold">{msg.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{msg.body}</p>
        </div>
      )}
      {a.reflection?.trim() && (
        <p className="text-sm"><span className="font-medium">What you'd tell yourself next time:</span> <span className="text-muted-foreground">{a.reflection}</span></p>
      )}
      <ThankYou s={s} a={a} />
    </Card>
  )
}

function SubmittedRow({ s, a, onOpen }: { s: Scholarship; a: Application; onOpen: (id: string) => void }) {
  const { completeApp } = useApp()
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [reflection, setReflection] = useState("")

  const options: { id: Outcome; label: string }[] = [
    { id: "awarded", label: "I was awarded it" },
    { id: "not_selected", label: "I wasn't selected" },
    { id: "withdrawn", label: "I withdrew" },
  ]

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{s.name}</h3>
            <StatusBadge app={a} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Submitted {a.submittedAt ? formatDate(a.submittedAt) : ""}. Waiting is the hardest part. Be kind to yourself while you do.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpen(s.id)}>View</Button>
          <Button variant="secondary" onClick={() => setOpen((o) => !o)}>I heard back</Button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 rounded-lg border bg-secondary/40 p-4">
          <p className="text-sm font-medium">What happened?</p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <Button key={o.id} size="sm" variant={outcome === o.id ? "default" : "outline"} aria-pressed={outcome === o.id} onClick={() => setOutcome(o.id)}>
                {outcome === o.id && <Check />} {o.label}
              </Button>
            ))}
          </div>
          <div>
            <label htmlFor={`refl-${s.id}`} className="mb-1.5 block text-sm">What would you tell yourself next time? <span className="text-muted-foreground">(optional)</span></label>
            <Textarea id={`refl-${s.id}`} value={reflection} onChange={(e) => setReflection(e.target.value)} className="min-h-[80px]" />
          </div>
          <Button disabled={!outcome} onClick={() => outcome && completeApp(s.id, outcome, reflection)}>Save</Button>
        </div>
      )}
    </Card>
  )
}

/** Closing the loop with the people who helped. This matters more than any badge. */
function ThankYou({ s, a }: { s: Scholarship; a: Application }) {
  const { people, profile, markThanked } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const helpers = a.references.filter((r) => r.status === "received" || r.status === "asked")
  if (helpers.length === 0) return null

  return (
    <div className="space-y-2 border-t pt-3">
      <p className="flex items-center gap-2 text-sm font-medium"><HeartHandshake className="size-4" /> Thank the people who helped</p>
      {helpers.map((r) => {
        const person = people.find((p) => p.id === r.personId)
        if (!person) return null
        const msg = thankYouMessage({ person, applicant: profile.name, scholarship: s, outcome: a.outcome })
        return (
          <div key={r.personId}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{person.name}</span>
              {r.thankedAt ? (
                <Badge variant="success"><Check className="size-3" /> Thanked</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setOpen(open === r.personId ? null : r.personId)}>Write a thank-you</Button>
              )}
            </div>
            {open === r.personId && !r.thankedAt && (
              <div className="mt-2">
                <MessageComposer to={person.email} initialSubject={msg.subject} initialBody={msg.body} onSent={() => markThanked(s.id, r.personId)} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
