export type UserRole = 'guest' | 'technician' | 'admin' | 'bot' | 'sensor'

export type ChatUser = {
  uid: string
  displayName: string
  role: UserRole
  createdAt: number
  lastSeenAt: number
}

export type Room = {
  id: string
  name: string
  description: string
  icon: string
  createdAt: number
}

export type AttachmentRef = {
  id: string
  name: string
  mimeType: string
  size: number
  storage: 'indexeddb'
  localOnly: true
  createdAt: number
}

export type Message = {
  id: string
  roomId: string
  userId: string
  userName: string
  userRole: ChatUser['role']
  text: string
  createdAt: number
  attachments?: AttachmentRef[]
}

export type PresenceUser = ChatUser & {
  online: boolean
}

export type RoomOperation = 'create' | 'rename' | 'delete'
