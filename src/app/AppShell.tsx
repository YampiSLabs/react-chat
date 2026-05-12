import { useState } from 'react'
import type { ReactNode } from 'react'
import { Bot, Menu, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function AppShell({
  chat,
  rightPanel,
  roomSheet,
  subtitle,
  rightPanelOpen: controlledOpen,
  onRightPanelOpenChange,
}: {
  chat: ReactNode
  rightPanel: ReactNode
  roomSheet: ReactNode
  subtitle: string
  rightPanelOpen?: boolean
  onRightPanelOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const sheetOpen = isControlled ? controlledOpen : internalOpen
  const setSheetOpen = isControlled ? onRightPanelOpenChange! : setInternalOpen

  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="flex h-dvh w-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-surface px-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open rooms">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] border-border bg-surface p-0">
              <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
                <SheetTitle className="text-sm">Rooms</SheetTitle>
                <SheetDescription className="text-xs">Support and IoT rooms</SheetDescription>
              </SheetHeader>
              {roomSheet}
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">SmartIoT Chat</p>
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open room info and users">
                <Users className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] border-border bg-surface p-0">
              <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
                <SheetTitle className="text-sm">Inspector</SheetTitle>
                <SheetDescription className="text-xs">Room details and online users</SheetDescription>
              </SheetHeader>
              {rightPanel}
            </SheetContent>
          </Sheet>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="hidden min-h-0 border-r border-border/60 bg-surface md:flex">{roomSheet}</aside>
          {chat}
          <aside className="hidden min-h-0 border-l border-border/60 bg-surface xl:flex">{rightPanel}</aside>
        </section>
      </div>
    </main>
  )
}
