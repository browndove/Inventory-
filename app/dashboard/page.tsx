import { auth } from '@/lib/auth'
import { redirect, headers as getHeaders } from 'next/navigation'
import { headers } from 'next/headers'
import { getProducts, getSalesInsights } from '@/app/actions/inventory'
import { DashboardHeader } from '@/components/dashboard-header'
import { ProductsList } from '@/components/products-list'
import { SalesInsights } from '@/components/sales-insights'
import { AddProductDialog } from '@/components/add-product-dialog'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const [products, insights] = await Promise.all([
    getProducts(),
    getSalesInsights(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Stats Section */}
        <div className="mb-6 sm:mb-8">
          <SalesInsights insights={insights} />
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your inventory</p>
            </div>
            <AddProductDialog />
          </div>
          
          <ProductsList products={products} />
        </div>
      </main>
    </div>
  )
}
