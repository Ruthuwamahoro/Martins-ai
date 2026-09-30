/**
 * Small, careful wrappers around localStorage.
 *
 * A student's essay drafts are precious. If storage is blocked (private mode,
 * a full disk, a locked-down school computer) we don't crash and we don't lose
 * what's on screen; we just can't remember it for next time.
 */
export function loadJSON<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function clearJSON(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* nothing to clear */
  }
}
