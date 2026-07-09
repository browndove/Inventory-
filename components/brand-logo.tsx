import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/dilitrust-word-logo.png'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  linkTo?: string | null
  priority?: boolean
}

export function BrandLogo({
  className,
  imageClassName,
  linkTo = '/dashboard',
  priority = false,
}: BrandLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="DILITRUST"
      width={220}
      height={56}
      priority={priority}
      className={cn('h-8 w-auto object-contain object-left sm:h-9', imageClassName)}
    />
  )

  if (!linkTo) {
    return <div className={cn('inline-flex shrink-0', className)}>{image}</div>
  }

  return (
    <Link href={linkTo} className={cn('inline-flex shrink-0', className)}>
      {image}
    </Link>
  )
}
