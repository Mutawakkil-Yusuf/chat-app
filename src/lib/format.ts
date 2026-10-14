import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
} from 'date-fns'

export function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/** Compact time for the conversation list: 14:05, Yesterday, Tue, or 12 Mar. */
export function formatListTime(value: string | number | Date): string {
  const date = toDate(value)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  if (differenceInCalendarDays(new Date(), date) < 7) return format(date, 'EEE')
  return format(date, 'd MMM')
}

/** Time shown under a message bubble. */
export function formatMessageTime(value: string | number | Date): string {
  return format(toDate(value), 'HH:mm')
}

export function formatDayDivider(value: string | number | Date): string {
  const date = toDate(value)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, d MMM yyyy')
}

export function formatLastSeen(value: string | number | Date | null | undefined): string {
  if (!value) return 'Offline'
  return `Last seen ${formatDistanceToNowStrict(toDate(value), { addSuffix: true })}`
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?'
}

/** Stable pastel-ish hue derived from an id, used for avatar fallbacks. */
export function hueFromId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360
  }
  return hash
}
