import { CalendarClock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { daysUntil, formatDate } from "@/lib/utils"

export function DeadlineBadge({ iso }: { iso: string }) {
  const d = daysUntil(iso)
  if (d < 0) return <Badge variant="outline">Closed</Badge>
  const soon = d <= 45
  return (
    <Badge variant={soon ? "accent" : "default"}>
      <CalendarClock className="size-3" />
      {soon ? `${d} days left` : formatDate(iso)}
    </Badge>
  )
}
