// Run once: node migrations/phase7_reviews_columns.js
// Additive only. `name` is deliberately NOT added as a stored column — the corrected
// reviewController.js below gets the reviewer's name by joining users.first_name/last_name
// instead, so it can't go stale if the customer later changes their name.
import pool from "../config/db.js";

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
            ALTER TABLE reviews
                ADD COLUMN IF NOT EXISTS title VARCHAR,
                ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
        `);
        await client.query("COMMIT");
        console.log("✅ phase7 migration applied (reviews.title, reviews.verified).");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ phase7 migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
