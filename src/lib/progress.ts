import type { Application, Essay, Person, Scholarship, WorkspaceStep } from "./types"
import { daysUntil, wordCount } from "./utils"

export function essayFor(app: Application, essays: Essay[]) {
  return app.essayId ? (essays.find((e) => e.id === app.essayId) ?? null) : null
}

/** A "new" scholarship was posted in the last two weeks and hasn't been opened yet. */
export function isNew(s: Scholarship, viewedIds: string[]) {
  return !viewedIds.includes(s.id) && daysUntil(s.postedAt) >= -14
}

export function appProgress(s: Scholarship, app: Application, essays: Essay[]) {
  const docsDone = s.documents.filter((d) => app.docs[d]).length
  const essay = essayFor(app, essays)
  const essayRatio = essay ? Math.min(1, wordCount(essay.body) / s.essayTarget) : 0
  const refsDone = Math.min(s.referencesNeeded, app.references.filter((r) => r.status === "received").length)
  const total = s.documents.length + 1 + s.referencesNeeded
  return Math.round(((docsDone + essayRatio + refsDone) / total) * 100)
}

/**
 * One small thing to do next. We never show a to-do list of twelve items;
 * we show the single most useful step and let the person breathe.
 */
export function nextStep(s: Scholarship, app: Application, essays: Essay[], people: Person[]): { text: string; step: WorkspaceStep } {
  const name = (id: string) => people.find((p) => p.id === id)?.name.split(" ")[0] ?? "someone"
  const essay = essayFor(app, essays)
  const words = essay ? wordCount(essay.body) : 0
  const missingDoc = s.documents.find((d) => !app.docs[d])
  const notAsked = app.references.filter((r) => r.status === "not_asked")
  const waiting = app.references.filter((r) => r.status === "asked")
  const received = app.references.filter((r) => r.status === "received").length

  if (!app.why.trim()) return { text: "Write one line about why this matters to you.", step: "why" }
  if (app.references.length < s.referencesNeeded) {
    const n = s.referencesNeeded - app.references.length
    return { text: `Choose ${n} ${n === 1 ? "person" : "people"} who can speak to your work.`, step: "people" }
  }
  if (notAsked.length) return { text: `Ask ${name(notAsked[0].personId)} for a reference. Early asks get kinder answers.`, step: "people" }
  if (!essay || words < s.essayTarget * 0.8) {
    return { text: essay ? `Keep writing. You're at ${words} of ${s.essayTarget} words.` : "Start your essay. A rough first draft is enough.", step: "essay" }
  }
  if (missingDoc) return { text: `Gather your ${missingDoc.toLowerCase()}.`, step: "documents" }
  if (received < s.referencesNeeded && waiting.length) return { text: `Check in gently with ${name(waiting[0].personId)}.`, step: "people" }
  return { text: "Read it through once, then submit on the official portal.", step: "review" }
}
