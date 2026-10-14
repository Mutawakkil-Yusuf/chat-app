import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type TypingPayload = { user_id: string; display_name: string }
export type TypingEntry = { userId: string; displayName: string }

const TYPING_TIMEOUT_MS = 4000

/**
 * Ephemeral typing indicators over Realtime broadcast (never persisted).
 */
export function useTyping(conversationId: string | null, currentUserId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingEntry>>(new Map())
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timeoutsRef = useRef<Map<string, number>>(new Map())
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!conversationId || !currentUserId) return

    const timeouts = timeoutsRef.current

    const channel = supabase
      .channel(`typing:${conversationId}`, {
        config: { broadcast: { self: false } },
      })
      .on('broadcast', { event: 'typing' }, (message) => {
        const payload = message.payload as TypingPayload
        if (!payload?.user_id || payload.user_id === currentUserId) return

        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.set(payload.user_id, {
            userId: payload.user_id,
            displayName: payload.display_name,
          })
          return next
        })

        window.clearTimeout(timeouts.get(payload.user_id))
        timeouts.set(
          payload.user_id,
          window.setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev)
              next.delete(payload.user_id)
              return next
            })
            timeouts.delete(payload.user_id)
          }, TYPING_TIMEOUT_MS),
        )
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channelRef.current = null
      timeouts.forEach((id) => window.clearTimeout(id))
      timeouts.clear()
      void supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  const sendTyping = useCallback(
    (displayName: string) => {
      if (!currentUserId) return
      const now = Date.now()
      if (now - lastSentRef.current < 2000) return
      lastSentRef.current = now
      void channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, display_name: displayName } satisfies TypingPayload,
      })
    },
    [currentUserId],
  )

  return { typingUsers: Array.from(typingUsers.values()), sendTyping }
}
