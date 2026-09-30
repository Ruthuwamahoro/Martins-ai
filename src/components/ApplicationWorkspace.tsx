import { useState } from "react"
import { ArrowLeft, Check, CircleAlert, ExternalLink, FileCheck2, Heart, ListChecks, PenLine, Send, Unlink, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { appProgress, essayFor } from "@/lib/progress"
import type { WorkspaceStep } from "@/lib/types"
import { cn, wordCount } from "@/lib/utils"
import { useApp } from "@/state"
import { DeadlineBadge } from "./DeadlineBadge"
import { EssayEditor } from "./EssayEditor"
import { ReferencesPanel } from "./ReferencesPanel"
import { StatusBadge } from "./StatusBadge"

interface Props {
  id: string
  initialStep?: WorkspaceStep
  onBack: () => void
  onOpenWriting: (essayId: string) => void
  onOpenPeople: () => void
}

export function ApplicationWorkspace({ id, initialStep = "why", onBack, onOpenWriting, onOpenPeople }: Props) {
  const { apps, catalog, essays, updateApp, submitApp, createEssay } = useApp()
  const s = catalog.find((x) => x.id === id)
  const app = apps[id]
  const [step, setStep] = useState<WorkspaceStep>(initialStep)
  if (!s || !app) return null

  const essay = essayFor(app, essays)
  const words = essay ? wordCount(essay.body) : 0
  const docsDone = s.documents.filter((d) => app.docs[d]).length
  const refsReceived = app.references.filter((r) => r.status === "received").length
  const pct = appProgress(s, app, essays)
  const essayReady = words >= s.essayTarget * 0.8
  const canSubmit = docsDone === s.documents.length && essayReady && refsReceived >= s.referencesNeeded
  const locked = app.status !== "drafting"

  const steps: { id: WorkspaceStep; label: string; icon: typeof ListChecks; done: boolean }[] = [
    { id: "why", label: "Your reason", icon: Heart, done: app.why.trim().length > 0 },
    { id: "documents", label: "Documents", icon: ListChecks, done: docsDone === s.documents.length },
    { id: "people", label: "People", icon: Users, done: refsReceived >= s.referencesNeeded },
    { id: "essay", label: "Essay", icon: PenLine, done: essayReady },
    { id: "review", label: "Review", icon: FileCheck2, done: app.status !== "drafting" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="-ml-2 mb-4" onClick={onBack}>
        <ArrowLeft /> All applications
      </Button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{s.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <DeadlineBadge iso={s.deadline} />
            <StatusBadge app={app} />
          </div>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <Progress value={pct} aria-label="Application progress" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Application steps" className="flex gap-2 overflow-x-auto md:flex-col">
          {steps.map((st) => (
            <button
              key={st.id}
              onClick={() => setStep(st.id)}
              aria-current={step === st.id ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                step === st.id ? "border-primary bg-card ring-1 ring-primary" : "bg-card/50 text-muted-foreground hover:bg-card"
              )}
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", st.done ? "bg-success text-white" : "bg-secondary")}>
                {st.done ? <Check className="size-4" /> : <st.icon className="size-4" />}
              </span>
              {st.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {step === "why" && (
            <Card>
              <CardHeader>
                <CardTitle>Why does this matter to you?</CardTitle>
                <p className="text-sm text-muted-foreground">This is just for you. When the essay gets hard or the paperwork gets long, come back and read it.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={app.why}
                  onChange={(e) => updateApp(id, { why: e.target.value })}
                  placeholder="For example: My village clinic still runs on paper. I want to learn how to change that."
                  className="min-h-[140px] text-base leading-relaxed"
                  aria-label="Why this matters to you"
                />
                <p className="text-xs text-muted-foreground">We'll show it on your applications page, and use it (only if you send it) when you ask someone for a reference.</p>
                <Button onClick={() => setStep("documents")}>Next: documents</Button>
              </CardContent>
            </Card>
          )}

          {step === "documents" && (
            <Card>
              <CardHeader>
                <CardTitle>Gather your documents</CardTitle>
                <p className="text-sm text-muted-foreground">{docsDone} of {s.documents.length} ready. Tick each one when you have a final copy. Take them one at a time.</p>
              </CardHeader>
              <CardContent className="space-y-1">
                {s.documents.map((d) => (
                  <div key={d} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-secondary/60">
                    <Checkbox id={d} checked={!!app.docs[d]} disabled={locked} onCheckedChange={(v) => updateApp(id, { docs: { ...app.docs, [d]: v === true } })} />
                    <label htmlFor={d} className={cn("flex-1 cursor-pointer text-sm", app.docs[d] && "text-muted-foreground line-through")}>{d}</label>
                  </div>
                ))}
                <div className="pt-4"><Button onClick={() => setStep("people")}>Next: your people</Button></div>
              </CardContent>
            </Card>
          )}

          {step === "people" && (
            <Card>
              <CardHeader>
                <CardTitle>The people behind your application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReferencesPanel appId={id} scholarship={s} onAddPeople={onOpenPeople} />
                <Button onClick={() => setStep("essay")}>Next: your essay</Button>
              </CardContent>
            </Card>
          )}

          {step === "essay" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">The question they're asking</CardTitle>
                  <p className="rounded-md bg-secondary p-3 text-sm">{s.essayPrompt}</p>
                  <p className="text-xs text-muted-foreground">Aim for about {s.essayTarget} words.</p>
                </CardHeader>
              </Card>

              {essay ? (
                <>
                  <EssayEditor key={essay.id} essayId={essay.id} />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onOpenWriting(essay.id)}>Open in Writing</Button>
                    <Button variant="ghost" size="sm" onClick={() => updateApp(id, { essayId: null })}>
                      <Unlink /> Detach from this application
                    </Button>
                  </div>
                </>
              ) : (
                <EssayChooser
                  onNew={() => {
                    const eid = createEssay({ title: `${s.name} essay`, prompt: s.essayPrompt, scholarshipId: s.id })
                    updateApp(id, { essayId: eid })
                  }}
                  onAdapt={(fromId) => {
                    const from = essays.find((e) => e.id === fromId)
                    if (!from) return
                    const eid = createEssay({ title: `${from.title} (for ${s.name})`, body: from.body, prompt: s.essayPrompt, scholarshipId: s.id })
                    updateApp(id, { essayId: eid })
                  }}
                  onLink={(eid) => updateApp(id, { essayId: eid })}
                />
              )}
              {essay && <Button onClick={() => setStep("review")}>Next: review</Button>}
            </div>
          )}

          {step === "review" && (
            <Card>
              <CardHeader>
                <CardTitle>{app.status === "drafting" ? "Ready to submit?" : "You've submitted this one"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {app.status === "drafting"
                    ? "Martins AI doesn't send your application. Submit it on the official portal, then come back and mark it done."
                    : "Take a breath. Tell your referees it's in, and note when you expect to hear back."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <Row ok={app.why.trim().length > 0}>Your reason is written</Row>
                  <Row ok={docsDone === s.documents.length}>{docsDone} of {s.documents.length} documents ready</Row>
                  <Row ok={refsReceived >= s.referencesNeeded}>{refsReceived} of {s.referencesNeeded} references received</Row>
                  <Row ok={essayReady}>Essay at {words} of {s.essayTarget} words</Row>
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <a href={s.url} target="_blank" rel="noreferrer">Open official portal <ExternalLink /></a>
                  </Button>
                  {app.status === "drafting" && (
                    <Button disabled={!canSubmit} onClick={() => submitApp(id)}>
                      <Send /> I've submitted it
                    </Button>
                  )}
                  {app.status === "submitted" && <Badge variant="success">Submitted</Badge>}
                </div>
                {!canSubmit && app.status === "drafting" && <p className="text-xs text-muted-foreground">This unlocks when everything above is ticked. No rush; it will wait for you.</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? <Check className="size-4 text-success" /> : <CircleAlert className="size-4 text-amber-600" />}
      {children}
    </li>
  )
}

function EssayChooser({ onNew, onAdapt, onLink }: { onNew: () => void; onAdapt: (essayId: string) => void; onLink: (essayId: string) => void }) {
  const { essays, apps } = useApp()
  const usedIds = new Set(Object.values(apps).map((a) => a.essayId))
  return (
    <Card>
      <CardHeader>
        <CardTitle>How would you like to begin?</CardTitle>
        <p className="text-sm text-muted-foreground">Every application deserves its own essay, but it can grow out of a story you already told.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button onClick={onNew}><PenLine /> Start with a blank page</Button>
        {essays.length > 0 && (
          <div>
            <h4 className="mb-2 font-display text-sm font-semibold">Or grow one from your Writing</h4>
            <ul className="space-y-2">
              {essays.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{e.title}</span>
                    <span className="text-xs text-muted-foreground">{wordCount(e.body)} words</span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => onAdapt(e.id)}>Adapt a copy</Button>
                    {!usedIds.has(e.id) && <Button size="sm" variant="ghost" onClick={() => onLink(e.id)}>Use this one</Button>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">"Adapt a copy" leaves your original untouched.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
