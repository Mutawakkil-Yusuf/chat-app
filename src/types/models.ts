import type { Database, ConversationKind } from './database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type Conversation = Tables['conversations']['Row']
export type ConversationMember = Tables['conversation_members']['Row']
export type Message = Tables['messages']['Row']
export type Reaction = Tables['message_reactions']['Row']

export type ConversationOverview =
  Database['public']['Functions']['get_my_conversations']['Returns'][number]

export type { ConversationKind }

export type MessageWithRelations = Message & {
  sender: Pick<Profile, 'id' | 'display_name' | 'username' | 'avatar_url'> | null
  message_reactions: Pick<Reaction, 'message_id' | 'user_id' | 'emoji'>[]
  reply_to:
    | (Pick<Message, 'id' | 'body' | 'sender_id'> & {
        sender: Pick<Profile, 'id' | 'display_name'> | null
      })
    | null
}

export type PublicProfile = Pick<
  Profile,
  'id' | 'username' | 'display_name' | 'avatar_url' | 'last_seen_at'
>

export type MemberWithProfile = {
  user_id: string
  role: string
  profile: PublicProfile | null
}

export type SearchMessageResult = {
  id: string
  conversation_id: string
  body: string
  created_at: string
  sender: Pick<Profile, 'id' | 'display_name'> | null
}
