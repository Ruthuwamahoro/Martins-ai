import { Check } from "lucide-react"

/**
 * Not a dashboard screenshot. A few small human things on a table:
 * a draft with a mentor's note in the margin, a reason written for oneself,
 * and a reference that has just arrived. Purely decorative, so it's hidden
 * from screen readers; the sentence beneath it says what it is.
 */
export function HeroCollage() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[470px] w-full max-w-md sm:h-[500px]">
      {/* warm block behind the paper */}
      <div className="absolute inset-x-2 bottom-8 top-12 rounded-3xl bg-accent/60" />

      {/* the draft */}
      <div className="absolute inset-x-4 top-16 z-10 -rotate-1 rounded-lg border bg-card p-6 shadow-sm sm:inset-x-8">
        <p className="font-display text-lg font-bold">Why I build for clinics</p>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          When I was fourteen I sat with my aunt for six hours in a health centre waiting room because the appointment book had been lost.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          <span className="bg-accent/50 px-0.5">I still remember the nurse who told me she finally ate lunch.</span> I want to keep building this kind of software.
        </p>
        <div className="mt-4 w-fit max-w-[15rem] rotate-1 rounded-sm bg-accent/30 px-3 py-2 font-hand text-xl leading-snug text-primary">
          Say more about the nurse. She's your story.
          <span className="mt-1 block text-base text-primary/70">Dr. Mukamana</span>
        </div>
      </div>

      {/* why it matters, written for oneself */}
      <div className="absolute right-0 top-0 z-20 w-52 rotate-2 rounded-lg bg-primary p-4 text-primary-foreground shadow-md sm:right-2">
        <p className="text-xs text-primary-foreground/70">Why this matters to me</p>
        <p className="mt-1 font-hand text-xl leading-snug">My village clinic still runs on paper.</p>
      </div>

      {/* a reference arrives */}
      <div className="absolute bottom-0 left-0 z-20 flex -rotate-3 items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-md sm:left-2">
        <span className="grid size-8 place-items-center rounded-full bg-success text-white">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <div>
          <p className="text-sm font-medium">Eric sent his reference</p>
          <p className="text-xs text-muted-foreground">Time to say thank you</p>
        </div>
      </div>
    </div>
  )
}