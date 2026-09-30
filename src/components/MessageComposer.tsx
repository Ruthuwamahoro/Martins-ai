import { useState } from "react"
import { Check, Copy, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { mailto } from "@/lib/utils"

interface Props {
  to: string
  initialSubject: string
  initialBody: string
  /** Called after the student opens their email app or copies the message, so we can update the record. */
  onSent?: () => void
  sendLabel?: string
}

/**
 * Martins AI never sends email on someone's behalf. The message goes out from the
 * student's own address, in their own name, and they can change every word.
 * A reference request should feel like it came from a person, because it did.
 */
export function MessageComposer({ to, initialSubject, initialBody, onSent, sendLabel = "Open in my email app" }: Props) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [copied, setCopied] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border bg-secondary/40 p-4">
      <div>
        <Label htmlFor="msg-subject" className="mb-1.5 block text-xs text-muted-foreground">Subject</Label>
        <Input id="msg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="msg-body" className="mb-1.5 block text-xs text-muted-foreground">Message. Change anything so it sounds like you.</Label>
        <Textarea id="msg-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[220px] leading-relaxed" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {to ? (
          <Button asChild onClick={onSent}>
            <a href={mailto(to, subject, body)}>
              <Mail /> {sendLabel}
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">Add their email on the People page to open this in your email app, or copy it and send it any way you like.</p>
        )}
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
              setCopied(true)
              onSent?.()
              setTimeout(() => setCopied(false), 2000)
            } catch {
              /* Clipboard can be blocked; the text is still selectable on screen. */
            }
          }}
        >
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy message"}
        </Button>
      </div>
    </div>
  )
}
