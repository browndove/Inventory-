'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCedi } from '@/lib/utils'
import { SaleDialog } from './sale-dialog'
import { EditProductDialog } from './edit-product-dialog'
import { deleteProduct } from '@/app/actions/inventory'
import { toast } from 'sonner'

type ProductDetailViewProps = {
  product: any
  onBack: () => void
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-border/60 pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-base font-medium text-foreground">{title}</span>
        <span className="text-muted-foreground">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && <div className="mt-6 space-y-4">{children}</div>}
    </div>
  )
}

export function ProductDetailView({ product, onBack }: ProductDetailViewProps) {
  const [saleOpen, setSaleOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const costPrice = parseFloat(product.costPrice as any)
  const sellingPrice = parseFloat(product.sellingPrice as any)
  const quantity = product.quantity || 0
  const profitPerUnit = sellingPrice - costPrice
  const profitMargin =
    sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(1) : '0'
  const inStock = quantity > 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      toast.success('Product deleted')
      onBack()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-opacity hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr_0.8fr] lg:gap-8 xl:gap-16">
        {/* Left — details */}
        <div className="order-2 space-y-8 lg:order-1">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Inventory</p>
            <h1 className="text-3xl font-medium tracking-tight text-foreground lg:text-4xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>

          <AccordionSection title="Product information" defaultOpen>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="font-medium text-foreground">Cost price</dt>
                <dd className="mt-1 text-muted-foreground">{formatCedi(costPrice)}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Selling price</dt>
                <dd className="mt-1 text-muted-foreground">{formatCedi(sellingPrice)}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Quantity</dt>
                <dd className="mt-1 text-muted-foreground">{quantity} units</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Margin</dt>
                <dd className="mt-1 text-muted-foreground">{profitMargin}%</dd>
              </div>
            </dl>
          </AccordionSection>

          <AccordionSection title="Inventory value">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Total stock value at selling price:{' '}
              <span className="font-medium text-foreground">
                {formatCedi(sellingPrice * quantity)}
              </span>
              . Profit per unit:{' '}
              <span className="font-medium text-foreground">
                {formatCedi(profitPerUnit)}
              </span>
              .
            </p>
          </AccordionSection>
        </div>

        {/* Center — image */}
        <div className="order-1 lg:order-2">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">
            {product.imageUrl || product.imageFile ? (
              <Image
                src={product.imageUrl || product.imageFile}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/30">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div className="order-3 space-y-6 lg:pt-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-2xl font-normal tabular-nums text-foreground">
              {formatCedi(sellingPrice)}
            </p>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={() => setSaleOpen(true)}
            >
              Sell
            </Button>
          </div>

          {!inStock && (
            <p className="text-sm text-muted-foreground">Out of stock</p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto justify-start px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setEditOpen(true)}
            >
              Edit product
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto justify-start px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete product'}
            </Button>
          </div>
        </div>
      </div>

      {saleOpen && (
        <SaleDialog
          product={product}
          onOpenChange={(open) => !open && setSaleOpen(false)}
        />
      )}

      {editOpen && (
        <EditProductDialog
          product={product}
          onOpenChange={(open) => !open && setEditOpen(false)}
        />
      )}
    </>
  )
}
