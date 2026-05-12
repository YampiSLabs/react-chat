import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  BellOff,
  Check,
  Hash,
  Loader2,
  LogOut,
  Pin,
  PinOff,
  Save,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSounds } from '@/lib/sounds'
import { stripControlCharacters } from '@/lib/security'
import { cn } from '@/lib/utils'
import { readAll, writeAll, type RoomPrefs } from '../hooks/useRoomPrefs'
import { roomIconMap } from '../utils'
import { OnlineUsers } from './OnlineUsers'
import { SkeletonRightPanel } from './SkeletonRightPanel'
import type { PresenceUser, Room } from '../types'

const roomTone = {
  general: 'border-border/60 bg-card text-muted-foreground',
  support: 'border-primary/20 bg-primary/10 text-primary',
  'iot-alerts': 'border-warning/20 bg-warning-subtle/30 text-warning',
}

function createdLabel(room?: Room) {
  if (!room?.createdAt) {
    return 'Demo room'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(room.createdAt)
}

export function RightPanel({
  currentDisplayName,
  profileName,
  room,
  setProfileName,
  updateDisplayName,
  users,
  usersLoading = false,
  onSignOut,
}: {
  currentDisplayName: string
  profileName: string
  room?: Room
  setProfileName: (value: string) => void
  updateDisplayName: (value: string) => boolean
  users: PresenceUser[]
  usersLoading?: boolean
  onSignOut?: () => Promise<void>
}) {
  const [roomPrefs, setRoomPrefs] = useState<Record<string, RoomPrefs>>(() => readAll())
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const onlineUsersRef = useRef<HTMLElement | null>(null)
  const { playSound } = useSounds()
  const cleanProfileName = profileName.trim()
  const savedProfileName = currentDisplayName.trim()
  const isNameDirty = cleanProfileName !== savedProfileName
  const isNameSaved = Boolean(cleanProfileName) && !isNameDirty
  const nameError = nameStatus === 'error' ? 'Enter a display name.' : ''
  const canSaveName = Boolean(cleanProfileName) && isNameDirty && nameStatus !== 'saving'

  useEffect(() => {
    function handleScrollToUsers() {
      onlineUsersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      playSound('select')
    }

    window.addEventListener('smartiot-chat:scroll-to-users', handleScrollToUsers)
    return () => window.removeEventListener('smartiot-chat:scroll-to-users', handleScrollToUsers)
  }, [playSound])

  if (!room) {
    return <SkeletonRightPanel />
  }

  const activeRoom = room
  const Icon = roomIconMap[activeRoom.id as keyof typeof roomIconMap] ?? Hash
  const tone = roomTone[activeRoom.id as keyof typeof roomTone] ?? roomTone.general
  const prefsDefaults: RoomPrefs = { muted: false, notifications: true, pinned: false }
  const currentPrefs: RoomPrefs = { ...prefsDefaults, ...roomPrefs[activeRoom.id] }

  function handleNameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!cleanProfileName) {
      setNameStatus('error')
      return
    }

    if (!isNameDirty) {
      setNameStatus('saved')
      window.setTimeout(() => setNameStatus('idle'), 1600)
      return
    }

    setNameStatus('saving')
    const updated = updateDisplayName(cleanProfileName)

    if (!updated) {
      setNameStatus('error')
      return
    }

    setProfileName(cleanProfileName)
    playSound('activate')
    toast.success('Display name updated', { duration: 1800 })
    setNameStatus('saved')
    window.setTimeout(() => setNameStatus('idle'), 1600)
  }

  function updateRoomPrefs(nextPrefs: RoomPrefs, successMessage: string, active: boolean) {
    const nextRoomPrefs = {
      ...roomPrefs,
      [activeRoom.id]: nextPrefs,
    }
    setRoomPrefs(nextRoomPrefs)
    writeAll(nextRoomPrefs)
    playSound(active ? 'activate' : 'deactivate')
    toast.success(successMessage, { duration: 2000 })
  }

  function toggleMuted() {
    const muted = !currentPrefs.muted
    updateRoomPrefs(
      { ...currentPrefs, muted },
      muted ? `${activeRoom.name} muted` : `${activeRoom.name} unmuted`,
      !muted,
    )
  }

  function toggleNotifications() {
    const notifications = !currentPrefs.notifications
    updateRoomPrefs(
      { ...currentPrefs, notifications },
      notifications ? `Notifications enabled for ${activeRoom.name}` : `Notifications paused for ${activeRoom.name}`,
      notifications,
    )
  }

  function togglePinned() {
    const pinned = !currentPrefs.pinned
    updateRoomPrefs(
      { ...currentPrefs, pinned },
      pinned ? `${activeRoom.name} pinned` : `${activeRoom.name} unpinned`,
      pinned,
    )
  }

  function handleSignOut() {
    playSound('deactivate')
    onSignOut?.()
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section>
          <p className="text-xs font-medium text-muted-foreground">Room</p>
          <div className="mt-2 rounded-xl border border-border/60 bg-card px-3 py-3">
            <div className="flex items-start gap-3">
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl border', tone)}>
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-foreground">{room.name}</h2>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{room.description}</p>
              </div>
            </div>

            <div className="mt-3 border-t border-border/40 pt-3">
              <dl className="grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Created by</dt>
                  <dd className="font-medium text-foreground">Admin</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium text-foreground">{createdLabel(room)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5">
            <span className="size-2 rounded-full bg-success" />
            <span className="text-xs text-foreground">Connected &middot; {users.length} online</span>
          </div>
        </section>

        <section className="mt-5">
          <p className="text-xs font-medium text-muted-foreground">Actions</p>
          <div className="mt-2 space-y-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-full justify-start rounded-lg px-2.5 text-xs',
                currentPrefs.muted ? 'text-warning' : 'text-muted-foreground',
              )}
              aria-pressed={currentPrefs.muted}
              aria-label={currentPrefs.muted ? 'Unmute room' : 'Mute room'}
              onClick={toggleMuted}
            >
              {currentPrefs.muted ? (
                <VolumeX className="size-3.5" aria-hidden="true" />
              ) : (
                <Volume2 className="size-3.5" aria-hidden="true" />
              )}
              {currentPrefs.muted ? 'Muted' : 'Mute'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-full justify-start rounded-lg px-2.5 text-xs',
                currentPrefs.notifications ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-pressed={currentPrefs.notifications}
              aria-label={currentPrefs.notifications ? 'Disable notifications' : 'Enable notifications'}
              onClick={toggleNotifications}
            >
              {currentPrefs.notifications ? (
                <Bell className="size-3.5" aria-hidden="true" />
              ) : (
                <BellOff className="size-3.5" aria-hidden="true" />
              )}
              {currentPrefs.notifications ? 'Alerts on' : 'Alerts off'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-full justify-start rounded-lg px-2.5 text-xs',
                currentPrefs.pinned ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-pressed={currentPrefs.pinned}
              aria-label={currentPrefs.pinned ? 'Unpin room' : 'Pin room'}
              onClick={togglePinned}
            >
              {currentPrefs.pinned ? (
                <PinOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Pin className="size-3.5" aria-hidden="true" />
              )}
              {currentPrefs.pinned ? 'Pinned' : 'Pin'}
            </Button>
            {onSignOut ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-start rounded-lg px-2.5 text-xs text-destructive hover:bg-destructive/10"
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Sign out
              </Button>
            ) : null}
          </div>
        </section>

        <section ref={onlineUsersRef} className="mt-5">
          <p className="text-xs font-medium text-muted-foreground">Online</p>
          <div className="mt-2 rounded-xl border border-border/60 bg-card p-1">
            <OnlineUsers users={users} compact loading={usersLoading} />
          </div>
        </section>
      </div>

      <form className="shrink-0 border-t border-border/60 bg-surface px-4 py-3" onSubmit={handleNameSubmit}>
        <label htmlFor="profile-name" className="text-xs font-medium text-muted-foreground">
          Profile
        </label>
        <div className="mt-1.5 flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <Input
              id="profile-name"
              value={profileName}
              onChange={(event) => {
                setProfileName(stripControlCharacters(event.target.value))
                setNameStatus('idle')
              }}
              maxLength={32}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'profile-name-error' : undefined}
              className="h-8 rounded-lg bg-background/50 text-xs"
            />
            {nameError ? (
              <p id="profile-name-error" className="mt-1 text-xs text-destructive" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!canSaveName}
            className="h-8 rounded-lg px-2.5 text-xs"
            aria-label={isNameDirty ? 'Save display name' : 'Display name saved'}
          >
            {nameStatus === 'saving' ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : nameStatus === 'saved' || isNameSaved ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Save className="size-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
