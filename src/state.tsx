/**
 * Everything a student would hate to lose lives in this store: their profile,
 * the scholarships they follow, their applications, their essays and the
 * people who help them.
 *
 * It's persisted to this device's localStorage so a closed tab or a dropped
 * connection never costs anyone their draft. When you add a backend, keep the
 * same actions and change what they do underneath.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { fetchNewlyPosted } from "./lib/api"
import { scholarships, seedEssays, seedPeople } from "./lib/data"
import { clearJSON, loadJSON, saveJSON } from "./lib/storage"
import type { Application, Essay, Outcome, Person, Profile, ReferenceStatus, Scholarship } from "./lib/types"
import { uid } from "./lib/utils"

const KEY = "ejo:v2"

interface Store {
  profile: Profile
  catalog: Scholarship[]
  lastCheckedAt: string | null
  viewedIds: string[]
  saved: string[]
  apps: Record<string, Application>
  essays: Essay[]
  people: Person[]
}

const initial: Store = {
  profile: {
    name: "Aline Uwase",
    country: "Rwanda",
    level: "Master's",
    field: "Computer Science",
    gpa: 3.6,
    goal: "Build health-tech tools for rural clinics",
  },
  catalog: scholarships,
  lastCheckedAt: null,
  viewedIds: [],
  saved: ["gates-cambridge"],
  apps: {},
  essays: seedEssays,
  people: seedPeople,
}

interface AppCtx extends Store {
  setProfile: (p: Profile) => void
  toggleSave: (id: string) => void
  markViewed: (id: string) => void
  /** Ask the server for newly posted scholarships. Resolves with the ones that were added. */
  checkForNew: () => Promise<Scholarship[]>

  startApp: (s: Scholarship) => void
  updateApp: (id: string, patch: Partial<Application>) => void
  submitApp: (id: string) => void
  completeApp: (id: string, outcome: Outcome, reflection: string) => void
  reopenApp: (id: string) => void

  createEssay: (init?: Partial<Essay>) => string
  updateEssay: (id: string, patch: Partial<Pick<Essay, "title" | "body" | "prompt">>) => void
  saveVersion: (id: string) => void
  restoreVersion: (id: string, versionId: string) => void
  deleteEssay: (id: string) => void
  addNote: (essayId: string, author: string, text: string) => void
  removeNote: (essayId: string, noteId: string) => void

  addPerson: (p: Omit<Person, "id">) => string
  updatePerson: (id: string, patch: Partial<Person>) => void
  removePerson: (id: string) => void
  addReference: (appId: string, personId: string) => void
  setReferenceStatus: (appId: string, personId: string, status: ReferenceStatus) => void
  markThanked: (appId: string, personId: string) => void
  removeReference: (appId: string, personId: string) => void

  resetAll: () => void
}

