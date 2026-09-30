import { landing } from "@/lib/landingCopy"

export function TheHardPart() {
  const { hardPart } = landing
  return (
    <section aria-labelledby="hard-title" className="border-y bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-24">
        <h2 id="hard-title" className="text-3xl font-bold sm:text-4xl">{hardPart.title}</h2>
        <div>
          {hardPart.items.map((item, i) => (
            <div key={item.title} className={i === 0 ? "pb-8" : "border-t py-8"}>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}