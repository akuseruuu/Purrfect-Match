import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/api";
import PetForm from "./PetForm";

/* ── Reusable Icon Components ── */

const PawIcon = () => (
  <span style={{ fontSize: "20px" }}>🐾</span>
);

const HeartIcon = () => (
  <span style={{ fontSize: "20px" }}>❤️</span>
);

const DocumentIcon = () => (
  <span style={{ fontSize: "20px" }}>📄</span>
);

const SearchIcon = () => (
  <span style={{ fontSize: "20px" }}>🔍</span>
);

const DeleteIcon = () => (
  <span style={{ fontSize: "20px" }}>🗑️</span>
);

const EditIcon = () => (
  <span style={{ fontSize: "20px" }}>✏️</span>
);

/* ── Helper Functions ── */

import { API_BASE } from "../utils/constants";

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
  const [currentPage, setCurrentPage] = useState(1);
  const PETS_PER_PAGE = 5;

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
        toast.success("Pet updated successfully! ");
      } else {
        await API.post("/pets", formData, config);
        toast.success("New pet added successfully! ");
      }

      closeForm();
      refreshAll();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to save pet.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet? This action cannot be undone.")) {
      return;
    }

    setError("");
    try {
      await API.delete(`/pets/${id}`);
      toast.success("Pet deleted successfully.");
      refreshAll();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to delete pet.";
      setError(msg);
      toast.error(msg);
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

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredPets.length / PETS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PETS_PER_PAGE;
  const paginatedPets = filteredPets.slice(startIdx, startIdx + PETS_PER_PAGE);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
                paginatedPets.map((pet) => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pet-pagination">
            <button
              className="pet-pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pet-pagination-btn ${page === safePage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pet-pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next ›
            </button>
          </div>
        )}

        <div className="pet-catalog-footer">
          Showing {startIdx + 1}–{Math.min(startIdx + PETS_PER_PAGE, filteredPets.length)} of {filteredPets.length} Animals
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
