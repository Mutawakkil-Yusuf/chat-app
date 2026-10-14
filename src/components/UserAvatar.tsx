import { cn } from 'cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, hueFromId } from '@/lib/format'

type UserAvatarProps = {
  id: string
  name: string | null | undefined
  avatarUrl?: string | null
  size?: number
  online?: boolean
  showPresence?: boolean
  className?: string
}

export function UserAvatar({
  id,
  name,
  avatarUrl,
  size = 40,
  online = false,
  showPresence = false,
  className,
}: UserAvatarProps) {
  const hue = hueFromId(id)
  const dotSize = Math.max(10, Math.round(size * 0.3))

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <Avatar className="size-full">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? 'User avatar'} /> : null}
        <AvatarFallback
          style={{
            backgroundColor: `oklch(0.6 0.14 ${hue})`,
            color: 'white',
            fontSize: Math.max(11, size * 0.36),
          }}
          className="font-medium"
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {showPresence ? (
        <span
          title={online ? 'Online' : 'Offline'}
          className={cn(
            'absolute right-0 bottom-0 rounded-full ring-2 ring-background',
            online ? 'bg-emerald-500' : 'bg-muted-foreground/40',
          )}
          style={{ width: dotSize, height: dotSize }}
        />
      ) : null}
    </div>
  )
}
