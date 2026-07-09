'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductImage, getProductImageSrc } from '@/components/product-image'
import { useMemo, useState } from 'react'
import { ProductDetailView } from './product-detail-view'
import { SaleDialog } from './sale-dialog'

export function ProductsList({ products }: { products: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [saleProduct, setSaleProduct] = useState<any>(null)
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

  if (selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">No products yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use Menu → Add product to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="relative max-w-sm">
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
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const inStock = (product.quantity || 0) > 0

            return (
              <article key={product.id} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="group block w-full text-left transition-opacity hover:opacity-80"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">
                    <ProductImage
                      src={getProductImageSrc(product)}
                      alt={product.name}
                      containerClassName="absolute inset-0"
                    />
                  </div>
                </button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="min-w-0 truncate text-left text-sm text-foreground transition-opacity hover:opacity-70"
                  >
                    {product.name}
                  </button>
                  <Button
                    size="sm"
                    disabled={!inStock}
                    onClick={() => setSaleProduct(product)}
                  >
                    Sell
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {saleProduct && (
        <SaleDialog
          product={saleProduct}
          onOpenChange={(open) => !open && setSaleProduct(null)}
        />
      )}
    </div>
  )
}
