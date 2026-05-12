import { useState } from 'react'
import { AlertCircle, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { error, isDemoMode, loading, signInWithGoogle, signInAsDemo } = useAuth()
  const [googleBusy, setGoogleBusy] = useState(false)
  const [demoBusy, setDemoBusy] = useState(false)

  async function handleGoogle() {
    setGoogleBusy(true)
    try { await signInWithGoogle() } finally { setGoogleBusy(false) }
  }

  async function handleDemo() {
    setDemoBusy(true)
    try { await signInAsDemo() } finally { setDemoBusy(false) }
  }

  const isBusy = googleBusy || demoBusy || loading

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4" aria-busy={isBusy || undefined}>
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-10 flex flex-col items-center gap-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10" aria-hidden="true">
            <Bot className="size-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Log in to SmartIoT Chat
          </h1>
        </div>

        <div className="w-full space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full rounded-xl py-6 text-sm font-medium"
            onClick={handleGoogle}
            disabled={isDemoMode || isBusy}
          >
            {googleBusy ? 'Connecting...' : 'Continue with Google'}
          </Button>

          {!isDemoMode && (
            <div className="relative my-4" role="separator" aria-label="or">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant={isDemoMode ? "default" : "ghost"}
            size="lg"
            className={cn(
              "w-full rounded-xl py-6 text-sm font-medium",
              !isDemoMode && "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleDemo}
            disabled={isBusy}
          >
            {demoBusy ? 'Connecting...' : 'Continue as demo'}
          </Button>
        </div>

        {error && (
          <div className="mt-6 flex w-full items-start gap-2 rounded-xl border border-destructive/20 bg-destructive-subtle px-4 py-3 text-sm text-destructive" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </main>
  )
}
