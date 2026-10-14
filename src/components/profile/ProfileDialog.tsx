import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/UserAvatar'
import { useUpdateProfile } from '@/hooks/useProfile'
import type { Profile } from '@/types/models'

const schema = z.object({
  display_name: z.string().trim().min(1, 'Name is required').max(50),
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  avatar_url: z.union([z.url('Enter a valid URL'), z.literal('')]),
  bio: z.string().trim().max(160, 'Keep it under 160 characters').optional(),
})

type FormValues = z.infer<typeof schema>

type ProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  profile: Profile
}

export function ProfileDialog({ open, onOpenChange, userId, profile }: ProfileDialogProps) {
  const updateProfile = useUpdateProfile(userId)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile.display_name,
      username: profile.username,
      avatar_url: profile.avatar_url ?? '',
      bio: profile.bio ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        display_name: profile.display_name,
        username: profile.username,
        avatar_url: profile.avatar_url ?? '',
        bio: profile.bio ?? '',
      })
    }
  }, [open, profile, reset])

  const avatarUrl = useWatch({ control, name: 'avatar_url' })
  const displayName = useWatch({ control, name: 'display_name' })

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile.mutateAsync({
        display_name: values.display_name.trim(),
        username: values.username.trim(),
        avatar_url: values.avatar_url.trim() ? values.avatar_url.trim() : null,
        bio: values.bio?.trim() ? values.bio.trim() : null,
      })
      toast.success('Profile updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update profile')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>Update how others see you in chat.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex justify-center">
            <UserAvatar
              id={userId}
              name={displayName || profile.display_name}
              avatarUrl={avatarUrl || null}
              size={72}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input id="profile-name" {...register('display_name')} aria-invalid={!!errors.display_name} />
            {errors.display_name ? (
              <p className="text-xs text-destructive">{errors.display_name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-username">Username</Label>
            <Input id="profile-username" {...register('username')} aria-invalid={!!errors.username} />
            {errors.username ? (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-avatar">Avatar URL</Label>
            <Input
              id="profile-avatar"
              placeholder="https://…"
              {...register('avatar_url')}
              aria-invalid={!!errors.avatar_url}
            />
            {errors.avatar_url ? (
              <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              rows={3}
              placeholder="A short line about you"
              {...register('bio')}
              aria-invalid={!!errors.bio}
            />
            {errors.bio ? (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
