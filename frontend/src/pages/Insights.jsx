import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'

function Insights() {
  const navigate = useNavigate()

  const [checkins, setCheckins] = useState([])
  const [reflections, setReflections] = useState([])
  const [journals, setJournals] = useState([])

  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    setLoading(true)
    setError('')

    try {
      const [
        checkinData,
        reflectionData,
        journalData,
      ] = await Promise.all([
        apiRequest('/checkins'),
        apiRequest('/reflections'),
        apiRequest('/journal'),
      ])

      setCheckins(checkinData || [])
      setReflections(reflectionData || [])
      setJournals(journalData || [])

      await generateInsight()
    } catch (err) {
      if (
        err.message === 'Not authenticated' ||
        err.message === 'Authentication failed'
      ) {
        navigate('/login')
        return
      }

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateInsight() {
    setLoadingInsight(true)

    try {
      const data = await apiRequest(
        '/insights/personalized'
      )

      setInsight(data.insight || '')
    } catch (err) {
      if (
        err.message.includes('Not enough personal data')
      ) {
        setInsight('')
      } else {
        console.error(
          'Could not generate insight:',
          err
        )
      }
    } finally {
      setLoadingInsight(false)
    }
  }

  function getMoodCounts() {
    const counts = {}

    checkins.forEach((checkin) => {
      counts[checkin.mood] =
        (counts[checkin.mood] || 0) + 1
    })

    return counts
  }

  function getMostCommonMood() {
    const counts = getMoodCounts()

    const moods = Object.keys(counts)

    if (moods.length === 0) {
      return null
    }

    return moods.reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    )
  }

  const moodCounts = getMoodCounts()
  const mostCommonMood = getMostCommonMood()

  if (loading) {
    return (
      <main className="insights-page">
        <div className="insights-loading">
          Looking at your journey...
        </div>
      </main>
    )
  }

  return (
    <main className="insights-page">

      <header className="insights-header">

        <button
          className="insights-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div>
          <p className="insights-eyebrow">
            Your journey
          </p>

          <h1>
            My Insights
          </h1>

          <p>
            A gentle look at what you've been
            noticing about yourself.
          </p>
        </div>

      </header>

      <section className="insights-content">

        {error && (
          <p className="insights-error">
            {error}
          </p>
        )}

        {/* AI PERSONALIZED INSIGHT */}

        <section className="svara-insight-card">

          <div className="svara-insight-header">

            <div className="svara-insight-orb">
              S
            </div>

            <div>
              <p className="insight-label">
                What Svara is noticing
              </p>

              <h2>
                A little something to reflect on
              </h2>
            </div>

          </div>

          {loadingInsight ? (
            <div className="insight-generating">
              <span></span>
              <span></span>
              <span></span>
              <p>
                Svara is looking through your recent
                reflections...
              </p>
            </div>
          ) : insight ? (
            <>
              <p className="svara-insight-text">
                {insight}
              </p>

              <button
                className="refresh-insight-button"
                onClick={generateInsight}
                disabled={loadingInsight}
              >
                Notice something new
              </button>
            </>
          ) : (
            <div className="insight-empty">

              <p>
                Keep checking in, journaling, or
                reflecting. As you build your journey,
                Svara will have more to notice.
              </p>

              <button
                className="refresh-insight-button"
                onClick={generateInsight}
              >
                Try again
              </button>

            </div>
          )}

        </section>


        {/* OVERVIEW */}

        <section className="insights-section">

          <h2>
            Your journey so far
          </h2>

          <div className="insight-stats">

            <div className="insight-stat-card">
              <span>
                Check-ins
              </span>

              <strong>
                {checkins.length}
              </strong>
            </div>

            <div className="insight-stat-card">
              <span>
                Reflections
              </span>

              <strong>
                {reflections.length}
              </strong>
            </div>

            <div className="insight-stat-card">
              <span>
                Journal entries
              </span>

              <strong>
                {journals.length}
              </strong>
            </div>

          </div>

        </section>


        {/* EMOTIONS */}

        <section className="insights-section">

          <h2>
            Emotions you've checked in with
          </h2>

          {checkins.length === 0 ? (
            <p className="insights-empty">
              Your emotional check-ins will appear
              here as you use Svara.
            </p>
          ) : (
            <div className="mood-list">

              {Object.entries(moodCounts).map(
                ([mood, count]) => (
                  <div
                    className="mood-item"
                    key={mood}
                  >

                    <span>
                      {mood}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>
                )
              )}

            </div>
          )}

        </section>


        {/* OBSERVATION */}

        {mostCommonMood && (
          <section className="insights-observation">

            <p className="observation-label">
              A gentle observation
            </p>

            <p>
              You've checked in with{' '}
              <strong>
                {mostCommonMood}
              </strong>{' '}
              more often than your other recorded
              emotions. This doesn't necessarily mean
              there's one clear reason behind it, but it
              could be something worth exploring through
              journaling or reflection.
            </p>

            <button
              onClick={() => navigate('/reflection')}
            >
              Explore this feeling
            </button>

          </section>
        )}

      </section>

    </main>
  )
}

export default Insights