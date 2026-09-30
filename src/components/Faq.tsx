import { landing } from "@/lib/landingCopy"
import { ChevronDown } from "lucide-react"

export function Faq() {
  const { faq } = landing
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-24">
        <h2 id="faq-title" className="text-3xl font-bold sm:text-4xl">{faq.title}</h2>
        <div className="divide-y border-y">
          {faq.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded font-display text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}