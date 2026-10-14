export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ConversationKind = 'direct' | 'group'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          last_seen_at: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          last_seen_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          last_seen_at?: string
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          kind: ConversationKind
          title: string | null
          created_by: string | null
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          kind?: ConversationKind
          title?: string | null
          created_by?: string | null
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          kind?: ConversationKind
          title?: string | null
          created_by?: string | null
          last_message_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          user_id: string
          role: string
          joined_at: string
          last_read_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          role?: string
          joined_at?: string
          last_read_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          role?: string
          joined_at?: string
          last_read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_members_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          body: string
          reply_to_id: string | null
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          body: string
          reply_to_id?: string | null
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          body?: string
          reply_to_id?: string | null
          edited_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_reply_to_id_fkey'
            columns: ['reply_to_id']
            isOneToOne: false
            referencedRelation: 'messages'
            referencedColumns: ['id']
          },
        ]
      }
      message_reactions: {
        Row: {
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'message_reactions_message_id_fkey'
            columns: ['message_id']
            isOneToOne: false
            referencedRelation: 'messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'message_reactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_my_conversations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          kind: ConversationKind
          title: string | null
          last_message_at: string | null
          last_message_body: string | null
          last_message_sender_id: string | null
          last_read_at: string | null
          unread_count: number
          other_user_id: string | null
          other_user_name: string | null
          other_user_avatar: string | null
          other_user_last_seen: string | null
          member_ids: string[]
        }[]
      }
      start_direct_conversation: {
        Args: { other_user: string }
        Returns: string
      }
      create_group_conversation: {
        Args: { p_title: string; p_member_ids: string[] }
        Returns: string
      }
      is_member: {
        Args: { p_conversation: string; p_user: string }
        Returns: boolean
      }
      is_message_member: {
        Args: { p_message: string; p_user: string }
        Returns: boolean
      }
    }
    Enums: {
      conversation_kind: ConversationKind
    }
    CompositeTypes: { [_ in never]: never }
  }
}
