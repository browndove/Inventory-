const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

function getApiKey() {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) {
    throw new Error('REMOVE_BG_API_KEY is not configured')
  }
  return apiKey
}

async function callRemoveBg(formData: FormData) {
  const response = await fetch(REMOVE_BG_URL, {
    method: 'POST',
    headers: { 'X-Api-Key': getApiKey() },
    body: formData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      message || `Background removal failed (${response.status})`
    )
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
  formData.append('format', 'png')
  formData.append('image_file', file, fileName)
  return callRemoveBg(formData)
}

export async function removeBackgroundFromUrl(imageUrl: string) {
  const formData = new FormData()
  formData.append('size', 'auto')
  formData.append('type', 'product')
  formData.append('format', 'png')
  formData.append('image_url', imageUrl)
  return callRemoveBg(formData)
}

export function toPngFileName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.png`
}
