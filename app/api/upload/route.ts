import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

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

  const safeName = sanitizeFileName(file.name)
  const uniqueName = `${Date.now()}-${safeName}`

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`${session.user.id}/${uniqueName}`, file, {
        access: 'public',
      })

      return NextResponse.json({ url: blob.url })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.id)
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/${session.user.id}/${uniqueName}`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
