'use client'

import { useState } from 'react'
import { deleteProduct } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteProductDialogProps {
  product: any
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteProductDialog({
  product,
  onOpenChange,
  onDeleted,
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (isDeleting) return
    setOpen(newOpen)
    onOpenChange(newOpen)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProduct(product.id)
      toast.success('Product deleted')
      handleOpenChange(false)
      onDeleted()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{product.name}</span>?
            This will permanently remove the product and its sales history.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="text-sm text-foreground transition-opacity hover:opacity-60 disabled:opacity-40"
          >
            Cancel
          </button>
          <Button
            type="button"
            size="store"
            disabled={isDeleting}
            onClick={handleDelete}
            className="min-w-[65%] flex-1 bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
