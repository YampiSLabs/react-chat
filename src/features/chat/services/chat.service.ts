import {
  get,
  limitToLast,
  off,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  set,
} from 'firebase/database'
import { appMode } from '../../../lib/env'
import { firebaseDatabase } from '../../../lib/firebase-database'
import { deleteAttachmentBlob } from '../../../lib/attachmentStorage'
import {
  MAX_ROOM_DESCRIPTION_LENGTH,
  MAX_ROOM_NAME_LENGTH,
  sanitizeMessageText,
  sanitizePlainTextMetadata,
  validateAttachmentRefs,
} from '../../../lib/security'
import { DEMO_EVENT, DEMO_MESSAGES_KEY, DEMO_ROOMS_KEY } from '../../../lib/constants'
import { generateId } from '../../../lib/utils'
import { mockMessages } from '../../../mocks/mockMessages'
import { mockRooms } from '../../../mocks/mockRooms'
import type { AttachmentRef, ChatUser, Message, PresenceUser, Room } from '../types'
const PRESENCE_HEARTBEAT_MS = 30_000
const PRESENCE_STALE_MS = 2 * 60_000

function getDemoPresence(now: number): PresenceUser[] {
  return [
    { uid: 'demo-tech', displayName: 'Nora Technician', role: 'technician', createdAt: now - 1000 * 60 * 200, lastSeenAt: now - 1000 * 60 * 3, online: true },
    { uid: 'demo-tech-james', displayName: 'James Miller', role: 'technician', createdAt: now - 1000 * 60 * 300, lastSeenAt: now - 1000 * 60 * 5, online: true },
    { uid: 'demo-admin-db', displayName: 'David Brown', role: 'admin', createdAt: now - 1000 * 60 * 400, lastSeenAt: now - 1000 * 60 * 7, online: true },
    { uid: 'demo-bot', displayName: 'Device Bot', role: 'bot', createdAt: now - 1000 * 60 * 500, lastSeenAt: now - 1000 * 60, online: true },
    { uid: 'sensor-temp-22', displayName: 'Temp-Sensor-22', role: 'sensor', createdAt: now - 1000 * 60 * 600, lastSeenAt: now - 1000 * 30, online: true },
    { uid: 'sensor-gateway-04', displayName: 'Gateway-04', role: 'sensor', createdAt: now - 1000 * 60 * 700, lastSeenAt: now - 1000 * 60 * 15, online: false },
    { uid: 'sensor-hum-09', displayName: 'Humid-Sensor-09', role: 'sensor', createdAt: now - 1000 * 60 * 550, lastSeenAt: now - 1000 * 60 * 5, online: true },
    { uid: 'demo-guest', displayName: 'Pat Green', role: 'guest', createdAt: now - 1000 * 60 * 180, lastSeenAt: now - 1000 * 60 * 25, online: false },
  ]
}

function isFirebaseReady() {
  return appMode === 'firebase' && Boolean(firebaseDatabase)
}

function emitDemoUpdate() {
  window.dispatchEvent(new Event(DEMO_EVENT))
}

function readDemoRooms(): Room[] {
  const stored = localStorage.getItem(DEMO_ROOMS_KEY)
  if (!stored) {
    try { localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(mockRooms)) } catch { /* storage unavailable */ }
    return [...mockRooms]
  }
  try {
    return JSON.parse(stored) as Room[]
  } catch {
    try { localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(mockRooms)) } catch { /* storage unavailable */ }
    return [...mockRooms]
  }
}

function writeDemoRooms(rooms: Room[]) {
  try {
    localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(rooms))
  } catch {
    console.warn('[chat] Failed to save rooms to localStorage.')
    return
  }
  emitDemoUpdate()
}

function readDemoMessages() {
  const stored = localStorage.getItem(DEMO_MESSAGES_KEY)

  if (!stored) {
    try { localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(mockMessages)) } catch { /* storage unavailable */ }
    return mockMessages
  }

  try {
    return JSON.parse(stored) as Message[]
  } catch {
    try { localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(mockMessages)) } catch { /* storage unavailable */ }
    return mockMessages
  }
}

