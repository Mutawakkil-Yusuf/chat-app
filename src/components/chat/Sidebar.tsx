import { useState } from 'react'
import { Loader2, LogOut, MessageCircle, Search, SquarePen, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/UserAvatar'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ConversationList } from './ConversationList'
import { useMessageSearch } from '@/hooks/useSearch'
import { formatListTime } from '@/lib/format'
import type { ConversationOverview, Profile } from '@/types/models'

type SidebarProps = {
  profile: Profile | null
  currentUserId: string
  conversations: ConversationOverview[]
  activeId: string | null
  onlineUserIds: Set<string>
  loading: boolean
  onSelect: (conversationId: string) => void
  onNewConversation: () => void
  onOpenProfile: () => void
  onSignOut: () => void
}

export function Sidebar({
  profile,
  currentUserId,
  conversations,
  activeId,
  onlineUserIds,
  loading,
  onSelect,
  onNewConversation,
  onOpenProfile,
  onSignOut,
}: SidebarProps) {
  const [search, setSearch] = useState('')
  const messageSearch = useMessageSearch(search, search.trim().length >= 2)
  const isSearching = search.trim().length >= 2

  return (
    <div className="flex h-full w-full flex-col border-r bg-background">
      <div className="flex h-16 shrink-0 items-center gap-2 px-3">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MessageCircle className="size-4" />
        </div>
        <span className="flex-1 text-base font-semibold">Chat</span>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Account menu" className="rounded-full">
              <UserAvatar
                id={currentUserId}
                name={profile?.display_name}
                avatarUrl={profile?.avatar_url}
                size={32}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="truncate text-sm font-medium">{profile?.display_name ?? 'You'}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                @{profile?.username ?? '—'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenProfile}>
              <UserRound className="size-4" /> Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onSignOut}>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3 px-3 pb-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats and messages"
            className="pl-8"
          />
          {messageSearch.isFetching ? (
            <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <Button variant="outline" className="w-full justify-start" onClick={onNewConversation}>
          <SquarePen /> New conversation
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          activeId={activeId}
          onlineUserIds={onlineUserIds}
          filter={isSearching ? search : ''}
          loading={loading}
          onSelect={onSelect}
        />

        {isSearching && (messageSearch.data?.length ?? 0) > 0 ? (
          <div className="border-t px-3 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Messages</p>
            <div className="space-y-1">
              {messageSearch.data?.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelect(result.conversation_id)}
                  className="w-full rounded-md px-2 py-1.5 text-left hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">
                      {result.sender?.display_name ?? 'Unknown'}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatListTime(result.created_at)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{result.body}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </ScrollArea>

      <div className="border-t px-3 py-2 text-[10px] text-muted-foreground">
        {conversations.length} conversation{conversations.length === 1 ? '' : 's'} · Realtime
        enabled
      </div>
    </div>
  )
}