const Ctx = createContext<AppCtx | null>(null)
const now = () => new Date().toISOString()

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadJSON<Store>(KEY, initial))
  const latest = useRef(store)
  latest.current = store

  // Save shortly after the last change, and once more if the tab is closing.
  useEffect(() => {
    const t = setTimeout(() => saveJSON(KEY, store), 400)
    return () => clearTimeout(t)
  }, [store])
  useEffect(() => {
    const flush = () => saveJSON(KEY, latest.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [])

  const set = useCallback((fn: (s: Store) => Store) => setStore(fn), [])
  const patchApp = useCallback(
    (id: string, fn: (a: Application) => Application) =>
      set((s) => (s.apps[id] ? { ...s, apps: { ...s.apps, [id]: fn(s.apps[id]) } } : s)),
    [set]
  )
  const patchEssay = useCallback(
    (id: string, fn: (e: Essay) => Essay) => set((s) => ({ ...s, essays: s.essays.map((e) => (e.id === id ? fn(e) : e)) })),
    [set]
  )

  const value = useMemo<AppCtx>(
    () => ({
      ...store,
      setProfile: (profile) => set((s) => ({ ...s, profile })),
      toggleSave: (id) => set((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
      markViewed: (id) => set((s) => (s.viewedIds.includes(id) ? s : { ...s, viewedIds: [...s.viewedIds, id] })),

      checkForNew: async () => {
        const added = await fetchNewlyPosted(latest.current.catalog.map((c) => c.id))
        set((s) => ({ ...s, catalog: [...s.catalog, ...added.filter((a) => !s.catalog.some((c) => c.id === a.id))], lastCheckedAt: now() }))
        return added
      },

      startApp: (sch) =>
        set((s) =>
          s.apps[sch.id]
            ? s
            : {
                ...s,
                apps: {
                  ...s.apps,
                  [sch.id]: {
                    scholarshipId: sch.id,
                    status: "drafting",
                    why: "",
                    docs: Object.fromEntries(sch.documents.map((d) => [d, false])),
                    essayId: null,
                    references: [],
                    startedAt: now(),
                  },
                },
              }
        ),
      updateApp: (id, patch) => patchApp(id, (a) => ({ ...a, ...patch })),
      submitApp: (id) => patchApp(id, (a) => ({ ...a, status: "submitted", submittedAt: now() })),
      completeApp: (id, outcome, reflection) => patchApp(id, (a) => ({ ...a, status: "completed", outcome, reflection, completedAt: now() })),
      reopenApp: (id) => patchApp(id, (a) => ({ ...a, status: "drafting", outcome: undefined, completedAt: undefined })),

      createEssay: (init = {}) => {
        const id = uid()
        const t = now()
        const essay: Essay = { id, title: "Untitled essay", body: "", createdAt: t, updatedAt: t, versions: [], notes: [], ...init }
        set((s) => ({ ...s, essays: [essay, ...s.essays] }))
        return id
      },
      updateEssay: (id, patch) => patchEssay(id, (e) => ({ ...e, ...patch, updatedAt: now() })),
      saveVersion: (id) =>
        patchEssay(id, (e) => ({
          ...e,
          versions: [{ id: uid(), savedAt: now(), label: `Version ${e.versions.length + 1}`, body: e.body }, ...e.versions].slice(0, 12),
        })),
      restoreVersion: (id, versionId) =>
        patchEssay(id, (e) => {
          const v = e.versions.find((x) => x.id === versionId)
          // Before we go back in time, keep the present safe as its own version.
          return v
            ? { ...e, body: v.body, updatedAt: now(), versions: [{ id: uid(), savedAt: now(), label: "Before restoring", body: e.body }, ...e.versions].slice(0, 12) }
            : e
        }),
      deleteEssay: (id) =>
        set((s) => ({
          ...s,
          essays: s.essays.filter((e) => e.id !== id),
          apps: Object.fromEntries(Object.entries(s.apps).map(([k, a]) => [k, a.essayId === id ? { ...a, essayId: null } : a])),
        })),
      addNote: (essayId, author, text) =>
        patchEssay(essayId, (e) => ({ ...e, notes: [...e.notes, { id: uid(), author: author.trim() || "A reader", text: text.trim(), createdAt: now() }] })),
      removeNote: (essayId, noteId) => patchEssay(essayId, (e) => ({ ...e, notes: e.notes.filter((n) => n.id !== noteId) })),

      addPerson: (p) => {
        const id = uid()
        set((s) => ({ ...s, people: [...s.people, { ...p, id }] }))
        return id
      },
      updatePerson: (id, patch) => set((s) => ({ ...s, people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePerson: (id) =>
        set((s) => ({
          ...s,
          people: s.people.filter((p) => p.id !== id),
          apps: Object.fromEntries(Object.entries(s.apps).map(([k, a]) => [k, { ...a, references: a.references.filter((r) => r.personId !== id) }])),
        })),
      addReference: (appId, personId) =>
        patchApp(appId, (a) => (a.references.some((r) => r.personId === personId) ? a : { ...a, references: [...a.references, { personId, status: "not_asked" }] })),
      setReferenceStatus: (appId, personId, status) =>
        patchApp(appId, (a) => ({
          ...a,
          references: a.references.map((r) =>
            r.personId !== personId
              ? r
              : { ...r, status, askedAt: status === "asked" ? (r.askedAt ?? now()) : r.askedAt, receivedAt: status === "received" ? now() : undefined }
          ),
        })),
      markThanked: (appId, personId) =>
        patchApp(appId, (a) => ({ ...a, references: a.references.map((r) => (r.personId === personId ? { ...r, thankedAt: now() } : r)) })),
      removeReference: (appId, personId) => patchApp(appId, (a) => ({ ...a, references: a.references.filter((r) => r.personId !== personId) })),

      resetAll: () => {
        clearJSON(KEY)
        setStore(initial)
      },
    }),
    [store, set, patchApp, patchEssay]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useApp must be used inside AppProvider")
  return v
}
