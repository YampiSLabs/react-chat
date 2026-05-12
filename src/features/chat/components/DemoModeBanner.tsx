import { FlaskConical } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DemoModeBanner() {
  return (
    <Alert className="rounded-xl border-warning/15 bg-warning-subtle/20">
      <FlaskConical className="size-3.5 text-warning" aria-hidden="true" />
      <AlertTitle className="text-xs text-warning">Demo Mode</AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground">
        Firebase not configured. Using mock data and browser storage.
      </AlertDescription>
    </Alert>
  )
}
