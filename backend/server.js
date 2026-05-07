require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const petRoutes = require("./routes/pets");
const authRoutes = require("./routes/auth");
const adoptionRoutes = require("./routes/adoptions");
const donationRoutes = require("./routes/donations");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/pets", petRoutes);
app.use("/api", authRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Purrfect Match API is running 🐾" });
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
