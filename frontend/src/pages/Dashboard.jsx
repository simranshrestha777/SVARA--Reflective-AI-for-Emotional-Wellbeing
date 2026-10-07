import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [selectedMood, setSelectedMood] = useState(null)
  const [intensity, setIntensity] = useState(3)
  const [checkinNote, setCheckinNote] = useState('')
  const [savingCheckin, setSavingCheckin] = useState(false)
  const [checkinError, setCheckinError] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        sessionStorage.removeItem('svara_token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  function selectMood(mood) {
    setSelectedMood(mood)
    setCheckinError('')
  }

  function resetCheckin() {
    setSelectedMood(null)
    setIntensity(3)
    setCheckinNote('')
    setCheckinError('')
  }

  async function saveCheckin() {
    if (!selectedMood || savingCheckin) {
      return
    }

    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    setSavingCheckin(true)
    setCheckinError('')

    try {
      const response = await fetch(
        `${API_URL}/checkins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mood: selectedMood,
            intensity: intensity,
            note: checkinNote.trim() || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not save your check-in.'
        )
      }

      const starterMessages = {
        struggling:
          "I'm struggling today and I don't really know what I need.",
        anxious:
          "I'm feeling anxious right now.",
        frustrated:
          "I'm feeling frustrated and I want to understand why.",
        okay:
          "I'm doing okay today. I'd like to check in with myself.",
        happy:
          "I'm feeling happy today and I'd like to talk about it.",
      }

      sessionStorage.setItem(
        'svara_starter_message',
        starterMessages[selectedMood]
      )

      navigate('/chat')
    } catch (error) {
      setCheckinError(error.message)
    } finally {
      setSavingCheckin(false)
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <p>Taking you to your space...</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Welcome back
          </p>

          <h1>
            Hello, {user?.name}.
          </h1>

          <p>
            How are you feeling today?
          </p>
        </div>

        <div className="dashboard-actions">

           {user?.is_admin && (
    <button
      className="admin-button"
      onClick={() => navigate('/admin')}
    >
      Admin
    </button>
  )}
          <button
            className="profile-button"
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>

          <button
            className="signout-button"
            onClick={() => {
              sessionStorage.removeItem('svara_token')
              navigate('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-main">

        <div className="check-in-card">
          <p>Take a moment.</p>

          <h2>
            What's on your mind?
          </h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="You can tell Svara anything..."
          />

          <button
            onClick={() => {
              if (message.trim()) {
                sessionStorage.setItem(
                  'svara_starter_message',
                  message.trim()
                )
              }

              navigate('/chat')
            }}
          >
            Talk to Svara
          </button>
        </div>

        <section className="dashboard-section">
          <h2>How are you feeling?</h2>

          {!selectedMood ? (
            <div className="feeling-options">

              <button
                onClick={() => selectMood('struggling')}
              >
                I'm struggling
              </button>

              <button
                onClick={() => selectMood('anxious')}
              >
                I'm anxious
              </button>

              <button
                onClick={() => selectMood('frustrated')}
              >
                I'm frustrated
              </button>

              <button
                onClick={() => selectMood('okay')}
              >
                I'm okay
              </button>

              <button
                onClick={() => selectMood('happy')}
              >
                I'm happy
              </button>

            </div>
          ) : (
            <div className="checkin-followup">

              <div className="checkin-selected">

                <p className="checkin-label">
                  You selected
                </p>

                <h3>
                  {selectedMood === 'struggling' &&
                    "I'm struggling"}

                  {selectedMood === 'anxious' &&
                    "I'm anxious"}

                  {selectedMood === 'frustrated' &&
                    "I'm frustrated"}

                  {selectedMood === 'okay' &&
                    "I'm okay"}

                  {selectedMood === 'happy' &&
                    "I'm happy"}
                </h3>

              </div>

              <div className="checkin-field">

                <p className="checkin-question">
                  How strongly are you feeling this?
                </p>

                <div className="intensity-options">

                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={
                        intensity === level
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        setIntensity(level)
                      }
                    >
                      {level}
                    </button>
                  ))}

                </div>

                <div className="intensity-labels">
                  <span>A little</span>
                  <span>Very strongly</span>
                </div>

              </div>

              <div className="checkin-field">

                <p className="checkin-question">
                  What's contributing to how you feel?
                </p>

                <textarea
                  value={checkinNote}
                  onChange={(e) =>
                    setCheckinNote(e.target.value)
                  }
                  placeholder="Optional — anything you'd like Svara to know..."
                  rows="3"
                />

              </div>

              {checkinError && (
                <p className="checkin-error">
                  {checkinError}
                </p>
              )}

              <div className="checkin-actions">

                <button
                  className="checkin-cancel"
                  type="button"
                  onClick={resetCheckin}
                  disabled={savingCheckin}
                >
                  Change mood
                </button>

                <button
                  className="checkin-save"
                  type="button"
                  onClick={saveCheckin}
                  disabled={savingCheckin}
                >
                  {savingCheckin
                    ? 'Saving...'
                    : 'Save & talk to Svara'}
                </button>

              </div>

            </div>
          )}

        </section>

        <section className="dashboard-section">
          <h2>Continue your journey</h2>

          <div className="journey-card">
            <div>
              <p>Begin your first reflection</p>
              <span>
                There's no right or wrong place to start.
              </span>
            </div>

            <button onClick={() => navigate('/reflection')}>
              Start →
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Your space</h2>

          <div className="journey-card">
            <div>
              <p>Write in your journal</p>
              <span>
                Put your thoughts into words, without judgment.
              </span>
            </div>

            <button onClick={() => navigate('/journal')}>
              Open →
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Take a moment</h2>

          <div className="journey-card">
            <div>
              <p>Calm & ground yourself</p>
              <span>
                Short exercises to help you pause and reconnect.
              </span>
            </div>

            <button onClick={() => navigate('/calm')}>
              Explore →
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Words for you</h2>

          <div className="journey-card">
            <div>
              <p>Explore affirmations</p>

              <span>
                Gentle reminders for whatever you're going through.
              </span>
            </div>

            <button
              onClick={() => navigate('/affirmations')}
            >
              Explore →
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Your journey</h2>

          <div className="journey-card">
            <div>
              <p>See your insights</p>

              <span>
                Notice patterns across your check-ins, journals,
                and reflections.
              </span>
            </div>

            <button
              onClick={() => navigate('/insights')}
            >
              View →
            </button>
          </div>
        </section>

      </section>

    </main>
  )
}

export default Dashboard