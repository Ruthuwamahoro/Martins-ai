import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landing } from "@/lib/landingCopy"
import { HeroCollage } from "./HeroCollage"

export function Hero({ onEnter }: { onEnter: () => void }) {
  const { hero } = landing
  return (
    <section id="top" aria-labelledby="hero-title" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-24">
      <div>
        <h1 id="hero-title" className="text-5xl font-bold leading-[1.05] sm:text-6xl">{hero.title}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{hero.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" variant="accent" onClick={onEnter}>{hero.primary}</Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#how">{hero.secondary}</a>
          </Button>
        </div>
        <p className="mt-5 flex max-w-md items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
          {hero.reassurance}
        </p>
      </div>

      <div>
        <HeroCollage />
        <p className="mt-3 text-center text-xs text-muted-foreground">{hero.sampleLabel}</p>
      </div>
    </section>
  )
}