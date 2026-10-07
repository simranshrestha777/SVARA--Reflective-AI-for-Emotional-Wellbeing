import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    region: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed.'
        )
      }

      setSuccess(
        'Your Svara account has been created.'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      setError(err.message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          Svara
        </div>

        <p className="auth-eyebrow">
          Begin your journey
        </p>

        <h1>A space that's yours.</h1>

        <p className="auth-description">
          Create your Svara account and begin
          building a space where you can come
          exactly as you are.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>
            Your name

            <input
              name="name"
              type="text"
              placeholder="What should Svara call you?"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email

            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password

            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Country

            <input
              name="country"
              type="text"
              placeholder="e.g. Nepal"
              value={form.country}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Region / Province

            <input
              name="region"
              type="text"
              placeholder="e.g. Bagmati"
              value={form.region}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? 'Creating...'
              : 'Create my Svara'}
          </button>

        </form>

        {success && (
          <p className="success-message">
            {success}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <p className="auth-switch">
          Already have an account?{' '}

          <Link to="/login">
            Sign in
          </Link>
        </p>

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Svara
        </Link>

      </div>
    </main>
  )
}

export default Register