function writeDemoMessages(messages: Message[]) {
  try {
    localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(messages))
  } catch {
    console.warn('[chat] Failed to save messages to localStorage.')
    return
  }
  emitDemoUpdate()
}

function mapRecord<T extends { id: string }>(value: unknown) {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, Omit<T, 'id'> & { id?: string }>).map(
    ([id, item]) => ({
      ...item,
      id: item.id ?? id,
    }),
  ) as T[]
}

function mapPresence(value: unknown) {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value as Record<string, PresenceUser>).map(([uid, item]) => ({
    ...item,
    uid: item.uid ?? uid,
  }))
}

export function subscribeRooms(
  onNext: (rooms: Room[]) => void,
  onError: (message: string) => void,
) {
  if (!isFirebaseReady() || !firebaseDatabase) {
    const sendCurrent = () => {
      onNext(readDemoRooms())
    }
    sendCurrent()
    window.addEventListener(DEMO_EVENT, sendCurrent)
    window.addEventListener('storage', sendCurrent)
    return () => {
      window.removeEventListener(DEMO_EVENT, sendCurrent)
      window.removeEventListener('storage', sendCurrent)
    }
  }

  const roomsRef = ref(firebaseDatabase, 'rooms')

  const unsubscribe = onValue(
    roomsRef,
    (snapshot) => {
      const rooms = mapRecord<Room>(snapshot.val())
      onNext(rooms)
    },
    (err) => {
      console.warn('[chat] Rooms subscription error:', err)
      onError('Could not load rooms.')
    },
  )

  return () => {
    unsubscribe()
    off(roomsRef)
  }
}

export function subscribeMessages(
  roomId: string,
  onNext: (messages: Message[]) => void,
  onError: (message: string) => void,
) {
  if (!isFirebaseReady() || !firebaseDatabase) {
    const sendCurrent = () => {
      const messages = readDemoMessages()
        .filter((message) => message.roomId === roomId)
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-50)
      onNext(messages)
    }

    sendCurrent()
    window.addEventListener(DEMO_EVENT, sendCurrent)
    window.addEventListener('storage', sendCurrent)

    return () => {
      window.removeEventListener(DEMO_EVENT, sendCurrent)
      window.removeEventListener('storage', sendCurrent)
    }
  }

  const messagesQuery = query(
    ref(firebaseDatabase, `messages/${roomId}`),
    orderByChild('createdAt'),
    limitToLast(50),
  )

  const unsubscribe = onValue(
    messagesQuery,
    (snapshot) => {
      const messages = mapRecord<Message>(snapshot.val()).sort(
        (a, b) => a.createdAt - b.createdAt,
      )
      onNext(messages)
    },
    (err) => {
      console.warn('[chat] Messages subscription error:', err)
      onError('Could not load messages for this room.')
    },
  )

  return unsubscribe
}

export async function sendMessage(
  roomId: string,
  user: ChatUser,
  text: string,
  attachments?: AttachmentRef[],
) {
  const cleanText = sanitizeMessageText(text)
  const cleanAttachments = validateAttachmentRefs(attachments)
  const hasAttachments = cleanAttachments && cleanAttachments.length > 0

  if (!cleanText && !hasAttachments) {
    throw new Error('Message cannot be empty.')
  }

  const message: Omit<Message, 'id'> = {
    roomId,
    userId: user.uid,
    userName: sanitizePlainTextMetadata(user.displayName, 32, 'Guest'),
    userRole: user.role,
    text: cleanText,
    createdAt: Date.now(),
    ...(hasAttachments ? { attachments: cleanAttachments } : {}),
  }

  if (!isFirebaseReady() || !firebaseDatabase) {
    const nextMessage = {
      ...message,
      id: generateId('demo'),
    }
    writeDemoMessages([...readDemoMessages(), nextMessage])
    return
  }

  const messageRef = push(ref(firebaseDatabase, `messages/${roomId}`))
  await set(messageRef, { ...message, userRole: 'guest' })
}

