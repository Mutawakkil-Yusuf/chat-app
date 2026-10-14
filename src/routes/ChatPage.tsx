import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquareDashed } from 'lucide-react'
import { cn } from 'cn'
import { Sidebar } from '@/components/chat/Sidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { NewConversationDialog } from '@/components/chat/NewConversationDialog'
import { ProfileDialog } from '@/components/profile/ProfileDialog'
import { useAuth } from '@/providers/auth-context'
import { useConversations } from '@/hooks/useConversations'
import { useProfile, usePresenceHeartbeat } from '@/hooks/useProfile'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'

export function ChatPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [newOpen, setNewOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const userId = user?.id ?? ''
  const { data: profile = null } = useProfile(userId || undefined)
  const conversationsQuery = useConversations(userId || undefined)
  const onlineUserIds = useOnlineUsers(userId || undefined)
  usePresenceHeartbeat(userId || undefined)

  const conversations = conversationsQuery.data ?? []
  const selected = conversations.find((c) => c.id === conversationId) ?? null
  const displayName = profile?.display_name ?? user?.email ?? 'Someone'

  const handleSelect = (id: string) => navigate(`/chats/${id}`)
  const handleBack = () => navigate('/chats')

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCreated = (id: string) => {
    setNewOpen(false)
    navigate(`/chats/${id}`)
  }

  return (
    <div className="flex h-svh overflow-hidden">
      <aside
        className={cn(
          'w-full shrink-0 md:flex md:w-80 lg:w-96',
          selected ? 'hidden' : 'flex',
        )}
        aria-hidden={Boolean(selected)}
      >
        <Sidebar
          profile={profile}
          currentUserId={userId}
          conversations={conversations}
          activeId={conversationId ?? null}
          onlineUserIds={onlineUserIds}
          loading={conversationsQuery.isLoading}
          onSelect={handleSelect}
          onNewConversation={() => setNewOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onSignOut={handleSignOut}
        />
      </aside>

      <main
        className={cn('min-w-0 flex-1 flex-col', selected ? 'flex' : 'hidden md:flex')}
      >
        {selected ? (
          <ChatWindow
            key={selected.id}
            conversation={selected}
            currentUserId={userId}
            currentUserDisplayName={displayName}
            onlineUserIds={onlineUserIds}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <MessageSquareDashed className="size-10" />
            <div>
              <p className="font-medium text-foreground">Select a conversation</p>
              <p className="text-sm">Or start a new one to begin chatting.</p>
            </div>
          </div>
        )}
      </main>

      {userId ? (
        <NewConversationDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          currentUserId={userId}
          onCreated={handleCreated}
        />
      ) : null}

      {userId && profile ? (
        <ProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          userId={userId}
          profile={profile}
        />
      ) : null}
    </div>
  )
}
