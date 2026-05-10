import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await API.post("/admin/login", { username, password });
      if (!response.data.success) {
        setError(response.data.message || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to login.");
    }
  };

  return (
    <main className="auth-page">
      <nav className="auth-navbar">
        <Link to="/" className="landing-brand">Purrfect Match</Link>
        <div className="landing-nav-right">
          <Link to="/login" className="landing-login-link">Login</Link>
          <Link to="/signup" className="landing-signup-btn">Sign-up</Link>
        </div>
      </nav>

      <section className="auth-container">
        <div className="auth-image">
          <img src="/login-dog.png" alt="Golden retriever" />
        </div>
        <div className="auth-form-wrapper">
          <h2 className="auth-title">Admin Login</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-remember">
              <input type="checkbox" id="admin-remember" />
              <label htmlFor="admin-remember">Remember Password</label>
            </div>
            <button type="submit" className="auth-submit-btn">Log in</button>
            {error ? <p className="error-text">{error}</p> : null}
            <p className="auth-switch">
              Need an admin account? <Link to="/admin/signup" className="auth-switch-link">Sign Up</Link>
            </p>
            <p className="auth-switch" style={{ marginTop: '8px' }}>
              Not an admin? <Link to="/login" className="auth-switch-link">User Login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
