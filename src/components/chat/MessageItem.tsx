import { useMemo } from 'react'
import { MoreHorizontal, Pencil, Reply, SmilePlus, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/UserAvatar'
import { formatMessageTime } from '@/lib/format'
import { ReactionPicker } from './ReactionPicker'
import type { MemberWithProfile, MessageWithRelations } from '@/types/models'

type MessageItemProps = {
  message: MessageWithRelations
  currentUserId: string
  members: MemberWithProfile[]
  showHeader: boolean
  onReply: (message: MessageWithRelations) => void
  onEdit: (message: MessageWithRelations) => void
  onDelete: (message: MessageWithRelations) => void
  onToggleReaction: (messageId: string, emoji: string, active: boolean) => void
}

export function MessageItem({
  message,
  currentUserId,
  members,
  showHeader,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: MessageItemProps) {
  const isOwn = message.sender_id === currentUserId
  const sender = message.sender
  const senderName = sender?.display_name ?? 'Unknown'

  const groupedReactions = useMemo(() => {
    const map = new Map<string, { count: number; mine: boolean }>()
    for (const reaction of message.message_reactions) {
      const entry = map.get(reaction.emoji) ?? { count: 0, mine: false }
      entry.count += 1
      if (reaction.user_id === currentUserId) entry.mine = true
      map.set(reaction.emoji, entry)
    }
    return Array.from(map.entries())
  }, [message.message_reactions, currentUserId])

  const replySenderName = useMemo(() => {
    if (!message.reply_to) return null
    if (message.reply_to.sender_id === currentUserId) return 'You'
    const member = members.find((m) => m.user_id === message.reply_to?.sender_id)
    return member?.profile?.display_name ?? 'Unknown'
  }, [message.reply_to, members, currentUserId])

  const toggleEmoji = (emoji: string) => {
    const mine = message.message_reactions.some(
      (reaction) => reaction.user_id === currentUserId && reaction.emoji === emoji,
    )
    onToggleReaction(message.id, emoji, mine)
  }

  return (
    <div
      className={cn(
        'group/message flex gap-2.5 px-2',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <div className="w-9 shrink-0">
        {showHeader ? (
          <UserAvatar
            id={sender?.id ?? message.sender_id}
            name={senderName}
            avatarUrl={sender?.avatar_url}
            size={36}
          />
        ) : null}
      </div>

      <div
        className={cn('flex max-w-[75%] flex-col', isOwn ? 'items-end' : 'items-start')}
      >
        {showHeader ? (
          <div
            className={cn(
              'mb-1 flex items-center gap-2 px-1 text-xs',
              isOwn && 'flex-row-reverse',
            )}
          >
            <span className="font-medium text-foreground">
              {isOwn ? 'You' : senderName}
            </span>
            <span className="text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
          </div>
        ) : null}

        {message.reply_to ? (
          <div
            className={cn(
              'mb-1 max-w-full rounded-md border-l-2 bg-muted/60 px-2 py-1 text-xs',
              isOwn ? 'border-primary/60' : 'border-muted-foreground/40',
            )}
          >
            <span className="font-medium">{replySenderName}</span>
            <p className="truncate text-muted-foreground">{message.reply_to.body}</p>
          </div>
        ) : null}

        <div className={cn('flex items-center gap-1.5', isOwn && 'flex-row-reverse')}>
          <div
            className={cn(
              'rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap',
              isOwn
                ? 'rounded-br-sm bg-primary text-primary-foreground'
                : 'rounded-bl-sm bg-muted text-foreground',
            )}
          >
            {message.body}
            {message.edited_at ? (
              <span className="ml-1.5 align-baseline text-[10px] opacity-60">
                (edited)
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100">
            <ReactionPicker onPick={toggleEmoji} align={isOwn ? 'end' : 'start'}>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Add reaction"
                className="text-muted-foreground"
              >
                <SmilePlus />
              </Button>
            </ReactionPicker>

            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Reply"
              className="text-muted-foreground"
              onClick={() => onReply(message)}
            >
              <Reply />
            </Button>

            {isOwn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="More actions"
                    className="text-muted-foreground"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(message)}
                  >
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {groupedReactions.length > 0 ? (
          <div className={cn('mt-1 flex flex-wrap gap-1', isOwn && 'flex-row-reverse')}>
            {groupedReactions.map(([emoji, { count, mine }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleEmoji(emoji)}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-muted',
                  mine ? 'border-primary/50 bg-primary/10' : 'border-border bg-card',
                )}
                aria-label={`${emoji} ${count}`}
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
