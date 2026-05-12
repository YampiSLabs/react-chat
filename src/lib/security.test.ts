import { describe, expect, it } from 'vitest'
import {
  MAX_ATTACHMENTS,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_ROOM_DESCRIPTION_LENGTH,
  MAX_ROOM_NAME_LENGTH,
  sanitizeAttachmentName,
  sanitizeMessageText,
  sanitizePlainTextMetadata,
  validateAttachmentRefs,
} from './security'
import type { AttachmentRef } from '@/features/chat/types'

function makeAttachment(overrides: Partial<AttachmentRef> = {}): AttachmentRef {
  return {
    id: crypto.randomUUID(),
    name: 'report.txt',
    mimeType: 'text/plain',
    size: 128,
    storage: 'indexeddb',
    localOnly: true,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('message text security', () => {
  it('trims message text and keeps normal line breaks', () => {
    expect(sanitizeMessageText('  hello\nworld  ')).toBe('hello\nworld')
  })

  it('rejects hidden control characters in message text', () => {
    expect(() => sanitizeMessageText(`hello${String.fromCharCode(0)}world`)).toThrow(
      'unsupported control characters',
    )
  })

  it('rejects message text over 500 characters', () => {
    expect(() => sanitizeMessageText('x'.repeat(501))).toThrow('500 characters or less')
  })
})

describe('plain text metadata security', () => {
  it('strips control characters from plain text metadata', () => {
    expect(sanitizePlainTextMetadata(`hello${String.fromCharCode(0)}world`, 64, 'fallback')).toBe(
      'helloworld',
    )
  })

  it('collapses multiple whitespace in plain text metadata', () => {
    expect(sanitizePlainTextMetadata('  hello   world  ', 64, 'fallback')).toBe('hello world')
  })

  it('enforces max length on plain text metadata', () => {
    expect(sanitizePlainTextMetadata('toolongvalue', 5, 'fallback')).toBe('toolo')
  })

  it('returns fallback for empty plain text', () => {
    expect(sanitizePlainTextMetadata('', 32, 'Guest')).toBe('Guest')
  })

  it('returns fallback when only control characters', () => {
    expect(
      sanitizePlainTextMetadata(String.fromCharCode(0, 1, 2, 3), 32, 'Guest'),
    ).toBe('Guest')
  })

  it('applies MAX_DISPLAY_NAME_LENGTH correctly', () => {
    const long = 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 10)
    const result = sanitizePlainTextMetadata(long, MAX_DISPLAY_NAME_LENGTH, '')
    expect(result.length).toBe(MAX_DISPLAY_NAME_LENGTH)
    expect(result).toBe('a'.repeat(MAX_DISPLAY_NAME_LENGTH))
  })

  it('applies MAX_ROOM_NAME_LENGTH correctly', () => {
    const long = 'b'.repeat(MAX_ROOM_NAME_LENGTH + 5)
    const result = sanitizePlainTextMetadata(long, MAX_ROOM_NAME_LENGTH, '')
    expect(result.length).toBe(MAX_ROOM_NAME_LENGTH)
  })

  it('applies MAX_ROOM_DESCRIPTION_LENGTH correctly', () => {
    const long = 'c'.repeat(MAX_ROOM_DESCRIPTION_LENGTH + 5)
    const result = sanitizePlainTextMetadata(long, MAX_ROOM_DESCRIPTION_LENGTH, '')
    expect(result.length).toBe(MAX_ROOM_DESCRIPTION_LENGTH)
  })
})

describe('attachment metadata security', () => {
  it('removes local path segments and control characters from attachment names', () => {
    expect(sanitizeAttachmentName(`C:\\fakepath\\report${String.fromCharCode(0)}.pdf`)).toBe(
      'report.pdf',
    )
  })

  it('rejects more than five attachment refs', () => {
    const attachments = Array.from({ length: MAX_ATTACHMENTS + 1 }, (_, index) =>
      makeAttachment({ id: `att-${index}` }),
    )

    expect(() => validateAttachmentRefs(attachments)).toThrow(
      `Maximum ${MAX_ATTACHMENTS} files per message.`,
    )
  })

  it('rejects spoofed attachment storage metadata', () => {
    expect(() =>
      validateAttachmentRefs([
        makeAttachment({ storage: 'indexeddb', localOnly: false as true }),
      ]),
    ).toThrow('invalid attachment metadata')
  })
})
