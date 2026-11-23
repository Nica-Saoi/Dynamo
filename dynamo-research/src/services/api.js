export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed')
  }

  return data
}

export async function getPaperFiles(paperId) {
  const response = await fetch(
    `/api/papers/${paperId}/files`
  )

  if (!response.ok) {
    throw new Error('Failed to retrieve files')
  }

  return response.json()
}