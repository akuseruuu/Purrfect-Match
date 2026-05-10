import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
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
          <h2 className="auth-title">Login</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Password</label>
            </div>
            <button type="submit" className="auth-submit-btn">Log in</button>
            {error ? <p className="error-text">{error}</p> : null}
            <p className="auth-switch">
              Don't have an account? <Link to="/signup" className="auth-switch-link">Sign-Up</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;
