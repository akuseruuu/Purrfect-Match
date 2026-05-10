-- ── Donations table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  reference_number VARCHAR(100) NOT NULL UNIQUE,
  proof_image      VARCHAR(255) NOT NULL,
  status           ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_donation_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);
