import pool from "../config/db.js";

// ---- Customer-facing ----
export const getMyNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
            [req.customer.id]
        );
        res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
};

export const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2", [id, req.customer.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update notification." });
    }
};

export const markAllRead = async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [req.customer.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update notifications." });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM notifications WHERE id = $1 AND user_id = $2", [id, req.customer.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete notification." });
    }
};

// ---- Admin-facing (user_id IS NULL) ----
export const getAdminNotifications = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 50");
        res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
};

export const markAdminRead = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id IS NULL", [id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update notification." });
    }
};

export const markAllAdminRead = async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = true WHERE user_id IS NULL");
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update notifications." });
    }
};

export const deleteAdminNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM notifications WHERE id = $1 AND user_id IS NULL", [id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete notification." });
    }
};