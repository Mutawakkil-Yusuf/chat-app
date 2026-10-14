import {
  CheckCheck,
  PencilLine,
  Reply,
  Search,
  SmilePlus,
  Sparkles,
  UsersRound,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Realtime messaging',
    description:
      'Messages appear instantly over Supabase Realtime — no polling, no refresh.',
  },
  {
    icon: Sparkles,
    title: 'Presence & typing',
    description:
      'See who is online and when someone is typing, live in every conversation.',
  },
  {
    icon: SmilePlus,
    title: 'Reactions',
    description: 'React to any message with emoji and see counts update for everyone.',
  },
  {
    icon: CheckCheck,
    title: 'Read receipts & unread',
    description: 'Know what has been seen and jump back to unread conversations.',
  },
  {
    icon: PencilLine,
    title: 'Edit & delete',
    description: 'Fix a typo or remove a message — changes sync to everyone instantly.',
  },
  {
    icon: Reply,
    title: 'Replies',
    description: 'Quote a message to keep long threads easy to follow.',
  },
  {
    icon: Search,
    title: 'Search',
    description: 'Find conversations and messages across all your chats in a keystroke.',
  },
  {
    icon: UsersRound,
    title: 'Groups & DMs',
    description: 'Create group conversations or one-to-one chats with anyone.',
  },
]

export const TECH_STACK = [
  { name: 'React 19', href: 'https://react.dev' },
  { name: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { name: 'Supabase', href: 'https://supabase.com' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com' },
  { name: 'Vite', href: 'https://vite.dev' },
]
