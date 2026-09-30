import { Badge } from "@/components/ui/badge"
import type { Application } from "@/lib/types"

const outcomeLabel = { awarded: "Awarded", not_selected: "Not selected", withdrawn: "Withdrawn" } as const

export function StatusBadge({ app }: { app: Application }) {
  if (app.status === "drafting") return <Badge>In progress</Badge>
  if (app.status === "submitted") return <Badge variant="success">Submitted</Badge>
  return <Badge variant={app.outcome === "awarded" ? "accent" : "outline"}>{app.outcome ? outcomeLabel[app.outcome] : "Completed"}</Badge>
}
