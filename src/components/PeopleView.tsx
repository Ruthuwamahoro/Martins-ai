import { useState } from "react"
import { Mail, Pencil, Plus, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/lib/types"
import { empty } from "@/lib/voice"
import { useApp } from "@/state"

type Draft = Omit<Person, "id">
const blank: Draft = { name: "", relationship: "", email: "", canSpeakTo: "" }

export function PeopleView() {
  const { people, apps, catalog, addPerson, updatePerson, removePerson } = useApp()
  const [editing, setEditing] = useState<string | "new" | null>(people.length === 0 ? "new" : null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const helping = (personId: string) =>
    Object.values(apps).flatMap((a) => {
      const r = a.references.find((x) => x.personId === personId)
      const s = catalog.find((c) => c.id === a.scholarshipId)
      return r && s ? [{ s, r }] : []
    })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your people</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">Lecturers, managers, mentors, friends who read drafts. Scholarships are won with help. Keep track of who's helping, and remember to thank them.</p>
        </div>
        <Button onClick={() => setEditing("new")}><Plus /> Add someone</Button>
      </div>

      {editing === "new" && (
        <PersonForm
          initial={blank}
          submitLabel="Add to my people"
          onCancel={() => setEditing(null)}
          onSave={(d) => {
            addPerson(d)
            setEditing(null)
          }}
        />
      )}

      {people.length === 0 && editing !== "new" && (
        <div className="py-16 text-center">
          <Users className="mx-auto mb-4 size-10 text-muted-foreground" />
          <h2 className="text-2xl font-bold">{empty.people.title}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">{empty.people.body}</p>
        </div>
      )}

      <ul className="space-y-3">
        {people.map((p) => {
          const items = helping(p.id)
          if (editing === p.id) {
            return (
              <li key={p.id}>
                <PersonForm
                  initial={{ name: p.name, relationship: p.relationship, email: p.email, canSpeakTo: p.canSpeakTo }}
                  submitLabel="Save changes"
                  onCancel={() => setEditing(null)}
                  onSave={(d) => {
                    updatePerson(p.id, d)
                    setEditing(null)
                  }}
                />
              </li>
            )
          }
          return (
            <li key={p.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.relationship}</p>
                      {p.canSpeakTo && <p className="mt-2 text-sm">Can speak to: <span className="text-muted-foreground">{p.canSpeakTo}</span></p>}
                      {p.email && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Mail className="size-3.5" /> {p.email}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p.id)}><Pencil /> Edit</Button>
                      {confirm === p.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Keep</Button>
                          <Button size="sm" className="bg-red-700 text-white hover:bg-red-700/90" onClick={() => { removePerson(p.id); setConfirm(null) }}>Remove</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirm(p.id)} aria-label={`Remove ${p.name}`}><Trash2 /></Button>
                      )}
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Helping you with</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(({ s, r }) => (
                          <Badge key={s.id} variant={r.status === "received" ? "success" : r.status === "asked" ? "accent" : "outline"}>
                            {s.name.split(" ")[0]} · {r.status === "received" ? "sent" : r.status === "asked" ? "asked" : "not asked yet"}
                            {r.thankedAt ? " · thanked" : ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PersonForm({ initial, submitLabel, onSave, onCancel }: { initial: Draft; submitLabel: string; onSave: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (d.name.trim()) onSave({ ...d, name: d.name.trim() })
          }}
        >
          <div>
            <Label htmlFor="pn" className="mb-1.5 block">Name</Label>
            <Input id="pn" value={d.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
          </div>
          <div>
            <Label htmlFor="pr" className="mb-1.5 block">How you know them</Label>
            <Input id="pr" value={d.relationship} onChange={(e) => set("relationship", e.target.value)} placeholder="Lecturer, manager, mentor…" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pe" className="mb-1.5 block">Email</Label>
            <Input id="pe" type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="Optional. Lets us open a message in your email app." />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pc" className="mb-1.5 block">What have they seen you do?</Label>
            <Input id="pc" value={d.canSpeakTo} onChange={(e) => set("canSpeakTo", e.target.value)} placeholder="e.g. supervised my final-year project" />
            <p className="mt-1.5 text-xs text-muted-foreground">We use this to make your request specific. It's easier for someone to say yes when they remember why you asked them.</p>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">{submitLabel}</Button>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
