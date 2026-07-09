'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductForm } from './product-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AddProductDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function AddProductDialog({
  open: controlledOpen,
  onOpenChange,
  showTrigger = false,
}: AddProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            Create a new product entry for your inventory
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
