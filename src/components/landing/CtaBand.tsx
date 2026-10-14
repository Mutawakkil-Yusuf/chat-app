import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-context'

export function CtaBand() {
  const { user } = useAuth()
  const appHref = user ? '/chats' : '/login'
  const appLabel = user ? 'Open Ripple' : 'Start chatting'

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(50% 120% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)',
          }}
        />
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Ready when you are.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Sign in with Google or a magic link and start a conversation in seconds.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to={appHref}>
              {appLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
