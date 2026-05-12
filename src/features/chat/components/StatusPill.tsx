import { cn } from '@/lib/utils'

export function StatusPill({ isDemoMode }: { isDemoMode: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
      <span
        className={cn('h-2 w-2 rounded-full', isDemoMode ? 'bg-warning' : 'bg-success')}
      />
      {isDemoMode ? 'Demo' : 'Connected'}
    </div>
  )
}
