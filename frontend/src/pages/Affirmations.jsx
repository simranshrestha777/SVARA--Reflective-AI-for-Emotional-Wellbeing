import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const affirmations = {
  self: [
    "I am allowed to take up space and be myself.",
    "I am becoming more confident in who I am.",
    "I do not need to have everything figured out today.",
    "I am worthy of kindness, including from myself.",
    "I trust myself to handle what comes next.",
  ],

  anxiety: [
    "I can take things one moment at a time.",
    "I am safe in this moment.",
    "I do not have to solve every problem right now.",
    "My thoughts are not always facts.",
    "I can slow down and breathe.",
  ],

  healing: [
    "I give myself permission to grow at my own pace.",
    "My past does not define my future.",
    "I can acknowledge my feelings without being controlled by them.",
    "I am learning to treat myself with compassion.",
    "It is okay to rest while I heal and grow.",
  ],

  relationships: [
    "I deserve relationships built on respect and honesty.",
    "I can communicate my needs clearly.",
    "I am allowed to have healthy boundaries.",
    "I do not have to abandon myself to keep someone else.",
    "Healthy connection does not require me to lose myself.",
  ],

  growth: [
    "Every small step still counts as progress.",
    "I am capable of learning from difficult experiences.",
    "I can become someone I am proud of.",
    "I am allowed to change my mind and grow.",
    "I don't need perfection to make progress.",
  ],
}

const categories = [
  { id: 'self', label: 'Self-worth' },
  { id: 'anxiety', label: 'Calm' },
  { id: 'healing', label: 'Healing' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'growth', label: 'Growth' },
]

function getRandomAffirmation(category) {
  const list = affirmations[category]
  return list[Math.floor(Math.random() * list.length)]
}

function Affirmations() {
  const navigate = useNavigate()

  const [category, setCategory] = useState('self')
  const [currentAffirmation, setCurrentAffirmation] = useState(
    affirmations.self[0]
  )

  function changeCategory(newCategory) {
    setCategory(newCategory)
    setCurrentAffirmation(getRandomAffirmation(newCategory))
  }

  function newAffirmation() {
    setCurrentAffirmation(getRandomAffirmation(category))
  }

  return (
    <main className="affirmations-page">

      <header className="affirmations-header">

        <button
          className="affirmations-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div className="affirmations-logo">
          Svara
        </div>

      </header>

      <section className="affirmations-container">

        <div className="affirmations-intro">

          <p className="affirmations-eyebrow">
            A little reminder
          </p>

          <h1>
            Words for you.
          </h1>

          <p>
            Sometimes we need to hear something gentle,
            especially from ourselves.
          </p>

        </div>

        <div className="affirmation-categories">

          {categories.map((item) => (
            <button
              key={item.id}
              className={
                category === item.id
                  ? 'affirmation-category active'
                  : 'affirmation-category'
              }
              onClick={() => changeCategory(item.id)}
            >
              {item.label}
            </button>
          ))}

        </div>

        <section className="affirmation-card">

          <span className="affirmation-mark">
            “
          </span>

          <p>
            {currentAffirmation}
          </p>

          <span className="affirmation-mark closing">
            ”
          </span>

        </section>

        <div className="affirmation-actions">

          <button
            className="affirmation-primary"
            onClick={newAffirmation}
          >
            Another affirmation
          </button>

          <button
            className="affirmation-secondary"
            onClick={() => navigate('/chat')}
          >
            Talk to Svara
          </button>

        </div>

      </section>

    </main>
  )
}

export default Affirmations