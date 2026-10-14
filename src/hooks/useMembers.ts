import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { MemberWithProfile } from '@/types/models'

export function useMembers(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.members(conversationId ?? 'none'),
    enabled: Boolean(conversationId),
    queryFn: async (): Promise<MemberWithProfile[]> => {
      const { data, error } = await supabase
        .from('conversation_members')
        .select(
          'user_id, role, profile:profiles!conversation_members_user_id_fkey(id, username, display_name, avatar_url, last_seen_at)',
        )
        .eq('conversation_id', conversationId as string)
        .returns<MemberWithProfile[]>()
      if (error) throw error
      return data ?? []
    },
  })
}
