import { useEffect, useRef, useState } from 'react'
import { Pencil, Reply, SendHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { MessageWithRelations } from '@/types/models'

type MessageComposerProps = {
  editing: MessageWithRelations | null
  replyingTo: MessageWithRelations | null
  sending: boolean
  onSend: (body: string, replyToId: string | null) => void
  onEditSubmit: (body: string) => void
  onCancelEdit: () => void
  onCancelReply: () => void
  onTyping: () => void
  replySenderName?: string
}

export function MessageComposer({
  editing,
  replyingTo,
  sending,
  onSend,
  onEditSubmit,
  onCancelEdit,
  onCancelReply,
  onTyping,
  replySenderName,
}: MessageComposerProps) {
  // The parent remounts this component (via `key`) when entering/leaving edit
  // mode, so editing.body is only ever needed for the initial value.
  const [value, setValue] = useState(editing?.body ?? '')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useEffect(() => {
    if (editing || replyingTo) {
      textareaRef.current?.focus()
      resize()
    }
  }, [editing, replyingTo])

  const submit = () => {
    const body = value.trim()
    if (!body) return
    if (editing) {
      onEditSubmit(body)
    } else {
      onSend(body, replyingTo?.id ?? null)
    }
    setValue('')
    requestAnimationFrame(resize)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
    if (event.key === 'Escape') {
      if (editing) onCancelEdit()
      else if (replyingTo) onCancelReply()
    }
  }

  return (
    <div className="border-t bg-background p-3">
      {editing ? (
        <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Pencil className="size-3" /> Editing message
          </span>
          <button type="button" onClick={onCancelEdit} aria-label="Cancel edit">
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {replyingTo && !editing ? (
        <div className="mb-2 flex items-center justify-between rounded-md border-l-2 border-primary bg-muted px-3 py-1.5 text-xs">
          <span className="min-w-0">
            <span className="font-medium">{replySenderName ?? 'Replying'}</span>
            <span className="ml-1.5 truncate text-muted-foreground">
              {replyingTo.body}
            </span>
          </span>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          rows={1}
          onChange={(event) => {
            setValue(event.target.value)
            if (!editing) onTyping()
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder={editing ? 'Edit your message…' : 'Type a message…'}
          className="max-h-40 min-h-9 resize-none"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={sending || value.trim().length === 0}
          aria-label={editing ? 'Save edit' : 'Send message'}
        >
          {editing ? <Reply className="rotate-180" /> : <SendHorizontal />}
        </Button>
      </div>
      <p className="mt-1 px-1 text-[10px] text-muted-foreground">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
