import { BookMarked, Compass, FileText, House, PenLine, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type View = "today" | "discover" | "applications" | "writing" | "people" | "profile"

const items: { id: View; label: string; icon: typeof Compass }[] = [
  { id: "today", label: "Today", icon: House },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "people", label: "People", icon: Users },
  { id: "profile", label: "Profile", icon: User },
]

export function Header({ view, setView, activeCount }: { view: View; setView: (v: View) => void; activeCount: number }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <button onClick={() => setView("today")} className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookMarked className="size-4" />
          </span>
          <span className="hidden font-display text-xl font-bold sm:inline">Martins AI</span>
        </button>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-current={view === id ? "page" : undefined}
              aria-label={label}
              className={cn(
                "relative flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3",
                view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="hidden lg:inline">{label}</span>
              {id === "applications" && activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">{activeCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
