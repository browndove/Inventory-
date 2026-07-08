'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { ProductsList } from '@/components/products-list'
import { InventoryStats } from '@/components/inventory-stats'
import { AddProductDialog } from '@/components/add-product-dialog'
import { formatCedi } from '@/lib/utils'

// Demo stats
const demoStats = {
  totalProducts: 5,
  totalQuantity: 510,
  totalCostValue: 9899.91,
  totalInventoryValue: 10945.56,
  totalProfit: 1045.65,
  totalSalesRecords: 4,
}

// Mock demo products
const demoProducts = [
  {
    id: 1,
    userId: 'demo',
    name: 'Wireless Headphones',
    description: 'High-quality noise-cancelling headphones',
    costPrice: '35.00',
    sellingPrice: '99.99',
    quantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 'demo',
    name: 'USB-C Cable (2m)',
    description: 'Durable fast charging cable',
    costPrice: '2.50',
    sellingPrice: '12.99',
    quantity: 150,
    imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 'demo',
    name: 'Portable Speaker',
    description: 'Waterproof Bluetooth speaker',
    costPrice: '15.00',
    sellingPrice: '49.99',
    quantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    userId: 'demo',
    name: 'Phone Stand',
    description: 'Adjustable metal phone stand',
    costPrice: '4.00',
    sellingPrice: '15.99',
    quantity: 87,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    userId: 'demo',
    name: 'Screen Protector Pack',
    description: 'Tempered glass pack (5pcs)',
    costPrice: '8.00',
    sellingPrice: '19.99',
    quantity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1616763355603-9755a640a2a9?w=300&h=300&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Package, DollarSign, TrendingUpIcon, Boxes } from 'lucide-react'
import dynamic from 'next/dynamic'

const SaleDialog = dynamic(() => import('@/components/sale-dialog').then(mod => ({ default: mod.SaleDialog })), {
  ssr: false,
})

export default function DemoPage() {
  const [selectedProductForSale, setSelectedProductForSale] = useState<any>(null)
  const [showSaleDialog, setShowSaleDialog] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={{
          id: 'demo',
          name: 'Demo Admin',
          email: 'demo@inventory.local',
          image: null,
        }}
        isDemo
      />

      <main className="space-y-12">
        {/* Key Metrics Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Overview</h2>
              <p className="mt-2 text-muted-foreground">Real-time inventory metrics</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Inventory Value', value: formatCedi(demoStats.totalInventoryValue), Icon: Package },
                { label: 'Total Cost', value: formatCedi(demoStats.totalCostValue), Icon: DollarSign },
                { label: 'Total Profit', value: formatCedi(demoStats.totalProfit), Icon: TrendingUpIcon, highlight: true },
                { label: 'Items in Stock', value: demoStats.totalQuantity.toLocaleString(), Icon: Boxes },
              ].map((metric, idx) => {
                const MetricIcon = metric.Icon
                return (
                  <div
                    key={idx}
                    className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      metric.highlight
                        ? 'border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10'
                        : 'border-border/40 bg-card/30 hover:border-border/80 hover:bg-card/60'
                    } p-6 backdrop-blur-sm`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                        <MetricIcon className={`h-5 w-5 ${metric.highlight ? 'text-primary' : 'text-muted-foreground/60'}`} />
                      </div>
                      <p className={`text-3xl font-bold ${metric.highlight ? 'text-primary' : 'text-foreground'}`}>
                        {metric.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Equipment</h2>
                <p className="mt-2 text-muted-foreground">{demoStats.totalProducts} products in inventory</p>
              </div>
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoProducts.map((product) => {
                const costPrice = parseFloat(product.costPrice.toString())
                const sellingPrice = parseFloat(product.sellingPrice.toString())
                const profitPerUnit = sellingPrice - costPrice
                const profitMargin = sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(1) : '0'
                const totalValue = costPrice * product.quantity

                return (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden bg-muted sm:h-48">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Content */}
                    <div className="space-y-5 p-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2 border-t border-border/40 pt-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Price</span>
                          <span className="text-2xl font-bold text-foreground">{formatCedi(sellingPrice)}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Cost</span>
                          <span className="text-xs line-through text-muted-foreground">{formatCedi(costPrice)}</span>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</p>
                          <p className="text-xl font-bold text-foreground">{product.quantity}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margin</p>
                          <p className="text-xl font-bold text-primary">{profitMargin}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</p>
                          <p className="text-sm font-bold text-foreground">{formatCedi(totalValue, { maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 border-t border-border/40 pt-4">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => {
                            setSelectedProductForSale(product)
                            setShowSaleDialog(true)
                          }}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="hidden sm:inline">Record Sale</span>
                          <span className="sm:hidden">Sale</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Sale Dialog */}
      {showSaleDialog && selectedProductForSale && (
        <SaleDialog
          product={selectedProductForSale}
          onOpenChange={(open) => {
            if (!open) setShowSaleDialog(false)
          }}
        />
      )}
    </div>
  )
}
