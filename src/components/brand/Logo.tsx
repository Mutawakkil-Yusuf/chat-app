import { cn } from 'cn'

export function LogoMark({
  className,
  decorative = false,
}: {
  className?: string
  decorative?: boolean
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'Ripple'}
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="ripple-mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8574a" />
          <stop offset="1" stopColor="#c72f1e" />
        </linearGradient>
        <clipPath id="ripple-mark-bubble">
          <path d="M9 3.5H23A7.5 7.5 0 0 1 30.5 11v7A7.5 7.5 0 0 1 23 25.5h-6l-5.5 5.5v-5.5H9A7.5 7.5 0 0 1 1.5 18v-7A7.5 7.5 0 0 1 9 3.5Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#ripple-mark-bubble)">
        <path
          d="M9 3.5H23A7.5 7.5 0 0 1 30.5 11v7A7.5 7.5 0 0 1 23 25.5h-6l-5.5 5.5v-5.5H9A7.5 7.5 0 0 1 1.5 18v-7A7.5 7.5 0 0 1 9 3.5Z"
          fill="url(#ripple-mark-g)"
        />
        <g fill="none" stroke="#ffffff" strokeWidth="1.8">
          <circle cx="16" cy="14.5" r="5.4" opacity="0.5" />
          <circle cx="16" cy="14.5" r="9" opacity="0.26" />
        </g>
        <circle cx="16" cy="14.5" r="2.4" fill="#ffffff" />
      </g>
    </svg>
  )
}

export function Logo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string
  markClassName?: string
  textClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={cn('size-7', markClassName)} decorative />
      <span className={cn('text-base font-semibold tracking-tight', textClassName)}>
        Ripple
      </span>
    </span>
  )
}
