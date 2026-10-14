import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { PublicProfile, SearchMessageResult } from '@/types/models'

function sanitizeTerm(term: string): string {
  return term.replace(/[,()\\%]/g, ' ').trim()
}

export function useUserSearch(term: string, currentUserId: string | undefined) {
  const clean = sanitizeTerm(term)
  return useQuery({
    queryKey: queryKeys.userSearch(clean),
    enabled: Boolean(currentUserId) && clean.length >= 2,
    queryFn: async (): Promise<PublicProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, last_seen_at')
        .or(`display_name.ilike.%${clean}%,username.ilike.%${clean}%`)
        .neq('id', currentUserId as string)
        .order('display_name', { ascending: true })
        .limit(20)
        .returns<PublicProfile[]>()
      if (error) throw error
      return data ?? []
    },
  })
}

export function useMessageSearch(term: string, enabled: boolean) {
  const clean = sanitizeTerm(term)
  return useQuery({
    queryKey: queryKeys.messageSearch(clean),
    enabled: enabled && clean.length >= 2,
    queryFn: async (): Promise<SearchMessageResult[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          'id, conversation_id, body, created_at, sender:profiles!messages_sender_id_fkey(id, display_name)',
        )
        .ilike('body', `%${clean}%`)
        .order('created_at', { ascending: false })
        .limit(30)
        .returns<SearchMessageResult[]>()
      if (error) throw error
      return data ?? []
    },
  })
}
