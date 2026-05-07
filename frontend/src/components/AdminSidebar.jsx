import { Link, useLocation, useNavigate } from "react-router-dom";

/* ── SVG Icon Components ── */

const DashboardIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const PetIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="4.5" cy="9.5" r="2.5" />
    <circle cx="9" cy="5.5" r="2.5" />
    <circle cx="15" cy="5.5" r="2.5" />
    <circle cx="19.5" cy="9.5" r="2.5" />
    <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.0 2.09 2.35C7.61 22.56 9.34 22 10.5 20.75c.42-.49.78-1.07 1.12-1.63.1-.15.19-.31.38-.31.19 0 .28.16.38.31.33.56.7 1.14 1.12 1.63 1.16 1.25 2.89 1.81 4.27 1.25 1.07-.35 1.8-1.33 2.08-2.35.31-2.03-1.3-3.48-2.61-4.79z" />
  </svg>
);

const RequestsIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

const DonationsIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);


const LogoutIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

/* ── Navigation Link Data ── */
const NAV_LINKS = [
  { to: "/admin", label: "Dashboard", icon: DashboardIcon },
  { to: "/admin/pets", label: "Manage Pet", icon: PetIcon },
  { to: "/admin/requests", label: "Adoption Requests", icon: RequestsIcon },
  { to: "/admin/donations", label: "Donations", icon: DonationsIcon },
];

/* ── Sidebar Component ── */

function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigating
    if (onClose) onClose();
  };

  return (
    <>
      {/* Dark overlay — visible only when sidebar is open on mobile */}
      {isOpen && (
        <div className="admin-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* Brand */}
        <div className="admin-brand">
          <img src="/public/logo.png" alt="Purrfect Match Logo" width="50" height="50" />
          <span>
            Purrfect Match
            <br />
            <small style={{ fontWeight: "normal", fontSize: "12px" }}>Admin Dashboard</small>
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="admin-nav">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-link ${isActive(to)}`}
              onClick={handleNavClick}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="admin-nav-bottom">
          <div className="admin-nav-link" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <LogoutIcon />
            LOG-OUT
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
