import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { API_BASE } from "../utils/constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editAddress, setEditAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user || user.role === "admin") {
      navigate("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await API.get(`/adoptions/user/${user.user_id}`);
        setApplications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // ── Edit Profile Handlers ──
  const handleEditStart = () => {
    setEditPhone(user.phone || "");
    setEditAddress(user.address || "");
    setEditMessage({ type: "", text: "" });
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditMessage({ type: "", text: "" });
  };

  const handleEditSave = async () => {
    setSaving(true);
    setEditMessage({ type: "", text: "" });

    try {
      const res = await API.put(`/users/${user.user_id}`, {
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditMessage({ type: "success", text: "Profile updated!" });
        setTimeout(() => {
          setEditing(false);
          setEditMessage({ type: "", text: "" });
        }, 1200);
      }
    } catch (err) {
      setEditMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE}/${img}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAge = (age) => {
    if (!age && age !== 0) return "";
    const num = parseInt(age, 10);
    if (num >= 12) {
      const years = Math.floor(num / 12);
      return `${years} yr${years > 1 ? "s" : ""}`;
    }
    return `${num} mo`;
  };

  const statusConfig = {
    Pending: { icon: "⏳", color: "#e65100", bg: "#fff3e0", label: "Pending Review" },
    Approved: { icon: "✅", color: "#2e7d32", bg: "#e8f5e9", label: "Approved" },
    Rejected: { icon: "❌", color: "#c62828", bg: "#ffebee", label: "Rejected" },
  };

  if (!user || user.role === "admin") return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const pendingCount = applications.filter(a => a.request_status === "Pending").length;
  const approvedCount = applications.filter(a => a.request_status === "Approved").length;
  const rejectedCount = applications.filter(a => a.request_status === "Rejected").length;

  return (
    <main className="landing-page">
      <Navbar />

      <section className="profile-container">
        {/* ── User Details Card ── */}
        <div className="profile-user-card">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-user-info">
            <h1 className="profile-user-name">{user.full_name}</h1>
            <span className="profile-user-role">Pet Adopter</span>
            <div className="profile-user-details">
              <div className="profile-detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="profile-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="profile-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card-actions">
            {!editing && (
              <button type="button" className="profile-edit-btn" onClick={handleEditStart}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Details
              </button>
            )}
            <button type="button" className="profile-logout-btn" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* ── Edit Profile Inline Card ── */}
        {editing && (
          <div className="profile-edit-card">
            <h2 className="profile-edit-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </h2>

            <div className="profile-edit-form">
              <div className="profile-edit-field">
                <label htmlFor="edit-phone">Phone Number</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    id="edit-phone"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="profile-edit-field">
                <label htmlFor="edit-address">Address</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    id="edit-address"
                    type="text"
                    placeholder="City, Province"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>

            {editMessage.text && (
              <div className={`profile-edit-message ${editMessage.type}`}>
                {editMessage.type === "success" ? "✅" : "⚠️"} {editMessage.text}
              </div>
            )}

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-edit-save-btn"
                onClick={handleEditSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="profile-edit-cancel-btn"
                onClick={handleEditCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Stats Summary ── */}
        <div className="profile-stats-row">
          <div className="profile-stat-card">
            <span className="profile-stat-number">{applications.length}</span>
            <span className="profile-stat-label">Total Applications</span>
          </div>
          <div className="profile-stat-card pending">
            <span className="profile-stat-number">{pendingCount}</span>
            <span className="profile-stat-label">Pending</span>
          </div>
          <div className="profile-stat-card approved">
            <span className="profile-stat-number">{approvedCount}</span>
            <span className="profile-stat-label">Approved</span>
          </div>
          <div className="profile-stat-card rejected">
            <span className="profile-stat-number">{rejectedCount}</span>
            <span className="profile-stat-label">Rejected</span>
          </div>
        </div>

        {/* ── Applications List ── */}
        <div className="profile-section">
          <h2 className="profile-section-title">My Applications</h2>

          {loading ? (
            <div className="findpets-loading">
              <div className="findpets-spinner" />
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">🐾</div>
              <h3>No Applications Yet</h3>
              <p>Find your purrfect companion and submit an adoption request!</p>
              <Link to="/pets" className="landing-cta-btn" style={{ marginTop: "16px" }}>
                Browse Pets
              </Link>
            </div>
          ) : (
            <div className="profile-app-list">
              {applications.map((app) => {
                const config = statusConfig[app.request_status] || statusConfig.Pending;
                const imgUrl = resolveImage(app.pet_image);

                return (
                  <div key={app.request_id} className="profile-app-card">
                    <div className="profile-app-thumb">
                      {imgUrl ? (
                        <img src={imgUrl} alt={app.pet_name} />
                      ) : (
                        <div className="profile-app-thumb-placeholder">🐾</div>
                      )}
                    </div>

                    <div className="profile-app-info">
                      <div className="profile-app-top">
                        <div>
                          <h3 className="profile-app-pet-name">{app.pet_name || "Unknown Pet"}</h3>
                          <span className="profile-app-breed">
                            {app.species} · {app.breed} {app.age ? `· ${formatAge(app.age)}` : ""}
                          </span>
                        </div>
                        <span
                          className="profile-app-status"
                          style={{ color: config.color, backgroundColor: config.bg }}
                        >
                          {config.icon} {config.label}
                        </span>
                      </div>

                      {app.message && (
                        <p className="profile-app-message">"{app.message}"</p>
                      )}

                      <div className="profile-app-footer">
                        <span className="profile-app-date">
                          Applied {formatDate(app.created_at)}
                        </span>
                        <Link to={`/pets/${app.pet_id}`} className="profile-app-view">
                          View Pet →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default UserProfile;
