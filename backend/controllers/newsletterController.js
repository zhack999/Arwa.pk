import pool from "../config/db.js";
import { sendAdminNewsletterSubscriberEmail } from "../utils/emailService.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await pool.query("SELECT id FROM newsletter WHERE email = $1", [normalized]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, alreadySubscribed: true, message: "You're already subscribed!" });
    }

    await pool.query("INSERT INTO newsletter (email) VALUES ($1)", [normalized]);

    sendAdminNewsletterSubscriberEmail(normalized); // fire-and-forget — only for genuinely new subscribers

    res.status(201).json({ success: true, alreadySubscribed: false, message: "Successfully subscribed!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to subscribe. Please try again." });
  }
};

// Admin-only — list subscribers for future admin management (per spec item #7)
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC");
    res.status(200).json({ success: true, count: result.rows.length, subscribers: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch subscribers." });
  }
};
