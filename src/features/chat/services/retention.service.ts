import { get, ref, set } from 'firebase/database'
import { appMode } from '../../../lib/env'
import { firebaseAuth } from '../../../lib/firebase'
import { firebaseDatabase } from '../../../lib/firebase-database'
import {
  deleteAttachmentBlob,
  purgeOrphanAttachments,
} from '../../../lib/attachmentStorage'
import { DEMO_MESSAGES_KEY, DEMO_ROOMS_KEY, DEMO_EVENT } from '../../../lib/constants'
import type { Message, Room } from '../types'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
const TWO_HOURS = 2 * 60 * 60 * 1000
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
const SIX_HOURS = 6 * 60 * 60 * 1000

export const RETENTION_MS_MESSAGES = SEVEN_DAYS
export const RETENTION_MS_PRESENCE = TWO_HOURS
export const RETENTION_MS_ROOMS = THIRTY_DAYS
export const RETENTION_MS_ATTACHMENTS = SEVEN_DAYS
export const CLEANUP_INTERVAL_MS = SIX_HOURS
export const LAST_CLEANUP_KEY = 'smartiot-chat:last-cleanup'

const BASE_ROOM_IDS = new Set([
  'general',
  'support',
  'iot-alerts',
  'network-ops',
  'device-fleet',
])

function isFirebaseReady() {
  return appMode === 'firebase' && Boolean(firebaseDatabase)
}

function shouldRunCleanup(): boolean {
  try {
    const last = localStorage.getItem(LAST_CLEANUP_KEY)
    if (!last) return true
    return Date.now() - Number(last) >= CLEANUP_INTERVAL_MS
  } catch {
    return true
  }
}

function markCleanupRun() {
  try {
    localStorage.setItem(LAST_CLEANUP_KEY, String(Date.now()))
  } catch {
    /* localStorage full — skip */
  }
}

function emitDemoUpdate() {
  window.dispatchEvent(new Event(DEMO_EVENT))
}

function readDemoMessages(): Message[] {
  const stored = localStorage.getItem(DEMO_MESSAGES_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as Message[]
  } catch {
    return []
  }
}

function readDemoRooms(): Room[] {
  const stored = localStorage.getItem(DEMO_ROOMS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as Room[]
  } catch {
    return []
  }
}

export async function cleanupExpiredChatData(): Promise<void> {
  if (!shouldRunCleanup()) return

  try {
    if (!isFirebaseReady() || !firebaseDatabase) {
      await demoCleanup()
    } else {
      await firebaseCleanup()
    }
    markCleanupRun()
  } catch (err) {
    console.warn('[retention] Cleanup failed:', err)
  }
}

// ---- Firebase ----

async function firebaseCleanup() {
  const db = firebaseDatabase!
  const currentUid = firebaseAuth?.currentUser?.uid
  const now = Date.now()

  const roomsSnapshot = await get(ref(db, 'rooms'))
  const rooms: Room[] = []
  if (roomsSnapshot.exists()) {
    const val = roomsSnapshot.val()
    for (const id of Object.keys(val)) {
      rooms.push({ id, ...val[id] })
    }
  }

  const roomIds = rooms.map((r) => r.id)
  const allRemainingAttachmentIds: string[] = []
  let deletedMessages = 0

  for (const roomId of roomIds) {
    let msgSnapshot
    try {
      msgSnapshot = await get(ref(db, `messages/${roomId}`))
    } catch {
      continue
    }
    if (!msgSnapshot.exists()) continue

    const msgVal = msgSnapshot.val()
    const deletePromises: Promise<void>[] = []

    for (const msgId of Object.keys(msgVal)) {
      const msg = msgVal[msgId] as Message
      const msgAge = now - (msg.createdAt ?? 0)
      const attachments = msg.attachments ?? []

      if (msgAge >= RETENTION_MS_MESSAGES) {
        deletedMessages++
        for (const att of attachments) {
          deleteAttachmentBlob(att.id).catch(() => undefined)
        }
        deletePromises.push(
          set(ref(db, `messages/${roomId}/${msgId}`), null).catch(
            () => undefined,
          ),
        )
      } else {
        const keptAttachments = attachments.filter((att) => {
          const attAge = now - (att.createdAt ?? 0)
          if (attAge >= RETENTION_MS_ATTACHMENTS) {
            deleteAttachmentBlob(att.id).catch(() => undefined)
            return false
          }
          return true
        })

        if (keptAttachments.length !== attachments.length && msg.userId === currentUid) {
          if (keptAttachments.length === 0 && !msg.text.trim()) {
            deletePromises.push(
              set(ref(db, `messages/${roomId}/${msgId}`), null).catch(
                () => undefined,
              ),
            )
          } else {
            deletePromises.push(
              set(ref(db, `messages/${roomId}/${msgId}`), {
                ...msg,
                attachments:
                  keptAttachments.length > 0 ? keptAttachments : null,
                id: undefined,
              }),
            )
          }
        }

        for (const att of keptAttachments) {
          allRemainingAttachmentIds.push(att.id)
        }
      }
    }

    await Promise.all(deletePromises)
  }

  const presenceSnapshot = await get(ref(db, 'presence'))
  let deletedPresence = 0
  if (presenceSnapshot.exists()) {
    const presenceVal = presenceSnapshot.val()
    const presencePromises: Promise<void>[] = []

    for (const uid of Object.keys(presenceVal)) {
      const entry = presenceVal[uid]
      const lastSeenAt = entry.lastSeenAt ?? 0
      const isStale = now - lastSeenAt >= RETENTION_MS_PRESENCE

      if (isStale) {
        deletedPresence++
        presencePromises.push(
          set(ref(db, `presence/${uid}`), null).catch(() => undefined),
        )
      }
    }

    await Promise.all(presencePromises)
  }

  let deletedRooms = 0
  for (const room of rooms) {
    if (BASE_ROOM_IDS.has(room.id)) continue

    const roomAge = now - (room.createdAt ?? 0)
    if (roomAge < RETENTION_MS_ROOMS) continue

    let msgSnapshot
    try {
      msgSnapshot = await get(ref(db, `messages/${room.id}`))
    } catch {
      continue
    }

    let hasRecent = false
    if (msgSnapshot.exists()) {
      const msgs = msgSnapshot.val()
      for (const key of Object.keys(msgs)) {
        const t = msgs[key].createdAt ?? 0
        if (now - t < RETENTION_MS_MESSAGES) {
          hasRecent = true
          break
        }
      }
    }

    if (hasRecent) continue

    deletedRooms++
    if (msgSnapshot.exists()) {
      const msgs = msgSnapshot.val()
      for (const key of Object.keys(msgs)) {
        const atts: { id: string }[] = msgs[key].attachments ?? []
        for (const att of atts) {
          deleteAttachmentBlob(att.id).catch(() => undefined)
        }
      }
    }

    await set(ref(db, `rooms/${room.id}`), null).catch(() => undefined)
    await set(ref(db, `messages/${room.id}`), null).catch(() => undefined)
  }

  const logs: string[] = []
  if (deletedMessages > 0) logs.push(`removed ${deletedMessages} messages`)
  if (deletedPresence > 0) logs.push(`removed ${deletedPresence} presence entries`)
  if (deletedRooms > 0) logs.push(`removed ${deletedRooms} rooms`)
  if (logs.length > 0) {
    console.log(`[retention] Firebase cleanup: ${logs.join(', ')}.`)
  }

  const orphanCount = await purgeOrphanAttachments(
    new Set(allRemainingAttachmentIds),
  )
  if (orphanCount > 0) {
    console.log(`[retention] Firebase: purged ${orphanCount} orphaned attachment blobs`)
  }
}

