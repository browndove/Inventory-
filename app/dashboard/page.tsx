import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getProducts, getSalesInsights } from '@/app/actions/inventory'
import { DashboardClient } from '@/components/dashboard-client'

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
    <DashboardClient
      user={session.user}
      products={products}
      insights={insights}
    />
  )
}
