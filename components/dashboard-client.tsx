'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { ProductsList } from '@/components/products-list'
import { SalesInsights } from '@/components/sales-insights'
import { AddProductDialog } from '@/components/add-product-dialog'

type DashboardClientProps = {
  user: {
    name?: string | null
    email?: string | null
  }
  products: any[]
  insights: any
  isDemo?: boolean
}

export function DashboardClient({
  user,
  products,
  insights,
  isDemo,
}: DashboardClientProps) {
  const [view, setView] = useState<'products' | 'overview'>('products')
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
        {view === 'overview' ? (
          <SalesInsights insights={insights} />
        ) : (
          <ProductsList products={products} />
        )}
      </DashboardShell>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
