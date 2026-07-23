// ==========================================================
// Phase 3 — Payments: ensure orders.payment_status allows 'refunded'
//
// This does NOT assume how payment_status is constrained today.
// It inspects the live column first, then only acts if needed:
//   - Plain VARCHAR/TEXT with no CHECK constraint → nothing to do,
//     'refunded' already works.
//   - CHECK constraint (e.g. CHECK (payment_status IN ('unpaid','paid')))
//     → constraint is dropped and recreated with the full value set:
//     pending, unpaid, paid, failed, cancelled, refunded.
//   - Native Postgres ENUM type → 'refunded' is added to the enum
//     with ADD VALUE IF NOT EXISTS.
// No existing rows are modified or deleted in any case.
//
// Run once with:  node migrations/phase3_payment_status_refunded.js
// ==========================================================
import pool from "../config/db.js";

const ALLOWED_VALUES = ["pending", "unpaid", "paid", "failed", "cancelled", "refunded"];

const run = async () => {
    try {
        console.log("Checking orders.payment_status...");

        // 1. Is it a native enum type?
        const enumCheck = await pool.query(`
            SELECT t.typname
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_attribute a ON a.atttypid = t.oid
            JOIN pg_class c ON a.attrelid = c.oid
            WHERE c.relname = 'orders' AND a.attname = 'payment_status'
            LIMIT 1;
        `);

        if (enumCheck.rows.length > 0) {
            const enumName = enumCheck.rows[0].typname;
            console.log(`payment_status is enum type "${enumName}" — adding 'refunded' if missing.`);
            // ALTER TYPE ... ADD VALUE cannot run inside a transaction block in old PG
            // versions, so this runs as a standalone statement (no BEGIN/COMMIT wrapper).
            await pool.query(`ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS 'refunded';`);
            console.log("✅ 'refunded' is now a valid enum value.");
            process.exit(0);
        }

        // 2. Is there a CHECK constraint restricting it?
        const checkResult = await pool.query(`
            SELECT con.conname, pg_get_constraintdef(con.oid) AS def
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            WHERE rel.relname = 'orders' AND con.contype = 'c'
              AND pg_get_constraintdef(con.oid) ILIKE '%payment_status%';
        `);

        if (checkResult.rows.length === 0) {
            console.log("No CHECK constraint or enum found on payment_status — it's unrestricted, 'refunded' already works.");
            process.exit(0);
        }

        const { conname, def } = checkResult.rows[0];
        if (def.toLowerCase().includes("'refunded'")) {
            console.log(`Constraint "${conname}" already allows 'refunded'. Nothing to do.`);
            process.exit(0);
        }

        console.log(`Constraint "${conname}" is missing 'refunded' (current def: ${def}). Updating...`);
        await pool.query(`ALTER TABLE orders DROP CONSTRAINT ${conname};`);
        await pool.query(`
            ALTER TABLE orders ADD CONSTRAINT ${conname}
            CHECK (payment_status IN (${ALLOWED_VALUES.map(v => `'${v}'`).join(", ")}));
        `);
        console.log(`✅ Constraint "${conname}" now allows: ${ALLOWED_VALUES.join(", ")}. No rows were changed.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

run();
