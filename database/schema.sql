CREATE DATABASE IF NOT EXISTS purrfect_match;
USE purrfect_match;

-- ── Users (Adopters) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Admins ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Pets ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) DEFAULT 'Dog',
  breed VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
  is_vaccinated ENUM('Yes', 'No') NOT NULL DEFAULT 'No',
  description TEXT,
  tags VARCHAR(255) DEFAULT NULL,
  image VARCHAR(255),
  status ENUM('Available', 'Adopted', 'Pending') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Adoption Requests (relates Users ↔ Pets) ───────────────────────────────
CREATE TABLE IF NOT EXISTS adoption_requests (
  request_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  pet_id       INT NOT NULL,
  message      TEXT DEFAULT NULL,
  status       ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Key Relationships
  CONSTRAINT fk_adoption_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_adoption_pet
    FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_number VARCHAR(100) NOT NULL UNIQUE,
  proof_image VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_donation_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);