import { Feather, HardDrive, MailCheck, Scale } from "lucide-react"
import { landing } from "@/lib/landingCopy"

const icons = [Feather, MailCheck, HardDrive, Scale]

export function Promises() {
  const { promises } = landing
  return (
    <section aria-labelledby="promises-title" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="promises-title" className="text-3xl font-bold sm:text-4xl">{promises.title}</h2>
        <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {promises.items.map((p, i) => {
            const Icon = icons[i]
            return (
              <div key={p.title} className="flex gap-4">
                <Icon className="mt-1 size-6 shrink-0 text-accent" />
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 leading-relaxed text-primary-foreground/80">{p.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}