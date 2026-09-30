import type { EssayReview, Match, Profile, Scholarship } from "./types"
import { wordCount } from "./utils"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Prototype "AI". Rule-based, so the UI works offline.
 * To go live, replace the bodies with calls to your backend / an LLM and keep
 * the signatures. One request for the real thing: the model should help the
 * student say what is true about them, never invent achievements for them.
 */
export async function findMatches(profile: Profile, query: string, catalog: Scholarship[]): Promise<Match[]> {
  await sleep(600)
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3)

  return catalog
    .map((s): Match => {
      const levelOk = s.levels.includes(profile.level)
      const fieldOk = s.fields.includes("Any") || s.fields.includes(profile.field)
      const nationOk = s.nationalities === "any" || s.nationalities.includes(profile.country)
      const gpaOk = profile.gpa >= s.minGpa

      const haystack = [s.name, s.about, s.coverage.join(" "), s.country, s.fields.join(" ")].join(" ").toLowerCase()
      const hits = words.filter((w) => haystack.includes(w)).length
      const queryBoost = Math.min(10, hits * 5)

      const raw = (levelOk ? 30 : 0) + (fieldOk ? 25 : 0) + (nationOk ? 20 : 0) + (gpaOk ? 15 : 5) + queryBoost
      const score = Math.min(100, levelOk && nationOk ? raw + 10 : Math.min(raw, 45))

      return {
        scholarship: s,
        score,
        checks: [
          { label: "Study level", ok: levelOk, detail: levelOk ? `Open to ${profile.level} applicants` : `Offered for ${s.levels.join(" / ")}` },
          { label: "Field", ok: fieldOk, detail: fieldOk ? (s.fields.includes("Any") ? "Open to all fields" : `Covers ${profile.field}`) : `Limited to ${s.fields.join(", ")}` },
          { label: "Nationality", ok: nationOk, detail: nationOk ? `Open to applicants from ${profile.country}` : "Your country is not on the eligible list" },
          { label: "Grades", ok: gpaOk, detail: gpaOk ? `Your GPA ${profile.gpa.toFixed(1)} meets the ${s.minGpa.toFixed(1)} guide` : `Typical minimum is ${s.minGpa.toFixed(1)}; yours is ${profile.gpa.toFixed(1)}` },
        ],
      }
    })
    .sort((a, b) => b.score - a.score)
}

/** Questions to think about, not sentences to paste. The student's voice is the point. */
export async function generateOutline(s: Scholarship, profile: Profile): Promise<string[]> {
  await sleep(500)
  return [
    `Start with one moment you remember clearly, a time you saw a problem in ${profile.field.toLowerCase()} and acted.`,
    `Who was helped, and how do you know? A number or a name makes it real.`,
    `What can ${s.country === "Multiple" ? "this programme" : s.country} give you that you can't get at home?`,
    `Your plan: "${profile.goal}". What will you do in your first year back?`,
  ]
}

export async function reviewEssay(text: string, s: Scholarship): Promise<EssayReview> {
  await sleep(600)
  const words = wordCount(text)
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length
  const hasNumbers = /\d/.test(text)
  const firstPerson = (text.match(/\bI\b/g) ?? []).length
  const mentionsProgramme = text.toLowerCase().includes(s.name.split(" ")[0].toLowerCase())

  return {
    checks: [
      { label: "Length", ok: words >= s.essayTarget * 0.8 && words <= s.essayTarget * 1.1, tip: `You have ${words} words. Aim for about ${s.essayTarget}.` },
      { label: "Structure", ok: paragraphs >= 3, tip: "Try three short paragraphs: a moment, the impact, your plan." },
      { label: "Evidence", ok: hasNumbers, tip: "One or two concrete numbers help: people reached, results achieved." },
      { label: "Your voice", ok: firstPerson >= 5, tip: "Write about what you did, not only what the team did." },
      { label: "Fit with the programme", ok: mentionsProgramme, tip: `Name ${s.name.split(" ")[0]} and say why it suits you specifically.` },
    ],
  }
}
