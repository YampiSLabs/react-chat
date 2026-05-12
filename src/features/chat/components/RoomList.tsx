import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  CheckCircle2,
  Copy,
  Hash,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { readPref, useSounds, writePref } from '@/lib/sounds'
import { stripControlCharacters } from '@/lib/security'
import { roomIconMap } from '../utils'
import type { Room } from '../types'

const roomMeta: Record<string, { unread: number }> = {
  general: { unread: 12 },
  support: { unread: 8 },
  'iot-alerts': { unread: 5 },
}

function useSoundPref() {
  const [enabled, setEnabled] = useState(() => readPref())
  const { playSound } = useSounds()

  const toggle = () => {
    const next = !enabled
    if (next) {
      playSound('activate', true)
    } else {
      playSound('deactivate')
    }
    writePref(next)
    setEnabled(next)
  }

  return { soundEnabled: enabled, toggleSound: toggle }
}

const roomItemVariants = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.96, height: 0, marginBottom: 0 },
}

const roomItemTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 35,
  mass: 0.8,
}

export function RoomList({
  isDemoMode,
  loading,
  onSelectRoom,
  rooms,
  selectedRoomId,
  onCreateRoom,
  onRenameRoom,
  onDeleteRoom,
  onDuplicateRoom,
}: {
  isDemoMode: boolean
  loading: boolean
  rooms: Room[]
  selectedRoomId: string
  onSelectRoom: (roomId: string) => void
  onCreateRoom: (name: string, description: string) => Promise<Room>
  onRenameRoom: (id: string, name: string) => Promise<void>
  onDeleteRoom: (id: string) => Promise<void>
  onDuplicateRoom: (room: Room) => Promise<Room>
}) {
  const { playSound } = useSounds()
  const { soundEnabled, toggleSound } = useSoundPref()

  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Room | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successRoomId, setSuccessRoomId] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editName, setEditName] = useState('')

  const successTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(successTimeout.current)
  }, [])

  function flashSuccess(roomId: string) {
    clearTimeout(successTimeout.current)
    setSuccessRoomId(roomId)
    successTimeout.current = setTimeout(() => setSuccessRoomId(null), 1500)
  }

  function resetCreateForm() {
    setNewName('')
    setNewDesc('')
    setActionError(null)
  }

  function resetEditForm() {
    setEditName('')
    setActionError(null)
  }

  function openCreate() {
    resetCreateForm()
    setCreateOpen(true)
  }

  function openRename(room: Room) {
    setRenameTarget(room)
    setEditName(room.name)
    setActionError(null)
  }

  function openDelete(room: Room) {
    setDeleteTarget(room)
    setActionError(null)
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setActionError('Room name is required.')
      return
    }
    setActionLoading(true)
    setActionError(null)
    try {
      const room = await onCreateRoom(newName.trim(), newDesc.trim())
      playSound('create')
      toast.success(`Room "${room.name}" created`, { duration: 2500 })
      flashSuccess(room.id)
      resetCreateForm()
      setCreateOpen(false)
      onSelectRoom(room.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create room.'
      setActionError(msg)
      playSound('error')
      toast.error(msg, { duration: 3500 })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRename() {
    if (!renameTarget) return
    if (!editName.trim()) {
      setActionError('Room name is required.')
      return
    }
    setActionLoading(true)
    setActionError(null)
    try {
      await onRenameRoom(renameTarget.id, editName.trim())
      playSound('edit')
      toast.success(`Room renamed to "${editName.trim()}"`, { duration: 2500 })
      flashSuccess(renameTarget.id)
      setRenameTarget(null)
      resetEditForm()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not rename room.'
      setActionError(msg)
      playSound('error')
      toast.error(msg, { duration: 3500 })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setActionLoading(true)
    setActionError(null)
    try {
      await onDeleteRoom(deleteTarget.id)
      playSound('delete')
      toast.success(`Room "${deleteTarget.name}" deleted`, { duration: 2500 })
      setDeleteTarget(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not delete room.'
      setActionError(msg)
      playSound('error')
      toast.error(msg, { duration: 3500 })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDuplicate(room: Room) {
    setActionLoading(true)
    try {
      const newRoom = await onDuplicateRoom(room)
      playSound('create')
      toast.success(`Room duplicated as "${newRoom.name}"`, { duration: 2500 })
      flashSuccess(newRoom.id)
      onSelectRoom(newRoom.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not duplicate room.'
      playSound('error')
      toast.error(msg, { duration: 3500 })
    } finally {
      setActionLoading(false)
    }
  }

  function handleSelectRoom(roomId: string) {
    playSound('select')
    onSelectRoom(roomId)
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="hidden items-center gap-3 border-b border-border/60 px-4 py-3.5 md:flex">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-foreground">SmartIoT Chat</h1>
            <p className="truncate text-xs text-muted-foreground">Realtime support & IoT ops</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-xs font-medium text-muted-foreground">Rooms</p>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={toggleSound}
                  aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                  className="max-sm:min-h-9 max-sm:min-w-9"
                >
                  {soundEnabled ? (
                    <Volume2 className="size-3.5" aria-hidden="true" />
                  ) : (
                    <VolumeX className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="inline-flex items-center justify-center rounded-lg border border-border/50 bg-card max-sm:p-2 p-1.5 text-muted-foreground hover:bg-card-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={openCreate}
                  aria-label="Create room"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">Create room</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-4"
          aria-label="Chat rooms"
          aria-busy={loading ? true : undefined}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border/50 bg-card px-3 py-3"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-44" />
                </motion.div>
              ))
            : null}

          <AnimatePresence mode="popLayout">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId
              const Icon = roomIconMap[room.id as keyof typeof roomIconMap] ?? Hash
              const meta = roomMeta[room.id as keyof typeof roomMeta] ?? { unread: 0 }

              return (
                <motion.div
                  key={room.id}
                  layout
                  variants={roomItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={roomItemTransition}
                  className="group relative"
                >
                  <motion.div
                    className={cn(
                      'flex min-h-12 w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-border/80 bg-card text-foreground'
                        : 'border-transparent bg-transparent text-foreground hover:border-border/50 hover:bg-card-hover',
                      successRoomId === room.id && 'border-success/40 bg-success/5',
                    )}
                    whileHover={isSelected ? {} : { scale: 1.01 }}
                    whileTap={isSelected ? {} : { scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
                      aria-current={isSelected ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'size-4 shrink-0',
                          isSelected ? 'text-primary' : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{room.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {room.description}
                        </span>
                      </span>
                      {meta.unread ? (
                        <Badge className="min-w-5 rounded-md border border-border/50 bg-surface px-1.5 text-[11px] font-medium text-muted-foreground">
                          {meta.unread}
                        </Badge>
                      ) : null}
                      {successRoomId === room.id ? (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <CheckCircle2 className="size-3.5 text-success" aria-label="Updated" />
                        </motion.span>
                      ) : null}
                    </button>

                    <div
                      className={cn(
                        'flex items-center gap-0.5',
                        'opacity-0 transition-opacity duration-150',
                        'group-hover:opacity-100 group-focus-within:opacity-100',
                        isSelected && 'opacity-100',
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 max-sm:min-h-9 max-sm:min-w-9"
                            aria-label={`Room actions for ${room.name}`}
                          >
                            <MoreVertical className="size-3.5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="right" className="min-w-40">
                          <DropdownMenuItem
                            onClick={() => openRename(room)}
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(room)}
                            onSelect={(e) => e.preventDefault()}
                            disabled={actionLoading}
                          >
                            <Copy className="size-4" aria-hidden="true" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(room)}
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </nav>

        <div className="border-t border-border/60 px-4 py-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {isDemoMode ? 'Demo Mode' : 'Live'}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {isDemoMode
                  ? 'Mock data in this browser'
                  : 'Firebase connected'}
              </p>
            </div>
            <span
              className={cn('mt-0.5 size-2 self-start rounded-full', isDemoMode ? 'bg-warning' : 'bg-success')}
            />
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm() }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create room</DialogTitle>
              <DialogDescription>Add a new chat room for your team.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="room-name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="room-name"
                  value={newName}
                   onChange={(e) => setNewName(stripControlCharacters(e.target.value))}
                   placeholder="e.g. project-alpha"
                   maxLength={32}
                   disabled={actionLoading}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleCreate()
                  }}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="room-desc" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="room-desc"
                  value={newDesc}
                   onChange={(e) => setNewDesc(stripControlCharacters(e.target.value))}
                  placeholder="What is this room for?"
                  maxLength={200}
                  disabled={actionLoading}
                  rows={3}
                />
              </div>
              {actionError ? (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setCreateOpen(false); resetCreateForm() }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleCreate}
                disabled={actionLoading || !newName.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  'Create'
                )}
              </motion.button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(renameTarget)}
          onOpenChange={(open) => {
            if (!open) { setRenameTarget(null); resetEditForm() }
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Rename room</DialogTitle>
              <DialogDescription>
                Rename {renameTarget ? `"${renameTarget.name}"` : ''} to something new.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-room-name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="edit-room-name"
                  value={editName}
                   onChange={(e) => setEditName(stripControlCharacters(e.target.value))}
                   maxLength={32}
                   disabled={actionLoading}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleRename()
                  }}
                  autoFocus
                />
              </div>
              {actionError ? (
                <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setRenameTarget(null); resetEditForm() }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleRename}
                disabled={actionLoading || !editName.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  'Save'
                )}
              </motion.button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) { setDeleteTarget(null); setActionError(null) }
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete room</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <strong>{deleteTarget ? `"${deleteTarget.name}"` : ''}</strong>?
                This will also remove all messages in this room. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {actionError ? (
              <p className="text-sm text-destructive flex items-center gap-1.5" role="alert">
                {actionError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setDeleteTarget(null); setActionError(null) }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