// ---- Demo (localStorage) ----

async function demoCleanup() {
  const now = Date.now()

  const messages = readDemoMessages()
  const keptMessages: Message[] = []
  const validAttachmentIds: string[] = []

  for (const msg of messages) {
    const msgAge = now - msg.createdAt

    if (msgAge >= RETENTION_MS_MESSAGES) {
      if (msg.attachments) {
        for (const att of msg.attachments) {
          deleteAttachmentBlob(att.id).catch(() => undefined)
        }
      }
      continue
    }

    const keptAttachments = (msg.attachments ?? []).filter((att) => {
      const attAge = now - att.createdAt
      if (attAge >= RETENTION_MS_ATTACHMENTS) {
        deleteAttachmentBlob(att.id).catch(() => undefined)
        return false
      }
      return true
    })

    if (keptAttachments.length === 0 && !msg.text.trim()) continue

    keptMessages.push({
      ...msg,
      attachments:
        keptAttachments.length > 0 ? keptAttachments : undefined,
    })

    for (const att of keptAttachments) {
      validAttachmentIds.push(att.id)
    }
  }

  const deletedMessageCount = messages.length - keptMessages.length

  const rooms = readDemoRooms()
  const keptRooms = rooms.filter((room) => {
    if (BASE_ROOM_IDS.has(room.id)) return true

    const roomAge = now - room.createdAt
    if (roomAge < RETENTION_MS_ROOMS) return true

    const hasRecent = keptMessages.some(
      (msg) =>
        msg.roomId === room.id &&
        now - msg.createdAt < RETENTION_MS_MESSAGES,
    )
    return hasRecent
  })

  const deletedRooms = rooms.length - keptRooms.length

  const anythingChanged = deletedMessageCount > 0 || deletedRooms > 0
  if (!anythingChanged) {
    const orphanCount = await purgeOrphanAttachments(new Set(validAttachmentIds))
    if (orphanCount > 0) {
      console.log(`[retention] Demo: purged ${orphanCount} orphaned attachment blobs`)
    }
    return
  }

  let finalMessages = keptMessages
  if (deletedRooms > 0) {
    const deletedIds = new Set(
      rooms.filter((r) => !keptRooms.some((kr) => kr.id === r.id)).map((r) => r.id),
    )

    for (const rid of deletedIds) {
      const deadMsgs = messages.filter((m) => m.roomId === rid)
      for (const dm of deadMsgs) {
        if (dm.attachments) {
          for (const att of dm.attachments) {
            deleteAttachmentBlob(att.id).catch(() => undefined)
          }
        }
      }
    }

    finalMessages = keptMessages.filter((m) => !deletedIds.has(m.roomId))
  }

  const logs: string[] = []
  if (deletedMessageCount > 0) logs.push(`removed ${deletedMessageCount} messages`)
  if (deletedRooms > 0) logs.push(`removed ${deletedRooms} rooms`)
  console.log(`[retention] Demo cleanup: ${logs.join(', ')}.`)

  try { localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(finalMessages)) } catch { /* storage unavailable */ }
  try { localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(keptRooms)) } catch { /* storage unavailable */ }
  emitDemoUpdate()

  const orphanCount = await purgeOrphanAttachments(new Set(validAttachmentIds))
  if (orphanCount > 0) {
    console.log(`[retention] Demo: purged ${orphanCount} orphaned attachment blobs`)
  }
}
