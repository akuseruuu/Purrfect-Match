const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ── POST /api/adoptions ─────────────────────────────────────────────────────
// TRANSACTION: Inserts adoption request AND updates pet status atomically.
// If either operation fails, the entire transaction is rolled back.
router.post("/", async (req, res) => {
  const { user_id, pet_id, message } = req.body;

  if (!user_id || !pet_id) {
    return res.status(400).json({
      success: false,
      message: "user_id and pet_id are required.",
    });
  }

  // Get a dedicated connection from the pool for the transaction
  const connection = await pool.getConnection();

  try {
    // ── Begin Transaction ──
    await connection.beginTransaction();

    // 1. Check if the pet is still available
    const [pets] = await connection.query(
      "SELECT id, status FROM pets WHERE id = ? LIMIT 1",
      [pet_id]
    );

    if (pets.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: "Pet not found." });
    }

    if (pets[0].status !== "Available") {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: "This pet is no longer available for adoption.",
      });
    }

    // 2. Check if this user already has a pending request for this pet
    const [existing] = await connection.query(
      "SELECT request_id FROM adoption_requests WHERE user_id = ? AND pet_id = ? AND status = 'Pending' LIMIT 1",
      [user_id, pet_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: "You already have a pending adoption request for this pet.",
      });
    }

    // 3. Insert the adoption request
    await connection.query(
      "INSERT INTO adoption_requests (user_id, pet_id, message) VALUES (?, ?, ?)",
      [user_id, pet_id, message || null]
    );

    // 4. Update the pet's status to 'Pending'
    await connection.query(
      "UPDATE pets SET status = 'Pending' WHERE id = ?",
      [pet_id]
    );

    // ── Commit Transaction ──
    await connection.commit();
    connection.release();

    res.json({ success: true, message: "Adoption request submitted successfully!" });
  } catch (err) {
    // ── Rollback on any error ──
    await connection.rollback();
    connection.release();
    console.error("Transaction failed:", err);
    res.status(500).json({ success: false, message: "Failed to submit adoption request." });
  }
});

// ── GET /api/adoptions ──────────────────────────────────────────────────────
// JOIN: Fetches adoption requests with related user and pet information
// in a single query using INNER JOINs across three tables.
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         ar.request_id,
         ar.status   AS request_status,
         ar.message,
         ar.created_at,
         ar.updated_at,
         u.user_id,
         u.full_name AS adopter_name,
         u.email     AS adopter_email,
         u.phone     AS adopter_phone,
         p.id        AS pet_id,
         p.name      AS pet_name,
         p.species,
         p.breed,
         p.image     AS pet_image
       FROM adoption_requests ar
       INNER JOIN users u ON ar.user_id = u.user_id
       INNER JOIN pets  p ON ar.pet_id  = p.id
       ORDER BY ar.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch adoption requests." });
  }
});

// ── GET /api/adoptions/user/:userId ─────────────────────────────────────────
// LEFT JOIN: Fetches a specific user's adoption requests with pet info.
// Used by the adopter profile page for application tracking.
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
         ar.request_id,
         ar.status   AS request_status,
         ar.message,
         ar.created_at,
         ar.updated_at,
         p.id        AS pet_id,
         p.name      AS pet_name,
         p.species,
         p.breed,
         p.age,
         p.image     AS pet_image,
         p.status    AS pet_status
       FROM adoption_requests ar
       LEFT JOIN pets p ON ar.pet_id = p.id
       WHERE ar.user_id = ?
       ORDER BY ar.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch user adoption requests." });
  }
});

// ── GET /api/adoptions/stats ────────────────────────────────────────────────
// Returns counts for dashboard stat cards.
router.get("/stats", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*)                                        AS total_requests,
         SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
       FROM adoption_requests`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch adoption stats." });
  }
});

// ── PUT /api/adoptions/:id/status ───────────────────────────────────────────
// TRANSACTION: Approve or reject an adoption request.
// On approval → pet status becomes 'Adopted', all other pending requests for
// the same pet are automatically rejected.
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'Approved' or 'Rejected'.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch the request to get the pet_id
    const [requests] = await connection.query(
      "SELECT request_id, pet_id, status FROM adoption_requests WHERE request_id = ? LIMIT 1",
      [id]
    );

    if (requests.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const request = requests[0];

    if (request.status !== "Pending") {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: "This request has already been processed.",
      });
    }

    // 2. Update this request's status
    await connection.query(
      "UPDATE adoption_requests SET status = ? WHERE request_id = ?",
      [status, id]
    );

    if (status === "Approved") {
      // 3a. Mark the pet as 'Adopted'
      await connection.query(
        "UPDATE pets SET status = 'Adopted' WHERE id = ?",
        [request.pet_id]
      );

      // 3b. Reject all other pending requests for the same pet
      await connection.query(
        "UPDATE adoption_requests SET status = 'Rejected' WHERE pet_id = ? AND request_id != ? AND status = 'Pending'",
        [request.pet_id, id]
      );
    } else {
      // If rejected, check if there are other pending requests for this pet
      const [otherPending] = await connection.query(
        "SELECT COUNT(*) AS cnt FROM adoption_requests WHERE pet_id = ? AND status = 'Pending' AND request_id != ?",
        [request.pet_id, id]
      );

      // If no other pending requests, set pet back to 'Available'
      if (otherPending[0].cnt === 0) {
        await connection.query(
          "UPDATE pets SET status = 'Available' WHERE id = ?",
          [request.pet_id]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.` });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Transaction failed:", err);
    res.status(500).json({ success: false, message: "Failed to update request status." });
  }
});

module.exports = router;
