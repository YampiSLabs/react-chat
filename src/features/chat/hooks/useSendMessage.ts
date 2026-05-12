import { useState } from 'react'
import { sendMessage } from '../services/chat.service'
import { saveAttachment, validateAttachment } from '../../../lib/attachmentStorage'
import { MAX_ATTACHMENTS, sanitizeMessageText } from '../../../lib/security'
import type { AttachmentRef, ChatUser } from '../types'

export function useSendMessage(roomId: string, user: ChatUser | null) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(text: string, files?: File[]) {
    if (!user) {
      setError('You must be signed in to send messages.')
      return false
    }

    let cleanText: string
    try {
      cleanText = sanitizeMessageText(text)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Message failed.')
      return false
    }

    if (!cleanText && (!files || files.length === 0)) {
      setError('Write a message or attach a file before sending.')
      return false
    }

    if (files && files.length > MAX_ATTACHMENTS) {
      setError(`Maximum ${MAX_ATTACHMENTS} files per message.`)
      return false
    }

    setSending(true)
    setError(null)

    try {
      let attachments: AttachmentRef[] | undefined

      if (files && files.length > 0) {
        attachments = []
        for (const file of files) {
          const validationError = validateAttachment(file)
          if (validationError) {
            throw new Error(validationError)
          }
          const ref = await saveAttachment(file)
          attachments.push(ref)
        }
      }

      await sendMessage(roomId, user, cleanText, attachments)
      return true
    } catch (caughtError) {
      console.warn('[chat] Send message failed:', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Message failed.')
      return false
    } finally {
      setSending(false)
    }
  }

  return { submit, sending, error }
}
