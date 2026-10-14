import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { GithubIcon } from '@/components/brand/GithubIcon'

const GITHUB_URL = 'https://github.com/Mutawakkil-Yusuf/chat-app'

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Realtime chat with presence, typing indicators and reactions. Conversations
            that flow.
          </p>
        </div>

        <div className="flex gap-12">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Product</p>
            <Link
              to="/features"
              className="block text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              to="/about"
              className="block text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">More</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <GithubIcon className="size-3.5" /> GitHub
            </a>
            <Link
              to="/login"
              className="block text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ripple</p>
          <p>Built with React, Supabase &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
