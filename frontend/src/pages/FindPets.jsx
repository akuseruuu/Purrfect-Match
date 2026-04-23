import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FindPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("All Species");
  const [breed, setBreed] = useState("All Breed");
  const [ageRange, setAgeRange] = useState("All Age");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await API.get("/pets");
        setPets(response.data.data || []);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `http://localhost:3000/${img}`;
  };

  const formatAge = (age) => {
    if (!age && age !== 0) return "";
    const num = parseInt(age, 10);
    if (num >= 12) {
      const years = Math.floor(num / 12);
      return `${years} Year${years > 1 ? "s" : ""} Old`;
    }
    return `${num} Month${num !== 1 ? "s" : ""} Old`;
  };

  // Filter Logic
  const filteredPets = pets.filter((pet) => {
    if (species !== "All Species" && pet.species?.toLowerCase() !== species.toLowerCase()) return false;
    if (breed !== "All Breed" && pet.breed?.toLowerCase() !== breed.toLowerCase()) return false;
    if (ageRange !== "All Age") {
      const isAdult = parseInt(pet.age, 10) >= 12;
      if (ageRange === "Baby/Young" && isAdult) return false;
      if (ageRange === "Adult/Senior" && !isAdult) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      if (
        !pet.name?.toLowerCase().includes(s) &&
        !pet.species?.toLowerCase().includes(s) &&
        !pet.breed?.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredPets.length / itemsPerPage) || 1;
  const currentPets = filteredPets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-reset pagination to page 1 if filtering changes the math
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const uniqueBreeds = Array.from(new Set(pets.map((p) => p.breed).filter(Boolean)));

  return (
    <main className="landing-page">
      <Navbar />

      <section className="findpets-container">
        {/* Top Search & Filter Bar */}
        <div className="findpets-filter-box">
          <h2 className="findpets-filter-heading">Find Your <span className="highlight">Purrfect Match</span></h2>

          <div className="findpets-search-row">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by species, breed, age"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="findpets-dropdown-row">
            <div className="findpets-dropdown-col">
              <label>SPECIES</label>
              <select value={species} onChange={(e) => setSpecies(e.target.value)}>
                <option>All Species</option>
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
              </select>
            </div>
            <div className="findpets-dropdown-col">
              <label>BREED</label>
              <select value={breed} onChange={(e) => setBreed(e.target.value)}>
                <option>All Breed</option>
                {uniqueBreeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="findpets-dropdown-col">
              <label>AGE RANGE</label>
              <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                <option>All Age</option>
                <option>Baby/Young</option>
                <option>Adult/Senior</option>
              </select>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="findpets-list-header">
          <h2>ADOPTABLE PETS AVAILABLE</h2>
          <p>Showing all adoptable pets</p>
        </div>

        {/* Results Grid */}
        <div className="findpets-content">
          {loading ? (
            <div className="findpets-loading">
              <div className="findpets-spinner" />
              <p>Loading pets...</p>
            </div>
          ) : currentPets.length === 0 ? (
            <div className="findpets-empty">
              <p>🐾 No pets match your search criteria. Check back soon!</p>
            </div>
          ) : (
            <div className="findpets-grid">
              {currentPets.map((pet) => {
                const imageUrl = resolveImage(pet.image);
                const tags = pet.tags
                  ? pet.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [];

                return (
                  <article key={pet.id} className="findpets-card" id={`pet-card-${pet.id}`}>
                    <div className="findpets-card-img-wrapper">
                      {imageUrl ? (
                        <img src={imageUrl} alt={pet.name} className="findpets-card-img" />
                      ) : (
                        <div className="findpets-card-img-placeholder">🐾</div>
                      )}
                    </div>
                    <div className="findpets-card-body">
                      <div className="findpets-card-top-row">
                        <h3 className="findpets-card-name">{pet.name}</h3>
                        <span className="findpets-card-age">{formatAge(pet.age)}</span>
                      </div>
                      {tags.length > 0 && (
                        <div className="findpets-card-tags">
                          {tags.map((tag) => (
                            <span key={tag} className="findpets-card-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <p className="findpets-card-desc">{pet.description}</p>
                      <Link to={`/pets/${pet.id}`} className="findpets-card-btn">
                        View Profile
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Box */}
        {!loading && totalPages > 1 && (
          <div className="findpets-pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default FindPets;

