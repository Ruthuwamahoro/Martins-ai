import { useState } from "react"
import { Check, Clock, HandHeart, UserPlus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import type { Scholarship } from "@/lib/types"
import { askForReferenceMessage } from "@/lib/voice"
import { formatDate, timeAgo } from "@/lib/utils"
import { useApp } from "@/state"
import { MessageComposer } from "./MessageComposer"

/**
 * References are the part of an application that depends on someone else's
 * time and goodwill. So this panel is about the relationship, not a checklist:
 * who you're asking, what they've seen of your work, and a message that is
 * honest, specific and easy to say no to.
 */
export function ReferencesPanel({ appId, scholarship, onAddPeople }: { appId: string; scholarship: Scholarship; onAddPeople: () => void }) {
  const { apps, people, profile, addReference, removeReference, setReferenceStatus } = useApp()
  const app = apps[appId]
  const [writingTo, setWritingTo] = useState<string | null>(null)
  const [pick, setPick] = useState("")
  if (!app) return null

  const available = people.filter((p) => !app.references.some((r) => r.personId === p.id))
  const received = app.references.filter((r) => r.status === "received").length

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {scholarship.name} asks for <strong className="text-foreground">{scholarship.referencesNeeded}</strong> {scholarship.referencesNeeded === 1 ? "reference" : "references"}. You have {received} so far. Ask at least three weeks before {formatDate(scholarship.deadline)}: people are busy, and they say yes more warmly when you give them time.
      </p>

      <ul className="space-y-3">
        {app.references.map((r) => {
          const person = people.find((p) => p.id === r.personId)
          if (!person) return null
          const msg = askForReferenceMessage({ person, applicant: profile.name, scholarship, why: app.why })
          return (
            <li key={r.personId} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.relationship}{person.canSpeakTo ? ` · ${person.canSpeakTo}` : ""}</p>
                </div>
                {r.status === "received" ? (
                  <Badge variant="success"><Check className="size-3" /> Received</Badge>
                ) : r.status === "asked" ? (
                  <Badge variant="accent"><Clock className="size-3" /> Asked {r.askedAt ? timeAgo(r.askedAt) : ""}</Badge>
                ) : (
                  <Badge variant="outline">Not asked yet</Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "received" && (
                  <Button size="sm" variant={r.status === "not_asked" ? "default" : "outline"} onClick={() => setWritingTo(writingTo === r.personId ? null : r.personId)}>
                    <HandHeart /> {r.status === "not_asked" ? `Write to ${person.name.split(" ")[0]}` : "Send a gentle reminder"}
                  </Button>
                )}
                {r.status === "asked" && (
                  <Button size="sm" variant="secondary" onClick={() => setReferenceStatus(appId, r.personId, "received")}>They've sent it</Button>
                )}
                {r.status === "received" && (
                  <Button size="sm" variant="ghost" onClick={() => setReferenceStatus(appId, r.personId, "asked")}>Undo</Button>
                )}
                {r.status === "not_asked" && (
                  <Button size="sm" variant="ghost" onClick={() => setReferenceStatus(appId, r.personId, "asked")}>I've already asked</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => removeReference(appId, r.personId)} aria-label={`Remove ${person.name} from this application`}>
                  <X /> Remove
                </Button>
              </div>

              {writingTo === r.personId && (
                <div className="mt-4">
                  <MessageComposer
                    key={r.status}
                    to={person.email}
                    initialSubject={r.status === "asked" ? "Checking in, no pressure" : msg.subject}
                    initialBody={
                      r.status === "asked"
                        ? `Dear ${person.name.split(" ")[0]},\n\nI hope you're well. I wanted to check in gently about the reference for the ${scholarship.name}. The deadline is ${formatDate(scholarship.deadline)}. If it's become too much, please tell me and I'll find another way. I'm grateful either way.\n\nWarmly,\n${profile.name}`
                        : msg.body
                    }
                    onSent={() => setReferenceStatus(appId, r.personId, "asked")}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {app.references.length < scholarship.referencesNeeded && (
        <div className="rounded-lg border border-dashed p-4">
          <p className="mb-2 text-sm font-medium">
            Choose {scholarship.referencesNeeded - app.references.length} more {scholarship.referencesNeeded - app.references.length === 1 ? "person" : "people"}
          </p>
          {available.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-64">
                <Select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Choose someone from your people">
                  <option value="">Choose from your people…</option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                  ))}
                </Select>
              </div>
              <Button
                disabled={!pick}
                onClick={() => {
                  addReference(appId, pick)
                  setPick("")
                }}
              >
                Add
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You've used everyone on your People list. Add someone new to continue.</p>
          )}
          <Button variant="link" className="mt-1 h-auto p-0" onClick={onAddPeople}>
            <UserPlus /> Add someone new to your people
          </Button>
        </div>
      )}
    </div>
  )
}
