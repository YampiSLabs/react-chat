import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AppShell } from '../../app/AppShell'
import { useSounds } from '@/lib/sounds'
import { useAuth } from '../auth/useAuth'
import { ChatHeader } from './components/ChatHeader'
import { DemoModeBanner } from './components/DemoModeBanner'
import { MessageInput } from './components/MessageInput'
import { MessageList } from './components/MessageList'
import { PinnedNotice } from './components/PinnedNotice'
import { RightPanel } from './components/RightPanel'
import { RoomList } from './components/RoomList'
import { useMessages } from './hooks/useMessages'
import { usePresence } from './hooks/usePresence'
import { useRooms } from './hooks/useRooms'
import {
  CLEANUP_INTERVAL_MS,
  cleanupExpiredChatData,
} from './services/retention.service'
import type { Room } from './types'

export const SCROLL_TO_USERS_EVENT = 'smartiot-chat:scroll-to-users'

export function ChatPage() {
  const { error: authError, isDemoMode, signOut, updateDisplayName, user } = useAuth()
  const { error: roomsError, loading: roomsLoading, rooms, createRoom, renameRoom, deleteRoom, duplicateRoom } = useRooms()
  const [selectedRoomId, setSelectedRoomId] = useState('support')
  const [profileName, setProfileName] = useState(user?.displayName ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const lastMessageAtByRoom = useRef<Record<string, number>>({})
  const { playSound } = useSounds()
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId],
  )
  const {
    error: messagesError,
    loading: messagesLoading,
    messages,
  } = useMessages(selectedRoom?.id ?? selectedRoomId)
  const { error: presenceError, loading: presenceLoading, users } = usePresence(user)
  const shellSubtitle = selectedRoom ? `# ${selectedRoom.name}` : 'Realtime support'

  useEffect(() => {
    if (rooms.length > 0 && !rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(rooms[0].id)
    }
  }, [rooms, selectedRoomId])

  useEffect(() => {
    setProfileName(user?.displayName ?? '')
  }, [user?.displayName])

  useEffect(() => {
    cleanupExpiredChatData()
    const interval = setInterval(cleanupExpiredChatData, CLEANUP_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const roomId = selectedRoom?.id ?? selectedRoomId

    if (messagesLoading || messages.length === 0) {
      return
    }

    const newestAt = Math.max(...messages.map((message) => message.createdAt))
    const previousAt = lastMessageAtByRoom.current[roomId]

    if (previousAt === undefined) {
      lastMessageAtByRoom.current[roomId] = newestAt
      return
    }

    if (newestAt <= previousAt) {
      lastMessageAtByRoom.current[roomId] = newestAt
      return
    }

    lastMessageAtByRoom.current[roomId] = newestAt

    const hasIncomingMessage = messages.some(
      (message) => message.createdAt > previousAt && message.userId !== user?.uid,
    )

    if (hasIncomingMessage) {
      playSound('message')
    }
  }, [messages, messagesLoading, playSound, selectedRoom?.id, selectedRoomId, user?.uid])

  const handleCreateRoom = useCallback(async (name: string, description: string) => {
    const room = await createRoom(name, description)
    return room
  }, [createRoom])

  const handleRenameRoom = useCallback(async (id: string, name: string) => {
    await renameRoom(id, name)
  }, [renameRoom])

  const handleDeleteRoom = useCallback(async (id: string) => {
    await deleteRoom(id)
  }, [deleteRoom])

  const handleDuplicateRoom = useCallback(async (room: Room) => {
    return await duplicateRoom(room)
  }, [duplicateRoom])

  const handleOnlineUsersClick = useCallback(() => {
    const isDesktop = window.matchMedia('(min-width: 1280px)').matches
    if (isDesktop) {
      window.dispatchEvent(new CustomEvent(SCROLL_TO_USERS_EVENT))
    } else {
      setRightPanelOpen(true)
    }
  }, [])

  const roomList = (
    <RoomList
      isDemoMode={isDemoMode}
      loading={roomsLoading}
      rooms={rooms}
      selectedRoomId={selectedRoom?.id ?? selectedRoomId}
      onSelectRoom={setSelectedRoomId}
      onCreateRoom={handleCreateRoom}
      onRenameRoom={handleRenameRoom}
      onDeleteRoom={handleDeleteRoom}
      onDuplicateRoom={handleDuplicateRoom}
    />
  )

  const rightPanel = (
    <RightPanel
      currentDisplayName={user?.displayName ?? ''}
      profileName={profileName}
      room={selectedRoom}
      setProfileName={setProfileName}
      updateDisplayName={updateDisplayName}
      users={users}
      usersLoading={presenceLoading}
      onSignOut={signOut}
    />
  )

  const statusError = [authError, roomsError, presenceError].filter(Boolean).join(' ')

  const chat = (
    <section className="flex min-h-0 min-w-0 flex-col bg-background">
      <ChatHeader
        onlineCount={users.length}
        room={selectedRoom}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOnlineUsersClick={handleOnlineUsersClick}
        onSignOut={signOut}
      />
      <div className="space-y-2">
        {isDemoMode ? (
          <div className="px-4 md:px-5">
            <DemoModeBanner />
          </div>
        ) : null}
        {statusError ? (
          <div className="px-4 md:px-5">
            <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive-subtle/30">
              <AlertCircle className="size-4" aria-hidden="true" />
              <AlertTitle>Connection notice</AlertTitle>
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          </div>
        ) : null}
      </div>
      <PinnedNotice />
      <MessageList
        loading={messagesLoading}
        messages={messages}
        error={messagesError}
        currentUserId={user?.uid}
        searchQuery={searchQuery}
      />
      <MessageInput roomId={selectedRoom?.id ?? selectedRoomId} user={user} />
    </section>
  )

  return (
    <AppShell
      chat={chat}
      rightPanel={rightPanel}
      roomSheet={roomList}
      subtitle={shellSubtitle}
      rightPanelOpen={rightPanelOpen}
      onRightPanelOpenChange={setRightPanelOpen}
    />
  )
}
