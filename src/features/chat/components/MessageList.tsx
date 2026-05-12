import { useMemo, useRef, useEffect, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingMessages } from './LoadingMessages'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../types'

function normalize(text: string) {
  return text.toLowerCase().trim()
}

function matchesQuery(message: Message, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  if (normalize(message.text).includes(q)) return true
  if (normalize(message.userName).includes(q)) return true
  if (normalize(message.userRole).includes(q)) return true
  if (message.attachments?.some((a) => normalize(a.name).includes(q))) return true
  return false
}

export function MessageList({
  currentUserId,
  error,
  loading,
  messages,
  searchQuery = '',
}: {
  currentUserId?: string
  error?: string | null
  loading: boolean
  messages: Message[]
  searchQuery?: string
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const isNearBottomRef = useRef(true)

  const isNearBottom = useCallback(() => {
    const el = viewportRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }, [])

  const filtered = useMemo(
    () => (searchQuery ? messages.filter((m) => matchesQuery(m, searchQuery)) : messages),
    [messages, searchQuery],
  )

  useEffect(() => {
    if (!searchQuery && isNearBottomRef.current) {
      viewportRef.current?.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length, searchQuery])

  function handleScroll() {
    isNearBottomRef.current = isNearBottom()
  }

  return (
    <ScrollArea className="min-h-0 flex-1" aria-busy={loading ? true : undefined}>
      <div ref={viewportRef} className="h-full overflow-y-auto" aria-live="polite" onScroll={handleScroll}>
        {searchQuery ? (
          <div className="sticky top-0 z-10 border-b border-border/60 bg-surface/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm md:px-5">
            {filtered.length === 0
              ? 'No results found'
              : `Found ${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
          </div>
        ) : null}
        {error ? <ErrorState message={error} /> : null}
        {!error && loading ? <LoadingMessages /> : null}
        {!error && !loading && filtered.length === 0 && !searchQuery ? <EmptyState /> : null}
        {!error && !loading && filtered.length > 0 ? (
          <div className="mx-auto max-w-[680px] px-4 py-4 md:px-5">
            <ol className="space-y-3">
              {filtered.map((message) => (
                <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  )
}
