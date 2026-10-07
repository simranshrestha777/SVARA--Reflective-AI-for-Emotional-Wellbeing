import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Exercises data array
const exercises = [
  {
    id: 'breathe',
    title: 'Calm my mind',
    description: 'A simple breathing exercise to slow things down.',
    duration: '2 minutes',
    steps: [
      'Find a comfortable position.',
      'Breathe in slowly through your nose for 4 seconds.',
      'Hold gently for 2 seconds.',
      'Exhale slowly for 6 seconds.',
      'Repeat this cycle a few times.',
    ],
  },
  {
    id: 'ground',
    title: 'Ground myself',
    description: 'Reconnect with the present moment.',
    duration: '3 minutes',
    steps: [
      'Look around and notice 5 things you can see.',
      'Notice 4 things you can physically touch.',
      'Listen for 3 things you can hear.',
      'Notice 2 things you can smell.',
      'Take one slow breath and notice how you feel.',
    ],
  },
  {
    id: 'slow',
    title: 'Slow down',
    description: 'Give yourself permission to pause.',
    duration: '2 minutes',
    steps: [
      'Put your phone down for a moment.',
      'Relax your shoulders.',
      'Take one slow breath.',
      'Notice what your body feels like right now.',
      'Ask yourself: “What do I actually need in this moment?”',
    ],
  },
  {
    id: 'sleep',
    title: 'Help me sleep',
    description: 'A gentle wind-down exercise for bedtime.',
    duration: '5 minutes',
    steps: [
      'Get comfortable and let your body settle.',
      'Take a slow, comfortable breath.',
      'Relax your jaw and shoulders.',
      'Notice the weight of your body against the bed.',
      'With every exhale, allow yourself to release a little tension.',
    ],
  },
];

function Calm() {
  const navigate = useNavigate();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setStep(0);
    setFinished(false);
  };

  const nextStep = () => {
    if (selectedExercise && step < selectedExercise.steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setSelectedExercise(null);
    setStep(0);
    setFinished(false);
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  return (
    <main className="calm-page">
      {/* Header */}
      <header className="calm-header">
        <button className="calm-back" onClick={goBack}>←</button>
        <div className="calm-logo">Svara</div>
      </header>

      {/* Main Content */}
      <section className="calm-container">
        {/* Exercise Selection */}
        {!selectedExercise ? (
          <>
            <div className="calm-intro">
              <p className="calm-eyebrow">A moment for you</p>
              <h1>Take a breath.</h1>
              <p>
                You don't have to solve everything right now.
                Choose something gentle and give yourself a
                few minutes to pause.
              </p>
            </div>

            <div className="calm-options">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  className="calm-option"
                  onClick={() => startExercise(exercise)}
                >
                  <div>
                    <h2>{exercise.title}</h2>
                    <p>{exercise.description}</p>
                  </div>
                  <span>{exercise.duration} →</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Exercise in progress or completed
          <section className="calm-exercise">
            {!finished ? (
              <>
                <p className="calm-eyebrow">{selectedExercise.title}</p>
                <div className="calm-progress">
                  Step {step + 1} of {selectedExercise.steps.length}
                </div>
                <div className="calm-step-card">
                  <div className="calm-step-number">{step + 1}</div>
                  <p>{selectedExercise.steps[step]}</p>
                </div>
                <div className="calm-actions">
                  <button className="calm-secondary" onClick={goBack}>Choose another</button>
                  <button className="calm-primary" onClick={nextStep}>
                    {step === selectedExercise.steps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </>
            ) : (
              // Completed message
              <div className="calm-complete">
                <p className="calm-eyebrow">You made space for yourself.</p>
                <h1>Well done.</h1>
                <p>
                  You don't need to feel completely different
                  for this moment to have mattered. Notice how
                  you feel now, without judging it.
                </p>
                <div className="calm-actions">
                  <button className="calm-secondary" onClick={restart}>Do it again</button>
                  <button className="calm-primary" onClick={() => navigate('/chat')}>Talk to Svara</button>
                </div>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default Calm;
