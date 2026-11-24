export async function uploadFile(file) {
    const formData = new FormData()

    formData.append('file', file)

    const response = await fetch('/api/files', {
        method: 'POST',
        credentials: 'include',
        body: formData
    })

    const data = await response.json()

    if (!response.ok) {
        const error = new Error(
            data.error || 'Upload failed'
        )

        error.status = response.status

        throw error
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

async function authRequest(endpoint, method, body) {

    const response = await fetch(`/api/auth/${endpoint}`, {
        method,
        credentials: 'include',

        headers: {
            'Content-Type': 'application/json'
        },

        ...(body ? {
            body: JSON.stringify(body)
        } : {})
    })

    const data = await response.json()

    if (!response.ok) {
        const error = new Error(
            data.error || 'Request failed'
        );

        error.status = response.status;

        throw error;
    }

    return data
}

export function registerUser(username, email, password) {

    return authRequest('register', 'POST', {
        username,
        email,
        password
    })
}

export function loginUser(email, password) {

    return authRequest('login', 'POST', {
        email,
        password
    })
}

export function logoutUser() {

    return authRequest('logout', 'POST')
}

export function getCurrentUser() {

    return authRequest('me', 'GET')
}