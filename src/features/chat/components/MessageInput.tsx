import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSendMessage } from '../hooks/useSendMessage'
import { formatFileSize, validateAttachment } from '../../../lib/attachmentStorage'
import { MAX_ATTACHMENTS, MAX_MESSAGE_LENGTH } from '../../../lib/security'
import type { ChatUser } from '../types'

export function MessageInput({ roomId, user }: { roomId: string; user: ChatUser | null }) {
  const [text, setText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { error, sending, submit } = useSendMessage(roomId, user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const count = text.length
  const hasContent = text.trim().length > 0 || selectedFiles.length > 0
  const disabled = sending || !user || !hasContent || count > MAX_MESSAGE_LENGTH

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    const acceptedFiles: File[] = []

    for (const file of files) {
      if (selectedFiles.length + acceptedFiles.length >= MAX_ATTACHMENTS) {
        toast.error(`Maximum ${MAX_ATTACHMENTS} files per message.`)
        break
      }
      const validationError = validateAttachment(file)
      if (validationError) {
        toast.error(validationError)
        continue
      }
      acceptedFiles.push(file)
    }

    if (acceptedFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles])
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function clearFiles() {
    setSelectedFiles([])
  }

  async function send() {
    const clean = text.trim()
    const files = selectedFiles.length > 0 ? selectedFiles : undefined

    if (!clean && !files) {
      toast.error('Write a message or attach a file before sending.')
      return
    }

    if (clean.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`)
      return
    }

    const sent = await submit(clean, files)

    if (sent) {
      setText('')
      clearFiles()
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await send()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }

  return (
    <form className="sticky bottom-0 shrink-0 px-4 pb-4 pt-2 md:px-6 md:pb-6" onSubmit={handleSubmit}>
      <div className="mx-auto max-w-[720px] rounded-2xl border border-border/60 bg-surface shadow-composer focus-within:border-border">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border/40 px-3 py-2.5">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1 text-xs"
              >
                <span className="max-sm:max-w-[140px] max-w-[100px] truncate text-foreground">{file.name}</span>
                <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-0.5 rounded p-0.5 text-muted-foreground transition hover:text-destructive"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 px-3 py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!user}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files"
                className="shrink-0 text-muted-foreground hover:text-foreground max-sm:min-h-11 max-sm:min-w-11"
              >
                <Paperclip className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach files</TooltipContent>
          </Tooltip>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.json"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="min-w-0 flex-1">
            <label htmlFor="message" className="sr-only">Message</label>
            <Textarea
              id="message"
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onKeyDown={handleKeyDown}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              placeholder={user ? 'Type a message...' : 'Sign in to send messages.'}
              disabled={!user}
              className="max-h-32 min-h-10 resize-none border-0 bg-transparent px-1 py-2 text-sm text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
          </div>

          <Button
            type="submit"
            size="icon-sm"
            disabled={disabled}
            aria-label={sending ? 'Sending message' : 'Send message'}
            className="shrink-0 max-sm:min-h-11 max-sm:min-w-11"
          >
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-[720px] items-center justify-between px-3 text-[11px] text-muted-foreground/50">
        <span>Enter to send &middot; Shift+Enter for new line</span>
        <span className={cn('tabular-nums', count > 450 && 'font-semibold text-muted-foreground')}>
          {count}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  )
}
