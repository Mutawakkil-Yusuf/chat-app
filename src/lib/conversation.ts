import type { ConversationOverview } from '@/types/models'

export function conversationTitle(conversation: ConversationOverview): string {
  if (conversation.kind === 'group') {
    return conversation.title?.trim() || 'Group chat'
  }
  return conversation.other_user_name ?? 'Unknown user'
}

export function conversationPresenceId(conversation: ConversationOverview): string {
  if (conversation.kind === 'group') return conversation.id
  return conversation.other_user_id ?? conversation.id
}

export function conversationSubtitle(
  conversation: ConversationOverview,
  currentUserId: string,
): string {
  const senderId = conversation.last_message_sender_id
  const body = conversation.last_message_body
  if (!body) return 'No messages yet'
  if (conversation.kind === 'group' && senderId) {
    const prefix =
      senderId === currentUserId ? 'You' : (conversation.other_user_name ?? 'Someone')
    return `${prefix}: ${body}`
  }
  return senderId === currentUserId ? `You: ${body}` : body
}
