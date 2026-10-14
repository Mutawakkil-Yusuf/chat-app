import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Hero } from '@/components/landing/Hero'
import { CtaBand } from '@/components/landing/CtaBand'
import { FeatureGrid, TechStrip } from '@/components/landing/FeatureGrid'

export function LandingPage() {
  return (
    <>
      <Hero />

      <section className="border-y bg-muted/30 py-10">
        <div className="mx-auto w-full max-w-6xl px-4">
          <p className="mb-6 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Built on modern, reliable foundations
          </p>
          <TechStrip />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need to stay in sync
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            The essentials of a great chat experience, thoughtfully designed and blazing
            fast.
          </p>
        </div>

        <FeatureGrid className="mt-12" limit={6} />

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/features">
              See all features <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