export async function deleteMessageAttachment(
  roomId: string,
  messageId: string,
  attachmentId: string,
) {
  let message: Message | undefined

  if (!isFirebaseReady() || !firebaseDatabase) {
    const messages = readDemoMessages()
    message = messages.find(
      (m) => m.id === messageId && m.roomId === roomId,
    )
    if (!message) return

    const updatedAttachments =
      message.attachments?.filter((a) => a.id !== attachmentId) ?? []

    const updated: Message = {
      ...message,
      attachments:
        updatedAttachments.length > 0 ? updatedAttachments : undefined,
      text:
        !message.text && updatedAttachments.length === 0
          ? 'Attachment removed'
          : message.text,
    }

    const index = messages.findIndex(
      (m) => m.id === messageId && m.roomId === roomId,
    )
    if (index !== -1) {
      messages[index] = updated
      writeDemoMessages(messages)
    }

    await deleteAttachmentBlob(attachmentId)
    return
  }

  const msgRef = ref(firebaseDatabase, `messages/${roomId}/${messageId}`)
  const snapshot = await get(msgRef)
  if (!snapshot.exists()) return

  const data = snapshot.val() as Message

  const updatedAttachments =
    data.attachments?.filter((a) => a.id !== attachmentId) ?? []

  const hasText = data.text && data.text.trim().length > 0
  const updateData: Record<string, unknown> = {
    attachments:
      updatedAttachments.length > 0 ? updatedAttachments : null,
    text:
      !hasText && updatedAttachments.length === 0
        ? 'Attachment removed'
        : data.text,
  }

  await set(msgRef, { ...data, ...updateData, id: undefined })
  await deleteAttachmentBlob(attachmentId)
}

export async function deleteMessage(
  roomId: string,
  messageId: string,
  attachments?: AttachmentRef[],
) {
  if (attachments) {
    await Promise.all(
      attachments.map((a) => deleteAttachmentBlob(a.id)),
    )
  }

  if (!isFirebaseReady() || !firebaseDatabase) {
    const messages = readDemoMessages()
    const filtered = messages.filter(
      (m) => !(m.id === messageId && m.roomId === roomId),
    )
    writeDemoMessages(filtered)
    return
  }

  await set(ref(firebaseDatabase, `messages/${roomId}/${messageId}`), null)
}

export async function createRoom(name: string, description: string): Promise<Room> {
  const cleanName = sanitizePlainTextMetadata(name, MAX_ROOM_NAME_LENGTH, '')
  const cleanDesc = sanitizePlainTextMetadata(description, MAX_ROOM_DESCRIPTION_LENGTH, '')

  if (!cleanName) throw new Error('Room name is required.')
  if (cleanName.length > MAX_ROOM_NAME_LENGTH) throw new Error(`Room name must be ${MAX_ROOM_NAME_LENGTH} characters or less.`)
  if (cleanDesc.length > MAX_ROOM_DESCRIPTION_LENGTH) throw new Error(`Description must be ${MAX_ROOM_DESCRIPTION_LENGTH} characters or less.`)

  const id = cleanName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || cleanName.toLowerCase().replace(/\s+/g, '-')

  const room: Room = {
    id,
    name: cleanName,
    description: cleanDesc,
    icon: cleanName[0].toUpperCase(),
    createdAt: Date.now(),
  }

  if (!isFirebaseReady() || !firebaseDatabase) {
    const rooms = readDemoRooms()
    if (rooms.some((r) => r.id === id)) {
      throw new Error(`Room "${cleanName}" already exists.`)
    }
    writeDemoRooms([...rooms, room])
    return room
  }

  const roomRef = ref(firebaseDatabase, `rooms/${id}`)
  await set(roomRef, { ...room, id: undefined })
  return room
}

