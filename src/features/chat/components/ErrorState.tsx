import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <Alert variant="destructive" className="max-w-sm rounded-xl border-destructive/20 bg-destructive-subtle/30">
        <AlertCircle className="size-4" aria-hidden="true" />
        <AlertTitle className="text-sm">Something went wrong</AlertTitle>
        <AlertDescription>
          <p className="text-xs">{message}</p>
          <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
