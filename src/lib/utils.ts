import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export function daysUntil(iso: string, from = new Date()) {
  const ms = new Date(iso).getTime() - from.getTime()
  return Math.ceil(ms / 86_400_000)
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || "there"
}

/** "just now", "5 minutes ago", "3 days ago" */
export function timeAgo(iso: string, now = new Date()) {
  const s = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000))
  if (s < 15) return "just now"
  if (s < 60) return "a few seconds ago"
  const m = Math.round(s / 60)
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? "" : "s"} ago`
}

export function mailto(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
