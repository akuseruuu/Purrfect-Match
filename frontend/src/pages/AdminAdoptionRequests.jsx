import { useEffect, useState } from "react";
import API from "../api/api";

/* ── Helper Functions ── */

import { API_BASE } from "../utils/constants";

/** Resolves a pet image path into a full URL. */
function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img}`;
}

/** Formats a date string to a readable short format. */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Maps a request status to the appropriate badge CSS class. */
function getBadgeClass(status) {
  const classMap = {
    Pending: "adopt-req-badge pending",
    Approved: "adopt-req-badge approved",
    Rejected: "adopt-req-badge rejected",
  };
  return classMap[status] || "adopt-req-badge";
}

/* ── Request Card Sub-component ── */

function RequestCard({ request, processing, onStatusUpdate }) {
  const image = resolveImage(request.pet_image);
  const isPending = request.request_status === "Pending";
  const isProcessing = processing === request.request_id;
  const phone = request.request_phone || request.adopter_phone;

  return (
    <div className="adopt-req-card">
      {/* Pet Thumbnail */}
      <div className="adopt-req-pet-thumb">
        {image ? (
          <img src={image} alt={request.pet_name} />
        ) : (
          <div className="adopt-req-pet-placeholder">🐾</div>
        )}
      </div>

      {/* Request Info */}
      <div className="adopt-req-info">
        {/* Pet name + status badge */}
        <div className="adopt-req-top-row">
          <div>
            <h3 className="adopt-req-pet-name">{request.pet_name}</h3>
            <span className="adopt-req-breed">
              {request.species} · {request.breed}
            </span>
          </div>
          <span className={getBadgeClass(request.request_status)}>
            {request.request_status}
          </span>
        </div>

        {/* Adopter info */}
        <div className="adopt-req-user-row">
          <div className="adopt-req-user-avatar">
            {request.adopter_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <span className="adopt-req-user-name">{request.adopter_name}</span>
            <span className="adopt-req-user-email">{request.adopter_email}</span>
            {phone && (
              <span className="adopt-req-user-phone">📞 {phone}</span>
            )}
          </div>
        </div>

        {/* Detailed Application Info */}
        <div className="adopt-req-details-grid">
          {request.request_address && (
            <div className="adopt-req-detail-item">
              <strong>Address:</strong> {request.request_address}
            </div>
          )}
          {request.living_in && (
            <div className="adopt-req-detail-item">
              <strong>Living In:</strong> {request.living_in}
            </div>
          )}
          {request.has_other_pets && (
            <div className="adopt-req-detail-item">
              <strong>Other Pets:</strong> {request.has_other_pets}
            </div>
          )}
        </div>

        {request.reason && (
          <div className="adopt-req-message">
            <span className="adopt-req-message-label">Reason for Adoption:</span>
            <p>{request.reason}</p>
          </div>
        )}

        {/* Optional message */}
        {request.message && (
          <div className="adopt-req-message">
            <span className="adopt-req-message-label">Additional Message:</span>
            <p>{request.message}</p>
          </div>
        )}

        {/* Footer: date + action buttons */}
        <div className="adopt-req-footer">
          <span className="adopt-req-date">Submitted {formatDate(request.created_at)}</span>

          {isPending && (
            <div className="adopt-req-actions">
              <button
                type="button"
                className="adopt-req-btn approve"
                onClick={() => onStatusUpdate(request.request_id, "Approved")}
                disabled={isProcessing}
              >
                {isProcessing ? "..." : "✓ Approve"}
              </button>
              <button
                type="button"
                className="adopt-req-btn reject"
                onClick={() => onStatusUpdate(request.request_id, "Rejected")}
                disabled={isProcessing}
              >
                {isProcessing ? "..." : "✕ Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */

function AdminAdoptionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchRequests = async () => {
    try {
      const { data } = await API.get("/adoptions");
      setRequests(data.data || []);
    } catch (err) {
      console.error("Failed to fetch adoption requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    setProcessing(requestId);
    try {
      await API.put(`/adoptions/${requestId}/status`, { status });
      await fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update request.");
    } finally {
      setProcessing(null);
    }
  };

  /* ── Pagination Logic ── */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Render States ── */

  if (loading) {
    return (
      <div className="admin-overview">
        <div className="findpets-loading">
          <div className="findpets-spinner" />
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h1>Adoption Requests</h1>
        <p style={{ color: "#888", margin: "4px 0 0 0", fontSize: "14px" }}>
          Manage and review adoption applications from users
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="adopt-req-empty">
          <div className="adopt-req-empty-icon">📋</div>
          <h3>No Adoption Requests Yet</h3>
          <p>When users submit adoption requests, they will appear here.</p>
        </div>
      ) : (
        <>
          <div className="adopt-req-list">
            {currentItems.map((req) => (
              <RequestCard
                key={req.request_id}
                request={req}
                processing={processing}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="findpets-pagination" style={{ marginTop: "30px", marginBottom: "20px" }}>
              <button
                className="page-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminAdoptionRequests;
