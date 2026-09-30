import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { findMatches } from "@/lib/ai"
import { isNew } from "@/lib/progress"
import type { Level, Match } from "@/lib/types"
import { cn, timeAgo } from "@/lib/utils"
import { useApp } from "@/state"
import { ScholarshipCard } from "./ScholarshipCard"
import { ScholarshipDetail } from "./ScholarshipDetail"

const SUGGESTIONS = ["Fully funded master's in Europe", "Scholarships with a monthly stipend", "Health or public service focus"]
type Tab = "all" | "new" | "saved"

export function Discover({ onApply, initialTab = "all" }: { onApply: (id: string) => void; initialTab?: Tab }) {
  const { profile, catalog, saved, toggleSave, apps, startApp, viewedIds, markViewed, checkForNew, lastCheckedAt } = useApp()
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sort, setSort] = useState<"match" | "deadline" | "amount">("match")
  const [level, setLevel] = useState<"All" | Level>("All")
  const [eligibleOnly, setEligibleOnly] = useState(false)
  const [tab, setTab] = useState<Tab>(initialTab)
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState("")

  const run = useCallback(
    async (q: string) => {
      setLoading(true)
      const res = await findMatches(profile, q, catalog)
      setMatches(res)
      setLoading(false)
    },
    [profile, catalog]
  )

  // Re-score whenever the profile or the catalog changes (for example after a fetch).
  useEffect(() => {
    run(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const visible = useMemo(() => {
    let list = matches.filter((m) => (level === "All" ? true : m.scholarship.levels.includes(level)))
    if (tab === "new") list = list.filter((m) => isNew(m.scholarship, viewedIds))
    if (tab === "saved") list = list.filter((m) => saved.includes(m.scholarship.id))
    if (eligibleOnly) list = list.filter((m) => m.checks.every((c) => c.ok))
    if (sort === "deadline") list = [...list].sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline))
    if (sort === "amount") list = [...list].sort((a, b) => b.scholarship.amountValue - a.scholarship.amountValue)
    return list
  }, [matches, level, eligibleOnly, sort, tab, viewedIds, saved])

  // Keep a sensible selection as filters change.
  useEffect(() => {
    if (!visible.some((m) => m.scholarship.id === selectedId)) setSelectedId(visible[0]?.scholarship.id ?? null)
  }, [visible, selectedId])

  const selected = visible.find((m) => m.scholarship.id === selectedId) ?? null
  const newCount = matches.filter((m) => isNew(m.scholarship, viewedIds)).length
  const top = matches[0]

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "new", label: "New", count: newCount },
    { id: "saved", label: "Saved", count: saved.length },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Funding for {profile.level === "Undergraduate" ? "your degree" : `your ${profile.level.toLowerCase()}`}, matched to you.</h1>
        <p className="mt-2 text-muted-foreground">Ejo checks each scholarship's rules against your profile, so you know where you stand before you write a word.</p>

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            run(query)
          }}
        >
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe what you're looking for" className="h-11 pl-9" aria-label="Describe what you're looking for" />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />} Find matches
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s)
                run(s)
              }}
              className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className={showDetail ? "hidden lg:block" : ""}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Show" className="inline-flex gap-1 rounded-lg bg-secondary p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tab === t.id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs", t.id === "new" ? "bg-accent text-accent-foreground" : "bg-secondary")}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">{lastCheckedAt ? `Checked ${timeAgo(lastCheckedAt)}` : "Not checked yet"}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={checking}
                onClick={async () => {
                  setChecking(true)
                  const added = await checkForNew()
                  setChecking(false)
                  setNotice(added.length ? `${added.length} new: ${added.map((a) => a.name).join(", ")}.` : "You're up to date. Nothing new since you last looked.")
                  if (added.length) setTab("new")
                }}
              >
                <RefreshCw className={cn(checking && "animate-spin")} /> Check for new
              </Button>
            </div>
          </div>
          <p className="sr-only" role="status">{notice}</p>
          {notice && <p className="mb-3 rounded-md bg-success-soft px-3 py-2 text-sm text-success">{notice}</p>}

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Label htmlFor="level" className="mb-1.5 block text-xs text-muted-foreground">Level</Label>
              <Select id="level" value={level} onChange={(e) => setLevel(e.target.value as "All" | Level)}>
                <option>All</option>
                <option>Undergraduate</option>
                <option>Master's</option>
                <option>PhD</option>
              </Select>
            </div>
            <div className="w-40">
              <Label htmlFor="sort" className="mb-1.5 block text-xs text-muted-foreground">Sort by</Label>
              <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="match">Best match</option>
                <option value="deadline">Nearest deadline</option>
                <option value="amount">Highest value</option>
              </Select>
            </div>
            <div className="flex h-10 items-center gap-2">
              <Checkbox id="elig" checked={eligibleOnly} onCheckedChange={(v) => setEligibleOnly(v === true)} />
              <Label htmlFor="elig" className="font-normal">Only where I meet every criterion</Label>
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Checking scholarships against your profile…" : top ? `${visible.length} shown. Best fit right now: ${top.scholarship.name} at ${top.score}%.` : "No scholarships found."}
          </p>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-secondary" />)
            ) : visible.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {tab === "new" ? "Nothing new right now. Try “Check for new”." : tab === "saved" ? "You haven't saved any yet. Tap the bookmark on anything that catches your eye." : 'Nothing matches these filters. Clear "Only where I meet every criterion" or change the level.'}
              </div>
            ) : (
              visible.map((m) => (
                <ScholarshipCard
                  key={m.scholarship.id}
                  match={m}
                  selected={m.scholarship.id === selectedId}
                  saved={saved.includes(m.scholarship.id)}
                  isNew={isNew(m.scholarship, viewedIds)}
                  app={apps[m.scholarship.id]}
                  onSelect={() => {
                    setSelectedId(m.scholarship.id)
                    setShowDetail(true)
                    markViewed(m.scholarship.id)
                  }}
                  onToggleSave={() => toggleSave(m.scholarship.id)}
                />
              ))
            )}
          </div>
        </div>

        <aside className={showDetail ? "" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            {selected ? (
              <ScholarshipDetail
                match={selected}
                saved={saved.includes(selected.scholarship.id)}
                app={apps[selected.scholarship.id]}
                onBack={() => setShowDetail(false)}
                onToggleSave={() => toggleSave(selected.scholarship.id)}
                onApply={() => {
                  startApp(selected.scholarship)
                  onApply(selected.scholarship.id)
                }}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Select a scholarship to see how you compare.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
