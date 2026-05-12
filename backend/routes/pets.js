const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");

const router = express.Router();

// ── Multer setup 
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `pet_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter });

// ── GET /api/pets 
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, species, breed, age, gender, is_vaccinated, description, tags, image, status, created_at FROM pets ORDER BY id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch pets." });
  }
});

// ── POST /api/pets 
router.post("/", upload.single("image"), async (req, res) => {
  const { name, species, breed, age, gender, is_vaccinated, description, tags } = req.body;

  if (!name || !breed || age === undefined || age === "") {
    return res.status(400).json({ success: false, message: "Name, breed and age are required." });
  }

  const imagePath = req.file ? `uploads/${req.file.filename}` : "";

  try {
    await pool.query(
      "INSERT INTO pets (name, species, breed, age, gender, is_vaccinated, description, tags, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, species || "", breed, parseInt(age, 10), gender || "Male", is_vaccinated || "No", description || "", tags || "", imagePath]
    );
    res.json({ success: true, message: "Pet added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add pet." });
  }
});

// ── PUT /api/pets/:id 
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, species, breed, age, gender, is_vaccinated, description, tags, existing_image } = req.body;

  if (!name || !breed || age === undefined || age === "") {
    return res.status(400).json({ success: false, message: "Name, breed and age are required." });
  }

  const imagePath = req.file ? `uploads/${req.file.filename}` : (existing_image || "");

  try {
    const [result] = await pool.query(
      "UPDATE pets SET name = ?, species = ?, breed = ?, age = ?, gender = ?, is_vaccinated = ?, description = ?, tags = ?, image = ? WHERE id = ?",
      [name, species || "", breed, parseInt(age, 10), gender || "Male", is_vaccinated || "No", description || "", tags || "", imagePath, parseInt(id, 10)]
    );
    const success = result.affectedRows > 0;
    res.json({ success, message: success ? "Pet updated successfully." : "Failed to update pet." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update pet." });
  }
});

// ── DELETE /api/pets/:id 
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM pets WHERE id = ?", [parseInt(id, 10)]);
    const success = result.affectedRows > 0;
    res.json({ success, message: success ? "Pet deleted successfully." : "Failed to delete pet." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete pet." });
  }
});

module.exports = router;
