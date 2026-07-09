import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { processImageFromUrl } from '@/lib/process-product-image'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { imageUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const imageUrl = body.imageUrl?.trim()
  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    const url = new URL(imageUrl)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
  }

  try {
    const url = await processImageFromUrl(imageUrl)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Process image error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to process image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
