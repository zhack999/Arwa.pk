// Run once: node migrations/phase5_jazzcash_easypaisa_payments.js
// Additive only — does not touch existing columns/data.
import pool from "../config/db.js";

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(`
            ALTER TABLE orders
                ADD COLUMN IF NOT EXISTS transaction_id VARCHAR,
                ADD COLUMN IF NOT EXISTS payment_provider VARCHAR,
                ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS gateway_callback JSONB;
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS payment_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES orders(id),
                provider VARCHAR NOT NULL,
                transaction_id VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                raw_payload JSONB,
                created_at TIMESTAMP DEFAULT now(),
                UNIQUE (provider, transaction_id)
            );
        `);

        await client.query("COMMIT");
        console.log("✅ phase5 migration applied (orders columns + payment_transactions table).");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ phase5 migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
