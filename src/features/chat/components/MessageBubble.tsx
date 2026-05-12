import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Activity, AlertTriangle, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AttachmentRenderer } from './AttachmentRenderer'
import { AvatarInitials } from './AvatarInitials'
import { ImageLightbox } from './ImageLightbox'
import { deleteMessageAttachment } from '../services/chat.service'
import { getMessageVariant, type MessageVariant } from '../services/message-variant'
import type { Message } from '../types'

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function iconForVariant(variant: MessageVariant) {
  if (variant === 'warning') {
    return <AlertTriangle className="size-3.5 text-warning" aria-hidden="true" />
  }

  if (variant === 'destructive') {
    return <AlertTriangle className="size-3.5 text-destructive" aria-hidden="true" />
  }

  if (variant === 'sensor') {
    return <Activity className="size-3.5 text-primary" aria-hidden="true" />
  }

  if (variant === 'bot') {
    return <Info className="size-3.5 text-primary" aria-hidden="true" />
  }

  return null
}

const variantStyles: Record<MessageVariant, string> = {
  own: 'border-primary/15 bg-primary/[0.08]',
  default: 'border-border/60 bg-card',
  bot: 'border-border/60 bg-card',
  sensor: 'border-border/60 bg-card',
  warning: 'border-warning/15 bg-warning-subtle/40',
  destructive: 'border-destructive/15 bg-destructive-subtle/40',
}

export function MessageBubble({
  currentUserId,
  message,
  variant = getMessageVariant(message, currentUserId),
}: {
  currentUserId?: string
  message: Message
  variant?: MessageVariant
}) {
  const own = variant === 'own'
  const statusIcon = iconForVariant(variant)

  const imageAttachments = useMemo(
    () => message.attachments?.filter((a) => a.mimeType.startsWith('image/')) ?? [],
    [message.attachments],
  )

  const nonImageAttachments = useMemo(
    () => message.attachments?.filter((a) => !a.mimeType.startsWith('image/')) ?? [],
    [message.attachments],
  )

  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null)

  async function handleDeleteAttachment(attachmentId: string) {
    try {
      await deleteMessageAttachment(message.roomId, message.id, attachmentId)
    } catch {
      toast.error('Could not delete attachment.')
    }
  }

  function handleViewImage(attachmentId: string) {
    const idx = imageAttachments.findIndex((a) => a.id === attachmentId)
    if (idx !== -1) setViewingImageIndex(idx)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn('flex gap-2.5', own && 'flex-row-reverse')}
    >
      {imageAttachments.length > 0 && viewingImageIndex !== null && (
        <ImageLightbox
          images={imageAttachments}
          initialIndex={viewingImageIndex}
          onClose={() => setViewingImageIndex(null)}
        />
      )}
      <AvatarInitials name={message.userName} role={message.userRole} />
      <article className={cn('min-w-0 max-w-[min(42rem,86%)]', own && 'items-end text-right')}>
        <header className={cn('mb-1 flex items-center gap-1.5', own && 'justify-end')}>
          <h3 className="truncate text-sm font-medium text-foreground">{message.userName}</h3>
          <time className="text-[11px] text-muted-foreground" dateTime={new Date(message.createdAt).toISOString()}>
            {formatTime(message.createdAt)}
          </time>
        </header>

        <div className={cn('rounded-[18px] border px-4 py-2.5 text-left text-sm leading-6', variantStyles[variant])}>
          {statusIcon ? (
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {statusIcon}
              {variant === 'destructive' ? 'Critical' : variant === 'warning' ? 'Warning' : 'System'}
            </p>
          ) : null}
          {message.text ? (
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-foreground">{message.text.replace(/^(Alert|Warning):\s*/i, '')}</p>
          ) : null}
          {imageAttachments.length > 0 && (
            <div className={cn(
              'grid gap-2',
              message.text ? 'mt-3' : '',
              imageAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
            )}>
              {imageAttachments.map((a) => (
                <AttachmentRenderer
                  key={a.id}
                  attachment={a}
                  isOwn={own}
                  onViewImage={handleViewImage}
                  onDelete={handleDeleteAttachment}
                />
              ))}
            </div>
          )}
          {nonImageAttachments.length > 0 && (
            <div className={cn('space-y-1.5', (message.text || imageAttachments.length > 0) ? 'mt-2' : '')}>
              {nonImageAttachments.map((a) => (
                <AttachmentRenderer
                  key={a.id}
                  attachment={a}
                  isOwn={own}
                  onDelete={handleDeleteAttachment}
                />
              ))}
            </div>
          )}
        </div>
      </article>
    </motion.li>
  )
}
