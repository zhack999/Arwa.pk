// ── Append to rateLimiters.js (keeps the existing authLimiter etc. untouched) ──

// OTP request/verify endpoints get their own (tighter) limiter, separate from
// authLimiter. authLimiter's 50-per-5-min is fine for login attempts, but OTP brute
// forcing is a narrower, higher-value target (a 6-digit code has only 1,000,000
// possibilities) — combined with otpService.js's own OTP_MAX_ATTEMPTS=5 per-code cap,
// this bounds how many codes an attacker can even get to try in a given window.
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
});
