import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { GithubIcon } from '@/components/brand/GithubIcon'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useAuth } from '@/providers/auth-context'

const NAV = [
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
]

const GITHUB_URL = 'https://github.com/Mutawakkil-Yusuf/chat-app'

export function SiteHeader() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const appHref = user ? '/chats' : '/login'
  const appLabel = user ? 'Open app' : 'Sign in'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
    )

  return (
    <header className="pt-safe sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4">
        <Link to="/" aria-label="Ripple home">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={appHref}>{appLabel}</Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <GithubIcon className="size-4" /> GitHub
            </a>
            <Button asChild size="sm" className="mt-2">
              <Link to={appHref} onClick={() => setOpen(false)}>
                {appLabel}
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
