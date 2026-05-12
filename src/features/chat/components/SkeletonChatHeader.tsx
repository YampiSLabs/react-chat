import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonChatHeader() {
  return (
    <header
      className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:px-5"
      aria-busy="true"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="hidden size-10 shrink-0 rounded-2xl sm:flex" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Skeleton className="hidden size-8 rounded-xl sm:block" />
        <Skeleton className="hidden size-8 rounded-xl sm:block" />
        <Skeleton className="size-8 rounded-xl" />
        <Skeleton className="size-8 rounded-xl" />
      </div>
    </header>
  )
}
