import { useMemo, useState } from "react"
import { ArrowLeft, PenLine, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { empty, writingPrompts } from "@/lib/voice"
import { cn, timeAgo, wordCount } from "@/lib/utils"
import { useApp } from "@/state"
import { EssayEditor } from "./EssayEditor"

export function WritingView({ initialEssayId }: { initialEssayId?: string }) {
  const { essays, createEssay, catalog } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(initialEssayId ?? null)
  const [q, setQ] = useState("")

  const list = useMemo(
    () =>
      [...essays]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .filter((e) => (e.title + " " + e.body).toLowerCase().includes(q.toLowerCase())),
    [essays, q]
  )

  const selected = essays.find((e) => e.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your writing</h1>
          <p className="mt-1 text-muted-foreground">Your stories, saved. Come back to them, reshape them, reuse the parts that are truly you.</p>
        </div>
        <Button onClick={() => setSelectedId(createEssay())}><Plus /> New essay</Button>
      </div>

      {essays.length === 0 ? (
        <div className="mx-auto max-w-xl py-16 text-center">
          <PenLine className="mx-auto mb-4 size-10 text-muted-foreground" />
          <h2 className="text-2xl font-bold">{empty.writing.title}</h2>
          <p className="mt-2 text-muted-foreground">{empty.writing.body}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {writingPrompts.map((p) => (
              <Button key={p.title} variant="outline" onClick={() => setSelectedId(createEssay({ title: p.title, prompt: p.hint }))}>{p.title}</Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className={cn("space-y-3", selected && "hidden lg:block")}>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your essays" className="pl-9" aria-label="Search your essays" />
            </div>
            <ul className="space-y-2">
              {list.map((e) => {
                const sch = e.scholarshipId ? catalog.find((c) => c.id === e.scholarshipId) : undefined
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => setSelectedId(e.id)}
                      className={cn(
                        "w-full rounded-lg border bg-card p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        e.id === selectedId ? "border-primary ring-1 ring-primary" : "hover:border-primary/40"
                      )}
                    >
                      <p className="truncate font-medium">{e.title || "Untitled essay"}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.body.trim() || "Nothing written yet."}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {wordCount(e.body)} words · {timeAgo(e.updatedAt)}
                        {sch && <Badge variant="outline">{sch.name.split(" ")[0]}</Badge>}
                        {e.notes.length > 0 && <Badge>{e.notes.length} comment{e.notes.length > 1 ? "s" : ""}</Badge>}
                      </p>
                    </button>
                  </li>
                )
              })}
              {list.length === 0 && <li className="text-sm text-muted-foreground">No essays match “{q}”.</li>}
            </ul>
            <div className="rounded-lg border border-dashed p-3">
              <p className="mb-2 text-xs font-medium">Need a place to begin?</p>
              <div className="flex flex-wrap gap-1.5">
                {writingPrompts.map((p) => (
                  <button key={p.title} onClick={() => setSelectedId(createEssay({ title: p.title, prompt: p.hint }))} className="rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(!selected && "hidden lg:block")}>
            {selected ? (
              <>
                <Button variant="ghost" size="sm" className="-ml-2 mb-2 lg:hidden" onClick={() => setSelectedId(null)}>
                  <ArrowLeft /> All essays
                </Button>
                <EssayEditor key={selected.id} essayId={selected.id} onDeleted={() => setSelectedId(null)} />
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Pick an essay to keep working, or start a new one.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
