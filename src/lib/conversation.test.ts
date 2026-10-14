import { describe, expect, it } from 'vitest'
import { conversationPresenceId, conversationSubtitle, conversationTitle } from './conversation'
import type { ConversationOverview } from '@/types/models'

function makeConversation(
  overrides: Partial<ConversationOverview> = {},
): ConversationOverview {
  return {
    id: 'conv-1',
    kind: 'direct',
    title: null,
    last_message_at: '2026-01-01T10:00:00.000Z',
    last_message_body: 'hello there',
    last_message_sender_id: 'user-a',
    last_read_at: '2026-01-01T09:00:00.000Z',
    unread_count: 0,
    other_user_id: 'user-b',
    other_user_name: 'Bea',
    other_user_avatar: null,
    other_user_last_seen: '2026-01-01T10:00:00.000Z',
    member_ids: ['user-a', 'user-b'],
    ...overrides,
  }
}

describe('conversationTitle', () => {
  it('uses the other user name for direct chats', () => {
    expect(conversationTitle(makeConversation())).toBe('Bea')
  })

  it('uses the title for groups and falls back when empty', () => {
    expect(conversationTitle(makeConversation({ kind: 'group', title: 'Team' }))).toBe(
      'Team',
    )
    expect(conversationTitle(makeConversation({ kind: 'group', title: '   ' }))).toBe(
      'Group chat',
    )
  })
})

describe('conversationSubtitle', () => {
  it('prefixes your own messages', () => {
    expect(conversationSubtitle(makeConversation(), 'user-a')).toBe('You: hello there')
  })

  it('shows the raw body for incoming messages', () => {
    expect(conversationSubtitle(makeConversation(), 'user-b')).toBe('hello there')
  })

  it('handles empty conversations', () => {
    expect(
      conversationSubtitle(makeConversation({ last_message_body: null }), 'user-a'),
    ).toBe('No messages yet')
  })
})

describe('conversationPresenceId', () => {
  it('returns the other user id for direct chats', () => {
    expect(conversationPresenceId(makeConversation())).toBe('user-b')
  })

  it('returns the conversation id for groups', () => {
    expect(conversationPresenceId(makeConversation({ kind: 'group' }))).toBe('conv-1')
  })
})
