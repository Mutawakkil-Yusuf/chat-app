import { Check } from 'lucide-react'
import { CtaBand } from '@/components/landing/CtaBand'
import { FeatureGrid } from '@/components/landing/FeatureGrid'

const EXTRAS = [
  'Group conversations and direct messages',
  'Typing indicators and live presence',
  'Emoji reactions on any message',
  'Read receipts and unread badges',
  'Edit, delete and reply to messages',
  'Full-text search across chats',
  'Automatic dark mode and theme control',
  'Responsive, installable on mobile',
  'Magic-link and Google sign-in',
  'Account management and custom avatar',
]

export function FeaturesPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Built for real conversations
          </h1>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            Everything Ripple ships with, out of the box.
          </p>
        </div>

        <FeatureGrid className="mt-12" />

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">And the little things</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {EXTRAS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
