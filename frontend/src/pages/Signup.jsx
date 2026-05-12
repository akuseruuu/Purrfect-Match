import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Signup() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
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
    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!formData.address.trim()) {
      setError("Please enter your address.");
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
      const response = await API.post("/register", formData);
      if (!response.data.success) {
        setError(response.data.message || "Signup failed.");
        return;
      }
      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <nav className="auth-navbar">
        <Link to="/" className="auth-navbar-brand">
          <img src="/logo.png" alt="Purrfect Match" className="auth-navbar-logo" />
          <span>Purrfect Match</span>
        </Link>
        <div className="auth-navbar-links">
          <Link to="/login" className="auth-navbar-link">Login</Link>
          <Link to="/signup" className="auth-navbar-btn active">Sign up</Link>
        </div>
      </nav>

      <section className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <img src="/logo.png" alt="Purrfect Match" className="auth-logo" />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and find your purrfect companion</p>
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
              <label htmlFor="signup-name">Full Name</label>
              <div className="auth-input-wrapper">
                <img src="/user.png" alt="Name" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="signup-name"
                  type="text"
                  name="full_name"
                  placeholder="Lebron James"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="signup-phone">Phone Number</label>
              <div className="auth-input-wrapper">
                <img src="/telephone.png" alt="Phone" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  placeholder="09XX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email Address</label>
            <div className="auth-input-wrapper">
              <img src="/mail.png" alt="Email" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-address">Address</label>
            <div className="auth-input-wrapper">
              <img src="/location.png" alt="Address" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
              <input
                id="signup-address"
                type="text"
                name="address"
                placeholder="City, Province"
                value={formData.address}
                onChange={handleChange}

                autoComplete="street-address"
              />
            </div>
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <img src="/password.png" alt="Password" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="signup-password"
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
              <label htmlFor="signup-confirm">Confirm Password</label>
              <div className="auth-input-wrapper">
                <img src="/password.png" alt="password" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
                <input
                  id="signup-confirm"
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
              "Create Account"
            )}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Log in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Signup;
