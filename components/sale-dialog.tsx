'use client'

import { useState } from 'react'
import { recordSale } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCedi } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SaleDialogProps {
  product: any
  onOpenChange: (open: boolean) => void
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm leading-relaxed">
      <span
        className={
          highlight
            ? 'font-semibold text-green-600'
            : bold
              ? 'font-medium text-foreground'
              : 'text-muted-foreground'
        }
      >
        {label}
      </span>
      <span
        className={
          highlight
            ? 'font-semibold text-green-600'
            : bold
              ? 'font-medium text-foreground'
              : 'text-foreground'
        }
      >
        {value}
      </span>
    </div>
  )
}

export function SaleDialog({ product, onOpenChange }: SaleDialogProps) {
  const [open, setOpen] = useState(true)
  const [quantity, setQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange(newOpen)
  }

  const sellingPrice = parseFloat(product.sellingPrice as any)
  const costPrice = parseFloat(product.costPrice as any)
  const available = product.quantity || 0
  const qty = parseInt(quantity) || 0
  const exceedsAvailable = qty > available
  const canSell = qty > 0 && !exceedsAvailable
  const totalAmount = qty * sellingPrice
  const costAmount = qty * costPrice
  const profit = totalAmount - costAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const parsedQty = parseInt(quantity)

      if (!parsedQty || parsedQty <= 0) {
        toast.error('Please enter a valid quantity')
        setIsLoading(false)
        return
      }

      if (parsedQty > (product.quantity || 0)) {
        toast.error(`Not enough inventory. Available: ${product.quantity}`)
        setIsLoading(false)
        return
      }

      await recordSale({
        productId: product.id,
        quantitySold: parsedQty,
      })

      toast.success(`Sale recorded! Profit: ${formatCedi(profit)}`)
      handleOpenChange(false)
    } catch (error) {
      console.error('Sale error:', error)
      toast.error('Failed to record sale')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <div className="flex items-baseline justify-between gap-6 pt-1">
            <DialogDescription className="min-w-0 truncate">
              {product.name}
            </DialogDescription>
            <p className="shrink-0 text-sm text-muted-foreground">
              Selling Price: {formatCedi(sellingPrice)}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Sell *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.quantity || 0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              autoFocus
              required
            />
            <p
              className={`text-xs ${
                exceedsAvailable ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              Available: {available} units
              {exceedsAvailable && ' — quantity exceeds stock'}
            </p>
          </div>

          <div className="space-y-3">
            <SummaryRow label="Quantity:" value={String(qty)} />
            <SummaryRow label="Selling Price:" value={formatCedi(sellingPrice)} />
            <SummaryRow label="Total Revenue:" value={formatCedi(totalAmount)} bold />
            <SummaryRow label="Cost:" value={formatCedi(costAmount)} />
            <SummaryRow
              label="Total Profit:"
              value={formatCedi(profit)}
              highlight
            />
          </div>

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
              disabled={isLoading || !canSell}
              className="min-w-[65%] flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Sale'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
