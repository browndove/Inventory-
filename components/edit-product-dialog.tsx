'use client'

import { useEffect, useState } from 'react'
import { ProductForm } from './product-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditProductDialogProps {
  product: any
  onOpenChange: (open: boolean) => void
}

export function EditProductDialog({ product, onOpenChange }: EditProductDialogProps) {
  const [open, setOpen] = useState(true)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details and pricing
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onSuccess={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
