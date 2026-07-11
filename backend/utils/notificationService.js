import pool from "../config/db.js";

// userId = null means this is an admin/system-facing notification
export async function createNotification({ userId = null, title, message, type = "general", link = null }) {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1,$2,$3,$4,$5)`,
            [userId, title, message, type, link]
        );
    } catch (error) {
        console.error("Failed to create notification:", error.message);
    }
}