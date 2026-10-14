import type { TypingEntry } from '@/hooks/useTyping'

export function TypingIndicator({ users }: { users: TypingEntry[] }) {
  if (users.length === 0) return null

  const label =
    users.length === 1
      ? `${users[0].displayName} is typing`
      : users.length === 2
        ? `${users[0].displayName} and ${users[1].displayName} are typing`
        : `${users.length} people are typing`

  return (
    <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5" aria-hidden="true">
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current" />
      </span>
      <span>{label}…</span>
    </div>
  )
}
