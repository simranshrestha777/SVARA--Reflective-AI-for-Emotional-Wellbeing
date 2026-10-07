import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`

function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not load profile.'
        )
      }

      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    sessionStorage.removeItem('svara_token')
    navigate('/login')
  }

  if (loading) {
    return (
      <main className="profile-page">
        <p>Opening your profile...</p>
      </main>
    )
  }

  return (
    <main className="profile-page">

      <header className="profile-header">
        <button
          className="profile-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div>
          <p className="profile-eyebrow">
            Your account
          </p>

          <h1>
            Profile
          </h1>
        </div>
      </header>

      <section className="profile-content">

        {error && (
          <p className="profile-error">
            {error}
          </p>
        )}

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>
              {user?.name}
            </h2>

            <p>
              {user?.email}
            </p>
          </div>
        </div>

        <section className="profile-section">
          <h2>
            Your space
          </h2>

          <p>
            Everything you share with Svara is connected
            to your personal journey.
          </p>
        </section>

        <section className="profile-section">
          <h2>
            Account
          </h2>

          <div className="profile-details">
            <div className="profile-detail">
              <span>Name</span>
              <strong>{user?.name}</strong>
            </div>

            <div className="profile-detail">
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>
          </div>
        </section>

        <button
          className="profile-signout"
          onClick={signOut}
        >
          Sign out
        </button>

      </section>

    </main>
  )
}

export default Profile