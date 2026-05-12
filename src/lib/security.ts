import type { AttachmentRef } from '@/features/chat/types'

export const MAX_MESSAGE_LENGTH = 500
export const MAX_ATTACHMENTS = 5
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
export const MAX_ATTACHMENT_NAME_LENGTH = 160
export const MAX_DISPLAY_NAME_LENGTH = 32
export const MAX_ROOM_NAME_LENGTH = 32
export const MAX_ROOM_DESCRIPTION_LENGTH = 200

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
])

const FILENAME_RESERVED_CHARS = /[<>:"/\\|?*]+/g
const PATH_SEGMENTS = /[/\\]+/

function assertFiniteTimestamp(value: number) {
  return Number.isFinite(value) && value > 0
}

function hasUnsupportedMessageControl(value: string): boolean {
  return [...value].some((char) => {
    const code = char.charCodeAt(0)
    return code === 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13)
  })
}

export function stripControlCharacters(value: string): string {
  return [...value]
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
}

export function sanitizeMessageText(text: string): string {
  const cleanText = text.trim()

  if (hasUnsupportedMessageControl(cleanText)) {
    throw new Error('Message contains unsupported control characters.')
  }

  if (cleanText.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`)
  }

  return cleanText
}

export function sanitizePlainTextMetadata(
  value: string,
  maxLength: number,
  fallback: string,
): string {
  const cleanValue = stripControlCharacters(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)

  return cleanValue || fallback
}

export function sanitizeAttachmentName(name: string): string {
  const lastSegment = name.split(PATH_SEGMENTS).pop() ?? ''
  const cleanName = stripControlCharacters(lastSegment)
    .replace(FILENAME_RESERVED_CHARS, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, MAX_ATTACHMENT_NAME_LENGTH)

  return cleanName || 'attachment'
}

export function validateAttachmentRefs(
  attachments?: AttachmentRef[],
): AttachmentRef[] | undefined {
  if (!attachments || attachments.length === 0) {
    return undefined
  }

  if (attachments.length > MAX_ATTACHMENTS) {
    throw new Error(`Maximum ${MAX_ATTACHMENTS} files per message.`)
  }

  return attachments.map((attachment) => {
    if (
      attachment.storage !== 'indexeddb' ||
      attachment.localOnly !== true ||
      !attachment.id ||
      attachment.id.length > 128 ||
      !ALLOWED_ATTACHMENT_MIME_TYPES.has(attachment.mimeType) ||
      !Number.isFinite(attachment.size) ||
      attachment.size <= 0 ||
      attachment.size > MAX_ATTACHMENT_SIZE ||
      !assertFiniteTimestamp(attachment.createdAt)
    ) {
      throw new Error('Message has invalid attachment metadata.')
    }

    return {
      ...attachment,
      name: sanitizeAttachmentName(attachment.name),
    }
  })
}
