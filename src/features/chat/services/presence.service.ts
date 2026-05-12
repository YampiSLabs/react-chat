import { appMode } from '../../../lib/env'
import { firebaseApp } from '../../../lib/firebase'
import type { ChatUser } from '../types'

export async function markUserOffline(user: ChatUser | null): Promise<void> {
  if (!user || appMode !== 'firebase' || !firebaseApp) return

  const { getDatabase, ref, set } = await import('firebase/database')
  const db = getDatabase(firebaseApp)

  await set(ref(db, `presence/${user.uid}`), {
    uid: user.uid,
    displayName: user.displayName,
    role: 'guest',
    createdAt: user.createdAt,
    lastSeenAt: Date.now(),
    online: false,
  })
}
