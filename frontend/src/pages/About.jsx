import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <main className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <h1>
          About <span className="landing-accent">Purrfect Match</span>
        </h1>
        <p>
          A simple mission — connecting loving homes with animals in need.
        </p>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-block">
            <span className="about-icon">🐾</span>
            <h2>Our Mission</h2>
            <p>
              Purrfect Match is a pet adoption platform built to make the process
              of finding a furry companion simple, transparent, and joyful. We
              believe every animal deserves a loving home, and every person
              deserves the unconditional love of a pet.
            </p>
          </div>

          <div className="about-block">
            <span className="about-icon">❤️</span>
            <h2>What We Do</h2>
            <p>
              We bridge the gap between shelters and adopters by providing an
              easy-to-use platform where you can browse available pets, submit
              adoption requests, and support the shelter through donations —
              all in one place.
            </p>
          </div>

          <div className="about-block">
            <span className="about-icon">🏠</span>
            <h2>Our Vision</h2>
            <p>
              A world where no pet is left without a home. We strive to reduce
              the number of homeless animals by making adoption accessible,
              encouraging responsible pet ownership, and building a compassionate
              community of animal lovers.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-steps-section">
        <h2 className="about-steps-title">How It Works</h2>
        <div className="about-steps">
          <div className="about-step">
            <div className="about-step-number">1</div>
            <h3>Browse Pets</h3>
            <p>Explore our catalog of lovable animals waiting for their forever homes.</p>
          </div>
          <div className="about-step-divider" />
          <div className="about-step">
            <div className="about-step-number">2</div>
            <h3>Submit a Request</h3>
            <p>Found your match? Fill out a quick adoption form and tell us about yourself.</p>
          </div>
          <div className="about-step-divider" />
          <div className="about-step">
            <div className="about-step-number">3</div>
            <h3>Welcome Home</h3>
            <p>Once approved, meet your new best friend and bring them home!</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to find your purrfect match?</h2>
        <div className="about-cta-buttons">
          <Link to="/pets" className="landing-cta-btn">
            Meet Our Pets 🐾
          </Link>
          <Link to="/donate" className="about-cta-secondary">
            Support the Shelter
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default About;