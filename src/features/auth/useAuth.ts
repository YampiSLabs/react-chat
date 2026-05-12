import { createContext, useContext } from 'react'
import type { ChatUser } from '../chat/types'

export type AuthMode = 'demo' | 'firebase'

export type AuthContextValue = {
  user: ChatUser | null
  loading: boolean
  error: string | null
  mode: AuthMode
  isDemoMode: boolean
  signInWithGoogle: () => Promise<void>
  signInAsDemo: () => Promise<void>
  signOut: () => Promise<void>
  updateDisplayName: (displayName: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}
