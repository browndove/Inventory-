'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { ProductsList } from '@/components/products-list'
import { SalesInsights } from '@/components/sales-insights'
import { BusinessDashboard } from '@/components/business-dashboard'
import { AddProductDialog } from '@/components/add-product-dialog'
import type { DashboardView } from '@/components/dashboard-views'

type DashboardClientProps = {
  user: {
    name?: string | null
    email?: string | null
  }
  products: any[]
  insights: any
  stats: any
  salesHistory: any[]
  isDemo?: boolean
}

export function DashboardClient({
  user,
  products,
  insights,
  stats,
  salesHistory,
  isDemo,
}: DashboardClientProps) {
  const [view, setView] = useState<DashboardView>('products')
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <DashboardShell
        user={user}
        isDemo={isDemo}
        inventoryCount={products.length}
        currentView={view}
        onViewChange={setView}
        onAddProduct={() => setAddOpen(true)}
      >
        {view === 'business' ? (
          <BusinessDashboard
            stats={stats}
            insights={insights}
            salesHistory={salesHistory}
          />
        ) : view === 'overview' ? (
          <SalesInsights insights={insights} />
        ) : (
          <ProductsList products={products} />
        )}
      </DashboardShell>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
