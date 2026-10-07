import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`

function AdminDashboard() {
  const navigate = useNavigate()

  const [overview, setOverview] = useState(null)
  const [countries, setCountries] = useState([])
  const [regions, setRegions] = useState([])
  const [riskLevels, setRiskLevels] = useState([])
  const [highRiskEvents, setHighRiskEvents] = useState([])
  const [adminNote, setAdminNote] = useState({})
  const [updatingEvent, setUpdatingEvent] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [
        overviewResponse,
        countriesResponse,
        regionsResponse,
        riskLevelsResponse,
        highRiskResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/analytics/overview`, { headers }),
        fetch(`${API_URL}/admin/analytics/countries`, { headers }),
        fetch(`${API_URL}/admin/analytics/regions`, { headers }),
        fetch(`${API_URL}/admin/analytics/risk-levels`, { headers }),
        fetch(`${API_URL}/admin/safety-events/high-risk`, { headers }),
      ])

      const responses = [
        overviewResponse,
        countriesResponse,
        regionsResponse,
        riskLevelsResponse,
        highRiskResponse,
      ]

      for (const response of responses) {
        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem('svara_token')
            navigate('/login')
            return
          }

          if (response.status === 403) {
            throw new Error(
              'You do not have permission to access the admin dashboard.'
            )
          }

          throw new Error('Could not load admin data.')
        }
      }

      const [
        overviewData,
        countriesData,
        regionsData,
        riskLevelsData,
        highRiskData,
      ] = await Promise.all([
        overviewResponse.json(),
        countriesResponse.json(),
        regionsResponse.json(),
        riskLevelsResponse.json(),
        highRiskResponse.json(),
      ])

      setOverview(overviewData)
      setCountries(countriesData)
      setRegions(regionsData)
      setRiskLevels(riskLevelsData)
      setHighRiskEvents(highRiskData)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateSafetyEvent(eventId, status) {
    try {
      setUpdatingEvent(eventId)

      const token = sessionStorage.getItem('svara_token')
      const note = adminNote[eventId] || ''

      const params = new URLSearchParams({
        status,
      })

      if (note.trim()) {
        params.append('admin_note', note.trim())
      }

      const response = await fetch(
        `${API_URL}/admin/safety-events/${eventId}?${params.toString()}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update safety event.')
      }

      await loadAdminData()

      setAdminNote((previous) => {
     const next = { ...previous }
     delete next[eventId]
     return next
   })
    } catch (error) {
      console.error(error)
      alert('Could not update this safety alert.')
    } finally {
      setUpdatingEvent(null)
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return 'Unknown'
    }

    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          Loading safety dashboard...
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">

      <header className="admin-header">

        <div>
          <p className="admin-eyebrow">
            Svara Administration
          </p>

          <h1>
            Safety & Insights
          </h1>

          <p>
            Monitor anonymized safety patterns
            across the Svara community.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-refresh-button"
            onClick={loadAdminData}
          >
            Refresh
          </button>

          <button
            className="admin-back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
        </div>

      </header>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {!error && overview && (
        <>

          {/* OVERVIEW */}

          <section className="admin-overview-grid">

            <div className="admin-stat-card">
              <p>Total users</p>
              <h2>{overview.total_users}</h2>
            </div>

            <div className="admin-stat-card">
              <p>Safety events</p>
              <h2>{overview.total_safety_events}</h2>
            </div>

            <div className="admin-stat-card high-risk">
              <p>High-risk alerts</p>
              <h2>{overview.high_risk_events}</h2>
            </div>

            <div className="admin-stat-card">
              <p>Medium-risk events</p>
              <h2>{overview.medium_risk_events}</h2>
            </div>

          </section>

          {/* HIGH RISK ALERTS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <div>
                <p className="admin-section-eyebrow">
                  Safety monitoring
                </p>

                <h2>High-risk alerts</h2>
              </div>

              <span className="admin-count-badge">
                {highRiskEvents.length}
              </span>
            </div>

            {highRiskEvents.length === 0 ? (
              <p className="admin-empty">
                No high-risk safety alerts.
              </p>
            ) : (
              highRiskEvents.map((event) => (
                <div
                  key={event.id}
                  className={`admin-alert-card ${event.status || 'new'}`}
                >
                  <div className="admin-alert-header">
                    <div>
                      <h3>
                        {event.category || 'Safety Alert'}
                      </h3>

                      <p className="admin-alert-location">
                        {event.country || 'Unknown country'}
                        {event.region && ` · ${event.region}`}
                      </p>
                    </div>

                    <span
                      className={`admin-status-badge ${
                        event.status || 'new'
                      }`}
                    >
                      {event.status || 'new'}
                    </span>
                  </div>

                  <div className="admin-alert-details">
                    <p>
                      <strong>Risk:</strong> {event.risk_level}
                    </p>

                    <p>
                      <strong>Detected phrase:</strong>{' '}
                      {event.matched_phrase || 'Not available'}
                    </p>

                    <p>
                      <strong>Detected:</strong>{' '}
                      {new Date(event.created_at).toLocaleString()}
                    </p>

                    {event.reviewed_at && (
                      <p>
                        <strong>Reviewed:</strong>{' '}
                        {new Date(event.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="admin-alert-note">
                    <label>Admin note</label>

                    <textarea
                      value={adminNote[event.id] ?? event.admin_note ?? ''}
                      onChange={(e) =>
                        setAdminNote((previous) => ({
                          ...previous,
                          [event.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a note about this alert..."
                      rows="2"
                    />
                  </div>

                  <div className="admin-alert-actions">
                    <button
                      className="review-alert-button"
                      onClick={() =>
                        updateSafetyEvent(event.id, 'reviewed')
                      }
                      disabled={updatingEvent === event.id}
                    >
                      Mark Reviewed
                    </button>

                    <button
                      className="escalate-alert-button"
                      onClick={() =>
                        updateSafetyEvent(event.id, 'escalated')
                      }
                      disabled={updatingEvent === event.id}
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              ))
            )}

          </section>

          {/* RISK LEVEL ANALYTICS */}

          <section className="admin-section">

            <p className="admin-section-eyebrow">
              Analytics
            </p>

            <h2>Safety events by risk level</h2>

            <div className="analytics-list">
              {riskLevels.map((item) => (
                <div
                  className="analytics-row"
                  key={item.risk_level}
                >
                  <span>{item.risk_level}</span>
                  <strong>{item.event_count}</strong>
                </div>
              ))}
            </div>

          </section>

          {/* COUNTRY ANALYTICS */}

          <section className="admin-section">

            <p className="admin-section-eyebrow">
              Global patterns
            </p>

            <h2>Safety events by country</h2>

            {countries.length === 0 ? (
              <div className="admin-empty-state">
                No country data available yet.
              </div>
            ) : (
              <div className="analytics-list">
                {countries.map((item) => (
                  <div
                    className="analytics-row"
                    key={item.country}
                  >
                    <span>🌍 {item.country}</span>
                    <strong>{item.event_count}</strong>
                  </div>
                ))}
              </div>
            )}

          </section>

          {/* REGION ANALYTICS */}

          <section className="admin-section">

            <p className="admin-section-eyebrow">
              Regional patterns
            </p>

            <h2>Safety events by region</h2>

            {regions.length === 0 ? (
              <div className="admin-empty-state">
                No regional data available yet.
              </div>
            ) : (
              <div className="analytics-list">
                {regions.map((item, index) => (
                  <div
                    className="analytics-row"
                    key={`${item.country}-${item.region}-${index}`}
                  >
                    <span>
                      📍 {item.region}, {item.country}
                    </span>
                    <strong>{item.event_count}</strong>
                  </div>
                ))}
              </div>
            )}

          </section>

        </>
      )}

    </main>
  )
}

export default AdminDashboard
