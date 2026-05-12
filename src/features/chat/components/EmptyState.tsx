import { MessageCirclePlus } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground">
          <MessageCirclePlus className="size-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No messages yet</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Start with a support note or status update.
        </p>
      </div>
    </div>
  )
}
