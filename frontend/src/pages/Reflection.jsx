import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function Reflection() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [answers, setAnswers] = useState({
    situation: '',
    feelings: '',
    needs: '',
  })

  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [journalContext, setJournalContext] = useState(null)

  const topics = [
    {
      id: 'emotions',
      title: 'My emotions',
      description: 'Understand what you are feeling and why.',
    },
    {
      id: 'relationship',
      title: 'A relationship',
      description: 'Explore something happening between you and someone else.',
    },
    {
      id: 'self',
      title: 'Myself',
      description: 'Notice patterns, thoughts, and behaviours within yourself.',
    },
    {
      id: 'situation',
      title: 'Something that happened',
      description: 'Process an experience that is still on your mind.',
    },
  ]

  function updateAnswer(field, value) {
    setAnswers((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function nextStep() {
    if (step === 1 && !topic) {
      setError('Choose something you would like to explore.')
      return
    }

    if (step === 2 && !answers.situation.trim()) {
      setError('Tell us a little about what happened.')
      return
    }

    if (step === 3 && !answers.feelings.trim()) {
      setError('Try describing what you were feeling.')
      return
    }

    setError('')
    setStep(step + 1)
  }

  async function generateReflection() {
    if (!answers.needs.trim()) {
      setError('Tell us what you think you need right now.')
      return
    }

    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/reflections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic,
            situation: answers.situation,
            feelings: answers.feelings,
            needs: answers.needs,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not create reflection.'
        )
      }

      setReflection(data.reflection)
      setStep(5)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedContext = sessionStorage.getItem(
      'svara_reflection_context'
    )

    if (savedContext) {
      try {
        const context = JSON.parse(savedContext)

        setJournalContext(context)

        setTopic('situation')

        setAnswers((previous) => ({
          ...previous,
          situation: context.content || '',
        }))

        sessionStorage.removeItem(
          'svara_reflection_context'
        )
      } catch (error) {
        console.error(
          'Could not load journal context:',
          error
        )
      }
    }
  }, [])

  return (
    <main className="reflection-page">

      <header className="reflection-header">

        <button
          className="reflection-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div className="reflection-logo">
          Svara
        </div>

      </header>

      <section className="reflection-container">

        {step < 5 && (
          <div className="reflection-progress">
            Step {step} of 4
          </div>
        )}

        {step === 1 && (
          <div className="reflection-step">

            {journalContext ? (
              <>
                <p className="reflection-eyebrow">
                  From your journal
                </p>

                <h1>
                  Let's explore
                  <br />
                  what you wrote.
                </h1>

                <div className="reflection-journal-preview">
                  {journalContext.title && (
                    <h3>{journalContext.title}</h3>
                  )}
                  <p>
                    {journalContext.content}
                  </p>
                </div>

                <p className="reflection-intro">
                  Svara will use this as a starting point
                  for your reflection.
                </p>

                <button
                  className="reflection-next"
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <p className="reflection-eyebrow">
                  A moment for yourself
                </p>

                <h1>
                  What would you like
                  <br />
                  to understand?
                </h1>

                <p className="reflection-intro">
                  There is no right place to begin.
                  Choose whatever feels closest to
                  what is on your mind.
                </p>

                <div className="reflection-topics">

                  {topics.map((item) => (
                    <button
                      key={item.id}
                      className={`reflection-topic ${
                        topic === item.id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setTopic(item.id)
                        setError('')
                      }}
                    >
                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.description}
                      </span>
                    </button>
                  ))}

                </div>

                <button
                  className="reflection-next"
                  onClick={nextStep}
                >
                  Continue
                </button>
              </>
            )}

          </div>
        )}

        {step === 2 && (
          <div className="reflection-step">

            <p className="reflection-eyebrow">
              Let's start with what happened
            </p>

            <h1>
              What has been
              <br />
              on your mind?
            </h1>

            <textarea
              value={answers.situation}
              onChange={(e) =>
                updateAnswer(
                  'situation',
                  e.target.value
                )
              }
              placeholder="Write whatever feels important..."
              className="reflection-textarea"
            />

            <button
              className="reflection-next"
              onClick={nextStep}
            >
              Continue
            </button>

          </div>
        )}

        {step === 3 && (
          <div className="reflection-step">

            <p className="reflection-eyebrow">
              Notice your inner experience
            </p>

            <h1>
              What were you
              <br />
              feeling?
            </h1>

            <textarea
              value={answers.feelings}
              onChange={(e) =>
                updateAnswer(
                  'feelings',
                  e.target.value
                )
              }
              placeholder="Try naming the emotions, thoughts, or sensations..."
              className="reflection-textarea"
            />

            <button
              className="reflection-next"
              onClick={nextStep}
            >
              Continue
            </button>

          </div>
        )}

        {step === 4 && (
          <div className="reflection-step">

            <p className="reflection-eyebrow">
              One last question
            </p>

            <h1>
              What do you think
              <br />
              you need right now?
            </h1>

            <textarea
              value={answers.needs}
              onChange={(e) =>
                updateAnswer(
                  'needs',
                  e.target.value
                )
              }
              placeholder="Maybe you need clarity, reassurance, space, boundaries, rest..."
              className="reflection-textarea"
            />

            <button
              className="reflection-next"
              onClick={generateReflection}
              disabled={loading}
            >
              {loading
                ? 'Svara is reflecting...'
                : 'Reflect with Svara'}
            </button>

          </div>
        )}

        {step === 5 && (
          <div className="reflection-result">

            <p className="reflection-eyebrow">
              Your reflection
            </p>

            <h1>
              What Svara noticed
            </h1>

            <div className="reflection-result-card">
              {reflection}
            </div>

            <div className="reflection-actions">

              <button
                className="reflection-next"
                onClick={() => navigate('/dashboard')}
              >
                Back to my space
              </button>

              <button
                className="reflection-secondary"
                onClick={() => {
                  setStep(1)
                  setTopic('')
                  setAnswers({
                    situation: '',
                    feelings: '',
                    needs: '',
                  })
                  setReflection('')
                }}
              >
                Start another reflection
              </button>

            </div>

          </div>
        )}

        {error && (
          <p className="reflection-error">
            {error}
          </p>
        )}

      </section>

    </main>
  )
}

export default Reflection
