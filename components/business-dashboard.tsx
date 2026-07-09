'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCedi } from '@/lib/utils'
import { CHART_COLORS, chartAxisStyle, chartGridStyle } from '@/lib/chart-styles'
import { RestockAlerts } from '@/components/restock-alerts'
import type { RestockAlert } from '@/app/actions/inventory'
import { LOW_STOCK_THRESHOLD } from '@/lib/inventory-constants'

type TrendPoint = {
  label: string
  dateLabel: string
  revenue: number
  profit: number
  units: number
}

type TopProduct = {
  productId: number
  name: string
  units: number
  revenue: number
}

type SaleRecord = {
  id: number
  productId: number
  productName: string
  quantitySold: number
  totalAmount: string | number
  costAmount: string | number
  createdAt: Date | string
}

type InventoryStats = {
  totalProducts: number
  totalQuantity: number
  totalCostValue: number
  totalInventoryValue: number
  totalProfit: number
  totalSalesRecords: number
}

type BusinessInsights = {
  trend: TrendPoint[]
  mostSold: TopProduct[]
  totalSales: number
  totalRevenue: number
  totalProfit: number
  totalUnits: number
}

interface BusinessDashboardProps {
  stats: InventoryStats
  insights: BusinessInsights
  salesHistory: SaleRecord[]
  restockAlerts: RestockAlert[]
  isDemo?: boolean
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="tabular-nums opacity-90">
          {entry.name}: {formatCedi(entry.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

function UnitsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="tabular-nums opacity-90">{payload[0]?.value ?? 0} units</p>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest">
        {label}
      </p>
      <p className="mt-1.5 truncate text-lg font-semibold tabular-nums tracking-tight text-foreground sm:mt-2 sm:text-2xl lg:text-3xl">
        {value}
      </p>
    </div>
  )
}

function formatSaleDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function BusinessDashboard({
  stats,
  insights,
  salesHistory,
  restockAlerts,
  isDemo,
}: BusinessDashboardProps) {
  const hasSales = insights.totalSales > 0
  const profitMargin =
    insights.totalRevenue > 0
      ? ((insights.totalProfit / insights.totalRevenue) * 100).toFixed(1)
      : '0'

  const topProductsChart = insights.mostSold.map((item) => ({
    name:
      item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
    fullName: item.name,
    revenue: item.revenue,
    units: item.units,
  }))

  const metrics = [
    { label: 'Total revenue', value: formatCedi(insights.totalRevenue) },
    { label: 'Total profit', value: formatCedi(insights.totalProfit) },
    { label: 'Profit margin', value: `${profitMargin}%` },
    { label: 'Inventory value', value: formatCedi(stats.totalInventoryValue) },
  ]

  return (
    <div className="space-y-16">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Business</p>
        <h2 className="text-3xl font-medium tracking-tight text-foreground">
          Sales & performance
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Needs restock
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Products at {LOW_STOCK_THRESHOLD} units or fewer
            </p>
          </div>
          {restockAlerts.length > 0 && (
            <p className="text-sm tabular-nums text-muted-foreground">
              {restockAlerts.length}{' '}
              {restockAlerts.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        <RestockAlerts items={restockAlerts} isDemo={isDemo} />
      </section>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <section className="space-y-8">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Revenue & profit
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Last 7 days</p>
          </div>

          {!hasSales ? (
            <p className="text-sm text-muted-foreground">No sales recorded yet</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={insights.trend}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...chartGridStyle} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    tickFormatter={(value) =>
                      value >= 1000 ? `₵${(value / 1000).toFixed(0)}k` : `₵${value}`
                    }
                    width={48}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART_COLORS.foreground}
                    fill={CHART_COLORS.fill}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke={CHART_COLORS.secondary}
                    fill="transparent"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <h3 className="text-base font-medium text-foreground">Units sold</h3>
            <p className="mt-1 text-sm text-muted-foreground">Daily volume</p>
          </div>

          {!hasSales ? (
            <p className="text-sm text-muted-foreground">No sales recorded yet</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.trend}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...chartGridStyle} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip content={<UnitsTooltip />} />
                  <Bar
                    dataKey="units"
                    fill={CHART_COLORS.foreground}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="space-y-8">
        <div>
          <h3 className="text-base font-medium text-foreground">Top products</h3>
          <p className="mt-1 text-sm text-muted-foreground">By revenue</p>
        </div>

        {topProductsChart.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products sold yet</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsChart}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  {...chartGridStyle}
                  horizontal={false}
                  vertical
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={chartAxisStyle}
                  tickFormatter={(value) => formatCedi(value)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={chartAxisStyle}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0]?.payload as {
                      fullName: string
                      revenue: number
                      units: number
                    }
                    return (
                      <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg">
                        <p className="mb-1 font-medium">{item.fullName}</p>
                        <p className="tabular-nums opacity-90">
                          {formatCedi(item.revenue)} · {item.units} units
                        </p>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill={CHART_COLORS.foreground}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Recent sales
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest transactions across inventory
            </p>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {stats.totalSalesRecords} total · {stats.totalQuantity} units in stock
          </p>
        </div>

        {salesHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales recorded yet</p>
        ) : (
          <div className="space-y-0">
            {salesHistory.map((sale) => {
              const revenue = parseFloat(String(sale.totalAmount))
              const cost = parseFloat(String(sale.costAmount))
              const profit = revenue - cost

              return (
                <div
                  key={sale.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-border/60 py-6 first:border-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {sale.productName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatSaleDate(sale.createdAt)} · {sale.quantitySold}{' '}
                      {sale.quantitySold === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="mt-1 text-sm tabular-nums text-foreground">
                        {formatCedi(revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit</p>
                      <p
                        className={`mt-1 text-sm tabular-nums ${
                          profit >= 0 ? 'text-foreground' : 'text-destructive'
                        }`}
                      >
                        {formatCedi(profit)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
