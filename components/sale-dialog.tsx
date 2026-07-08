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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SaleDialogProps {
  product: any
  onOpenChange: (open: boolean) => void
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
  const qty = parseInt(quantity) || 0
  const totalAmount = qty * sellingPrice
  const costAmount = qty * costPrice
  const profit = totalAmount - costAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const qty = parseInt(quantity)

      if (!qty || qty <= 0) {
        toast.error('Please enter a valid quantity')
        setIsLoading(false)
        return
      }

      if (qty > (product.quantity || 0)) {
        toast.error(`Not enough inventory. Available: ${product.quantity}`)
        setIsLoading(false)
        return
      }

      await recordSale({
        productId: product.id,
        quantitySold: qty,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            {product.name} - Selling Price: {formatCedi(sellingPrice)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity to Sell *
            </Label>
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
            <p className="text-xs text-muted-foreground">
              Available: {product.quantity || 0} units
            </p>
          </div>

          {/* Sale Summary */}
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{qty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selling Price:</span>
              <span className="font-medium">{formatCedi(sellingPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-2 text-sm font-medium">
              <span>Total Revenue:</span>
              <span>{formatCedi(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium">{formatCedi(costAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-green-200 dark:border-green-900/30 pt-2 text-sm font-bold">
              <span className="text-green-600 dark:text-green-400">Total Profit:</span>
              <span className="text-green-600 dark:text-green-400">{formatCedi(profit)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !quantity} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Sale'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
