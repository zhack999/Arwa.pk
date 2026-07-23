// Run once: node migrations/phase6_auth_upgrade.js
// Additive only. Reuses the existing `is_verified` column rather than adding a
// duplicate — it's already selected/returned everywhere (checkCustomerAuth, getCustomers).
import pool from "../config/db.js";

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(`
            ALTER TABLE users
                ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE,
                ADD COLUMN IF NOT EXISTS facebook_id VARCHAR UNIQUE,

                -- Verification (link token AND otp both usable — see tokenService.js/otpService.js)
                ADD COLUMN IF NOT EXISTS verification_token VARCHAR,
                ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP,

                -- OTP — one active OTP per user at a time, tagged by purpose
                -- ('verify' | 'reset'); purpose prevents a 'verify' OTP being replayed
                -- against the password-reset endpoint or vice versa.
                ADD COLUMN IF NOT EXISTS otp_code VARCHAR,
                ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP,
                ADD COLUMN IF NOT EXISTS otp_purpose VARCHAR,
                ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS otp_last_sent_at TIMESTAMP,

                -- Login security
                ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP,

                -- Bumped on password change / "log out everywhere" — embedded in every
                -- JWT issued; a mismatch means the token was issued before the bump and
                -- is rejected, which is what makes "logout all devices" possible with
                -- stateless JWTs.
                ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;
        `);

        // Google/Facebook-only signups have no password — column must allow NULL.
        await client.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL;`);

        await client.query("COMMIT");
        console.log("✅ phase6 migration applied (OAuth + verification + OTP + lockout columns on users).");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ phase6 migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
