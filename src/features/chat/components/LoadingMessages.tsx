import { Skeleton } from '@/components/ui/skeleton'

export function LoadingMessages() {
  return (
    <div className="mx-auto max-w-[680px] space-y-4 px-4 py-5 md:px-5" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-14 max-w-[28rem] rounded-[18px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
