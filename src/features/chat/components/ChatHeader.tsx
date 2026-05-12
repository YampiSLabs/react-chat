import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  Hash,
  LogOut,
  MoreVertical,
  Pin,
  PinOff,
  Search,
  Users,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { stripControlCharacters } from '@/lib/security'
import { SkeletonChatHeader } from './SkeletonChatHeader'
import { readRoomPrefs, updateRoomPrefs } from '../hooks/useRoomPrefs'
import { roomIconMap } from '../utils'
import type { Room } from '../types'

export function ChatHeader({
  onlineCount,
  room,
  searchQuery,
  onSearchChange,
  onOnlineUsersClick,
  onSignOut,
}: {
  onlineCount: number
  room?: Room
  searchQuery: string
  onSearchChange: (query: string) => void
  onOnlineUsersClick: () => void
  onSignOut?: () => Promise<void>
}) {
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch) {
      inputRef.current?.focus()
    }
  }, [showSearch])

  if (!room) {
    return <SkeletonChatHeader />
  }

  const safeRoom = room
  const Icon = roomIconMap[safeRoom.id as keyof typeof roomIconMap] ?? Hash

  function handleToggleSearch() {
    if (showSearch) {
      setShowSearch(false)
      onSearchChange('')
    } else {
      setShowSearch(true)
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setShowSearch(false)
      onSearchChange('')
    }
  }

  function handleClearSearch() {
    onSearchChange('')
    inputRef.current?.focus()
  }

  function handleCopyRoomName() {
    navigator.clipboard.writeText(safeRoom.name).catch(() => {})
    toast.success(`Copied "${safeRoom.name}"`, { duration: 2000 })
  }

  const roomPrefs = readRoomPrefs(safeRoom.id)

  function handleTogglePinned() {
    const next = { ...roomPrefs, pinned: !roomPrefs.pinned }
    updateRoomPrefs(safeRoom.id, next)
  }

  return (
    <header className="shrink-0 border-b border-border/60 bg-surface">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">{room.name}</h2>
            <p className="truncate text-xs text-muted-foreground">{room.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Search messages" onClick={handleToggleSearch} className="max-sm:min-h-9 max-sm:min-w-9">
            <Search className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Online users, ${onlineCount} active`}
            className="hidden sm:inline-flex text-muted-foreground"
            onClick={onOnlineUsersClick}
          >
            <Users className="size-4" aria-hidden="true" />
            <span className="ml-0.5 text-xs">{onlineCount}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions" className="max-sm:min-h-9 max-sm:min-w-9">
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleTogglePinned}>
                {roomPrefs.pinned ? (
                  <PinOff className="size-4" aria-hidden="true" />
                ) : (
                  <Pin className="size-4" aria-hidden="true" />
                )}
                {roomPrefs.pinned ? 'Unpin room' : 'Pin room'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyRoomName}>
                <Copy className="size-4" aria-hidden="true" />
                Copy room name
              </DropdownMenuItem>
              {onSignOut ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => onSignOut()}>
                    <LogOut className="size-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AnimatePresence>
        {showSearch ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2 md:px-5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => onSearchChange(stripControlCharacters(e.target.value))}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search messages..."
                className="h-8 rounded-lg border-border/50 bg-background/50 text-sm"
              />
              {searchQuery ? (
                <Button variant="ghost" size="icon-xs" aria-label="Clear search" onClick={handleClearSearch} className="max-sm:min-h-9 max-sm:min-w-9">
                  <X className="size-3.5" aria-hidden="true" />
                </Button>
              ) : null}
              <Button variant="ghost" size="icon-xs" aria-label="Close search" onClick={handleToggleSearch} className="max-sm:min-h-9 max-sm:min-w-9">
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
