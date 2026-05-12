import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const roleStyles: Record<string, string> = {
  admin: 'border-primary/15 bg-primary/8 text-primary',
  bot: 'border-primary/15 bg-primary/8 text-primary',
  guest: 'border-border/40 bg-card text-muted-foreground',
  sensor: 'border-warning/15 bg-warning-subtle/30 text-warning',
  technician: 'border-success/15 bg-success-subtle/30 text-success',
}

const roleLabels: Record<string, string> = {
  admin: 'admin',
  bot: 'bot',
  guest: 'guest',
  sensor: 'sensor',
  technician: 'technician',
}

export function BadgeRole({ className, role }: { className?: string; role: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('h-4 rounded px-1.5 text-[10px] font-medium lowercase', roleStyles[role] ?? roleStyles.guest, className)}
    >
      {roleLabels[role] ?? role}
    </Badge>
  )
}
