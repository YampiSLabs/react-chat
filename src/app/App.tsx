import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '../features/auth/AuthProvider'
import { useAuth } from '../features/auth/useAuth'

const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const ChatPage = lazy(() => import('../features/chat/ChatPage').then(m => ({ default: m.ChatPage })))

function LoadingSkeleton() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4" aria-busy="true">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Skeleton className="mb-5 size-14 rounded-2xl" />
        <Skeleton className="mb-10 h-6 w-56 rounded-md" />
        <div className="w-full space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </main>
  )
}

function AppRoutes() {
  const { loading, user } = useAuth()

  if (loading) return <LoadingSkeleton />
  if (!user) return <LoginPage />
  return <ChatPage />
}

export function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Suspense fallback={<LoadingSkeleton />}>
          <AppRoutes />
        </Suspense>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AuthProvider>
  )
}
