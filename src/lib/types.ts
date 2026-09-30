export type Level = "Undergraduate" | "Master's" | "PhD"

export interface Scholarship {
  id: string
  name: string
  provider: string
  country: string
  levels: Level[]
  fields: string[] // "Any" means open to all fields
  nationalities: "any" | string[]
  minGpa: number // on a 4.0 scale
  amountLabel: string
  amountValue: number // rough yearly value in USD, used for sorting
  fullyFunded: boolean
  coverage: string[]
  deadline: string // ISO date
  postedAt: string // ISO date the scholarship was listed
  about: string
  essayPrompt: string
  essayTarget: number // words
  documents: string[]
  referencesNeeded: number // how many people must write for you
  url: string
}

export interface Profile {
  name: string
  country: string
  level: Level
  field: string
  gpa: number
  goal: string
}

export interface Check {
  label: string
  ok: boolean
  detail: string
}

export interface Match {
  scholarship: Scholarship
  score: number // 0-100
  checks: Check[]
}

/** Someone who supports the student: a lecturer, manager, mentor, friend who reads drafts. */
export interface Person {
  id: string
  name: string
  relationship: string // "Lecturer", "Former manager", "Mentor"...
  email: string
  canSpeakTo: string // what they have seen first-hand; we quote this back when the student writes to them
}

export type ReferenceStatus = "not_asked" | "asked" | "received"

export interface ReferenceRequest {
  personId: string
  status: ReferenceStatus
  askedAt?: string
  receivedAt?: string
  thankedAt?: string
}

export type AppStatus = "drafting" | "submitted" | "completed"
export type Outcome = "awarded" | "not_selected" | "withdrawn"

export interface Application {
  scholarshipId: string
  status: AppStatus
  why: string // "why this matters to me", written by the student, for the student
  docs: Record<string, boolean>
  essayId: string | null
  references: ReferenceRequest[]
  startedAt: string
  submittedAt?: string
  completedAt?: string
  outcome?: Outcome
  reflection?: string // "what I'd tell myself next time"
}

export interface EssayVersion {
  id: string
  savedAt: string
  label: string
  body: string
}

/** A comment from a real reader: a mentor, a friend, a lecturer. */
export interface EssayNote {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface Essay {
  id: string
  title: string
  body: string
  prompt?: string // the question this piece is answering, if any
  scholarshipId?: string
  createdAt: string
  updatedAt: string
  versions: EssayVersion[]
  notes: EssayNote[]
}

export interface EssayReview {
  checks: { label: string; ok: boolean; tip: string }[]
}

export type WorkspaceStep = "why" | "documents" | "people" | "essay" | "review"
