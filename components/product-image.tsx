'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  containerClassName?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  containerClassName,
  priority,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center text-sm text-muted-foreground/40',
          containerClassName,
          className
        )}
      >
        No image
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        'h-full w-full object-contain object-center',
        containerClassName,
        className
      )}
    />
  )
}

export function getProductImageSrc(product: {
  imageUrl?: string | null
  imageFile?: string | null
}) {
  return product.imageUrl || product.imageFile || null
}
