import { Button } from "@/components/ui/button"
import { landing } from "@/lib/landingCopy"

export function FinalCta({ onEnter }: { onEnter: () => void }) {
  const { finalCta, footer } = landing
  return (
    <>
      <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="rounded-3xl bg-accent/70 px-6 py-14 sm:px-12">
          <h2 id="cta-title" className="max-w-xl text-3xl font-bold text-accent-foreground sm:text-4xl">{finalCta.title}</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-accent-foreground/80">{finalCta.body}</p>
          <Button size="lg" className="mt-8" onClick={onEnter}>{finalCta.cta}</Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{footer.line}</p>
          <p>{footer.note}</p>
        </div>
      </footer>
    </>
  )
}