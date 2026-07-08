import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CEDI_SYMBOL = '₵'

export function formatCedi(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
) {
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2
  const minimumFractionDigits = Math.min(
    options?.minimumFractionDigits ?? maximumFractionDigits,
    maximumFractionDigits,
  )

  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return `${CEDI_SYMBOL}${formatted}`
}
