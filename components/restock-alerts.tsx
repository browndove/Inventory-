'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { restockProduct } from '@/app/actions/inventory'
import type { RestockAlert } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCedi } from '@/lib/utils'
import { LOW_STOCK_THRESHOLD } from '@/lib/inventory-constants'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RestockDialogProps {
  product: RestockAlert
  onOpenChange: (open: boolean) => void
  isDemo?: boolean
}

export function RestockDialog({
  product,
  onOpenChange,
  isDemo,
}: RestockDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [units, setUnits] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading) return
    setOpen(newOpen)
    onOpenChange(newOpen)
  }

  const parsedUnits = parseInt(units) || 0
  const restockCost = parsedUnits * product.costPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isDemo) {
      toast.message('Demo mode — restock is disabled')
      return
    }

    if (!parsedUnits || parsedUnits <= 0) {
      toast.error('Enter how many units to add')
      return
    }

    setIsLoading(true)
    try {
      await restockProduct(product.id, parsedUnits)
      toast.success(`Added ${parsedUnits} units to ${product.name}`)
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Restock error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to restock product'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock product</DialogTitle>
          <DialogDescription>
            Add units to{' '}
            <span className="font-medium text-foreground">{product.name}</span>.
            Currently {product.quantity}{' '}
            {product.quantity === 1 ? 'unit' : 'units'} in stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="restock-units">Units to add *</Label>
            <Input
              id="restock-units"
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="Enter quantity"
              autoFocus
              required
            />
          </div>

          {parsedUnits > 0 && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New stock level</span>
                <span className="tabular-nums text-foreground">
                  {product.quantity + parsedUnits} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restock cost</span>
                <span className="tabular-nums text-foreground">
                  {formatCedi(restockCost)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="text-sm text-foreground transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              Cancel
            </button>
            <Button
              type="submit"
              size="store"
              disabled={isLoading || parsedUnits <= 0}
              className="min-w-[65%] flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restocking...
                </>
              ) : (
                'Confirm restock'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface RestockAlertsProps {
  items: RestockAlert[]
  isDemo?: boolean
  compact?: boolean
}

export function RestockAlerts({
  items,
  isDemo,
  compact = false,
}: RestockAlertsProps) {
  const [restockProduct, setRestockProduct] = useState<RestockAlert | null>(
    null
  )

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All products are above {LOW_STOCK_THRESHOLD} units.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 py-6 first:border-0 first:pt-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.status === 'out' ? (
                  <span className="text-destructive">Out of stock</span>
                ) : (
                  <>
                    Low stock · {item.quantity}{' '}
                    {item.quantity === 1 ? 'unit' : 'units'} left
                  </>
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {!compact && (
                <p className="hidden text-right text-xs text-muted-foreground sm:block">
                  Cost {formatCedi(item.costPrice)}
                  <br />
                  Sell {formatCedi(item.sellingPrice)}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setRestockProduct(item)}
              >
                Restock
              </Button>
            </div>
          </div>
        ))}
      </div>

      {restockProduct && (
        <RestockDialog
          product={restockProduct}
          onOpenChange={(open) => !open && setRestockProduct(null)}
          isDemo={isDemo}
        />
      )}
    </>
  )
}
