import { useEffect, useState } from "react";
import API from "../api/api";
import PetForm from "./PetForm";

/* ── Reusable Icon Components ── */

const PawIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <circle cx="4.5" cy="9.5" r="2.5" />
    <circle cx="9" cy="5.5" r="2.5" />
    <circle cx="15" cy="5.5" r="2.5" />
    <circle cx="19.5" cy="9.5" r="2.5" />
    <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.0 2.09 2.35C7.61 22.56 9.34 22 10.5 20.75c.42-.49.78-1.07 1.12-1.63.1-.15.19-.31.38-.31.19 0 .28.16.38.31.33.56.7 1.14 1.12 1.63 1.16 1.25 2.89 1.81 4.27 1.25 1.07-.35 1.8-1.33 2.08-2.35.31-2.03-1.3-3.48-2.61-4.79z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="#d95040" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="pet-search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="18"
    height="18"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

/* ── Helper Functions ── */

const API_BASE = "http://localhost:3000";

/** Resolves a pet image path into a full URL. */
function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img}`;
}

/** Formats a date string to a readable format (e.g. "April 24, 2026"). */
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Stat Card Sub-component ── */

function StatCard({ icon, title, value, iconStyle }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <div className="admin-stat-icon" style={iconStyle}>
          {icon}
        </div>
      </div>
      <div>
        <div className="admin-stat-title">{title}</div>
        <div className="admin-stat-value">{value}</div>
      </div>
    </div>
  );
}

/* ── Pet Table Row Sub-component ── */

function PetRow({ pet, onEdit, onDelete }) {
  const status = pet.status || "Available";

  return (
    <tr>
      {/* Pet Details */}
      <td>
        <div className="pet-detail-cell">
          <div className="pet-table-avatar">
            {pet.image ? (
              <img src={resolveImage(pet.image)} alt={pet.name} />
            ) : (
              <div className="pet-avatar-placeholder">🐾</div>
            )}
          </div>
          <div>
            <div className="pet-detail-name">{pet.name.toUpperCase()}</div>
            <div className="pet-detail-id">ID: D{String(pet.id).padStart(2, "0")}</div>
          </div>
        </div>
      </td>

      {/* Species & Breed */}
      <td>
        <div className="pet-detail-name">{(pet.species || "—").toUpperCase()}</div>
        <div className="pet-detail-id">{pet.breed}</div>
      </td>

      {/* Status Badge */}
      <td>
        <span className={`pet-status-badge ${status.toLowerCase()}`}>
          <span className="pet-status-dot" />
          {status}
        </span>
      </td>

      {/* Date */}
      <td>{formatDate(pet.created_at)}</td>

      {/* Actions */}
      <td>
        <div className="pet-actions-cell">
          <button
            type="button"
            className="pet-action-btn delete"
            onClick={() => onDelete(pet.id)}
            title="Delete"
          >
            <DeleteIcon />
          </button>
          <button
            type="button"
            className="pet-action-btn edit"
            onClick={() => onEdit(pet)}
            title="Edit"
          >
            <EditIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* 
   Main Component
    */

function AdminPets() {
  /* ── State ── */
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [adoptionStats, setAdoptionStats] = useState({ approved: 0, pending: 0 });

  /* ── Data Fetching ── */

  const fetchPets = async () => {
    try {
      const { data } = await API.get("/pets");
      setPets(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch pets.");
    }
  };

  const fetchAdoptionStats = async () => {
    try {
      const { data } = await API.get("/adoptions/stats");
      setAdoptionStats({
        approved: Number(data.data.approved) || 0,
        pending: Number(data.data.pending) || 0,
      });
    } catch {
      // Stats are non-critical — silently ignore errors
    }
  };

  const refreshAll = () => {
    fetchPets();
    fetchAdoptionStats();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  /* ── Form Handlers ── */

  const openAddForm = () => {
    setSelectedPet(null);
    setIsFormOpen(true);
  };

  const openEditForm = (pet) => {
    setSelectedPet(pet);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedPet(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (formData) => {
    setError("");
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (selectedPet) {
        await API.put(`/pets/${selectedPet.id}`, formData, config);
      } else {
        await API.post("/pets", formData, config);
      }

      closeForm();
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save pet.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet? This action cannot be undone.")) {
      return;
    }

    setError("");
    try {
      await API.delete(`/pets/${id}`);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete pet.");
    }
  };

  /* ── Derived Data ── */

  const query = searchQuery.toLowerCase().trim();

  const filteredPets = query
    ? pets.filter((pet) => {
      const fields = [
        pet.name,
        pet.species,
        pet.breed,
        pet.status || "Available",
      ];
      return fields.some((field) =>
        (field || "").toLowerCase().includes(query)
      );
    })
    : pets;

  /* ── Render ── */

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Pets</h1>
      </div>

      {/* ── Stats Row ── */}
      <div className="admin-stats-grid">
        <StatCard icon={<PawIcon />} title="Total Pets" value={pets.length} />
        <StatCard
          icon={<HeartIcon />}
          title="Pets Adopted"
          value={adoptionStats.approved}
          iconStyle={{ backgroundColor: "#fbdfdd" }}
        />
        <StatCard icon={<DocumentIcon />} title="Pending Adoptions" value={adoptionStats.pending} />
      </div>

      {/* ── Pet Catalog ── */}
      <div className="pet-catalog">
        {/* Header with title + search bar */}
        <div className="pet-catalog-header">
          <h3 className="pet-catalog-title">PET CATALOG</h3>

          <div className="pet-search-bar">
            <SearchIcon />
            <input
              id="pet-search-input"
              type="text"
              placeholder="Search by name, species, breed, or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="pet-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* Table */}
        <div className="pet-table-wrapper">
          <table className="pet-table">
            <thead>
              <tr>
                <th>PET DETAILS</th>
                <th>SPECIES &amp; BREED</th>
                <th>STATUS</th>
                <th>LAST UPDATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
                    {query
                      ? `No pets matching "${searchQuery}".`
                      : 'No pets found. Click "+ ADD NEW PET" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredPets.map((pet) => (
                  <PetRow
                    key={pet.id}
                    pet={pet}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pet-catalog-footer">
          Showing {filteredPets.length} of {pets.length} Animals
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <button type="button" className="add-pet-fab" onClick={openAddForm}>
        + ADD NEW PET
      </button>

      {/* ── Pet Form Modal ── */}
      <PetForm
        selectedPet={selectedPet}
        onSubmit={handleSubmit}
        onCancel={closeForm}
        isOpen={isFormOpen}
        onClose={closeForm}
      />
    </div>
  );
}

export default AdminPets;
