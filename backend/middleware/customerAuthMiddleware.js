import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const customerAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.customerToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Not logged in." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // A token issued before a password change / "logout all devices" has a stale
        // tokenVersion — reject it even though the JWT signature itself is still valid.
        // This is what makes logoutAllDevices() actually work with stateless JWTs.
        const result = await pool.query("SELECT token_version FROM users WHERE id = $1", [decoded.id]);
        if (result.rows.length === 0 || result.rows[0].token_version !== decoded.tokenVersion) {
            return res.status(401).json({ success: false, message: "Your session has expired. Please log in again." });
        }

        req.customer = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired session." });
    }
};

export default customerAuthMiddleware;
