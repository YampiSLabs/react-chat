import { useEffect, useState } from 'react'
import { Download, File, FileImage, FileText, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getAttachmentBlob } from '../../../lib/attachmentStorage'
import { formatFileSize } from '../../../lib/attachmentStorage'
import type { AttachmentRef } from '../types'

function FileTypeIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) {
    return <FileImage className={cn('size-3.5 shrink-0 text-primary', className)} aria-hidden="true" />
  }
  if (['text/plain', 'text/csv', 'application/json'].includes(mimeType)) {
    return <FileText className={cn('size-3.5 shrink-0 text-muted-foreground', className)} aria-hidden="true" />
  }
  return <File className={cn('size-3.5 shrink-0 text-muted-foreground', className)} aria-hidden="true" />
}

export function AttachmentRenderer({
  attachment,
  isOwn,
  onDelete,
  onViewImage,
}: {
  attachment: AttachmentRef
  isOwn: boolean
  onDelete?: (id: string) => void
  onViewImage?: (id: string) => void
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    getAttachmentBlob(attachment.id)
      .then((blob) => {
        if (cancelled) return
        if (blob) {
          url = URL.createObjectURL(blob)
          setBlobUrl(url)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [attachment.id])

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/40 bg-card/50">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
        <FileTypeIcon mimeType={attachment.mimeType} className="size-3 opacity-50" />
        <span className="flex-1 truncate">{attachment.name}</span>
        <span className="shrink-0 text-right text-[10px] italic leading-relaxed opacity-50 max-sm:max-w-24">Only available on<br />original device</span>
      </div>
    )
  }

  if (attachment.mimeType.startsWith('image/') && blobUrl) {
    return (
      <button
        type="button"
        onClick={() => onViewImage?.(attachment.id)}
        className="group relative overflow-hidden rounded-xl border border-border/40 bg-black/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`View ${attachment.name}`}
      >
        <img
          src={blobUrl}
          alt={attachment.name}
          className="aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {onDelete && isOwn && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(attachment.id) }}
            className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1 text-white opacity-0 transition hover:bg-destructive/80 group-hover:opacity-100"
            aria-label={`Delete ${attachment.name}`}
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </button>
    )
  }

  return (
    <div className="group relative flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-3 py-2 text-xs transition hover:border-border/60">
      <FileTypeIcon mimeType={attachment.mimeType} />
      <span className="min-w-0 flex-1 truncate text-foreground">{attachment.name}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(attachment.size)}</span>
      {blobUrl && (
        <a
          href={blobUrl}
          download={attachment.name}
          className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground transition hover:text-foreground"
          aria-label={`Download ${attachment.name}`}
        >
          <Download className="size-3" aria-hidden="true" />
        </a>
      )}
      {onDelete && isOwn && (
        <button
          type="button"
          onClick={() => onDelete(attachment.id)}
          className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
          aria-label={`Delete ${attachment.name}`}
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  )
}
