import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { API_BASE } from "../utils/constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig = {
  pending: { color: "#e65100", bg: "#fff3e0", label: "Pending" },
  approved: { color: "#2e7d32", bg: "#e8f5e9", label: "Approved" },
  rejected: { color: "#c62828", bg: "#ffebee", label: "Rejected" },
};

/* 
   Main Component
  */

function Donate() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Form state
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  // History state
  const [donations, setDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active tab: 'form' or 'history'
  const [activeTab, setActiveTab] = useState("form");

  // Image lightbox
  const [lightboxImg, setLightboxImg] = useState(null);

  const isLoggedIn = user && user.role !== "admin";

  // Fetch donation history
  const fetchDonations = async () => {
    if (!isLoggedIn) return;
    setLoadingHistory(true);
    try {
      const res = await API.get(`/donations/my/${user.user_id}`);
      setDonations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchDonations();
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFormMessage({ type: "error", text: "Only JPG and PNG images are allowed." });
      return;
    }

    // Validate size
    if (file.size > 2 * 1024 * 1024) {
      setFormMessage({ type: "error", text: "File size must be under 2 MB." });
      return;
    }

    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setFormMessage({ type: "", text: "" });
  };

  // Remove selected file
  const clearFile = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  // Submit donation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: "", text: "" });

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setFormMessage({ type: "error", text: "Please enter a valid donation amount." });
      return;
    }
    if (!referenceNumber.trim()) {
      setFormMessage({ type: "error", text: "Reference number is required." });
      return;
    }
    if (!proofFile) {
      setFormMessage({ type: "error", text: "Please upload a proof of payment image." });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("user_id", user.user_id);
    formData.append("amount", parseFloat(amount));
    formData.append("reference_number", referenceNumber.trim());
    formData.append("proof_image", proofFile);

    try {
      const res = await API.post("/donations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setFormMessage({ text: "Donation submitted successfully!" });
        setAmount("");
        setReferenceNumber("");
        clearFile();
        fetchDonations();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit donation.";
      setFormMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="landing-page">
      <Navbar />

      <section className="donate-section">
        <div className="donate-hero-banner">
          <div className="donate-hero-content">
            <span className="donate-hero-badge">❤️ Support Our Shelter</span>
            <h1 className="donate-hero-title">
              Every Donation <span className="landing-accent">Saves a Life</span>
            </h1>
            <p className="donate-hero-desc">
              Your generous contributions help us provide food, shelter, and medical care
              for rescued animals. Together, we can make a difference.
            </p>
          </div>
        </div>

        {!isLoggedIn ? (
          /* ── Not logged in — prompt ── */
          <div className="donate-login-prompt">

            <h2>Login Required</h2>
            <p>Please log in to submit a donation and track your contributions.</p>
            <Link to="/login" className="landing-cta-btn">Login to Donate</Link>
          </div>
        ) : (
          /* ── Logged in — tabs ── */
          <div className="donate-content-area">
            {/* Tab Switcher */}
            <div className="donate-tabs">
              <button
                type="button"
                className={`donate-tab ${activeTab === "form" ? "active" : ""}`}
                onClick={() => setActiveTab("form")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Make a Donation
              </button>
              <button
                type="button"
                className={`donate-tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                My Donations
                {donations.length > 0 && (
                  <span className="donate-tab-badge">{donations.length}</span>
                )}
              </button>
            </div>

            {/* ── Donation Form ── */}
            {activeTab === "form" && (
              <div className="donate-form-card">
                <div className="donate-form-header">
                  <h2>Submit Your Donation</h2>
                  <p>Fill in the details below and upload your proof of payment</p>
                </div>

                {/* ── GCash Info Box ── */}
                <div className="donate-payment-info">
                  <div className="donate-payment-header">
                    <div className="donate-payment-method">GCash Transfer</div>
                  </div>
                  <div className="donate-payment-details">
                    <div className="donate-qr-placeholder">
                      <img src="qr.png" alt="QR Code" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div className="donate-account-details">
                      <p className="donate-account-name">Account Name: <strong>Purrfect Match</strong></p>
                      <p className="donate-account-number">GCash Number: <strong>0969 302 1957</strong></p>
                      <p className="donate-account-hint">Please send your donation to the details above before submitting this form.</p>
                    </div>
                  </div>
                </div>

                <form className="donate-form" onSubmit={handleSubmit}>
                  {/* Amount */}
                  <div className="donate-field">
                    <label htmlFor="donate-amount">Donation Amount (₱)</label>
                    <div className="donate-amount-wrapper">
                      <span className="donate-currency">₱</span>
                      <input
                        id="donate-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Quick amounts */}
                  <div className="donate-quick-amounts">
                    {[100, 250, 500, 1000, 2500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`donate-quick-btn ${amount === String(val) ? "active" : ""}`}
                        onClick={() => setAmount(String(val))}
                      >
                        ₱{val.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Reference number */}
                  <div className="donate-field">
                    <label htmlFor="donate-ref">Reference Number</label>
                    <input
                      id="donate-ref"
                      type="text"
                      placeholder="e.g. GCash / Bank reference"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Proof upload */}
                  <div className="donate-field">
                    <label>Proof of Payment</label>
                    {proofPreview ? (
                      <div className="donate-preview-box">
                        <img src={proofPreview} alt="Proof preview" className="donate-preview-img" />
                        <button type="button" className="donate-preview-remove" onClick={clearFile}>
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="donate-proof" className="donate-upload-zone">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b63d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="donate-upload-text">Click to upload proof image</span>
                        <span className="donate-upload-hint">JPG or PNG • Max 2 MB</span>
                        <input
                          id="donate-proof"
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          hidden
                        />
                      </label>
                    )}
                  </div>

                  {/* Message */}
                  {formMessage.text && (
                    <div className={`donate-message ${formMessage.type}`}>
                      {formMessage.type === "success" ? "✅" : "⚠️"} {formMessage.text}
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" className="donate-submit-btn" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="donate-spinner" /> Submitting...
                      </>
                    ) : (
                      "Submit Donation"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Donation History ── */}
            {activeTab === "history" && (
              <div className="donate-history-area">
                {loadingHistory ? (
                  <div className="findpets-loading">
                    <div className="findpets-spinner" />
                    <p>Loading your donations...</p>
                  </div>
                ) : donations.length === 0 ? (
                  <div className="donate-empty">
                    <h3>No Donations Yet</h3>
                    <p>Make your first donation to help our furry friends!</p>
                    <button
                      type="button"
                      className="landing-cta-btn"
                      onClick={() => setActiveTab("form")}
                    >
                      Donate Now
                    </button>
                  </div>
                ) : (
                  <div className="donate-history-list">
                    {donations.map((d) => {
                      const config = statusConfig[d.status] || statusConfig.pending;
                      const imgUrl = resolveImage(d.proof_image);

                      return (
                        <div key={d.id} className="donate-history-card">
                          <div className="donate-history-left">
                            <div className="donate-history-amount">
                              ₱{parseFloat(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="donate-history-ref">
                              Ref: {d.reference_number}
                            </div>
                            <div className="donate-history-date">
                              {formatDate(d.created_at)}
                            </div>
                          </div>

                          <div className="donate-history-center">
                            {imgUrl && (
                              <img
                                src={imgUrl}
                                alt="Proof"
                                className="donate-history-proof"
                                onClick={() => setLightboxImg(imgUrl)}
                              />
                            )}
                          </div>

                          <div className="donate-history-right">
                            <span
                              className="donate-history-status"
                              style={{ color: config.color, backgroundColor: config.bg }}
                            >
                              {config.icon} {config.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div className="donate-lightbox" onClick={() => setLightboxImg(null)}>
          <button type="button" className="donate-lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
          <img src={lightboxImg} alt="Proof of payment" />
        </div>
      )}

      <Footer />
    </main>
  );
}

export default Donate;