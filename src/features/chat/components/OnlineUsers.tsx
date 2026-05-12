import { useEffect, useState } from 'react'
import { AvatarInitials } from './AvatarInitials'
import { BadgeRole } from './BadgeRole'
import { SkeletonOnlineUsers } from './SkeletonOnlineUsers'
import type { PresenceUser } from '../types'

function formatSeen(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) {
    return 'now'
  }

  return `${minutes} min ago`
}

export function OnlineUsers({ compact = false, loading = false, users }: { compact?: boolean; loading?: boolean; users: PresenceUser[] }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(interval)
  }, [])
  if (loading) {
    return <SkeletonOnlineUsers compact={compact} />
  }

  if (users.length === 0) {
    return <p className="px-4 py-4 text-sm text-muted-foreground">No active users yet.</p>
  }

  return (
    <ul className={compact ? 'space-y-px' : 'space-y-1 px-3 py-3'}>
      {users.map((user) => (
        <li key={user.uid} className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-card-hover">
          <AvatarInitials name={user.displayName} role={user.role} size="sm" online={user.online} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground">Seen {formatSeen(user.lastSeenAt)}</p>
          </div>
          {!compact ? <BadgeRole role={user.role} /> : null}
        </li>
      ))}
    </ul>
  )
}
