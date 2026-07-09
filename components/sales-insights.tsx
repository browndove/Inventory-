import { formatCedi } from '@/lib/utils'

interface SalesInsightsProps {
  insights: {
    trend: {
      label: string
      dateLabel: string
      revenue: number
      units: number
    }[]
    mostSold: {
      productId: number
      name: string
      units: number
      revenue: number
    }[]
    totalSales: number
    totalRevenue: number
    totalUnits: number
  }
}

export function SalesInsights({ insights }: SalesInsightsProps) {
  const maxRevenue = Math.max(...insights.trend.map((day) => day.revenue), 1)
  const hasSales = insights.totalSales > 0

  return (
    <div className="space-y-16">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Overview</p>
        <h2 className="text-3xl font-medium tracking-tight text-foreground">
          Sales insights
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <section className="space-y-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-base font-medium text-foreground">Sale trend</h3>
              <p className="mt-1 text-sm text-muted-foreground">Last 7 days</p>
            </div>
            {hasSales && (
              <div className="text-right">
                <p className="text-xl tabular-nums text-foreground">
                  {formatCedi(insights.totalRevenue)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {insights.totalUnits} units sold
                </p>
              </div>
            )}
          </div>

          {!hasSales ? (
            <p className="text-sm text-muted-foreground">No sales recorded yet</p>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {insights.trend.map((day) => (
                <div
                  key={day.dateLabel}
                  className="flex min-w-0 flex-1 flex-col items-center gap-3"
                  title={`${day.dateLabel}: ${formatCedi(day.revenue)} · ${day.units} units`}
                >
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t-sm bg-foreground"
                      style={{
                        height:
                          day.revenue > 0
                            ? `${Math.max((day.revenue / maxRevenue) * 100, 6)}%`
                            : '0%',
                        opacity: day.revenue > 0 ? 1 : 0.12,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{day.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <h3 className="text-base font-medium text-foreground">Most sold items</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Top products by units sold
            </p>
          </div>

          {insights.mostSold.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items sold yet</p>
          ) : (
            <div className="space-y-6">
              {insights.mostSold.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-baseline justify-between gap-4 border-t border-border/60 pt-6 first:border-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">0{index + 1}</p>
                    <p className="mt-1 truncate text-sm text-foreground">{item.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm tabular-nums text-foreground">{item.units}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCedi(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
