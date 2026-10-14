import { Users } from 'lucide-react'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/UserAvatar'
import { formatListTime } from '@/lib/format'
import { conversationSubtitle, conversationTitle } from '@/lib/conversation'
import type { ConversationOverview } from '@/types/models'

type ConversationItemProps = {
  conversation: ConversationOverview
  currentUserId: string
  active: boolean
  online: boolean
  onSelect: (conversationId: string) => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  active,
  online,
  onSelect,
}: ConversationItemProps) {
  const isGroup = conversation.kind === 'group'
  const title = conversationTitle(conversation)
  const subtitle = conversationSubtitle(conversation, currentUserId)
  const unread = conversation.unread_count ?? 0

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active && 'bg-muted',
      )}
    >
      {isGroup ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Users className="size-5" />
        </div>
      ) : (
        <UserAvatar
          id={conversation.other_user_id ?? conversation.id}
          name={conversation.other_user_name}
          avatarUrl={conversation.other_user_avatar}
          online={online}
          showPresence={Boolean(conversation.other_user_id)}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {conversation.last_message_at ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatListTime(conversation.last_message_at)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
          {unread > 0 ? (
            <Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[10px]">
              {unread > 99 ? '99+' : unread}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  )
}
