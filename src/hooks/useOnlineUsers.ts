import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PresenceMeta = { user_id: string; online_at: string }

/**
 * Tracks which users are currently connected, app-wide, using a single
 * Realtime presence channel keyed by user id.
 */
export function useOnlineUsers(currentUserId: string | undefined) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase.channel('online-users', {
      config: { presence: { key: currentUserId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceMeta>()
        const next = new Set<string>()
        for (const presences of Object.values(state)) {
          for (const presence of presences) {
            if (presence.user_id) next.add(presence.user_id)
          }
        }
        setOnlineUserIds(next)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          } satisfies PresenceMeta)
        }
      })

    return () => {
      setOnlineUserIds(new Set())
      void supabase.removeChannel(channel)
    }
  }, [currentUserId])

  return onlineUserIds
}
