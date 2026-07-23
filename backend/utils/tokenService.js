// Verification-link tokens. The RAW token goes in the email URL; only its SHA-256 hash
// is ever stored in the DB — same reasoning as never storing plaintext passwords: if the
// database leaks, stored hashes can't be replayed as valid tokens.
import crypto from "crypto";

export function generateToken() {
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
}

export function hashToken(raw) {
    return crypto.createHash("sha256").update(raw).digest("hex");
}
