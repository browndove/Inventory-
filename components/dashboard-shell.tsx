'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import type { DashboardView } from '@/components/dashboard-views'

type StoreHeaderProps = {
  user?: {
    name?: string | null
    email?: string | null
  }
  isDemo?: boolean
  inventoryCount?: number
  onMenuOpen?: () => void
  showMenu?: boolean
}

export function StoreHeader({
  user,
  isDemo,
  inventoryCount = 0,
  onMenuOpen,
  showMenu = true,
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <div className="w-28">
          {showMenu && onMenuOpen ? (
            <button
              type="button"
              onClick={onMenuOpen}
              className="text-sm text-foreground transition-opacity hover:opacity-60"
            >
              Menu
            </button>
          ) : (
            <span className="text-sm text-transparent">Menu</span>
          )}
        </div>

        <Link
          href={isDemo ? '/demo' : '/dashboard'}
          className="text-sm font-medium tracking-[0.2em] text-foreground"
        >
          DILITRUST
        </Link>

        <div className="flex w-28 items-center justify-end gap-4 text-sm">
          {user ? (
            <>
              <span className="hidden truncate text-muted-foreground sm:inline">
                {user.name?.split(' ')[0] || 'Account'}
              </span>
              <span className="text-foreground">
                Inventory ({inventoryCount})
              </span>
            </>
          ) : (
            <Link href="/sign-in" className="text-foreground hover:opacity-60">
              Account
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

type StoreMenuProps = {
  open: boolean
  onClose: () => void
  isDemo?: boolean
  currentView: DashboardView
  onNavigate: (view: DashboardView) => void
  onSignOut: () => void
  onAddProduct?: () => void
}

export function StoreMenu({
  open,
  onClose,
  isDemo,
  currentView,
  onNavigate,
  onSignOut,
  onAddProduct,
}: StoreMenuProps) {
  if (!open) return null

  const links = [
    { id: 'products' as const, label: 'Products' },
    { id: 'overview' as const, label: 'Overview' },
    { id: 'business' as const, label: 'Business' },
  ]

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/5"
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-background px-8 py-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="mb-10 text-sm tracking-[0.2em] text-foreground">DILITRUST</p>

        <nav className="flex flex-col gap-6">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                onNavigate(link.id)
                onClose()
              }}
              className={cn(
                'text-left text-2xl font-normal transition-opacity hover:opacity-60',
                currentView === link.id ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </button>
          ))}
          {onAddProduct && (
            <button
              type="button"
              onClick={() => {
                onAddProduct()
                onClose()
              }}
              className="text-left text-2xl font-normal text-muted-foreground transition-opacity hover:opacity-60"
            >
              Add product
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-4">
          {isDemo && (
            <p className="text-sm text-muted-foreground">Demo mode</p>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="text-sm text-muted-foreground transition-opacity hover:text-foreground"
          >
            {isDemo ? 'Exit demo' : 'Sign out'}
          </button>
        </div>
      </aside>
    </div>
  )
}

type DashboardShellProps = {
  user: {
    name?: string | null
    email?: string | null
  }
  isDemo?: boolean
  inventoryCount?: number
  currentView: DashboardView
  onViewChange: (view: DashboardView) => void
  onAddProduct?: () => void
  children: React.ReactNode
}

export function DashboardShell({
  user,
  isDemo,
  inventoryCount = 0,
  currentView,
  onViewChange,
  onAddProduct,
  children,
}: DashboardShellProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    if (isDemo) {
      router.push('/')
      return
    }
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader
        user={user}
        isDemo={isDemo}
        inventoryCount={inventoryCount}
        onMenuOpen={() => setMenuOpen(true)}
      />

      <StoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isDemo={isDemo}
        currentView={currentView}
        onNavigate={onViewChange}
        onSignOut={handleSignOut}
        onAddProduct={onAddProduct}
      />

      <main className="mx-auto max-w-[1440px] px-6 pb-20 pt-4 lg:px-10 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
