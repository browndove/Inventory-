import { formatCedi } from '@/lib/utils'

interface StatsProps {
  stats: {
    totalProducts: number
    totalQuantity: number
    totalCostValue: number
    totalInventoryValue: number
    totalProfit: number
    totalSalesRecords: number
  }
}

export function InventoryStats({ stats }: StatsProps) {
  const profitMargin =
    stats.totalInventoryValue > 0
      ? ((stats.totalProfit / stats.totalInventoryValue) * 100).toFixed(1)
      : 0

  const metrics = [
    {
      label: 'Inventory Value',
      value: formatCedi(stats.totalInventoryValue),
    },
    {
      label: 'Cost Value',
      value: formatCedi(stats.totalCostValue),
    },
    {
      label: 'Total Profit',
      value: formatCedi(stats.totalProfit),
    },
    {
      label: 'Profit Margin',
      value: `${profitMargin}%`,
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
