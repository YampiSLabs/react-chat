import { useEffect, useState } from 'react'
import { subscribeMessages } from '../services/chat.service'
import type { Message } from '../types'

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const cleanup = subscribeMessages(
      roomId,
      (nextMessages) => {
        if (cancelled) return
        setMessages(nextMessages)
        setLoading(false)
      },
      (message) => {
        if (cancelled) return
        setError(message)
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [roomId])

  return { messages, loading, error }
}
