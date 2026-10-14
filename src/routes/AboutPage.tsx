import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/brand/Logo'
import { GithubIcon } from '@/components/brand/GithubIcon'
import { CtaBand } from '@/components/landing/CtaBand'
import { TechStrip } from '@/components/landing/FeatureGrid'

const GITHUB_URL = 'https://github.com/Mutawakkil-Yusuf/chat-app'

export function AboutPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-3xl px-4 pt-16 pb-4">
        <div className="text-center">
          <LogoMark className="mx-auto size-14" decorative />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            About Ripple
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            A modern, open-source chat app focused on one thing: conversations that flow.
          </p>
        </div>

        <div className="mt-12 space-y-5 text-muted-foreground">
          <p>
            Ripple started as a rebuild of an older chat project with a simple goal — keep
            what made it fun, and make it feel fast and effortless on any device. It pairs
            a React front end with Supabase for auth, database and realtime.
          </p>
          <p>
            Every message, reaction and presence update streams in live. There is no
            polling and no manual refresh; the interface reacts the moment something
            happens. It is fully responsive, works as an installable web app, and respects
            your system theme.
          </p>
          <p>
            The project is open source. Feedback, issues and pull requests are welcome.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border bg-card p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold">Under the hood</h2>
          <div className="mt-5">
            <TechStrip />
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <GithubIcon className="size-4" /> View on GitHub
            </a>
          </Button>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
