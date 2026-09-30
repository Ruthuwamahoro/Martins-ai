import { incomingPool } from "./data"
import type { Scholarship } from "./types"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Prototype stand-in for your backend.
 * Swap the body for something like:
 *   GET /api/scholarships?postedSince=<lastCheckedAt>
 * and keep returning Scholarship[]; the rest of the app won't notice.
 *
 * Here we hand out up to two scholarships the student hasn't seen yet, stamped
 * as "posted just now", so the "New" flow is easy to try.
 */
export async function fetchNewlyPosted(alreadyHave: string[]): Promise<Scholarship[]> {
  await wait(900)
  const now = new Date().toISOString()
  return incomingPool
    .filter((s) => !alreadyHave.includes(s.id))
    .slice(0, 2)
    .map((s) => ({ ...s, postedAt: now }))
}
