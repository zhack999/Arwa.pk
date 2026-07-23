import bcrypt from "bcrypt";

const OTP_TTL_MS = 10 * 60 * 1000;      // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between resends
const OTP_MAX_ATTEMPTS = 5;              // wrong-code guesses before the OTP is dead

export function generateOtp() {
    // 100000-999999 — never starts with 0, so it's always a clean 6 digits.
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(otp) {
    return bcrypt.hash(otp, 10);
}

// Returns { canSend: boolean, secondsRemaining } — used to enforce the resend cooldown
// and give the frontend a real countdown instead of a hardcoded 30s the backend doesn't
// actually enforce.
export function checkResendCooldown(lastSentAt) {
    if (!lastSentAt) return { canSend: true, secondsRemaining: 0 };
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    if (elapsed >= OTP_RESEND_COOLDOWN_MS) return { canSend: true, secondsRemaining: 0 };
    return { canSend: false, secondsRemaining: Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000) };
}

export function otpExpiryDate() {
    return new Date(Date.now() + OTP_TTL_MS);
}

// Verifies a submitted OTP against the stored hash for a given user row. Returns
// { valid, reason? } where reason is one of 'no_otp' | 'wrong_purpose' | 'expired' |
// 'too_many_attempts' | undefined (valid).
//
// IMPORTANT: the caller is responsible for incrementing otp_attempts in the DB on a wrong
// guess (this function is pure/stateless — it doesn't touch the DB itself) and for
// clearing otp_code/otp_expires/otp_attempts once used successfully, so a verified OTP
// can never be replayed.
export async function verifyOtp({ submittedOtp, storedHash, storedPurpose, expectedPurpose, expiresAt, attempts }) {
    if (!storedHash || !storedPurpose) return { valid: false, reason: "no_otp" };
    if (storedPurpose !== expectedPurpose) return { valid: false, reason: "wrong_purpose" };
    if (attempts >= OTP_MAX_ATTEMPTS) return { valid: false, reason: "too_many_attempts" };
    if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) return { valid: false, reason: "expired" };

    const matches = await bcrypt.compare(submittedOtp, storedHash);
    return matches ? { valid: true } : { valid: false, reason: "wrong_code" };
}

export const OTP_MAX_ATTEMPTS_EXPORT = OTP_MAX_ATTEMPTS;
