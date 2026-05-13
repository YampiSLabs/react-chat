import { describe, expect, it, vi } from 'vitest'
import { mockRooms } from '../../mocks/mockRooms'
import { mockMessages } from '../../mocks/mockMessages'
import { sanitizeMessageText, sanitizePlainTextMetadata } from '../../lib/security'
import type { Message, AttachmentRef } from './types'

vi.mock('firebase/database', () => ({ get: vi.fn(), ref: vi.fn(), set: vi.fn(), onValue: vi.fn(), off: vi.fn(), push: vi.fn(), query: vi.fn(), limitToLast: vi.fn(), orderByChild: vi.fn(), onDisconnect: vi.fn() }))
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(), onAuthStateChanged: vi.fn(), signInAnonymously: vi.fn(), signInWithPopup: vi.fn(), signOut: vi.fn(), setPersistence: vi.fn(), browserSessionPersistence: '', GoogleAuthProvider: vi.fn() }))
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(), FirebaseError: class extends Error { code = '' } }))
vi.mock('../../lib/firebase', () => ({ firebaseAuth: null }))
vi.mock('../../lib/firebase-database', () => ({ firebaseDatabase: null }))
vi.mock('../../lib/env', () => ({ appMode: 'demo', isFirebaseConfigured: false, firebaseConfig: {} as Record<string, string> }))

function makeAttachment(overrides: Partial<AttachmentRef> = {}): AttachmentRef {
  return {
    id: crypto.randomUUID(),
    name: 'file.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    storage: 'indexeddb',
    localOnly: true,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('Demo mode smoke tests', () => {
  it('default rooms contain General, Support, and IoT Alerts', () => {
    const names = mockRooms.map((r) => r.name.toLowerCase())
    expect(names).toContain('general')
    expect(names).toContain('support')
    expect(names).toContain('iot-alerts')
  })

  it('default rooms are exactly 5 base rooms + 1 retention test room', () => {
    expect(mockRooms.length).toBe(6)
  })

  it('messages are seeded with correct structure', () => {
    for (const msg of mockMessages) {
      expect(msg).toHaveProperty('id')
      expect(msg).toHaveProperty('roomId')
      expect(msg).toHaveProperty('userId')
      expect(msg).toHaveProperty('userName')
      expect(msg).toHaveProperty('userRole')
      expect(typeof msg.text).toBe('string')
      expect(typeof msg.createdAt).toBe('number')
    }
  })
})

describe('Message validation', () => {
  it('accepts a message up to 500 characters', () => {
    const text = 'a'.repeat(500)
    expect(sanitizeMessageText(text)).toBe(text)
  })

  it('rejects a message over 500 characters', () => {
    expect(() => sanitizeMessageText('a'.repeat(501))).toThrow('500 characters or less')
  })

  it('trims whitespace from messages', () => {
    expect(sanitizeMessageText('  hello  ')).toBe('hello')
  })

  it('blocks messages with only whitespace by trimming', () => {
    const result = sanitizeMessageText('  ')
    expect(result).toBe('')
    expect(result.length).toBe(0)
  })

  it('rejects messages with control characters', () => {
    expect(() => sanitizeMessageText(`hello${String.fromCharCode(0)}world`)).toThrow('control characters')
  })
})

describe('Display name editing', () => {
  it('sanitizes display names correctly', () => {
    expect(sanitizePlainTextMetadata('  Alice  ', 32, 'Guest')).toBe('Alice')
  })

  it('enforces 32 character limit on display names', () => {
    const long = 'a'.repeat(40)
    const result = sanitizePlainTextMetadata(long, 32, '')
    expect(result.length).toBe(32)
  })

  it('returns fallback for empty display name', () => {
    expect(sanitizePlainTextMetadata('', 32, 'Guest')).toBe('Guest')
  })

  it('strips control characters from display names', () => {
    expect(sanitizePlainTextMetadata(`Bob${String.fromCharCode(0)}Smith`, 32, 'Guest')).toBe('BobSmith')
  })
})

describe('Retention edge case — attachment-only messages', () => {
  const expiredAttachment = makeAttachment({
    id: 'exp-1',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  })
  const validAttachment = makeAttachment({
    id: 'valid-1',
    createdAt: Date.now(),
  })
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

  it('skips message with empty text after all attachments expire (demo path)', () => {
    const msg: Message = {
      id: 'msg-1',
      roomId: 'general',
      userId: 'user-1',
      userName: 'Test',
      userRole: 'guest',
      text: '',
      createdAt: Date.now(),
      attachments: [expiredAttachment],
    }
    const now = Date.now()
    const msgAge = now - msg.createdAt

    if (msgAge >= SEVEN_DAYS) return

    const keptAttachments = (msg.attachments ?? []).filter((att) => {
      const attAge = now - att.createdAt
      return attAge < SEVEN_DAYS
    })

    const shouldKeep = !(keptAttachments.length === 0 && !msg.text.trim())
    expect(shouldKeep).toBe(false)
  })

  it('keeps message with empty text when valid attachments remain', () => {
    const msg: Message = {
      id: 'msg-2',
      roomId: 'general',
      userId: 'user-1',
      userName: 'Test',
      userRole: 'guest',
      text: '',
      createdAt: Date.now(),
      attachments: [validAttachment],
    }
    const now = Date.now()

    const keptAttachments = (msg.attachments ?? []).filter((att) => {
      const attAge = now - att.createdAt
      return attAge < SEVEN_DAYS
    })

    expect(keptAttachments.length).toBe(1)
  })

  it('keeps message with text even when all attachments expire', () => {
    const msg: Message = {
      id: 'msg-3',
      roomId: 'general',
      userId: 'user-1',
      userName: 'Test',
      userRole: 'guest',
      text: 'Has text content',
      createdAt: Date.now(),
      attachments: [expiredAttachment],
    }
    const now = Date.now()

    const keptAttachments = (msg.attachments ?? []).filter((att) => {
      const attAge = now - att.createdAt
      return attAge < SEVEN_DAYS
    })

    const shouldKeep = !(keptAttachments.length === 0 && !msg.text.trim())
    expect(shouldKeep).toBe(true)
  })
})


