import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'
import { TypingIndicator } from './TypingIndicator'
import { useMembers } from '@/hooks/useMembers'
import {
  useMessages,
  useDeleteMessage,
  useEditMessage,
  useSendMessage,
  useToggleReaction,
} from '@/hooks/useMessages'
import { useMarkConversationRead } from '@/hooks/useConversations'
import { useTyping } from '@/hooks/useTyping'
import type { ConversationOverview, MessageWithRelations } from '@/types/models'

type ChatWindowProps = {
  conversation: ConversationOverview
  currentUserId: string
  currentUserDisplayName: string
  onlineUserIds: Set<string>
  onBack: () => void
}

export function ChatWindow({
  conversation,
  currentUserId,
  currentUserDisplayName,
  onlineUserIds,
  onBack,
}: ChatWindowProps) {
  const [replyingTo, setReplyingTo] = useState<MessageWithRelations | null>(null)
  const [editing, setEditing] = useState<MessageWithRelations | null>(null)

  const { data: members = [] } = useMembers(conversation.id)
  const messagesQuery = useMessages(conversation.id)
  const { typingUsers, sendTyping } = useTyping(conversation.id, currentUserId)

  const sendMessage = useSendMessage(currentUserId)
  const editMessage = useEditMessage(currentUserId)
  const deleteMessage = useDeleteMessage(currentUserId)
  const toggleReaction = useToggleReaction(currentUserId)
  const markRead = useMarkConversationRead(currentUserId)

  const messages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? []
    return pages
      .slice()
      .reverse()
      .flatMap((page) => page.slice().reverse())
  }, [messagesQuery.data])

  useEffect(() => {
    markRead.mutate(conversation.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, messages.length])

  const handleSend = (body: string, replyToId: string | null) => {
    sendMessage.mutate(
      { conversationId: conversation.id, body, replyToId },
      {
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Failed to send'),
        onSuccess: () => setReplyingTo(null),
      },
    )
  }

  const handleEditSubmit = (body: string) => {
    if (!editing) return
    editMessage.mutate(
      { messageId: editing.id, body, conversationId: conversation.id },
      {
        onError: () => toast.error('Failed to edit message'),
        onSuccess: () => setEditing(null),
      },
    )
  }

  const handleDelete = (message: MessageWithRelations) => {
    if (!window.confirm('Delete this message?')) return
    deleteMessage.mutate(
      { messageId: message.id, conversationId: conversation.id },
      {
        onError: () => toast.error('Failed to delete message'),
        onSuccess: () => toast.success('Message deleted'),
      },
    )
  }

  const handleToggleReaction = (messageId: string, emoji: string, active: boolean) => {
    toggleReaction.mutate({ messageId, emoji, active, conversationId: conversation.id })
  }

  const replySenderName = replyingTo
    ? replyingTo.sender_id === currentUserId
      ? 'You'
      : (members.find((m) => m.user_id === replyingTo.sender_id)?.profile?.display_name ??
        'Unknown')
    : undefined

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader
        conversation={conversation}
        members={members}
        currentUserId={currentUserId}
        onlineUserIds={onlineUserIds}
        typingUsers={typingUsers}
        onBack={onBack}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        members={members}
        loading={messagesQuery.isLoading}
        hasNextPage={Boolean(messagesQuery.hasNextPage)}
        isFetchingNextPage={messagesQuery.isFetchingNextPage}
        onLoadMore={() => void messagesQuery.fetchNextPage()}
        onReply={(message) => {
          setEditing(null)
          setReplyingTo(message)
        }}
        onEdit={(message) => {
          setReplyingTo(null)
          setEditing(message)
        }}
        onDelete={handleDelete}
        onToggleReaction={handleToggleReaction}
      />

      <div className="px-4">
        <TypingIndicator users={typingUsers} />
      </div>

      <MessageComposer
        key={editing?.id ?? 'composer'}
        editing={editing}
        replyingTo={replyingTo}
        sending={sendMessage.isPending}
        onSend={handleSend}
        onEditSubmit={handleEditSubmit}
        onCancelEdit={() => setEditing(null)}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={() => sendTyping(currentUserDisplayName)}
        replySenderName={replySenderName}
      />
    </div>
  )
}
