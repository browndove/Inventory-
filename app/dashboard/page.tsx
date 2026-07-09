import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getProducts, getSalesInsights, getInventoryStats, getSalesHistory, getRestockAlerts } from '@/app/actions/inventory'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const [products, insights, stats, salesHistory, restockAlerts] = await Promise.all([
    getProducts(),
    getSalesInsights(),
    getInventoryStats(),
    getSalesHistory(),
    getRestockAlerts(),
  ])

  return (
    <DashboardClient
      user={session.user}
      products={products}
      insights={insights}
      stats={stats}
      salesHistory={salesHistory}
      restockAlerts={restockAlerts}
    />
  )
}
