import { useEffect, useMemo, useRef } from 'react'
import { formatDayDivider } from '@/lib/format'
import { MessageItem } from './MessageItem'
import type { MemberWithProfile, MessageWithRelations } from '@/types/models'

type MessageListProps = {
  messages: MessageWithRelations[]
  currentUserId: string
  members: MemberWithProfile[]
  loading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onReply: (message: MessageWithRelations) => void
  onEdit: (message: MessageWithRelations) => void
  onDelete: (message: MessageWithRelations) => void
  onToggleReaction: (messageId: string, emoji: string, active: boolean) => void
}

const GROUP_WINDOW_MS = 5 * 60 * 1000

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export function MessageList({
  messages,
  currentUserId,
  members,
  loading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const lastCountRef = useRef(0)

  const items = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1]
      const showDay = !previous || !sameDay(previous.created_at, message.created_at)
      const showHeader =
        !previous ||
        showDay ||
        previous.sender_id !== message.sender_id ||
        new Date(message.created_at).getTime() - new Date(previous.created_at).getTime() >
          GROUP_WINDOW_MS
      return { message, showDay, showHeader }
    })
  }, [messages])

  useEffect(() => {
    const grew = messages.length > lastCountRef.current
    lastCountRef.current = messages.length
    if (grew) {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [messages.length])

  if (loading) {
    return <div className="flex-1" />
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        No messages yet. Say hello 👋
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
      {hasNextPage ? (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}
          </button>
        </div>
      ) : null}

      {items.map(({ message, showDay, showHeader }) => (
        <div key={message.id}>
          {showDay ? (
            <div className="my-3 flex items-center justify-center">
              <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                {formatDayDivider(message.created_at)}
              </span>
            </div>
          ) : null}
          <MessageItem
            message={message}
            currentUserId={currentUserId}
            members={members}
            showHeader={showHeader}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleReaction={onToggleReaction}
          />
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
