const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`

export async function getCurrentUser() {
  const token = sessionStorage.getItem('svara_token')

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Authentication failed')
  }

  return response.json()
}


export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('svara_token')

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    throw new Error(
      errorData.detail || 'Request failed'
    )
  }

  return response.json()
}