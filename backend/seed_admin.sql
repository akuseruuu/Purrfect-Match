-- 
-- Purrfect Match — Admin Seed Script
-- 
-- Run this script once to create the default admin account.
-- The password below is hashed with bcrypt (10 rounds).
--
-- Default credentials:
--   Username : admin
--   Password : admin123
--
-- IMPORTANT: Change the password after first login or re-hash a new
-- password using bcrypt before deploying to production.
--
-- Usage:
--   mysql -u root -p purrfect_match < seed_admin.sql
-- 

INSERT INTO admins (username, full_name, password)
SELECT 'admin', 'System Administrator',
       '$2a$10$K6eS6P4vg1h/GRob7/Qz4uJkxHO1GwR01UK9n6mLTCV9tqegN1r6C'
WHERE NOT EXISTS (
    SELECT 1 FROM admins WHERE username = 'admin'
);
