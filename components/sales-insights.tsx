import { formatCedi } from '@/lib/utils'
import { TrendingUp, Trophy } from 'lucide-react'

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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
      {/* Sale trend */}
      <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Sale Trend</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Last 7 days</p>
          </div>
          {hasSales && (
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {formatCedi(insights.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                {insights.totalUnits} units sold
              </p>
            </div>
          )}
        </div>

        {!hasSales ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">No sales recorded yet</p>
          </div>
        ) : (
          <div className="flex h-40 items-end gap-2 sm:gap-3">
            {insights.trend.map((day) => (
              <div
                key={day.dateLabel}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
                title={`${day.dateLabel}: ${formatCedi(day.revenue)} · ${day.units} units`}
              >
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary transition-all"
                    style={{
                      height:
                        day.revenue > 0
                          ? `${Math.max((day.revenue / maxRevenue) * 100, 8)}%`
                          : '0%',
                      opacity: day.revenue > 0 ? 1 : 0.15,
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground sm:text-xs">
                    {day.label}
                  </p>
                  <p className="hidden text-[10px] text-muted-foreground sm:block">
                    {day.units > 0 ? day.units : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most sold items */}
      <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Most Sold Items</h3>
            <p className="text-xs text-muted-foreground">Top products by units sold</p>
          </div>
        </div>

        {insights.mostSold.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">No items sold yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.mostSold.map((item, index) => {
              const topUnits = insights.mostSold[0]?.units || 1
              const width = Math.max((item.units / topUnits) * 100, 8)

              return (
                <div key={item.productId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {item.units}
                      </p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">units</p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue: {formatCedi(item.revenue)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
