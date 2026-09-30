import { useEffect, useState } from "react"
import { Check, CircleAlert, History, Loader2, MessageSquareText, Plus, Save, Send, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { generateOutline, reviewEssay } from "@/lib/ai"
import type { EssayReview } from "@/lib/types"
import { askForFeedbackMessage } from "@/lib/voice"
import { cn, formatDate, timeAgo, wordCount } from "@/lib/utils"
import { useApp } from "@/state"
import { MessageComposer } from "./MessageComposer"

interface Props {
  essayId: string
  onDeleted?: () => void
}

/**
 * The place a student actually writes.
 *
 * It saves as they type, keeps earlier versions they choose to keep, and makes
 * it easy to ask a real person to read the draft, then keep that person's
 * comments right next to the words they're about. Writing is lonely; the
 * editor tries to make it a little less so.
 */
export function EssayEditor({ essayId, onDeleted }: Props) {
  const { essays, catalog, people, profile, updateEssay, saveVersion, restoreVersion, deleteEssay, addNote, removeNote } = useApp()
  const essay = essays.find((e) => e.id === essayId)
  const scholarship = essay?.scholarshipId ? catalog.find((s) => s.id === essay.scholarshipId) : undefined

  const [outline, setOutline] = useState<string[] | null>(null)
  const [review, setReview] = useState<EssayReview | null>(null)
  const [busy, setBusy] = useState<"outline" | "review" | null>(null)
  const [readerId, setReaderId] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [noteAuthor, setNoteAuthor] = useState("")
  const [noteText, setNoteText] = useState("")
  const [, tick] = useState(0)

  // Keep "saved 2 minutes ago" honest without re-rendering every second.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 20_000)
    return () => clearInterval(t)
  }, [])

  if (!essay) return null
  const words = wordCount(essay.body)
  const target = scholarship?.essayTarget
  const reader = people.find((p) => p.id === readerId)

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <Label htmlFor="essay-title" className="sr-only">Essay title</Label>
          <Input
            id="essay-title"
            value={essay.title}
            onChange={(e) => updateEssay(essay.id, { title: e.target.value })}
            className="h-auto border-0 bg-transparent px-0 font-display text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder="Give it a title"
          />
          {essay.prompt && <p className="mt-2 rounded-md bg-secondary p-3 text-sm">{essay.prompt}</p>}
        </div>

        <div>
          <Textarea
            value={essay.body}
            onChange={(e) => {
              updateEssay(essay.id, { body: e.target.value })
              setReview(null)
            }}
            placeholder="Begin anywhere. A rough sentence is better than a blank page. You can shape it later."
            className="min-h-[360px] text-base leading-relaxed"
            aria-label="Essay text"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className={cn(target && words >= target * 0.8 && "font-medium text-success")}>
                {words}
                {target ? ` / ${target}` : ""} words
              </span>
              <span className="mx-2">·</span>
              Saved on this device {timeAgo(essay.updatedAt)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => saveVersion(essay.id)} disabled={!essay.body.trim()}>
                <Save /> Keep this version
              </Button>
              {scholarship && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={async () => {
                      setBusy("outline")
                      setOutline(await generateOutline(scholarship, profile))
                      setBusy(null)
                    }}
                  >
                    {busy === "outline" ? <Loader2 className="animate-spin" /> : <Sparkles />} Ideas to think about
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null || words < 20}
                    onClick={async () => {
                      setBusy("review")
                      setReview(await reviewEssay(essay.body, scholarship))
                      setBusy(null)
                    }}
                  >
                    {busy === "review" ? <Loader2 className="animate-spin" /> : <Sparkles />} Check my draft
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {outline && (
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-display text-sm font-semibold">Questions to think about</h4>
            <ul className="space-y-2">
              {outline.map((o, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{o}</span>
                  <Button variant="ghost" size="sm" className="h-7 shrink-0" onClick={() => updateEssay(essay.id, { body: `${essay.body}${essay.body ? "\n\n" : ""}[${o}]` })}>
                    <Plus /> Add
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">These are prompts, not sentences to copy. Reviewers can tell whose story they're reading.</p>
          </div>
        )}

        {review && (
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-display text-sm font-semibold">A quick read of your draft</h4>
            <ul className="space-y-2">
              {review.checks.map((c) => (
                <li key={c.label} className="flex gap-2 text-sm">
                  {c.ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                  <span>
                    <span className="font-medium">{c.label}</span>
                    {!c.ok && <span className="block text-muted-foreground">{c.tip}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---- Real readers ---- */}
        <details className="rounded-lg border p-4" open={essay.notes.length > 0}>
          <summary className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold">
            <MessageSquareText className="size-4" /> From the people who read it ({essay.notes.length})
          </summary>
          <div className="mt-4 space-y-4">
            {essay.notes.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. A second pair of eyes is the best edit there is. Ask someone below.</p>}
            {essay.notes.map((n) => (
              <figure key={n.id} className="rounded-md bg-secondary/60 p-3">
                <blockquote className="text-sm leading-relaxed">{n.text}</blockquote>
                <figcaption className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{n.author} · {formatDate(n.createdAt)}</span>
                  <button onClick={() => removeNote(essay.id, n.id)} className="rounded underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))}

            <form
              className="grid gap-2 sm:grid-cols-[180px_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                if (!noteText.trim()) return
                addNote(essay.id, noteAuthor, noteText)
                setNoteText("")
              }}
            >
              <Input value={noteAuthor} onChange={(e) => setNoteAuthor(e.target.value)} placeholder="Who said it?" aria-label="Who said it" />
              <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Paste what they told you" aria-label="Their comment" />
              <Button type="submit" variant="secondary" disabled={!noteText.trim()}>Add comment</Button>
            </form>

            <div className="border-t pt-4">
              <Label htmlFor="reader" className="mb-1.5 block text-sm">Ask someone to read this</Label>
              {people.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add someone on the People page and they'll show up here.</p>
              ) : (
                <div className="max-w-sm">
                  <Select id="reader" value={readerId} onChange={(e) => setReaderId(e.target.value)}>
                    <option value="">Choose a person…</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                    ))}
                  </Select>
                </div>
              )}
              {reader && (
                <div className="mt-3">
                  <MessageComposer
                    key={reader.id + essay.id}
                    to={reader.email}
                    initialSubject={askForFeedbackMessage({ person: reader, applicant: profile.name, essayTitle: essay.title, body: essay.body }).subject}
                    initialBody={askForFeedbackMessage({ person: reader, applicant: profile.name, essayTitle: essay.title, body: essay.body }).body}
                    sendLabel="Open in my email app"
                  />
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Send className="size-3" /> Long essays can be cut off by email apps. If so, use "Copy message".</p>
                </div>
              )}
            </div>
          </div>
        </details>

        <details className="rounded-lg border p-4">
          <summary className="flex cursor-pointer items-center gap-2 font-display text-sm font-semibold">
            <History className="size-4" /> Earlier versions ({essay.versions.length})
          </summary>
          <div className="mt-3 space-y-2">
            {essay.versions.length === 0 && <p className="text-sm text-muted-foreground">Nothing kept yet. Use "Keep this version" before a big rewrite, and you can always come back.</p>}
            {essay.versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{v.label} · {wordCount(v.body)} words</p>
                  <p className="truncate text-xs text-muted-foreground">{timeAgo(v.savedAt)} · {v.body.slice(0, 80) || "(empty)"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => restoreVersion(essay.id, v.id)}>Restore</Button>
              </div>
            ))}
          </div>
        </details>

        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">Started {formatDate(essay.createdAt)}</p>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Delete this essay for good?</span>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Keep it</Button>
              <Button
                size="sm"
                className="bg-red-700 text-white hover:bg-red-700/90"
                onClick={() => {
                  deleteEssay(essay.id)
                  onDeleted?.()
                }}
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete essay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
