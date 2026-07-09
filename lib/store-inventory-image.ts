import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

function isProduction() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
}

export async function storeInventoryImage(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  if (isProduction() && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Image storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel.'
    )
  }

  const blobPath = `inventory/${fileName}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: 'image/png',
    })
    return blob.url
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'inventory')
  await mkdir(uploadDir, { recursive: true })
  const filePath = join(uploadDir, fileName)
  await writeFile(filePath, buffer)
  return `/uploads/inventory/${fileName}`
}
