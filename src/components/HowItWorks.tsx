import { landing } from "@/lib/landingCopy"

/** Five steps in a real order, so numbers earn their place here. */
export function HowItWorks() {
  const { how } = landing
  return (
    <section id="how" aria-labelledby="how-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <h2 id="how-title" className="max-w-xl text-3xl font-bold sm:text-4xl">{how.title}</h2>
      <ol className="mt-12 max-w-2xl space-y-10 border-l pl-8">
        {how.steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="absolute -left-[3.05rem] top-0 grid size-9 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground ring-8 ring-background">
              {i + 1}
            </span>
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}