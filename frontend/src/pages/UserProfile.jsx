import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `http://localhost:3000/${img}`;
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
    Pending:  { icon: "⏳", color: "#e65100", bg: "#fff3e0", label: "Pending Review" },
    Approved: { icon: "✅", color: "#2e7d32", bg: "#e8f5e9", label: "Approved" },
    Rejected: { icon: "❌", color: "#c62828", bg: "#ffebee", label: "Rejected" },
  };

  if (!user || user.role === "admin") return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const pendingCount  = applications.filter(a => a.request_status === "Pending").length;
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="profile-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="profile-detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </div>
          <button type="button" className="profile-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

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
