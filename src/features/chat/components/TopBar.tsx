import { Bell, ChevronDown, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { IconButton } from './IconButton'
import { StatusPill } from './StatusPill'
import { AvatarInitials } from './AvatarInitials'
import type { ChatUser } from '../types'

export function TopBar({
  isDemoMode,
  user,
}: {
  isDemoMode: boolean
  user: ChatUser | null
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex h-auto min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-ink-950/70 px-4 py-3 backdrop-blur-xl lg:px-8"
    >
      <div className="flex min-w-0 items-center gap-5">
        <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
          SmartIoT <span className="text-neon-cyan">Chat</span>
        </h1>
        <div className="hidden sm:block">
          <StatusPill isDemoMode={isDemoMode} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton aria-label="Search messages" className="hidden sm:inline-flex">
          <Search className="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Notifications" className="relative hidden sm:inline-flex">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neon-blue px-1 text-[11px] font-bold text-white">
            2
          </span>
        </IconButton>
        {user ? (
          <div className="ml-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1">
            <AvatarInitials name={user.displayName} role={user.role} size="sm" />
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </motion.header>
  )
}
