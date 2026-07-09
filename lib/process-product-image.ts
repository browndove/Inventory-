import {
  removeBackgroundFromFile,
  removeBackgroundFromUrl,
  toPngFileName,
} from '@/lib/remove-background'
import { storeInventoryImage } from '@/lib/store-inventory-image'

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function processUploadedImageFile(file: File) {
  const safeName = sanitizeFileName(file.name)
  const uniqueName = `${Date.now()}-${toPngFileName(safeName)}`
  const processed = await removeBackgroundFromFile(file, safeName)
  const url = await storeInventoryImage(processed, uniqueName)
  return url
}

export async function processImageFromUrl(imageUrl: string) {
  const processed = await removeBackgroundFromUrl(imageUrl)
  const uniqueName = `${Date.now()}-from-url.png`
  const url = await storeInventoryImage(processed, uniqueName)
  return url
}
