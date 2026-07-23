import rateLimit from "express-rate-limit";

// Loosened for active testing — still limited, just not painfully so.
// Tighten this back down (e.g. max: 10) before real public launch.
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

// Looser limit for general write operations (orders, reviews, cart)
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// Very tight — order placement and payment endpoints specifically
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many orders placed. Please try again later." },
});

// OTP-related endpoints (verify, resend, forgot-password, reset). Tighter than
// authLimiter — otp_attempts in the DB already caps wrong-guess attempts on a
// single OTP (see otpService.js), but this stops someone from working around
// that by requesting fresh OTPs for the same or many different email addresses.
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

// General API-wide baseline, applied globally as a safety net
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});