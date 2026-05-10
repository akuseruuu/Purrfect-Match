/**
 * Migration: Adds household information columns to the adoption_requests table.
 *
 * Run once:  node migrations/add_adoption_fields.js
 */

const pool = require("../config/db");

async function migrate() {
  const columns = [
    { name: "phone",       sql: "VARCHAR(30)  DEFAULT NULL" },
    { name: "address",     sql: "TEXT         DEFAULT NULL" },
    { name: "living_in",   sql: "VARCHAR(50)  DEFAULT NULL" },
    { name: "reason",      sql: "TEXT         DEFAULT NULL" },
    { name: "has_other_pets", sql: "VARCHAR(5) DEFAULT NULL" },
  ];

  for (const col of columns) {
    try {
      await pool.query(
        `ALTER TABLE adoption_requests ADD COLUMN ${col.name} ${col.sql}`
      );
      console.log(`✓ Added column: ${col.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`– Column already exists: ${col.name}`);
      } else {
        console.error(`✕ Failed to add ${col.name}:`, err.message);
      }
    }
  }

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate();
