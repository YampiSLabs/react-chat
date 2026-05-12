import { describe, expect, it } from 'vitest'
import { validateAttachment, formatFileSize } from './attachmentStorage'
import { MAX_ATTACHMENT_SIZE } from './security'

describe('validateAttachment', () => {
  it('returns null for a valid file', () => {
    expect(
      validateAttachment({ name: 'report.pdf', size: 1024, type: 'application/pdf' }),
    ).toBeNull()
  })

  it('returns error for an empty file', () => {
    const result = validateAttachment({
      name: 'empty.txt',
      size: 0,
      type: 'text/plain',
    })
    expect(result).toMatch(/empty/)
  })

  it('returns error for a file exceeding MAX_ATTACHMENT_SIZE', () => {
    const result = validateAttachment({
      name: 'big.pdf',
      size: MAX_ATTACHMENT_SIZE + 1,
      type: 'application/pdf',
    })
    expect(result).toMatch(/5 MB limit/)
  })

  it('returns error for an unsupported extension', () => {
    const result = validateAttachment({
      name: 'script.exe',
      size: 1024,
      type: 'application/x-msdownload',
    })
    expect(result).toMatch(/not supported/)
  })

  it('returns error for a mismatched MIME type', () => {
    const result = validateAttachment({
      name: 'report.pdf',
      size: 1024,
      type: 'text/plain',
    })
    expect(result).toMatch(/unexpected MIME type/)
  })

  it('sanitizes the name before displaying in error messages', () => {
    const result = validateAttachment({
      name: 'C:\\fakepath\\empty.pdf',
      size: 0,
      type: 'application/pdf',
    })
    expect(result).toMatch(/empty\.pdf.*empty/)
  })

  it('accepts all allowed extensions with correct MIME types', () => {
    const files = [
      { name: 'img.png', size: 100, type: 'image/png' },
      { name: 'img.jpg', size: 100, type: 'image/jpeg' },
      { name: 'img.jpeg', size: 100, type: 'image/jpeg' },
      { name: 'img.webp', size: 100, type: 'image/webp' },
      { name: 'img.gif', size: 100, type: 'image/gif' },
      { name: 'doc.pdf', size: 100, type: 'application/pdf' },
      { name: 'notes.txt', size: 100, type: 'text/plain' },
      { name: 'data.csv', size: 100, type: 'text/csv' },
      { name: 'data.json', size: 100, type: 'application/json' },
    ]
    for (const file of files) {
      expect(validateAttachment(file)).toBeNull()
    }
  })
})

describe('formatFileSize', () => {
  it('returns "B" for files under 1 KB', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1023)).toBe('1023 B')
  })

  it('returns "KB" for files between 1 KB and 1 MB (exclusive)', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1024 KB')
  })

  it('returns "MB" for files 1 MB and above', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatFileSize(1536 * 1024)).toBe('1.5 MB')
  })
})
