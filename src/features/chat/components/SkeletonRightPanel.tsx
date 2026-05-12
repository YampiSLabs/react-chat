import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SkeletonOnlineUsers } from './SkeletonOnlineUsers'

export function SkeletonRightPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden" aria-busy="true">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section>
          <Skeleton className="h-3 w-12" />
          <div className="mt-2 rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-start gap-3">
              <Skeleton className="size-9 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5">
          <Skeleton className="h-3 w-14" />
          <div className="mt-2 rounded-xl border border-border/60 bg-card p-3">
            <Skeleton className="h-4 w-28" />
          </div>
        </section>

        <section className="mt-5">
          <Skeleton className="h-3 w-16" />
          <div className="mt-2 space-y-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </section>

        <section className="mt-5">
          <Skeleton className="h-3 w-14" />
          <div className="mt-2 rounded-xl border border-border/60 bg-card p-1">
            <SkeletonOnlineUsers compact />
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-border/60 bg-surface px-4 py-3">
        <Skeleton className="h-3 w-14" />
        <div className="mt-1.5 flex gap-1.5">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
