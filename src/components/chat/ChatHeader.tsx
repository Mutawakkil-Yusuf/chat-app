import { ArrowLeft, Info, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { UserAvatar } from '@/components/UserAvatar'
import { conversationPresenceId, conversationTitle } from '@/lib/conversation'
import { formatLastSeen } from '@/lib/format'
import type { ConversationOverview, MemberWithProfile } from '@/types/models'
import type { TypingEntry } from '@/hooks/useTyping'

type ChatHeaderProps = {
  conversation: ConversationOverview
  members: MemberWithProfile[]
  currentUserId: string
  onlineUserIds: Set<string>
  typingUsers: TypingEntry[]
  onBack: () => void
}

export function ChatHeader({
  conversation,
  members,
  currentUserId,
  onlineUserIds,
  typingUsers,
  onBack,
}: ChatHeaderProps) {
  const isGroup = conversation.kind === 'group'
  const title = conversationTitle(conversation)
  const otherId = conversation.other_user_id
  const otherOnline = otherId
    ? onlineUserIds.has(otherId)
    : onlineUserIds.has(conversationPresenceId(conversation))

  const subtitle = (() => {
    if (typingUsers.length > 0) {
      return typingUsers.length === 1
        ? `${typingUsers[0].displayName} is typing…`
        : 'Several people are typing…'
    }
    if (isGroup) return `${members.length} member${members.length === 1 ? '' : 's'}`
    if (otherOnline) return 'Online'
    return formatLastSeen(conversation.other_user_last_seen)
  })()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onBack}
        aria-label="Back to conversations"
      >
        <ArrowLeft />
      </Button>

      {isGroup ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Users className="size-5" />
        </div>
      ) : (
        <UserAvatar
          id={otherId ?? conversation.id}
          name={conversation.other_user_name}
          avatarUrl={conversation.other_user_avatar}
          size={36}
          online={otherOnline}
          showPresence={Boolean(otherId)}
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Conversation details">
            <Info />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              {isGroup ? `${members.length} members` : 'Direct conversation'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-1 px-4">
            {members.map((member) => {
              const profile = member.profile
              const online = onlineUserIds.has(member.user_id)
              return (
                <div key={member.user_id} className="flex items-center gap-3 py-2">
                  <UserAvatar
                    id={member.user_id}
                    name={profile?.display_name}
                    avatarUrl={profile?.avatar_url}
                    size={36}
                    online={online}
                    showPresence
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile?.display_name ?? 'Unknown'}
                      {member.user_id === currentUserId ? ' (you)' : ''}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {online ? 'Online' : formatLastSeen(profile?.last_seen_at)}
                    </p>
                  </div>
                  {member.role === 'owner' ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      Owner
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
