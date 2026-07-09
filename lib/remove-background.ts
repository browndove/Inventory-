const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

function getApiKey() {
  const apiKey = process.env.REMOVE_BG_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'Background removal is not configured. Add REMOVE_BG_API_KEY to your environment.'
    )
  }
  return apiKey
}

async function parseRemoveBgError(response: Response) {
  const text = await response.text()
  try {
    const json = JSON.parse(text) as {
      errors?: Array<{ title?: string; code?: string }>
    }
    const title = json.errors?.[0]?.title
    if (title) return title
  } catch {
    // not JSON
  }
  return text || `Background removal failed (${response.status})`
}

async function callRemoveBg(formData: FormData) {
  const response = await fetch(REMOVE_BG_URL, {
    method: 'POST',
    headers: { 'X-Api-Key': getApiKey() },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseRemoveBgError(response))
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function removeBackgroundFromFile(
  file: File | Blob,
  fileName: string
) {
  const formData = new FormData()
  formData.append('size', 'auto')
  formData.append('type', 'product')
  formData.append('image_file', file, fileName)
  return callRemoveBg(formData)
}

export async function removeBackgroundFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl, {
    headers: {
      Accept: 'image/*,*/*',
      'User-Agent': 'Mozilla/5.0 (compatible; SmartInventory/1.0)',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Could not download image from URL (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    throw new Error('URL does not point to a valid image')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length === 0) {
    throw new Error('Downloaded image is empty')
  }

  const extension =
    contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
        ? 'webp'
        : contentType.includes('gif')
          ? 'gif'
          : 'jpg'

  const blob = new Blob([buffer], { type: contentType })
  return removeBackgroundFromFile(blob, `source.${extension}`)
}

export function toPngFileName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.png`
}

export function isProcessedInventoryImage(url: string) {
  return (
    url.includes('blob.vercel-storage.com') ||
    url.includes('/uploads/inventory/')
  )
}
