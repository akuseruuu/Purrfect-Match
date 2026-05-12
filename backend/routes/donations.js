const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

const router = express.Router();

// ── Ensure uploads/donations directory exists 
const donationsDir = path.join(__dirname, "..", "uploads", "donations");
if (!fs.existsSync(donationsDir)) {
  fs.mkdirSync(donationsDir, { recursive: true });
}

// ── Multer setup for donation proof images 
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, donationsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `donation_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "proof_image"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// ── POST /api/donations
// Submit a new donation with proof image.
// Wraps multer in manual error handling so file-related errors return proper messages.
router.post("/", (req, res) => {
  upload.single("proof_image")(req, res, async (uploadErr) => {
    // Handle multer-specific errors
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError) {
        if (uploadErr.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ success: false, message: "File too large. Maximum size is 2 MB." });
        }
        return res.status(400).json({ success: false, message: "Only JPG and PNG images are allowed." });
      }
      console.error("Upload error:", uploadErr);
      return res.status(500).json({ success: false, message: "File upload failed." });
    }

    const { user_id, amount, reference_number } = req.body;

    if (!user_id || !amount || !reference_number) {
      return res.status(400).json({
        success: false,
        message: "user_id, amount, and reference_number are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof image is required (JPG or PNG, max 2 MB).",
      });
    }

    const proofPath = `uploads/donations/${req.file.filename}`;

    try {
      await pool.query(
        `INSERT INTO donations (user_id, amount, reference_number, proof_image)
         VALUES (?, ?, ?, ?)`,
        [user_id, parseFloat(amount), reference_number, proofPath]
      );

      res.json({ success: true, message: "Donation submitted successfully!" });
    } catch (err) {
      // Handle duplicate reference_number
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "This reference number has already been used.",
        });
      }
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to submit donation." });
    }
  });
});

// ── GET /api/donations/my/:userId 
// Return all donations for a specific user.
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, amount, reference_number, proof_image, status, created_at
       FROM donations
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch donations." });
  }
});

// ── GET /api/donations/stats
// Returns counts + total for dashboard stat cards.
// NOTE: Must be defined BEFORE the catch-all GET "/" route.
router.get("/stats", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*)                                          AS total_donations,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS total_approved_amount,
         SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
       FROM donations`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch donation stats." });
  }
});

// ── GET /api/donations/monthly
// Returns monthly donation totals for the specified range (for chart visualization).
// Accepts ?months=N query param (1, 3, 6, 12). Defaults to 6.
router.get("/monthly", async (req, res) => {
  const allowed = [1, 3, 6, 12];
  const months = allowed.includes(Number(req.query.months)) ? Number(req.query.months) : 6;

  // months=1 means "this calendar month only"
  const dateFilter = months === 1
    ? `created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`
    : `created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)`;
  const params = months === 1 ? [] : [months];

  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS month,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS approved_total,
         COALESCE(SUM(amount), 0) AS all_total,
         COUNT(*) AS donation_count
       FROM donations
       WHERE ${dateFilter}
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch monthly donation data." });
  }
});

// ── GET /api/donations/export/csv 
// Exports donation records as a CSV file for reporting.
// Accepts optional ?months=N query param (1, 3, 6, 12) to filter by date range.
router.get("/export/csv", async (req, res) => {
  const allowedMonths = [1, 3, 6, 12];
  const months = allowedMonths.includes(Number(req.query.months))
    ? Number(req.query.months)
    : null; // null = export all

  try {
    let query = `SELECT
         d.id,
         u.full_name AS donor_name,
         u.email     AS donor_email,
         d.amount,
         d.reference_number,
         d.status,
         d.created_at
       FROM donations d
       INNER JOIN users u ON d.user_id = u.user_id`;
    const params = [];

    if (months === 1) {
      query += ` WHERE d.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`;
    } else if (months) {
      query += ` WHERE d.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)`;
      params.push(months);
    }

    query += ` ORDER BY d.created_at DESC`;

    const [rows] = await pool.query(query, params);

    const headers = ["ID", "Donor Name", "Donor Email", "Amount", "Reference Number", "Status", "Date"];
    const csvRows = rows.map((r) =>
      [
        r.id,
        `"${(r.donor_name || "").replace(/"/g, '""')}"`,
        `"${(r.donor_email || "").replace(/"/g, '""')}"`,
        r.amount,
        `"${r.reference_number}"`,
        r.status,
        new Date(r.created_at).toISOString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const rangeLabel = months ? `${months}mo` : "all";

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=donations_report_${rangeLabel}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to export donations." });
  }
});

// ── GET /api/donations 
// Admin: Return all donations with user info.
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         d.id,
         d.amount,
         d.reference_number,
         d.proof_image,
         d.status,
         d.created_at,
         u.user_id,
         u.full_name AS donor_name,
         u.email     AS donor_email
       FROM donations d
       INNER JOIN users u ON d.user_id = u.user_id
       ORDER BY d.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch donations." });
  }
});

// ── PATCH /api/donations/:id/approve 
// Admin: Approve a donation.
router.patch("/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE donations SET status = 'approved' WHERE id = ? AND status = 'pending'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or already processed.",
      });
    }

    res.json({ success: true, message: "Donation approved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to approve donation." });
  }
});

// ── PATCH /api/donations/:id/reject 
// Admin: Reject a donation.
router.patch("/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE donations SET status = 'rejected' WHERE id = ? AND status = 'pending'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or already processed.",
      });
    }

    res.json({ success: true, message: "Donation rejected successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to reject donation." });
  }
});

module.exports = router;
