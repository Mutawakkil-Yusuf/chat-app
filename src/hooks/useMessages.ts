import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { MessageWithRelations } from '@/types/models'

const PAGE_SIZE = 30

const MESSAGE_SELECT = `
  id, conversation_id, sender_id, body, reply_to_id, edited_at, created_at,
  sender:profiles!messages_sender_id_fkey(id, display_name, username, avatar_url),
  message_reactions(message_id, user_id, emoji),
  reply_to:messages!messages_reply_to_id_fkey(id, body, sender_id)
`

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId ?? 'none'),
    enabled: Boolean(conversationId),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<MessageWithRelations[]> => {
      let request = supabase
        .from('messages')
        .select(MESSAGE_SELECT)
        .eq('conversation_id', conversationId as string)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)

      if (pageParam) request = request.lt('created_at', pageParam)

      const { data, error } = await request.returns<MessageWithRelations[]>()
      if (error) throw error
      return data ?? []
    },
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1].created_at : undefined,
  })

  useEffect(() => {
    if (!conversationId) return
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) })

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        invalidate,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient])

  return query
}

function invalidateAll(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  userId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) })
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
  }
}

export function useSendMessage(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
      replyToId,
    }: {
      conversationId: string
      body: string
      replyToId?: string | null
    }) => {
      if (!userId) throw new Error('Not authenticated')
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: body.trim(),
        reply_to_id: replyToId ?? null,
      })
      if (error) throw error
      return conversationId
    },
    onSuccess: (_data, variables) =>
      invalidateAll(queryClient, variables.conversationId, userId),
  })
}

export function useEditMessage(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageId,
      body,
    }: {
      messageId: string
      body: string
      conversationId: string
    }) => {
      const { error } = await supabase
        .from('messages')
        .update({ body: body.trim(), edited_at: new Date().toISOString() })
        .eq('id', messageId)
      if (error) throw error
    },
    onSuccess: (_data, variables) =>
      invalidateAll(queryClient, variables.conversationId, userId),
  })
}

export function useDeleteMessage(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageId,
    }: {
      messageId: string
      conversationId: string
    }) => {
      const { error } = await supabase.from('messages').delete().eq('id', messageId)
      if (error) throw error
    },
    onSuccess: (_data, variables) =>
      invalidateAll(queryClient, variables.conversationId, userId),
  })
}

export function useToggleReaction(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
      active,
    }: {
      messageId: string
      emoji: string
      active: boolean
      conversationId: string
    }) => {
      if (!userId) throw new Error('Not authenticated')
      if (active) {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId)
          .eq('emoji', emoji)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('message_reactions')
          .insert({ message_id: messageId, user_id: userId, emoji })
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) =>
      invalidateAll(queryClient, variables.conversationId, userId),
  })
}
