import { landing } from "@/lib/landingCopy"

export function Letter() {
  const { letter } = landing
  return (
    <section aria-labelledby="letter-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="max-w-2xl">
        <h2 id="letter-title" className="text-3xl font-bold sm:text-4xl">{letter.title}</h2>
        <div className="mt-6 space-y-5 text-lg leading-[1.8] text-foreground/90">
          {letter.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-8 font-hand text-3xl text-primary">{letter.signoff}</p>
      </div>
    </section>
  )
}