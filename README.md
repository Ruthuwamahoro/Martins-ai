# Martins AI: an AI scholarship finder that remembers there are people on both sides

This is a React + TypeScript + Tailwind + shadcn/ui app for students finding and applying to scholarships.

```bash
npm install
npm run dev
```

## What a student can do
- **Today**: a warm, short summary: where you left off, what's newly posted, who you might write to.
- **Discover**: AI-assisted matching against your profile. Tabs for All / **New** / Saved. "Check for new" fetches newly posted scholarships (mocked in `src/lib/api.ts`).
- **Applications**: Saved · In progress · Submitted · Completed. Record the outcome (awarded, not selected, withdrawn) and get a kind, honest message back. Write thank-you notes to the people who helped.
- **Application workspace**: your reason → documents → people (references) → essay → review.
- **Writing**: a library of essays that autosave, keep versions you choose, hold comments from real readers, and can be adapted (copied) into any application.
- **People**: the lecturers, managers and mentors who help you, with a message that is specific, honest and easy to say no to.

## Design principles (please keep them)
1. **People first.** Every feature should ask: who is on the other side of this? A referee, a reader, a family member. Support the relationship, not just the task.
2. **Never send on someone's behalf.** Messages open in the student's own email app, in their own name (`MessageComposer`).
3. **One small next step.** `nextStep()` in `src/lib/progress.ts` shows a single doable thing, not a to-do list.
4. **The student's voice stays theirs.** The "AI" asks questions and points out gaps. It doesn't write the essay.
5. **Lose nothing.** Autosave, kept versions, a copy of the present before any restore, and soft confirmations before deleting.
6. **Say it like a friend.** All copy lives in `src/lib/voice.ts` so tone stays consistent and is easy to translate.

## Where things are
| Path | What it does |
| --- | --- |
| `src/lib/voice.ts` | Every warm word: greetings, outcomes, message templates |
| `src/lib/ai.ts` | Mock matching, questions-to-think-about, draft check. Swap for a real backend/LLM |
| `src/lib/api.ts` | Mock "newly posted" fetch. Swap for `GET /api/scholarships?postedSince=` |
| `src/lib/progress.ts` | Progress %, next step, "is new" |
| `src/state.tsx` | The store: profile, catalog, applications, essays, people. Persists to `localStorage` |
| `src/components/ui/*` | shadcn-style primitives (`components.json` included) |

## Notes
- Scholarship data, the seeded essay, the two sample people, and the community tips are **samples** for the prototype. Verify scholarship details with providers, and replace the tips with real, consented stories.
