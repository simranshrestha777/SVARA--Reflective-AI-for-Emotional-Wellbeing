import { Link } from 'react-router-dom'

function Landing() {
  return (
    <main className="svara-home">
      <nav className="navbar">
        <div className="logo">
          Svara
        </div>

        <Link to="/login" className="nav-login">
          Sign in
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">A space to come as you are</p>

          <h1>
            You don't have to
            <span> carry everything alone.</span>
          </h1>

          <p className="hero-description">
            Svara is a quiet space to understand what you're feeling,
            reflect on what you're going through, and take your next step
            with a little more clarity.
          </p>

          <Link to="/register" className="primary-button">
            Begin your journey
          </Link>

          <p className="login-text">
            Already have an account?{' '}
            <Link to="/login">
            Sign in
            </Link>
          </p>
        </div>

        <div className="hero-orb">
          <div className="orb-inner">
            <span>It's okay to pause.</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Landing