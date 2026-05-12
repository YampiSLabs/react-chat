import type { AttachmentRef } from '@/features/chat/types'
import {
  MAX_ATTACHMENT_SIZE,
  sanitizeAttachmentName,
} from './security'
import { generateId } from './utils'

const DB_NAME = 'smartiot-chat-attachments'
const DB_VERSION = 1
const STORE_NAME = 'attachments'

const EXT_MIME_MAP: Record<string, string[]> = {
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  webp: ['image/webp'],
  gif: ['image/gif'],
  pdf: ['application/pdf'],
  txt: ['text/plain'],
  csv: ['text/csv'],
  json: ['application/json'],
}

export const ALLOWED_EXTENSIONS = Object.keys(EXT_MIME_MAP)

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveAttachment(file: File): Promise<AttachmentRef> {
  const validationError = validateAttachment(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const safeName = sanitizeAttachmentName(file.name)

  const id = generateId('att')

  const ref: AttachmentRef = {
    id,
    name: safeName,
    mimeType: file.type,
    size: file.size,
    storage: 'indexeddb',
    localOnly: true,
    createdAt: Date.now(),
  }

  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  return ref
}

export async function getAttachmentBlob(
  id: string,
): Promise<Blob | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onsuccess = () => resolve(request.result ?? undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteAttachmentBlob(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllAttachmentKeys(): Promise<string[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAllKeys()
    request.onsuccess = () => resolve(request.result as string[])
    request.onerror = () => reject(request.error)
  })
}

export async function purgeOrphanAttachments(
  validIds: Set<string>,
): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAllKeys()
    let count = 0
    request.onsuccess = () => {
      const keys = request.result as string[]
      for (const key of keys) {
        if (!validIds.has(key as string)) {
          store.delete(key)
          count++
        }
      }
    }
    tx.oncomplete = () => resolve(count)
    tx.onerror = () => reject(tx.error)
  })
}

export function validateAttachment(file: File): string | null {
  const safeName = sanitizeAttachmentName(file.name)

  if (file.size <= 0) {
    return `"${safeName}" is empty.`
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return `"${safeName}" exceeds the 5 MB limit.`
  }
  const ext = safeName.split('.').pop()?.toLowerCase() ?? ''
  const allowedMimes = EXT_MIME_MAP[ext]
  if (!allowedMimes) return `"${safeName}" type is not supported.`
  if (!allowedMimes.includes(file.type))
    return `"${safeName}" has an unexpected MIME type.`
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
