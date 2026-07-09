'use client'

import { formatCedi } from '@/lib/utils'

interface PremiumStatsProps {
  stats: {
    totalProducts?: number
    totalQuantity?: number
    totalCostValue?: number
    totalInventoryValue?: number
    totalProfit?: number
    totalSalesRecords?: number
  }
}

export function PremiumStats({ stats }: PremiumStatsProps) {
  const metrics = [
    {
      label: 'Total Inventory Value',
      value: formatCedi(stats.totalInventoryValue || 0),
    },
    {
      label: 'Cost Value',
      value: formatCedi(stats.totalCostValue || 0),
    },
    {
      label: 'Total Profit',
      value: formatCedi(stats.totalProfit || 0),
    },
    {
      label: 'Units in Stock',
      value: (stats.totalQuantity || 0).toLocaleString('en-US'),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="min-w-0 space-y-1"
        >
          <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest">
            {metric.label}
          </p>
          <p className="mt-1.5 truncate text-lg font-semibold tabular-nums tracking-tight text-foreground sm:mt-2 sm:text-2xl lg:text-3xl">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}
