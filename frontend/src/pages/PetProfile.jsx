import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ── Helpers ── */

import { API_BASE } from "../utils/constants";

function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img}`;
}

function formatAge(age) {
  if (!age && age !== 0) return "";
  const num = parseInt(age, 10);
  if (num >= 12) {
    const years = Math.floor(num / 12);
    return `${years} Year${years > 1 ? "s" : ""} Old`;
  }
  return `${num} Month${num !== 1 ? "s" : ""} Old`;
}

/* 
   Pet Profile Page
    */

function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await API.get("/pets");
        const all = response.data.data || [];
        const found = all.find((p) => String(p.id) === String(id));
        setPet(found || null);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleAdoptClick = () => {
    if (!user || user.role === "admin") {
      navigate("/login");
      return;
    }
    // Navigate to the dedicated adoption form page
    navigate(`/adopt/${pet.id}`);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <main className="landing-page">
        <Navbar />
        <div className="pet-profile-loading">
          <div className="findpets-spinner" />
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  /* ── Not Found State ── */
  if (!pet) {
    return (
      <main className="landing-page">
        <Navbar />
        <div className="pet-profile-loading">
          <h2>Pet not found</h2>
          <p>The pet you're looking for doesn't exist or has been adopted.</p>
          <Link to="/pets" className="landing-cta-btn" style={{ marginTop: "16px" }}>
            Browse All Pets
          </Link>
        </div>
      </main>
    );
  }

  /* ── Derived Data ── */
  const imageUrl = resolveImage(pet.image);
  const tags = pet.tags
    ? pet.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const isAvailable = pet.status === "Available";

  /* ── Render ── */
  return (
    <main className="landing-page">
      <Navbar />

      <section className="pet-profile-section">
        <button type="button" className="pet-profile-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="pet-profile-card">
          <div className="pet-profile-image-wrapper">
            {imageUrl ? (
              <img src={imageUrl} alt={pet.name} className="pet-profile-image" />
            ) : (
              <div className="featured-pet-img-placeholder" style={{ height: "100%", minHeight: 360 }}>🐾</div>
            )}
          </div>

          <div className="pet-profile-details">
            <div className="pet-profile-name-row">
              <h1 className="pet-profile-name">{pet.name}</h1>
              <span className={`pet-profile-status ${pet.status === "Pending" ? "pending" : pet.status === "Adopted" ? "adopted" : ""}`}>
                {pet.status || "Available"}
              </span>
            </div>

            <div className="pet-profile-meta">
              {pet.species && (
                <div className="pet-profile-meta-item">
                  <span className="pet-profile-meta-label">Species</span>
                  <span className="pet-profile-meta-value">{pet.species}</span>
                </div>
              )}
              <div className="pet-profile-meta-item">
                <span className="pet-profile-meta-label">Breed</span>
                <span className="pet-profile-meta-value">{pet.breed}</span>
              </div>
              <div className="pet-profile-meta-item">
                <span className="pet-profile-meta-label">Gender</span>
                <span className="pet-profile-meta-value">{pet.gender}</span>
              </div>
              <div className="pet-profile-meta-item">
                <span className="pet-profile-meta-label">Age</span>
                <span className="pet-profile-meta-value">{formatAge(pet.age)}</span>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="pet-profile-tags">
                {tags.map((tag) => (
                  <span key={tag} className="featured-pet-tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="pet-profile-about">
              <h3>About {pet.name}</h3>
              <p>{pet.description || "No description available."}</p>
            </div>

            {isAvailable ? (
              <button type="button" className="landing-cta-btn" onClick={handleAdoptClick}>
                Adopt {pet.name} 🐾
              </button>
            ) : (
              <span className="adopt-status-badge">
                {pet.status === "Pending" ? "⏳ Adoption Pending" : "🏠 Already Adopted"}
              </span>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default PetProfile;
