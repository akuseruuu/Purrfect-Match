import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/login", { email, password });
      if (!response.data.success) {
        setError(response.data.message || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to login.");
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
          <Link to="/login" className="auth-navbar-link active">Login</Link>
          <Link to="/signup" className="auth-navbar-btn">Sign up</Link>
        </div>
      </nav>

      <section className="auth-card">
        <div className="auth-card-header">
          <img src="/logo.png" alt="Purrfect Match" className="auth-logo" />
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrapper">
              <img src="/mail.png" alt="Email" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <img src="/password.png" alt="Password" className="auth-input-icon" style={{ opacity: 0.3, width: "18px", height: "18px" }} />
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input type="checkbox" id="remember" />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-switch-link">Create one</Link>
          </p>

        </form>
      </section>
    </main>
  );
}

export default Login;
