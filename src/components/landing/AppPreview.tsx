import { Paperclip, Search, Send, Smile } from 'lucide-react'
import { cn } from 'cn'

type PreviewMessage = {
  id: number
  mine?: boolean
  author: string
  initial: string
  color: string
  body: string
  time: string
  reactions?: { emoji: string; count: number; mine?: boolean }[]
  edited?: boolean
}

const MESSAGES: PreviewMessage[] = [
  {
    id: 1,
    author: 'Amara',
    initial: 'A',
    color: 'bg-violet-500',
    body: 'Hey! Did the new realtime layer ship? 👀',
    time: '09:41',
  },
  {
    id: 2,
    author: 'Yusuf',
    initial: 'Y',
    color: 'bg-emerald-500',
    body: 'Just did — messages, typing and presence all live.',
    time: '09:42',
  },
  {
    id: 3,
    mine: true,
    author: 'You',
    initial: 'Y',
    color: 'bg-primary',
    body: 'Nice. Reactions are working too right?',
    time: '09:42',
    reactions: [
      { emoji: '🔥', count: 2 },
      { emoji: '🎉', count: 1, mine: true },
    ],
  },
  {
    id: 4,
    author: 'Amara',
    initial: 'A',
    color: 'bg-violet-500',
    body: 'Yep, read receipts are in as well.',
    time: '09:43',
    edited: true,
  },
]

const CONVERSATIONS = [
  {
    name: 'Amara',
    initial: 'A',
    color: 'bg-violet-500',
    snippet: 'Yep, read receipts…',
    time: '09:43',
    unread: 2,
    online: true,
  },
  {
    name: 'Design crew',
    initial: 'D',
    color: 'bg-sky-500',
    snippet: 'Yusuf: locked the palette',
    time: '09:20',
    unread: 0,
    online: false,
  },
  {
    name: 'Tunde',
    initial: 'T',
    color: 'bg-amber-500',
    snippet: 'talk tomorrow 👋',
    time: 'Mon',
    unread: 0,
    online: true,
  },
]

export function AppPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-[30rem] sm:h-[34rem]">
        <div className="hidden w-56 shrink-0 flex-col border-r bg-muted/30 sm:flex">
          <div className="flex h-14 items-center gap-2 border-b px-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
              R
            </span>
            <span className="text-sm font-semibold">Ripple</span>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs text-muted-foreground">
              <Search className="size-3.5" /> Search
            </div>
          </div>
          <div className="space-y-0.5 px-2">
            {CONVERSATIONS.map((c, i) => (
              <div
                key={c.name}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2',
                  i === 0 && 'bg-accent',
                )}
              >
                <span className="relative">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white',
                      c.color,
                    )}
                  >
                    {c.initial}
                  </span>
                  {c.online ? (
                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">{c.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {c.time}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {c.snippet}
                    </span>
                    {c.unread > 0 ? (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {c.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <span className="relative">
              <span className="flex size-8 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white">
                A
              </span>
              <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Amara</p>
              <p className="text-[11px] text-emerald-500">Online</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-hidden p-4">
            {MESSAGES.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col gap-1',
                  m.mine ? 'items-end' : 'items-start',
                )}
              >
                <div className={cn('flex items-end gap-2', m.mine && 'flex-row-reverse')}>
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white',
                      m.color,
                    )}
                  >
                    {m.initial}
                  </span>
                  <div
                    className={cn(
                      'max-w-[16rem] rounded-2xl px-3 py-2 text-sm',
                      m.mine
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted text-foreground',
                    )}
                  >
                    {m.body}
                    <span
                      className={cn(
                        'mt-0.5 block text-right text-[10px]',
                        m.mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {m.time}
                      {m.edited ? ' · edited' : ''}
                    </span>
                  </div>
                </div>
                {m.reactions ? (
                  <div className={cn('flex gap-1', m.mine ? 'pr-8' : 'pl-8')}>
                    {m.reactions.map((r) => (
                      <span
                        key={r.emoji}
                        className={cn(
                          'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
                          r.mine ? 'border-primary/40 bg-primary/10' : 'bg-muted',
                        )}
                      >
                        {r.emoji}
                        <span className="text-muted-foreground">{r.count}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <div className="flex items-center gap-2 pl-8">
              <span className="flex gap-1 rounded-full bg-muted px-3 py-2">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t p-3">
            <Paperclip className="size-4 text-muted-foreground" />
            <div className="flex flex-1 items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm text-muted-foreground">
              Message Amara…
            </div>
            <Smile className="size-4 text-muted-foreground" />
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Send className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
