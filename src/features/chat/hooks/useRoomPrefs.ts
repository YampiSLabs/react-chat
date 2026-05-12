import { useCallback, useState } from 'react'
import { useSounds } from '@/lib/sounds'

const ROOM_ACTIONS_KEY = 'smartiot-chat:room-actions:v1'

export type RoomPrefs = {
  muted: boolean
  notifications: boolean
  pinned: boolean
}

const DEFAULTS: RoomPrefs = { muted: false, notifications: true, pinned: false }

export function readAll(): Record<string, RoomPrefs> {
  try {
    return JSON.parse(localStorage.getItem(ROOM_ACTIONS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function writeAll(prefs: Record<string, RoomPrefs>) {
  try {
    localStorage.setItem(ROOM_ACTIONS_KEY, JSON.stringify(prefs))
  } catch {
    // localStorage may be unavailable
  }
}

export function readRoomPrefs(roomId: string): RoomPrefs {
  const all = readAll()
  return { ...DEFAULTS, ...all[roomId] }
}

export function updateRoomPrefs(roomId: string, next: RoomPrefs) {
  const all = readAll()
  all[roomId] = next
  writeAll(all)
}

export function useRoomPrefs(roomId?: string) {
  const { playSound } = useSounds()
  const [version, setVersion] = useState(0)

  const currentPrefs: RoomPrefs = roomId ? readRoomPrefs(roomId) : DEFAULTS

  const setPrefs = useCallback(
    (next: RoomPrefs, active: boolean) => {
      if (!roomId) return
      updateRoomPrefs(roomId, next)
      setVersion((v) => v + 1)
      playSound(active ? 'activate' : 'deactivate')
    },
    [roomId, playSound],
  )

  const toggleMuted = useCallback(() => {
    if (!roomId) return
    const next = { ...currentPrefs, muted: !currentPrefs.muted }
    setPrefs(next, !next.muted)
  }, [roomId, currentPrefs, setPrefs])

  const toggleNotifications = useCallback(() => {
    if (!roomId) return
    const next = { ...currentPrefs, notifications: !currentPrefs.notifications }
    setPrefs(next, next.notifications)
  }, [roomId, currentPrefs, setPrefs])

  const togglePinned = useCallback(() => {
    if (!roomId) return
    const next = { ...currentPrefs, pinned: !currentPrefs.pinned }
    setPrefs(next, next.pinned)
  }, [roomId, currentPrefs, setPrefs])

  return {
    currentPrefs,
    toggleMuted: roomId ? toggleMuted : undefined,
    toggleNotifications: roomId ? toggleNotifications : undefined,
    togglePinned: roomId ? togglePinned : undefined,
    version,
  }
}
