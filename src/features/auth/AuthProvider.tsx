import {
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { appMode } from '../../lib/env'
import { firebaseAuth } from '../../lib/firebase'
import { markUserOffline } from '../chat/services/presence.service'
import { generateId } from '../../lib/utils'
import type { ChatUser } from '../chat/types'
import { MAX_DISPLAY_NAME_LENGTH, sanitizePlainTextMetadata } from '../../lib/security'
import type { AuthMode } from './useAuth'
import { AuthContext } from './useAuth'

const USER_KEY = 'smartiot-chat:user'
const NAME_PREFIXES = ['Circuit', 'Beacon', 'Relay', 'Node', 'Vector', 'Signal']

function makeDisplayName(uid: string) {
  const suffix = uid.slice(-4).toUpperCase()
  const prefix = NAME_PREFIXES[Math.abs(uid.length + suffix.length) % NAME_PREFIXES.length]
  return `${prefix} ${suffix}`
}

function makeDemoUser(): ChatUser {
  const now = Date.now()
  const uid = generateId('demo')

  return {
    uid,
    displayName: makeDisplayName(uid),
    role: 'guest',
    createdAt: now,
    lastSeenAt: now,
  }
}

function loadDemoUser() {
  const stored = localStorage.getItem(USER_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as ChatUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function firebaseUserToChatUser(user: User, existingName?: string): ChatUser {
  const now = Date.now()
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).getTime()
    : now

  return {
    uid: user.uid,
    displayName: sanitizePlainTextMetadata(existingName ?? user.displayName ?? '', MAX_DISPLAY_NAME_LENGTH, makeDisplayName(user.uid)),
    role: 'guest',
    createdAt,
    lastSeenAt: now,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const persistUser = useCallback((nextUser: ChatUser | null) => {
    setUser(nextUser)

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [])

  useEffect(() => {
    if (appMode === 'demo') {
      const existing = loadDemoUser()
      if (existing) {
        persistUser({ ...existing, lastSeenAt: Date.now() })
      }
      setLoading(false)
      return
    }

    if (!firebaseAuth) {
      setError('Firebase Auth is not available.')
      setLoading(false)
      return
    }

    setPersistence(firebaseAuth, browserSessionPersistence).catch((err) => console.warn('[auth] Session persistence failed:', err))

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (firebaseUser) => {
        const stored = loadDemoUser()
        setUser(firebaseUser ? firebaseUserToChatUser(firebaseUser, stored?.displayName) : null)
        setLoading(false)
      },
      (err) => {
        console.warn('[auth] onAuthStateChanged error:', err)
        setError('Could not read authentication state.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [persistUser])

  const signInWithGoogle = useCallback(async () => {
    setError(null)

    if (!firebaseAuth) {
      setError('Firebase is not configured. Google sign-in is unavailable.')
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(firebaseAuth, provider)
      const stored = loadDemoUser()
      persistUser(firebaseUserToChatUser(result.user, stored?.displayName))
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'auth/popup-closed-by-user') return
      console.warn('[auth] Google sign-in failed:', err)
      setError('Google sign-in failed. Try demo mode instead.')
    }
  }, [persistUser])

  const signInAsDemo = useCallback(async () => {
    setError(null)

    if (appMode === 'demo') {
      persistUser(loadDemoUser() ?? makeDemoUser())
      return
    }

    if (!firebaseAuth) {
      setError('Firebase Auth is not configured.')
      return
    }

    try {
      await setPersistence(firebaseAuth, browserSessionPersistence)
      const result = await signInAnonymously(firebaseAuth)
      const stored = loadDemoUser()
      persistUser(firebaseUserToChatUser(result.user, stored?.displayName))
    } catch (err) {
      console.warn('[auth] Anonymous sign-in failed:', err)
      setError('Anonymous sign-in failed. Check that it is enabled in Firebase Auth.')
    }
  }, [persistUser])

  const signOut = useCallback(async () => {
    setError(null)

    if (appMode === 'demo') {
      localStorage.removeItem(USER_KEY)
      setUser(null)
      return
    }

    if (firebaseAuth) {
      try {
        await markUserOffline(user).catch(() => undefined)
        await firebaseSignOut(firebaseAuth)
      } catch (err) {
        console.warn('[auth] Sign out failed:', err)
        setError('Could not sign out. Try again.')
        return
      }
    }

    setUser(null)
  }, [user])

  const updateDisplayName = useCallback((displayName: string) => {
    const cleanName = sanitizePlainTextMetadata(displayName, MAX_DISPLAY_NAME_LENGTH, '')

    if (!cleanName || !user) {
      return false
    }

    const nextUser = { ...user, displayName: cleanName, lastSeenAt: Date.now() }
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return true
  }, [user])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      mode: appMode as AuthMode,
      isDemoMode: appMode === 'demo',
      signInWithGoogle,
      signInAsDemo,
      signOut,
      updateDisplayName,
    }),
    [error, loading, signInAsDemo, signInWithGoogle, signOut, updateDisplayName, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
