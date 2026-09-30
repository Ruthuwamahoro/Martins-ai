import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { COUNTRIES, FIELDS } from "@/lib/data"
import type { Level, Profile } from "@/lib/types"
import { useApp } from "@/state"

export function ProfileView({ onSaved }: { onSaved: () => void }) {
  const { profile, setProfile, resetAll } = useApp()
  const [form, setForm] = useState<Profile>(profile)
  const [done, setDone] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setDone(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">About you</h1>
      <p className="mt-2 text-muted-foreground">We use this to check scholarships against your situation. It stays on this device.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              setProfile(form)
              setDone(true)
            }}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="mb-1.5 block">What should we call you?</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country" className="mb-1.5 block">Nationality</Label>
              <Select id="country" value={form.country} onChange={(e) => set("country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="plevel" className="mb-1.5 block">Studying for</Label>
              <Select id="plevel" value={form.level} onChange={(e) => set("level", e.target.value as Level)}>
                <option>Undergraduate</option>
                <option>Master's</option>
                <option>PhD</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="field" className="mb-1.5 block">Field</Label>
              <Select id="field" value={form.field} onChange={(e) => set("field", e.target.value)}>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="gpa" className="mb-1.5 block">GPA (out of 4.0)</Label>
              <Input id="gpa" type="number" min={0} max={4} step={0.1} value={form.gpa} onChange={(e) => set("gpa", Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="goal" className="mb-1.5 block">What do you hope to do once you graduate?</Label>
              <Textarea id="goal" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
              <p className="mt-1.5 text-xs text-muted-foreground">We use this to suggest questions to think about when you write.</p>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit">Save</Button>
              {done && (
                <>
                  <span className="flex items-center gap-1 text-sm text-success"><Check className="size-4" /> Saved</span>
                  <Button type="button" variant="link" onClick={onSaved}>See updated matches</Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">Your data lives on this device</p>
            <p className="text-sm text-muted-foreground">Essays, people and applications are saved in your browser. Clearing it removes the sample content too.</p>
          </div>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>Keep everything</Button>
              <Button size="sm" className="bg-red-700 text-white hover:bg-red-700/90" onClick={() => { resetAll(); setConfirmReset(false); onSaved() }}>Erase and start over</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>Start over</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
