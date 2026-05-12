import { describe, expect, it } from 'vitest'
import { getMessageVariant } from '../services/message-variant'
import type { Message } from '../types'

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    roomId: 'room-1',
    userId: 'user-1',
    userName: 'Test User',
    userRole: 'guest',
    text: 'hello',
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('getMessageVariant', () => {
  it('returns "own" when userId matches currentUserId', () => {
    const msg = makeMessage({ userId: 'alice' })
    expect(getMessageVariant(msg, 'alice')).toBe('own')
  })

  it('returns "bot" for bot userRole', () => {
    const msg = makeMessage({ userRole: 'bot' })
    expect(getMessageVariant(msg)).toBe('bot')
  })

  it('returns "destructive" for sensor messages with critical keywords', () => {
    const msg = makeMessage({ userRole: 'sensor', text: 'temperature critical' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "destructive" for sensor messages with offline keyword', () => {
    const msg = makeMessage({ userRole: 'sensor', text: 'device offline' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "destructive" for sensor messages with failed keyword', () => {
    const msg = makeMessage({ userRole: 'sensor', text: 'connection failed' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "destructive" for sensor messages with down keyword', () => {
    const msg = makeMessage({ userRole: 'sensor', text: 'system down' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "warning" for non-critical sensor messages', () => {
    const msg = makeMessage({ userRole: 'sensor', text: 'temperature 22.5°C' })
    expect(getMessageVariant(msg)).toBe('warning')
  })

  it('returns "warning" for messages starting with "warning:"', () => {
    const msg = makeMessage({ text: 'Warning: high temperature' })
    expect(getMessageVariant(msg)).toBe('warning')
  })

  it('returns "destructive" for messages starting with "alert:"', () => {
    const msg = makeMessage({ text: 'Alert: system failure' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "destructive" for messages containing critical keywords', () => {
    const msg = makeMessage({ text: 'The device has failed' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "destructive" for messages containing offline keyword', () => {
    const msg = makeMessage({ text: 'sensor is offline' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })

  it('returns "default" for ordinary user messages', () => {
    const msg = makeMessage({ text: 'hello everyone' })
    expect(getMessageVariant(msg)).toBe('default')
  })

  it('respects own-message check before role-based checks', () => {
    const msg = makeMessage({ userId: 'me', userRole: 'bot' })
    expect(getMessageVariant(msg, 'me')).toBe('own')
  })

  it('uses case-insensitive matching for destructive keywords', () => {
    const msg = makeMessage({ text: 'CRITICAL error' })
    expect(getMessageVariant(msg)).toBe('destructive')
  })
})
