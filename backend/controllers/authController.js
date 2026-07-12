import pool from "../config/db.js";
import { sendWelcomeEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/notificationService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ==========================================
// LOGIN
// ==========================================
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const result = await pool.query(
            "SELECT * FROM admins WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const admin = result.rows[0];

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Store the token in a secure cookie the browser manages automatically
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: true, // required when sameSite is "none" — cross-site cookies must be HTTPS-only
            sameSite: "none", // frontend (Vercel) and backend (Render) are different domains
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================================
// LOGOUT
// ==========================================
export const adminLogout = async (req, res) => {
    res.clearCookie("adminToken");
    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

// ==========================================
// CHECK AUTH (used on page refresh to see if still logged in)
// ==========================================
export const checkAuth = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM admins WHERE id = $1",
            [req.admin.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Admin not found." });
        }

        res.status(200).json({
            success: true,
            admin: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};