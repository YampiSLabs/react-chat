import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonOnlineUsers({ compact = false }: { compact?: boolean }) {
  const count = compact ? 3 : 4

  return (
    <ul
      className={compact ? 'space-y-0.5 p-1' : 'space-y-1 px-3 py-3'}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2">
          <Skeleton className="size-8 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          {!compact ? <Skeleton className="h-5 w-16 rounded-md" /> : null}
        </li>
      ))}
    </ul>
  )
}
