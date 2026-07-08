'use client'

import Image from 'next/image'
import { Edit2, Trash2, ShoppingCart, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProduct, recordSale } from '@/app/actions/inventory'
import { EditProductDialog } from './edit-product-dialog'
import { SaleDialog } from './sale-dialog'
import { useMemo, useState } from 'react'
import { formatCedi } from '@/lib/utils'
import { toast } from 'sonner'

export function ProductsList({ products }: { products: any[] }) {
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [saleProduct, setSaleProduct] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => {
      const name = (product.name ?? '').toLowerCase()
      const description = (product.description ?? '').toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }, [products, searchQuery])

  const handleDelete = async (id: number) => {
    setIsDeleting(id)
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(null)
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-12">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">No products yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Add your first product to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9 pr-9"
          aria-label="Search products"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-12">
          <Search className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">No products found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different search term
          </p>
        </div>
      ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => {
        const costPrice = parseFloat(product.costPrice as any)
        const sellingPrice = parseFloat(product.sellingPrice as any)
        const profitPerUnit = sellingPrice - costPrice
        const profitMargin = sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(1) : 0
        const totalValue = sellingPrice * (product.quantity || 0)

        return (
          <div
            key={product.id}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              {product.imageUrl || product.imageFile ? (
                <Image
                  src={product.imageUrl || product.imageFile}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="truncate text-base font-bold text-foreground">{product.name}</h3>
              
              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
              )}

              {/* Prices */}
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Price</p>
                    <p className="text-2xl font-light tracking-tight text-foreground">{formatCedi(sellingPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Cost</p>
                    <p className="text-sm text-muted-foreground line-through">{formatCedi(costPrice)}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Qty</p>
                    <p className="text-lg font-light text-foreground">{product.quantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Margin</p>
                    <p className="text-lg font-light text-foreground">{profitMargin}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Value</p>
                    <p className="text-lg font-light text-foreground">{formatCedi(totalValue)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSaleProduct(product)}
                  className="flex-1 gap-1.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Sell</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingProduct(product)}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting === product.id}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
      )}

      {/* Edit Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}

      {/* Sale Dialog */}
      {saleProduct && (
        <SaleDialog
          product={saleProduct}
          onOpenChange={(open) => !open && setSaleProduct(null)}
        />
      )}
    </div>
  )
}
