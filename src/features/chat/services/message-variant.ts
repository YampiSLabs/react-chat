import type { Message } from '../types'

export type MessageVariant = 'default' | 'own' | 'bot' | 'sensor' | 'warning' | 'destructive'

export function getMessageVariant(message: Message, currentUserId?: string): MessageVariant {
  if (message.userId === currentUserId) {
    return 'own'
  }

  if (message.userRole === 'bot') {
    return 'bot'
  }

  if (message.userRole === 'sensor') {
    return /offline|critical|failed|down/i.test(message.text) ? 'destructive' : 'warning'
  }

  if (/^warning:/i.test(message.text)) {
    return 'warning'
  }

  if (/^alert:|critical|failed|offline/i.test(message.text)) {
    return 'destructive'
  }

  return 'default'
}
