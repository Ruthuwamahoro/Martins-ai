import { landing } from "@/lib/landingCopy"
import { scholarships, seedPeople } from "@/lib/data"
import { askForReferenceMessage } from "@/lib/voice"

/**
 * The message shown here is produced by the very same function the app uses,
 * so the landing page can never promise something the product doesn't do.
 */
export function YourPeople() {
  const { people } = landing
  const msg = askForReferenceMessage({
    person: seedPeople[0],
    applicant: "Aline Uwase",
    scholarship: scholarships[0],
    why: people.sampleWhy,
  })

  return (
    <section id="people" aria-labelledby="people-title" className="border-y bg-secondary/60">
      <div className="mx-auto grid max-w-6xl scroll-mt-20 items-start gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <h2 id="people-title" className="text-3xl font-bold sm:text-4xl">{people.title}</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">{people.body}</p>
          <dl className="mt-8 space-y-5">
            {people.points.map((p) => (
              <div key={p.title} className="border-l-2 border-accent pl-4">
                <dt className="font-display font-semibold">{p.title}</dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure>
          <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs text-muted-foreground">To: {seedPeople[0].name}</p>
            <p className="mt-1 border-b pb-3 text-sm font-medium">{msg.subject}</p>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{msg.body}</p>
          </div>
          <figcaption className="mt-3 text-xs text-muted-foreground">{people.sampleLabel}</figcaption>
        </figure>
      </div>
    </section>
  )
}