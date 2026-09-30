import { BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landing } from "@/lib/landingCopy"

export function LandingNav({ onEnter }: { onEnter: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookMarked className="size-4" />
          </span>
          <span className="font-display text-xl font-bold">Ejo</span>
        </a>
        <nav aria-label="Page sections" className="hidden items-center gap-6 md:flex">
          {landing.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {l.label}
            </a>
          ))}
        </nav>
        <Button onClick={onEnter}>{landing.nav.cta}</Button>
      </div>
    </header>
  )
}