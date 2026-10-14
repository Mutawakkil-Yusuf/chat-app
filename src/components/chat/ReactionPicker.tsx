import type { ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '🙏', '🔥']

type ReactionPickerProps = {
  onPick: (emoji: string) => void
  children: ReactNode
  align?: 'start' | 'center' | 'end'
}

export function ReactionPicker({ onPick, children, align = 'center' }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-1.5">
        <div className="flex gap-0.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onPick(emoji)}
              className="rounded-md p-1 text-lg leading-none transition-transform hover:scale-125 hover:bg-muted"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
