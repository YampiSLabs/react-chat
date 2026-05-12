import { useEffect, useState } from 'react'
import { subscribePresence } from '../services/chat.service'
import type { ChatUser, PresenceUser } from '../types'

export function usePresence(user: ChatUser | null) {
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const cleanup = subscribePresence(
      user,
      (nextUsers) => {
        if (cancelled) return
        setUsers(nextUsers)
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
  }, [user])

  return { users, loading, error }
}
