import { useState } from 'react'
import { Check, Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/UserAvatar'
import { useUserSearch } from '@/hooks/useSearch'
import {
  useCreateGroupConversation,
  useStartDirectConversation,
} from '@/hooks/useConversations'
import type { PublicProfile } from '@/types/models'

type NewConversationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onCreated: (conversationId: string) => void
}

export function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onCreated,
}: NewConversationDialogProps) {
  const [term, setTerm] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [selected, setSelected] = useState<Map<string, PublicProfile>>(new Map())

  const { data: results = [], isFetching } = useUserSearch(term, currentUserId)
  const startDirect = useStartDirectConversation(currentUserId)
  const createGroup = useCreateGroupConversation(currentUserId)

  const resetState = () => {
    setTerm('')
    setGroupTitle('')
    setSelected(new Map())
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  const handleDirect = async (profile: PublicProfile) => {
    try {
      const conversationId = await startDirect.mutateAsync(profile.id)
      onCreated(conversationId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start chat')
    }
  }

  const toggleMember = (profile: PublicProfile) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(profile.id)) next.delete(profile.id)
      else next.set(profile.id, profile)
      return next
    })
  }

  const handleCreateGroup = async () => {
    if (selected.size === 0) {
      toast.error('Add at least one member')
      return
    }
    try {
      const conversationId = await createGroup.mutateAsync({
        title: groupTitle.trim() || 'New group',
        memberIds: Array.from(selected.keys()),
      })
      onCreated(conversationId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create group')
    }
  }

  return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>Start a direct message or create a group.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct">
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              Group
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-4">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search people by name or username"
              className="pl-8"
            />
            {isFetching ? (
              <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          <TabsContent value="direct" className="mt-3">
            <UserResults
              results={results}
              emptyHint="Type at least 2 characters to search."
              onPick={handleDirect}
              pending={startDirect.isPending}
            />
          </TabsContent>

          <TabsContent value="group" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="group-title">Group name</Label>
              <Input
                id="group-title"
                value={groupTitle}
                onChange={(event) => setGroupTitle(event.target.value)}
                placeholder="e.g. Weekend plans"
              />
            </div>

            {selected.size > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selected.values()).map((profile) => (
                  <span
                    key={profile.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {profile.display_name}
                    <button
                      type="button"
                      onClick={() => toggleMember(profile)}
                      aria-label={`Remove ${profile.display_name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <UserResults
              results={results}
              emptyHint="Search to add members."
              onPick={toggleMember}
              selectedIds={selected}
            />

            <Button
              className="w-full"
              disabled={createGroup.isPending || selected.size === 0}
              onClick={handleCreateGroup}
            >
              {createGroup.isPending ? <Loader2 className="animate-spin" /> : null}
              Create group ({selected.size})
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function UserResults({
  results,
  emptyHint,
  onPick,
  pending,
  selectedIds,
}: {
  results: PublicProfile[]
  emptyHint: string
  onPick: (profile: PublicProfile) => void
  pending?: boolean
  selectedIds?: Map<string, PublicProfile>
}) {
  if (results.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyHint}</p>
  }

  return (
    <ScrollArea className="h-56">
      <div className="space-y-1 pr-2">
        {results.map((profile) => {
          const isSelected = selectedIds?.has(profile.id)
          return (
            <button
              key={profile.id}
              type="button"
              disabled={pending}
              onClick={() => onPick(profile)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted',
                'disabled:opacity-50',
              )}
            >
              <UserAvatar
                id={profile.id}
                name={profile.display_name}
                avatarUrl={profile.avatar_url}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{profile.display_name}</p>
                <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
              </div>
              {isSelected ? <Check className="size-4 text-primary" /> : null}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
