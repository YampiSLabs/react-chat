import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getAttachmentBlob } from '../../../lib/attachmentStorage'
import type { AttachmentRef } from '../types'

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: AttachmentRef[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState<Set<string>>(new Set())
  const urlsCreated = useRef<string[]>([])
  const loadedRef = useRef<Set<string>>(new Set())

  const current = images[index]

  const loadBlob = useCallback(async (attachment: AttachmentRef) => {
    if (loadedRef.current.has(attachment.id)) return
    loadedRef.current.add(attachment.id)
    try {
      const blob = await getAttachmentBlob(attachment.id)
      if (blob) {
        const url = URL.createObjectURL(blob)
        urlsCreated.current.push(url)
        setBlobUrls((prev) => ({ ...prev, [attachment.id]: url }))
      } else {
        setNotFound((prev) => new Set(prev).add(attachment.id))
      }
    } catch {
      setNotFound((prev) => new Set(prev).add(attachment.id))
    }
  }, [])

  useEffect(() => {
    if (current) loadBlob(current)
  }, [current, loadBlob])

  useEffect(() => {
    const left = images[index - 1]
    const right = images[index + 1]
    if (left) loadBlob(left)
    if (right) loadBlob(right)
  }, [index, images, loadBlob])

  useEffect(() => {
    const urls = urlsCreated.current
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 1))
      }
      if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(images.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, onClose])

  if (!current) return null

  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-label="Image preview"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label="Close preview"
      >
        <X className="size-6" />
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white/80">
          {index + 1} / {images.length}
        </div>
      )}

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1) }}
          className="absolute left-3 z-10 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-white/20 hover:text-white md:left-6"
          aria-label="Previous image"
        >
          <ChevronLeft className="size-7 md:size-9" />
        </button>
      )}

      <div
        className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {blobUrls[current.id] ? (
          <img
            src={blobUrls[current.id]}
            alt={current.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        ) : notFound.has(current.id) ? (
          <div className="flex size-48 items-center justify-center rounded-lg bg-white/5 px-6 text-center text-sm text-white/50">
            <span className="italic leading-relaxed">
              Only available on<br />original device
            </span>
          </div>
        ) : (
          <div className="size-32 animate-pulse rounded-lg bg-white/10" />
        )}
      </div>

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1) }}
          className="absolute right-3 z-10 rounded-full bg-black/50 p-2 text-white/80 transition hover:bg-white/20 hover:text-white md:right-6"
          aria-label="Next image"
        >
          <ChevronRight className="size-7 md:size-9" />
        </button>
      )}
    </div>
  )
}
