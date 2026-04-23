-- ── Migration: Create adoption_requests table ──────────────────────────────
-- Links users (adopters) to pets via foreign keys.
-- Demonstrates relational database design with multi-entity relationships.

USE purrfect_match;

CREATE TABLE IF NOT EXISTS adoption_requests (
  request_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  pet_id       INT NOT NULL,
  message      TEXT DEFAULT NULL,
  status       ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- ── Foreign Key Relationships ──
  CONSTRAINT fk_adoption_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_adoption_pet
    FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE CASCADE
);
