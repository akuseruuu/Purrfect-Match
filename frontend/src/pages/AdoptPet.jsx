import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ── Constants ── */

import { API_BASE } from "../utils/constants";

const LIVING_OPTIONS = [
  { value: "", label: "Select your living situation" },
  { value: "Apartment", label: "Apartment" },
  { value: "Condo", label: "Condo" },
  { value: "House", label: "House" },
  { value: "Dorm", label: "Dorm" },
  { value: "Others", label: "Others" },
];

const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  living_in: "",
  reason: "",
  has_other_pets: "",
  message: "",
};

/* ── Helper ── */

function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img}`;
}

/* ── Reusable Form Field Components ── */

function TextField({ label, id, error, ...props }) {
  return (
    <div className="adopt-form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {error && <span className="adopt-form-error">{error}</span>}
    </div>
  );
}

function TextAreaField({ label, id, error, ...props }) {
  return (
    <div className="adopt-form-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} {...props} />
      {error && <span className="adopt-form-error">{error}</span>}
    </div>
  );
}

function SelectField({ label, id, options, error, ...props }) {
  return (
    <div className="adopt-form-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="adopt-form-error">{error}</span>}
    </div>
  );
}

function RadioGroup({ label, name, value, onChange, options, error }) {
  return (
    <div className="adopt-form-field">
      <label>{label}</label>
      <div className="adopt-form-radios">
        {options.map((opt) => (
          <label key={opt.value} className="adopt-form-radio-label">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <span className="adopt-form-error">{error}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Adoption Page Component
   ══════════════════════════════════════════════════════════════════════════════ */

function AdoptPet() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ── State ── */
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  /* ── Redirect if not logged in or is admin ── */
  useEffect(() => {
    if (!user || user.role === "admin") {
      navigate("/login", { replace: true });
    }
  }, []);

  /* ── Fetch pet info ── */
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await API.get("/pets");
        const found = (data.data || []).find(
          (p) => String(p.id) === String(petId)
        );
        setPet(found || null);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId]);

  /* ── Auto-populate user fields from localStorage ── */
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, []);

  /* ── Handlers ── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.full_name.trim()) newErrors.full_name = "Name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ""))) {
      newErrors.phone = "Enter a valid phone number.";
    }
    if (!form.address.trim()) newErrors.address = "Address is required.";
    if (!form.living_in) newErrors.living_in = "Please select your living situation.";
    if (!form.reason.trim()) newErrors.reason = "Please tell us why you want to adopt.";
    if (!form.has_other_pets) newErrors.has_other_pets = "Please select Yes or No.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const { data } = await API.post("/adoptions", {
        user_id: user.user_id,
        pet_id: Number(petId),
        message: form.message || null,
        phone: form.phone,
        address: form.address,
        living_in: form.living_in,
        reason: form.reason,
        has_other_pets: form.has_other_pets,
      });

      setSubmitResult({ success: true, message: data.message });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setSubmitResult({ success: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading & Not Found States ── */

  if (loading) {
    return (
      <main className="landing-page">
        <Navbar />
        <div className="pet-profile-loading">
          <div className="findpets-spinner" />
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="landing-page">
        <Navbar />
        <div className="pet-profile-loading">
          <h2>Pet not found</h2>
          <p>The pet you're looking for doesn't exist.</p>
          <Link to="/pets" className="landing-cta-btn" style={{ marginTop: "16px" }}>
            Browse All Pets
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (pet.status !== "Available") {
    return (
      <main className="landing-page">
        <Navbar />
        <div className="pet-profile-loading">
          <h2>Not Available</h2>
          <p>{pet.name} is no longer available for adoption.</p>
          <Link to="/pets" className="landing-cta-btn" style={{ marginTop: "16px" }}>
            Browse Other Pets
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── Success State ── */

  if (submitResult?.success) {
    return (
      <main className="landing-page">
        <Navbar />
        <section className="adopt-page-section">
          <div className="adopt-success-page">
            <div className="adopt-success-icon-large"></div>
            <h1>Application Submitted!</h1>
            <p>{submitResult.message}</p>
            <p className="adopt-success-detail">
              We've received your adoption application for <strong>{pet.name}</strong>.
              Our team will review it and get back to you soon.
            </p>
            <div className="adopt-success-actions">
              <Link to={`/pets/${pet.id}`} className="adopt-form-btn secondary">
                Back to {pet.name}'s Profile
              </Link>
              <Link to="/pets" className="adopt-form-btn primary">
                Browse More Pets
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  /* ── Main Form Render ── */

  const petImage = resolveImage(pet.image);

  return (
    <main className="landing-page">
      <Navbar />

      <section className="adopt-page-section">
        <button
          type="button"
          className="pet-profile-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="adopt-page-layout">
          {/* ── Left: Pet Summary Card ── */}
          <aside className="adopt-pet-summary">
            <div className="adopt-pet-image">
              {petImage ? (
                <img src={petImage} alt={pet.name} />
              ) : (
                <div className="featured-pet-img-placeholder" style={{ height: 220 }}>🐾</div>
              )}
            </div>
            <div className="adopt-pet-info">
              <h2>{pet.name}</h2>
              <p className="adopt-pet-breed">{pet.species} · {pet.breed}</p>
              <span className="pet-profile-status">Available</span>
            </div>
          </aside>

          {/* ── Right: Application Form ── */}
          <form className="adopt-form-container" onSubmit={handleSubmit} noValidate>
            <h1 className="adopt-form-title">Adoption Application</h1>
            <p className="adopt-form-subtitle">
              Fill out this form to apply for adopting <strong>{pet.name}</strong>.
              All fields are required.
            </p>

            {/* Section 1: Applicant's Information */}
            <fieldset className="adopt-form-section">
              <legend>Applicant's Information</legend>

              <TextField
                label="Full Name"
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
                error={errors.full_name}
              />

              <TextField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <TextField
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 09123456789"
                value={form.phone}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Allow only digits, backspace, delete, tab, arrows
                  if (
                    !/[0-9]/.test(e.key) &&
                    !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                error={errors.phone}
              />
            </fieldset>

            {/* Section 2: Household Information */}
            <fieldset className="adopt-form-section">
              <legend>Household Information</legend>

              <TextAreaField
                label="Address"
                id="address"
                name="address"
                rows={2}
                placeholder="Your complete home address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
              />

              <SelectField
                label="Living In"
                id="living_in"
                name="living_in"
                value={form.living_in}
                onChange={handleChange}
                options={LIVING_OPTIONS}
                error={errors.living_in}
              />

              <TextAreaField
                label="Why do you want to adopt this pet?"
                id="reason"
                name="reason"
                rows={4}
                placeholder="Tell us about your home environment, experience with pets, and why you'd be a great match..."
                value={form.reason}
                onChange={handleChange}
                error={errors.reason}
              />

              <RadioGroup
                label="Do you have any other pets?"
                name="has_other_pets"
                value={form.has_other_pets}
                onChange={handleChange}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                error={errors.has_other_pets}
              />
            </fieldset>

            {/* Optional message */}
            <TextAreaField
              label="Additional Message (optional)"
              id="message"
              name="message"
              rows={3}
              placeholder="Anything else you'd like to tell us?"
              value={form.message}
              onChange={handleChange}
            />

            {/* Error banner */}
            {submitResult && !submitResult.success && (
              <div className="adopt-form-error-banner">
                {submitResult.message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="adopt-form-btn primary full-width"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application 🐾"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default AdoptPet;
