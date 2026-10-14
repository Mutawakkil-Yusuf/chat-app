import { cn } from 'cn'
import { FEATURES, TECH_STACK } from './content'

export function FeatureGrid({
  className,
  limit,
}: {
  className?: string
  limit?: number
}) {
  const features = limit ? FEATURES.slice(0, limit) : FEATURES

  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {features.map((feature) => (
        <div
          key={feature.title}
          className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <feature.icon className="size-5" />
          </div>
          <h3 className="font-medium">{feature.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

export function TechStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      {TECH_STACK.map((tech) => (
        <a
          key={tech.name}
          href={tech.href}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {tech.name}
        </a>
      ))}
    </div>
  )
}