export async function renameRoom(id: string, name: string): Promise<void> {
  const cleanName = sanitizePlainTextMetadata(name, MAX_ROOM_NAME_LENGTH, '')
  if (!cleanName) throw new Error('Room name is required.')
  if (cleanName.length > MAX_ROOM_NAME_LENGTH) throw new Error(`Room name must be ${MAX_ROOM_NAME_LENGTH} characters or less.`)

  if (!isFirebaseReady() || !firebaseDatabase) {
    const rooms = readDemoRooms()
    const index = rooms.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Room not found.')
    rooms[index] = { ...rooms[index], name: cleanName }
    writeDemoRooms(rooms)
    return
  }

  await set(ref(firebaseDatabase, `rooms/${id}/name`), cleanName)
}

export async function duplicateRoom(room: Room): Promise<Room> {
  return createRoom(`${room.name} (copy)`, room.description)
}

export async function deleteRoom(id: string): Promise<void> {
  if (!isFirebaseReady() || !firebaseDatabase) {
    const rooms = readDemoRooms()
    const filtered = rooms.filter((r) => r.id !== id)
    if (filtered.length === rooms.length) throw new Error('Room not found.')
    writeDemoRooms(filtered)

    const messages = readDemoMessages().filter((m) => m.roomId !== id)
    writeDemoMessages(messages)
    return
  }

  await set(ref(firebaseDatabase, `rooms/${id}`), null)
  await set(ref(firebaseDatabase, `messages/${id}`), null)
}

export function subscribePresence(
  user: ChatUser | null,
  onNext: (users: PresenceUser[]) => void,
  onError: (message: string) => void,
) {
  if (!isFirebaseReady() || !firebaseDatabase) {
    const localUser = user
      ? [
          {
            ...user,
            lastSeenAt: Date.now(),
            online: true,
          },
        ]
      : []
    onNext([...localUser, ...getDemoPresence(Date.now())])
    return () => undefined
  }

  if (!user) {
    onNext([])
    return () => undefined
  }

  const activeUser = user
  const presenceRef = ref(firebaseDatabase, `presence/${activeUser.uid}`)
  const allPresenceRef = ref(firebaseDatabase, 'presence')

  function presencePayload(online: boolean): PresenceUser {
    return {
      uid: activeUser.uid,
      displayName: activeUser.displayName,
      role: 'guest',
      createdAt: activeUser.createdAt,
      lastSeenAt: Date.now(),
      online,
    }
  }

  const connectedRef = ref(firebaseDatabase, '.info/connected')
  const setOnline = () => set(presenceRef, presencePayload(true))
  const setOffline = () => set(presenceRef, presencePayload(false))
  const disconnect = onDisconnect(presenceRef)

  const unsubscribeConnection = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) {
      return
    }

    disconnect
      .set(presencePayload(false))
      .then(setOnline)
      .catch((err) => {
        console.warn('[presence] Disconnect setup failed:', err)
        onError('Could not update presence for this session.')
      })
  })

  const heartbeat = window.setInterval(() => {
    setOnline().catch(() => console.warn('[presence] Heartbeat write failed'))
  }, PRESENCE_HEARTBEAT_MS)

  const markOfflineOnPageHide = () => {
    setOffline().catch(() => console.warn('[presence] Pagehide offline sync failed'))
  }

  window.addEventListener('pagehide', markOfflineOnPageHide)
  window.addEventListener('beforeunload', markOfflineOnPageHide)

  const unsubscribe = onValue(
    allPresenceRef,
    (snapshot) => {
      const now = Date.now()
      const users = mapPresence(snapshot.val())
        .filter((presenceUser) => presenceUser.online)
        .filter((presenceUser) => now - presenceUser.lastSeenAt < PRESENCE_STALE_MS)
        .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
      onNext(users)
    },
    (err) => {
      console.warn('[chat] Presence subscription error:', err)
      onError('Could not load online users.')
    },
  )

  return () => {
    window.clearInterval(heartbeat)
    window.removeEventListener('pagehide', markOfflineOnPageHide)
    window.removeEventListener('beforeunload', markOfflineOnPageHide)
    disconnect.cancel().catch(() => undefined)
    setOffline().catch(() => undefined)
    unsubscribeConnection()
    unsubscribe()
  }
}


