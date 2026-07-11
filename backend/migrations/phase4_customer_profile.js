// ==========================================================
// Phase 4 — Customer Profile: DB Migration
// Adds the new columns needed for profile + address features
// without touching any existing data or tables.
//
// Run once with:  node migrations/phase4_customer_profile.js
// ==========================================================
import pool from "../config/db.js";

const run = async () => {
    try {
        console.log("Running Phase 4 migration...");

        // Extra profile fields on users
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_public_id TEXT`);

        // Country field on addresses (defaults to Pakistan so existing rows stay valid)
        await pool.query(`ALTER TABLE customer_addresses ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT 'Pakistan'`);

        console.log("✅ Phase 4 migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

run();
