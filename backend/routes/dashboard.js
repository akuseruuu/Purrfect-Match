const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ── GET /api/dashboard/activity ─────────────────────────────────────────────
// Returns recent activity feed aggregated from donations, adoptions, and pets.
// Uses UNION ALL to combine events from multiple tables into a single timeline.
router.get("/activity", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `(
        SELECT
          'donation' AS type,
          CONCAT(u.full_name, ' donated ₱', FORMAT(d.amount, 2)) AS description,
          d.status AS status,
          d.created_at AS created_at
        FROM donations d
        INNER JOIN users u ON d.user_id = u.user_id
        ORDER BY d.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT
          'adoption' AS type,
          CONCAT(u.full_name, ' requested to adopt ', p.name) AS description,
          ar.status AS status,
          ar.created_at AS created_at
        FROM adoption_requests ar
        INNER JOIN users u ON ar.user_id = u.user_id
        INNER JOIN pets p ON ar.pet_id = p.id
        ORDER BY ar.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT
          'pet_added' AS type,
          CONCAT('New pet "', name, '" was added to the shelter') AS description,
          status AS status,
          created_at AS created_at
        FROM pets
        ORDER BY created_at DESC
        LIMIT 10
      )
      ORDER BY created_at DESC
      LIMIT 15`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch activity feed." });
  }
});

// ── GET /api/dashboard/summary ──────────────────────────────────────────────
// Returns a comprehensive summary report for the admin dashboard.
router.get("/summary", async (_req, res) => {
  try {
    const [[petStats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_pets,
         SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
         SUM(CASE WHEN status = 'Adopted'   THEN 1 ELSE 0 END) AS adopted,
         SUM(CASE WHEN status = 'Pending'   THEN 1 ELSE 0 END) AS pending
       FROM pets`
    );

    const [[adoptionStats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_requests,
         SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
       FROM adoption_requests`
    );

    const [[donationStats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_donations,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS total_approved_amount,
         SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
       FROM donations`
    );

    res.json({
      success: true,
      data: {
        pets: petStats,
        adoptions: adoptionStats,
        donations: donationStats,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard summary." });
  }
});

module.exports = router;
