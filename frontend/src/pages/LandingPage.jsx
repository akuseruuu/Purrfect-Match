import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FeaturedPetCard({ pet }) {
  const imageUrl = pet.image
    ? pet.image.startsWith("http")
      ? pet.image
      : `http://localhost:3000/${pet.image}`
    : null;

  const formatAge = (age) => {
    if (!age && age !== 0) return "";
    const num = parseInt(age, 10);
    if (num >= 12) {
      const years = Math.floor(num / 12);
      return `${years} Year${years > 1 ? "s" : ""} Old`;
    }
    return `${num} Month${num !== 1 ? "s" : ""} Old`;
  };

  /* Parse tags from a comma-separated string, or fall back to defaults */
  const tags = pet.tags
    ? pet.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="featured-pet-card" id={`featured-pet-${pet.id}`}>
      <div className="featured-pet-img-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={pet.name} className="featured-pet-img" />
        ) : (
          <div className="featured-pet-img-placeholder">🐾</div>
        )}
      </div>

      <div className="featured-pet-body">
        <div className="featured-pet-top-row">
          <h3 className="featured-pet-name">{pet.name}</h3>
          <span className="featured-pet-age">{formatAge(pet.age)}</span>
        </div>

        <p className="featured-pet-desc">{pet.description}</p>

        <Link to={`/pets/${pet.id}`} className="featured-pet-learn-more">
          Learn More
        </Link>
      </div>
    </article>
  );
}

function LandingPage() {
  const [featuredPets, setFeaturedPets] = useState([]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await API.get("/pets");
        const all = response.data.data || [];
        /* Hide adopted pets, then show the 3 most recent */
        const available = all.filter((p) => p.status !== "Adopted");
        setFeaturedPets(available.slice(0, 3));
      } catch {
        /* Silently fail – section just won't show */
      }
    };
    fetchPets();
  }, []);

  return (
    <main className="landing-page">
      <Navbar />

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-text">
          <h1>
            Find Your<br />
            <span className="landing-accent">Purrfect Match</span>
          </h1>
          <p>
            Connecting loving hearts with paws in need. Discover the
            joy of adoption and bring a lifetime of warmth to
            your home today.
          </p>
          <Link to="/pets" className="landing-cta-btn">
            Meet our Pets 🐾
          </Link>
        </div>
        <div className="landing-hero-image">
          <img src="/hero.png" alt="Person hugging a dog" />
        </div>
      </section>

      {/* Featured Furry Friends */}
      {featuredPets.length > 0 && (
        <section className="featured-section" id="featured-pets">
          <div className="featured-header">
            <div>
              <h2 className="featured-title">Featured Furry Friends</h2>
              <p className="featured-subtitle">
                These lovable companions are ready to find their forever homes.<br />
                Could one of them be your purrfect match?
              </p>
            </div>
            <Link to="/pets" className="featured-view-all">
              View All Pets&nbsp;&nbsp;→
            </Link>
          </div>

          <div className="featured-pets-grid">
            {featuredPets.map((pet) => (
              <FeaturedPetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

export default LandingPage;
