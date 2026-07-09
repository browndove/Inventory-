import { cn } from '@/lib/utils'

export function ProductImageOverlays({
  price,
  outOfStock = false,
  className,
}: {
  price: string
  outOfStock?: boolean
  className?: string
}) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-10', className)}
    >
      <div className="absolute left-3 top-3 rounded-lg bg-background/75 px-2.5 py-1.5 backdrop-blur-[1px]">
        <p
          className={cn(
            'text-xs tabular-nums',
            outOfStock ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {price}
        </p>
      </div>
      {outOfStock && (
        <div className="absolute inset-x-0 bottom-0 bg-background/75 px-3 py-2.5 text-center backdrop-blur-[1px]">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Out of stock
          </p>
        </div>
      )}
    </div>
  )
}
