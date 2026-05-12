import { useEffect, useState } from "react";
import API from "../api/api";

import { API_BASE } from "../utils/constants";

/** Resolves a proof image path into a full URL. */
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

/** Maps a donation status to the appropriate badge CSS class. */
function getBadgeClass(status) {
  const classMap = {
    pending: "donate-admin-badge pending",
    approved: "donate-admin-badge approved",
    rejected: "donate-admin-badge rejected",
  };
  return classMap[status] || "donate-admin-badge";
}

/* ── Donation Card Sub-component ── */

function DonationCard({ donation, processing, onApprove, onReject, onImageClick }) {
  const image = resolveImage(donation.proof_image);
  const isPending = donation.status === "pending";
  const isProcessing = processing === donation.id;

  return (
    <div className="donate-admin-card">
      {/* Proof Image Thumbnail */}
      <div className="donate-admin-thumb">
        {image ? (
          <img
            src={image}
            alt="Proof of payment"
            onClick={() => onImageClick(image)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div className="donate-admin-thumb-placeholder">📄</div>
        )}
      </div>

      {/* Donation Info */}
      <div className="donate-admin-info">
        {/* Amount + status badge */}
        <div className="donate-admin-top-row">
          <div>
            <h3 className="donate-admin-amount">
              ₱{parseFloat(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <span className="donate-admin-ref">
              Ref: {donation.reference_number}
            </span>
          </div>
          <span className={getBadgeClass(donation.status)}>
            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
          </span>
        </div>

        {/* Donor info */}
        <div className="donate-admin-user-row">
          <div className="donate-admin-user-avatar">
            {donation.donor_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <span className="donate-admin-user-name">{donation.donor_name}</span>
            <span className="donate-admin-user-email">{donation.donor_email}</span>
          </div>
        </div>

        {/* Footer: date + action buttons */}
        <div className="donate-admin-footer">
          <span className="donate-admin-date">Submitted {formatDate(donation.created_at)}</span>

          {isPending && (
            <div className="donate-admin-actions">
              <button
                type="button"
                className="donate-admin-btn approve"
                onClick={() => onApprove(donation.id)}
                disabled={isProcessing}
              >
                {isProcessing ? "..." : "✓ Approve"}
              </button>
              <button
                type="button"
                className="donate-admin-btn reject"
                onClick={() => onReject(donation.id)}
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

/*
   Main Component
  */

function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [lightboxImg, setLightboxImg] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDonations = async () => {
    try {
      const { data } = await API.get("/donations");
      setDonations(data.data || []);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleApprove = async (donationId) => {
    setProcessing(donationId);
    try {
      await API.patch(`/donations/${donationId}/approve`);
      await fetchDonations();
    } catch (err) {
      console.error("Failed to approve donation:", err);
      alert(err.response?.data?.message || "Failed to approve donation.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (donationId) => {
    setProcessing(donationId);
    try {
      await API.patch(`/donations/${donationId}/reject`);
      await fetchDonations();
    } catch (err) {
      console.error("Failed to reject donation:", err);
      alert(err.response?.data?.message || "Failed to reject donation.");
    } finally {
      setProcessing(null);
    }
  };

  /* ── Filtering ── */
  const filteredDonations = filter === "all"
    ? donations
    : donations.filter((d) => d.status === filter);

  /* ── Stats ── */
  const totalAmount = donations
    .filter((d) => d.status === "approved")
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const pendingCount = donations.filter((d) => d.status === "pending").length;
  const approvedCount = donations.filter((d) => d.status === "approved").length;
  const rejectedCount = donations.filter((d) => d.status === "rejected").length;

  /* ── Pagination Logic ── */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  /* ── Render States ── */

  if (loading) {
    return (
      <div className="admin-overview">
        <div className="findpets-loading">
          <div className="findpets-spinner" />
          <p>Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h1>Donations</h1>
        <p style={{ color: "#888", margin: "4px 0 0 0", fontSize: "14px" }}>
          Review and manage donation submissions from users
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="donate-admin-stats">
        <div className="donate-admin-stat-card total">
          <div>
            <span className="donate-admin-stat-value">
              ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="donate-admin-stat-label">Total Approved</span>
          </div>
        </div>
        <div className="donate-admin-stat-card pending">
          <div>
            <span className="donate-admin-stat-value">{pendingCount}</span>
            <span className="donate-admin-stat-label">Pending</span>
          </div>
        </div>
        <div className="donate-admin-stat-card approved">
          <div>
            <span className="donate-admin-stat-value">{approvedCount}</span>
            <span className="donate-admin-stat-label">Approved</span>
          </div>
        </div>
        <div className="donate-admin-stat-card rejected">
          <div>
            <span className="donate-admin-stat-value">{rejectedCount}</span>
            <span className="donate-admin-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="donate-admin-filter">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            type="button"
            className={`donate-admin-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="donate-admin-filter-count">
              {f === "all" ? donations.length
                : f === "pending" ? pendingCount
                  : f === "approved" ? approvedCount
                    : rejectedCount}
            </span>
          </button>
        ))}
      </div>

      {/* ── Donation List ── */}
      {filteredDonations.length === 0 ? (
        <div className="adopt-req-empty">
          <h3>No Donations Found</h3>
          <p>
            {filter === "all"
              ? "When users submit donations, they will appear here."
              : `No ${filter} donations at the moment.`}
          </p>
        </div>
      ) : (
        <>
          <div className="donate-admin-list">
            {currentItems.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                processing={processing}
                onApprove={handleApprove}
                onReject={handleReject}
                onImageClick={setLightboxImg}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pet-pagination" style={{ marginTop: "24px" }}>
              <button
                className="pet-pagination-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`pet-pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pet-pagination-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}

          <div className="pet-catalog-footer" style={{ marginTop: "16px" }}>
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredDonations.length)} of {filteredDonations.length} Donations
          </div>
        </>
      )}

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div className="donate-lightbox" onClick={() => setLightboxImg(null)}>
          <button type="button" className="donate-lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
          <img src={lightboxImg} alt="Proof of payment" />
        </div>
      )}
    </div>
  );
}

export default AdminDonations;
