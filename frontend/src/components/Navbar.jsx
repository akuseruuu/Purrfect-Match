import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="landing-navbar">
      <Link to="/" className="landing-brand">Purrfect Match</Link>

      {/* Hamburger button — visible only on mobile */}
      <button
        type="button"
        className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      {/* Nav links + right section — collapsible on mobile */}
      <div className={`navbar-collapse ${menuOpen ? "show" : ""}`}>
        <div className="landing-nav-center">
          <Link to="/" className={`landing-nav-item ${isActive("/") ? "active-link" : ""}`}>Home</Link>
          <Link to="/pets" className={`landing-nav-item ${isActive("/pets") ? "active-link" : ""}`}>Find a Pet</Link>
          <Link to="/donate" className={`landing-nav-item ${isActive("/donate") ? "active-link" : ""}`}>Donate</Link>
          <Link to="/about" className={`landing-nav-item ${isActive("/about") ? "active-link" : ""}`}>About Us</Link>
        </div>

        <div className="landing-nav-right">
          {user ? (
            <>
              {user.role === "admin" && <Link to="/admin" className="landing-nav-item">Admin</Link>}
              {user.role === "admin" ? (
                <button
                  type="button"
                  className="landing-signup-btn"
                  onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}
                >
                  Logout
                </button>
              ) : (
                <Link to="/profile" className="profile-nav-avatar" title="My Profile">
                  {initials}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="landing-login-link">Login</Link>
              <Link to="/signup" className="landing-signup-btn">Sign-up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
