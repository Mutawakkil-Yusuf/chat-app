import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { Profile } from '@/types/models'

const HEARTBEAT_MS = 60_000

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? 'anonymous'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      updates: Partial<Pick<Profile, 'display_name' | 'username' | 'avatar_url' | 'bio'>>,
    ) => {
      if (!userId) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}

/** Periodically refresh the current user's last_seen_at while the app is open. */
export function usePresenceHeartbeat(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    const beat = () => {
      void supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId)
    }

    beat()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') beat()
    }, HEARTBEAT_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') beat()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', beat)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', beat)
      beat()
    }
  }, [userId])
}
