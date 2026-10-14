import { MessagesSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ConversationItem } from './ConversationItem'
import { conversationPresenceId, conversationTitle } from '@/lib/conversation'
import type { ConversationOverview } from '@/types/models'

type ConversationListProps = {
  conversations: ConversationOverview[]
  currentUserId: string
  activeId: string | null
  onlineUserIds: Set<string>
  filter: string
  loading: boolean
  onSelect: (conversationId: string) => void
}

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
  onlineUserIds,
  filter,
  loading,
  onSelect,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-1 py-1.5">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const clean = filter.trim().toLowerCase()
  const filtered = clean
    ? conversations.filter((conversation) => {
        const haystack = `${conversationTitle(conversation)} ${conversation.last_message_body ?? ''}`
        return haystack.toLowerCase().includes(clean)
      })
    : conversations

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-muted-foreground">
        <MessagesSquare className="size-8" />
        <p className="text-sm">
          {conversations.length === 0
            ? 'No conversations yet. Start one to begin chatting.'
            : 'No conversations match your search.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {filtered.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          active={conversation.id === activeId}
          online={onlineUserIds.has(conversationPresenceId(conversation))}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
