export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  conversations: (userId: string) => ['conversations', userId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  members: (conversationId: string) => ['members', conversationId] as const,
  userSearch: (term: string) => ['user-search', term] as const,
  messageSearch: (term: string) => ['message-search', term] as const,
}
