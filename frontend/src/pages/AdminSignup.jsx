import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function AdminSignup() {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/admin/register", formData);
      if (!response.data.success) {
        setError(response.data.message || "Signup failed.");
        return;
      }
      navigate("/admin/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-admin">
      <nav className="auth-navbar">
        <Link to="/" className="auth-navbar-brand">
          <img src="/logo.png" alt="Purrfect Match" className="auth-navbar-logo" />
          <span>Purrfect Match</span>
        </Link>
        <div className="auth-navbar-links">
          <Link to="/login" className="auth-navbar-link">User Login</Link>
          <Link to="/signup" className="auth-navbar-btn">Sign up</Link>
        </div>
      </nav>

      <section className="auth-card">
        <div className="auth-card-header">
          <img src="/logo.png" alt="Purrfect Match" className="auth-logo" />
          <h1 className="auth-title">Admin Sign Up</h1>
          <p className="auth-subtitle">Create a new administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error-banner">
              <span style={{ fontSize: "20px" }}>⚠️</span>
              {error}
            </div>
          )}

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="admin-signup-name">Full Name</label>
              <div className="auth-input-wrapper">
                <img src="/user.png" alt="Name" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="admin-signup-name"
                  type="text"
                  name="full_name"
                  placeholder="Admin Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="admin-signup-username">Username</label>
              <div className="auth-input-wrapper">
                <img src="/mail.png" alt="Username" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="admin-signup-username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="admin-signup-password">Password</label>
              <div className="auth-input-wrapper">
                <img src="/password.png" alt="Password" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="admin-signup-password"
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="admin-signup-confirm">Confirm Password</label>
              <div className="auth-input-wrapper">
                <img src="/password.png" alt="Password" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="admin-signup-confirm"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Creating account...
              </>
            ) : (
              "Create Admin Account"
            )}
          </button>

          <p className="auth-switch">
            Already an admin?{" "}
            <Link to="/admin/login" className="auth-switch-link">Admin Login</Link>
          </p>

        </form>
      </section>
    </main>
  );
}

export default AdminSignup;
