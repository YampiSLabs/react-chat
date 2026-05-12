import { useState } from 'react'
import { Pin, X } from 'lucide-react'

export function PinnedNotice() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return null
  }

  return (
    <div className="mx-4 mt-2 flex items-start gap-2 rounded-lg border border-warning/15 bg-warning-subtle/20 px-3 py-2 md:mx-5">
      <Pin className="mt-0.5 size-3 shrink-0 text-warning/70" aria-hidden="true" />
      <p className="flex-1 text-xs leading-5 text-foreground/80">
        <span className="font-medium text-foreground">Pinned: </span>
        Provide device, model, error code, and what changed before the issue.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="mt-0.5 rounded p-0.5 text-muted-foreground/50 transition hover:text-foreground"
        aria-label="Hide pinned notice"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </div>
  )
}
