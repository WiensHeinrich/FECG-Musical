import { format, parseISO } from "date-fns"
import { de } from "date-fns/locale"

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "d. MMMM yyyy", { locale: de })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "d. MMMM yyyy, HH:mm 'Uhr'", { locale: de })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "HH:mm 'Uhr'", { locale: de })
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd.MM.yyyy", { locale: de })
}

export function formatWeekday(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "EEEE", { locale: de })
}
