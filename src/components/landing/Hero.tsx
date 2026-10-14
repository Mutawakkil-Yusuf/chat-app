import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AppPreview } from './AppPreview'
import { useAuth } from '@/providers/auth-context'

export function Hero() {
  const { user } = useAuth()
  const appHref = user ? '/chats' : '/login'
  const appLabel = user ? 'Open app' : 'Start chatting'

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)',
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="size-3.5 fill-primary text-primary" />
            Realtime chat, open source
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Conversations that <span className="text-primary">flow</span>.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
            Ripple is a fast, modern chat app with live messages, presence, typing
            indicators, reactions and read receipts — on every device.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={appHref}>
                {appLabel} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/features">Explore features</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <AppPreview />
        </div>
      </div>
    </section>
  )
}
