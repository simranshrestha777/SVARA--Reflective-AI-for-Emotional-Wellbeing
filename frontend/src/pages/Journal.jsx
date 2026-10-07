import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function Journal() {
  const navigate = useNavigate()

  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const token = sessionStorage.getItem('svara_token')

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const response = await fetch(
        `${API_URL}/journal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Could not load your journal.')
      }

      const data = await response.json()
      setEntries(data)

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    if (!content.trim()) {
      setError('Write something before saving your entry.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/journal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim() || null,
            content: content.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not save your entry.'
        )
      }

      setEntries((previous) => [data, ...previous])

      setTitle('')
      setContent('')

    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this journal entry?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${API_URL}/journal/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not delete entry.'
        )
      }

      setEntries((previous) =>
        previous.filter((entry) => entry.id !== id)
      )

    } catch (error) {
      setError(error.message)
    }
  }

  function reflectOnEntry(entry) {
    sessionStorage.setItem(
      'svara_reflection_context',
      JSON.stringify({
        title: entry.title,
        content: entry.content,
      })
    )

    navigate('/reflection')
  }

  if (loading) {
    return (
      <main className="journal-page">
        <p>Opening your journal...</p>
      </main>
    )
  }

  return (
    <main className="journal-page">

      <header className="journal-header">

        <button
          className="journal-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div className="journal-logo">
          Svara
        </div>

      </header>


      <section className="journal-container">

        <div className="journal-intro">

          <p className="journal-eyebrow">
            Your private space
          </p>

          <h1>
            Write it down.
          </h1>

          <p>
            You don't have to make sense of everything.
            Sometimes putting it into words is enough.
          </p>

        </div>


        <section className="journal-editor">

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this moment a title (optional)"
            className="journal-title-input"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="journal-content-input"
          />

          <button
            className="journal-save-button"
            onClick={saveEntry}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save entry'}
          </button>

        </section>


        {error && (
          <p className="journal-error">
            {error}
          </p>
        )}


        <section className="journal-history">

          <div className="journal-history-header">
            <h2>
              Your entries
            </h2>

            <span>
              {entries.length}
              {entries.length === 1
                ? ' entry'
                : ' entries'}
            </span>
          </div>


          {entries.length === 0 ? (

            <div className="journal-empty">

              <h3>
                Your journal is waiting.
              </h3>

              <p>
                Your thoughts, experiences, and little
                moments can live here.
              </p>

            </div>

          ) : (

            <div className="journal-list">

              {entries.map((entry) => (

                <article
                  className="journal-entry"
                  key={entry.id}
                >

                  <div className="journal-entry-top">

                    <div>

                      <h3>
                        {entry.title || 'Untitled entry'}
                      </h3>

                      <span>
                        {new Date(
                          entry.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>

                    </div>

                    <button
                      className="journal-delete"
                      onClick={() =>
                        deleteEntry(entry.id)
                      }
                    >
                      Delete
                    </button>

                  </div>


                  <p className="journal-entry-content">
                    {entry.content}
                  </p>


                  <button
                    className="journal-reflect"
                    onClick={() =>
                      reflectOnEntry(entry)
                    }
                  >
                    Reflect with Svara →
                  </button>

                </article>

              ))}

            </div>

          )}

        </section>

      </section>

    </main>
  )
}

export default Journal 