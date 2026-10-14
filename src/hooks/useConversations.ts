import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { ConversationOverview } from '@/types/models'

export function useConversations(userId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.conversations(userId ?? 'anonymous'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<ConversationOverview[]> => {
      const { data, error } = await supabase
        .rpc('get_my_conversations')
        .returns<ConversationOverview[]>()
      if (error) throw error
      return data ?? []
    },
  })

  useEffect(() => {
    if (!userId) return
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_members' },
        invalidate,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        invalidate,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  return query
}

export function useStartDirectConversation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc('start_direct_conversation', {
        other_user: otherUserId,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
    },
  })
}

export function useCreateGroupConversation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ title, memberIds }: { title: string; memberIds: string[] }) => {
      const { data, error } = await supabase.rpc('create_group_conversation', {
        p_title: title,
        p_member_ids: memberIds,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
    },
  })
}

export function useMarkConversationRead(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!userId) return
      const { error } = await supabase
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
    },
  })
}
