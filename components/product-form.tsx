'use client'

import { useState } from 'react'
import { createProduct, updateProduct } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCedi } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ProductImage } from '@/components/product-image'
import { isProcessedInventoryImage } from '@/lib/remove-background'

interface ProductFormProps {
  product?: any
  onSuccess: () => void
}

async function processImageUrl(imageUrl: string) {
  const response = await fetch('/api/process-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to process image URL')
  }

  return data.url as string
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    costPrice: product?.costPrice || '',
    sellingPrice: product?.sellingPrice || '',
    quantity: product?.quantity ?? '',
    imageUrl: product?.imageUrl || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string>(
    product?.imageFile || product?.imageUrl || ''
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error ?? 'Upload failed')
      }

      setUploadedImage(data.url)
      setFormData((prev) => ({ ...prev, imageUrl: '' }))
      toast.success('Image uploaded with background removed')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessImageUrl = async () => {
    const imageUrl = formData.imageUrl.trim()
    if (!imageUrl) return

    setIsProcessingUrl(true)
    try {
      const url = await processImageUrl(imageUrl)
      setUploadedImage(url)
      setFormData((prev) => ({ ...prev, imageUrl: '' }))
      toast.success('Image processed with background removed')
    } catch (error) {
      console.error('Process URL error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to process image URL'
      )
    } finally {
      setIsProcessingUrl(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalImage = uploadedImage

      if (!finalImage && formData.imageUrl.trim()) {
        finalImage = await processImageUrl(formData.imageUrl.trim())
        setUploadedImage(finalImage)
        setFormData((prev) => ({ ...prev, imageUrl: '' }))
      }

      if (
        finalImage &&
        finalImage.startsWith('http') &&
        !isProcessedInventoryImage(finalImage)
      ) {
        finalImage = await processImageUrl(finalImage)
        setUploadedImage(finalImage)
      }

      const data = {
        name: formData.name,
        description: formData.description || undefined,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.quantity),
        imageUrl: null,
        imageFile: finalImage || null,
      }

      if (
        !data.name ||
        Number.isNaN(data.costPrice) ||
        Number.isNaN(data.sellingPrice) ||
        Number.isNaN(data.quantity)
      ) {
        toast.error('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      if (data.costPrice < 0 || data.sellingPrice < 0) {
        toast.error('Prices cannot be negative')
        setIsLoading(false)
        return
      }

      if (data.quantity < 0) {
        toast.error('Quantity cannot be negative')
        setIsLoading(false)
        return
      }

      if (product) {
        await updateProduct(product.id, data)
        toast.success('Product updated successfully')
      } else {
        await createProduct(data)
        toast.success('Product added successfully')
      }

      onSuccess()
    } catch (error) {
      console.error('Form error:', error)
      toast.error(product ? 'Failed to update product' : 'Failed to add product')
    } finally {
      setIsLoading(false)
    }
  }

  const cost = parseFloat(formData.costPrice)
  const sell = parseFloat(formData.sellingPrice)
  const hasPrices = formData.costPrice !== '' && formData.sellingPrice !== ''
  const profitPerUnit = hasPrices && !Number.isNaN(cost) && !Number.isNaN(sell) ? sell - cost : 0
  const margin =
    hasPrices && sell > 0
      ? (((sell - cost) / sell) * 100).toFixed(1)
      : '0'

  const imageBusy = isUploading || isProcessingUrl

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Industrial Drill"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Product details..."
          className="min-h-24 resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price *</Label>
          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            disabled={imageBusy}
          />
          <Button
            type="button"
            variant="outline"
            disabled={imageBusy || !formData.imageUrl.trim()}
            onClick={handleProcessImageUrl}
          >
            {isProcessingUrl ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Process'
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Background is removed automatically for uploads and image links.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Upload Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={imageBusy}
            onChange={handleImageUpload}
            className="file:mr-3 file:text-sm file:font-normal file:text-foreground"
          />
          {isUploading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>
        {uploadedImage && (
          <div className="space-y-2">
            <div className="relative aspect-square w-32 overflow-hidden rounded-lg bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
              <ProductImage
                src={uploadedImage}
                alt="Product preview"
                className="object-contain"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isProcessedInventoryImage(uploadedImage)
                ? 'Background removed'
                : 'Will remove background on save'}
            </p>
          </div>
        )}
      </div>

      {hasPrices && !Number.isNaN(cost) && !Number.isNaN(sell) && (
        <div className="rounded-[var(--radius-lg)] bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Profit per unit</p>
          <p
            className={`mt-1 text-xl font-semibold ${
              profitPerUnit >= 0 ? 'text-green-600' : 'text-destructive'
            }`}
          >
            {formatCedi(profitPerUnit)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Margin: {margin}%</p>
        </div>
      )}

      <Button
        type="submit"
        size="store"
        disabled={isLoading || imageBusy}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {product ? 'Updating...' : 'Adding...'}
          </>
        ) : product ? (
          'Update Product'
        ) : (
          'Add Product'
        )}
      </Button>
    </form>
  )
}
