import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { processUploadedImageFile } from '@/lib/process-product-image'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true

  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension === 'avif'
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!isAllowedImage(file)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP, GIF, and AVIF images are allowed' },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Image must be 5MB or smaller' },
      { status: 400 },
    )
  }

  try {
    const url = await processUploadedImageFile(file)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    const message =
      error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
