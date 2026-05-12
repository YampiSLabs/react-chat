import { useCallback, useEffect, useState } from 'react'
import type { Room } from '../types'
import {
  createRoom as createRoomService,
  deleteRoom as deleteRoomService,
  duplicateRoom as duplicateRoomService,
  renameRoom as renameRoomService,
  subscribeRooms,
} from '../services/chat.service'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    return subscribeRooms(
      (nextRooms) => {
        setRooms(nextRooms)
        setLoading(false)
      },
      (message) => {
        setError(message)
        setLoading(false)
      },
    )
  }, [])

  const createRoom = useCallback(async (name: string, description: string): Promise<Room> => {
    const room = await createRoomService(name, description)
    return room
  }, [])

  const renameRoom = useCallback(async (id: string, name: string): Promise<void> => {
    await renameRoomService(id, name)
  }, [])

  const deleteRoom = useCallback(async (id: string): Promise<void> => {
    await deleteRoomService(id)
  }, [])

  const duplicateRoom = useCallback(async (room: Room): Promise<Room> => {
    return await duplicateRoomService(room)
  }, [])

  return { rooms, loading, error, createRoom, renameRoom, deleteRoom, duplicateRoom }
}
