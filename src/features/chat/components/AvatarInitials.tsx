import { Activity, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const roleClasses: Record<string, string> = {
  guest: 'border-border/50 bg-card text-muted-foreground',
  technician: 'border-success/25 bg-success-subtle/40 text-success',
  admin: 'border-primary/20 bg-primary/10 text-primary',
  bot: 'border-primary/20 bg-primary/10 text-primary',
  sensor: 'border-warning/25 bg-warning-subtle/40 text-warning',
}

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return parts || 'U'
}

function RoleIcon({ role }: { role: string }) {
  if (role === 'bot') {
    return <Bot className="size-3.5" aria-hidden="true" />
  }

  if (role === 'sensor') {
    return <Activity className="size-3.5" aria-hidden="true" />
  }

  return null
}

export function AvatarInitials({
  name,
  online = true,
  role,
  size = 'md',
}: {
  name: string
  online?: boolean
  role: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'size-8 text-[11px]' : 'size-9 text-xs'
  const icon = role === 'bot' || role === 'sensor'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full border font-semibold',
        sizeClass,
        roleClasses[role] ?? roleClasses.guest,
      )}
      aria-label={`${name} avatar`}
    >
      {icon ? <RoleIcon role={role} /> : initials(name)}
      {online ? (
        <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background bg-success">
          <span className="sr-only">Online</span>
        </span>
      ) : null}
    </span>
  )
}
