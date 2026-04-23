import { useEffect, useState } from "react";
import API from "../api/api";

function AdminAdoptionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // request_id being processed

  const fetchRequests = async () => {
    try {
      const response = await API.get("/adoptions");
      setRequests(response.data.data || []);
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
      // Refresh the list
      await fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update request.");
    } finally {
      setProcessing(null);
    }
  };

  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `http://localhost:3000/${img}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "adopt-req-badge pending";
      case "Approved":
        return "adopt-req-badge approved";
      case "Rejected":
        return "adopt-req-badge rejected";
      default:
        return "adopt-req-badge";
    }
  };

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h1>Adoption Requests</h1>
        <p style={{ color: "#888", margin: "4px 0 0 0", fontSize: "14px" }}>
          Manage and review adoption applications from users
        </p>
      </div>

      {loading ? (
        <div className="findpets-loading">
          <div className="findpets-spinner" />
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="adopt-req-empty">
          <div className="adopt-req-empty-icon">📋</div>
          <h3>No Adoption Requests Yet</h3>
          <p>When users submit adoption requests, they will appear here.</p>
        </div>
      ) : (
        <div className="adopt-req-list">
          {requests.map((req) => (
            <div key={req.request_id} className="adopt-req-card">
              {/* Pet thumbnail */}
              <div className="adopt-req-pet-thumb">
                {resolveImage(req.pet_image) ? (
                  <img src={resolveImage(req.pet_image)} alt={req.pet_name} />
                ) : (
                  <div className="adopt-req-pet-placeholder">🐾</div>
                )}
              </div>

              {/* Info */}
              <div className="adopt-req-info">
                <div className="adopt-req-top-row">
                  <div>
                    <h3 className="adopt-req-pet-name">{req.pet_name}</h3>
                    <span className="adopt-req-breed">
                      {req.species} · {req.breed}
                    </span>
                  </div>
                  <span className={statusBadgeClass(req.request_status)}>
                    {req.request_status}
                  </span>
                </div>

                <div className="adopt-req-user-row">
                  <div className="adopt-req-user-avatar">
                    {req.adopter_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="adopt-req-user-name">{req.adopter_name}</span>
                    <span className="adopt-req-user-email">{req.adopter_email}</span>
                    {req.adopter_phone && (
                      <span className="adopt-req-user-phone">📞 {req.adopter_phone}</span>
                    )}
                  </div>
                </div>

                {req.message && (
                  <div className="adopt-req-message">
                    <span className="adopt-req-message-label">Message:</span>
                    <p>{req.message}</p>
                  </div>
                )}

                <div className="adopt-req-footer">
                  <span className="adopt-req-date">
                    Submitted {formatDate(req.created_at)}
                  </span>

                  {req.request_status === "Pending" && (
                    <div className="adopt-req-actions">
                      <button
                        type="button"
                        className="adopt-req-btn approve"
                        onClick={() => handleStatusUpdate(req.request_id, "Approved")}
                        disabled={processing === req.request_id}
                      >
                        {processing === req.request_id ? "..." : "✓ Approve"}
                      </button>
                      <button
                        type="button"
                        className="adopt-req-btn reject"
                        onClick={() => handleStatusUpdate(req.request_id, "Rejected")}
                        disabled={processing === req.request_id}
                      >
                        {processing === req.request_id ? "..." : "✕ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAdoptionRequests;
