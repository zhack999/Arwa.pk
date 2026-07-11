import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendPasswordChangedEmail, sendWelcomeEmail } from "../utils/emailService.js";
import cloudinary from "../config/cloudinary.js";
import { createNotification } from "../utils/notificationService.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,     // set to true once you deploy with HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ==========================================
// REGISTER
// ==========================================
export const registerCustomer = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required." });
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified)
             VALUES ($1,$2,$3,$4,$5,'customer', false)
             RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at`,
            [first_name, last_name, email, phone || null, hashedPassword]
        );
        const user = result.rows[0];

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("customerToken", token, COOKIE_OPTIONS);

        sendWelcomeEmail(user); // fire-and-forget — doesn't block registration if email fails
        createNotification({
            userId: null,
            title: "New customer registered",
            message: `${user.first_name} ${user.last_name} (${user.email}) just created an account.`,
            type: "admin_customer",
            link: "/admin/customers",
        });

        res.status(201).json({ success: true, message: "Account created successfully.", user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to register." });
    }
};

// ==========================================
// LOGIN
// ==========================================
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("customerToken", token, COOKIE_OPTIONS);

        const { password: _pw, ...safeUser } = user;
        res.status(200).json({ success: true, message: "Login successful.", user: safeUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to login." });
    }
};

// ==========================================
// LOGOUT
// ==========================================
export const logoutCustomer = async (req, res) => {
    res.clearCookie("customerToken", COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: "Logged out." });
};

// ==========================================
// CHECK AUTH (auto-login on refresh)
// ==========================================
export const checkCustomerAuth = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, first_name, last_name, email, phone, role, is_verified, created_at,
                    date_of_birth, gender, profile_picture
             FROM users WHERE id = $1`,
            [req.customer.id]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Account not found." });
        }
        res.status(200).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to verify session." });
    }
};
// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, date_of_birth, gender } = req.body;
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required." });
        }

        if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
        }

        const ALLOWED_GENDERS = ["male", "female", "other", "prefer_not_to_say"];
        if (gender && !ALLOWED_GENDERS.includes(gender)) {
            return res.status(400).json({ success: false, message: "Invalid gender value." });
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, req.customer.id]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "That email is already in use by another account." });
        }

        const result = await pool.query(
            `UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4,
                    date_of_birth = $5, gender = $6
             WHERE id = $7
             RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at,
                       date_of_birth, gender, profile_picture`,
            [first_name, last_name, email, phone || null, date_of_birth || null, gender || null, req.customer.id]
        );

        res.status(200).json({ success: true, message: "Profile updated successfully.", user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to update profile." });
    }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
        }

        const result = await pool.query("SELECT password, email, first_name FROM users WHERE id = $1", [req.customer.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        const match = await bcrypt.compare(oldPassword, result.rows[0].password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        const isSamePassword = await bcrypt.compare(newPassword, result.rows[0].password);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: "New password must be different from your current password." });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, req.customer.id]);

        sendPasswordChangedEmail(result.rows[0]); // fire-and-forget

        res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to change password." });
    }
};

// ==========================================
// PROFILE PICTURE
// ==========================================
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided." });
        }

        const existing = await pool.query("SELECT profile_picture_public_id FROM users WHERE id = $1", [req.customer.id]);
        const oldPublicId = existing.rows[0]?.profile_picture_public_id;

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "arwa-profile-pictures",
        });

        const result = await pool.query(
            `UPDATE users SET profile_picture = $1, profile_picture_public_id = $2
             WHERE id = $3
             RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at,
                       date_of_birth, gender, profile_picture`,
            [uploadResult.secure_url, uploadResult.public_id, req.customer.id]
        );

        if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
        }

        res.status(200).json({ success: true, message: "Profile picture updated.", user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to upload profile picture." });
    }
};

export const removeProfilePicture = async (req, res) => {
    try {
        const existing = await pool.query("SELECT profile_picture_public_id FROM users WHERE id = $1", [req.customer.id]);
        const oldPublicId = existing.rows[0]?.profile_picture_public_id;

        const result = await pool.query(
            `UPDATE users SET profile_picture = NULL, profile_picture_public_id = NULL
             WHERE id = $1
             RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at,
                       date_of_birth, gender, profile_picture`,
            [req.customer.id]
        );

        if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
        }

        res.status(200).json({ success: true, message: "Profile picture removed.", user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to remove profile picture." });
    }
};

// ==========================================
// ADDRESSES
// ==========================================
export const getAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
            [req.customer.id]
        );
        res.status(200).json({ success: true, addresses: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch addresses." });
    }
};

export const addAddress = async (req, res) => {
    try {
        const { label, name, phone, address, city, province, postal, country, isDefault } = req.body;
        if (!label || !name || !phone || !address || !city || !province) {
            return res.status(400).json({ success: false, message: "All address fields except postal code are required." });
        }

        if (isDefault) {
            await pool.query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1", [req.customer.id]);
        }

        const result = await pool.query(
            `INSERT INTO customer_addresses (user_id, label, name, phone, address, city, province, postal, country, is_default)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [req.customer.id, label, name, phone, address, city, province, postal || null, country || "Pakistan", !!isDefault]
        );

        res.status(201).json({ success: true, message: "Address added.", address: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to add address." });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, name, phone, address, city, province, postal, country, isDefault } = req.body;
        if (!label || !name || !phone || !address || !city || !province) {
            return res.status(400).json({ success: false, message: "All address fields except postal code are required." });
        }

        const owned = await pool.query("SELECT id FROM customer_addresses WHERE id = $1 AND user_id = $2", [id, req.customer.id]);
        if (owned.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }

        if (isDefault) {
            await pool.query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1", [req.customer.id]);
        }

        const result = await pool.query(
            `UPDATE customer_addresses SET label=$1, name=$2, phone=$3, address=$4, city=$5, province=$6, postal=$7, country=$8${isDefault ? ", is_default = true" : ""}
             WHERE id = $9 RETURNING *`,
            [label, name, phone, address, city, province, postal || null, country || "Pakistan", id]
        );

        res.status(200).json({ success: true, message: "Address updated.", address: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update address." });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2 RETURNING id", [id, req.customer.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }
        res.status(200).json({ success: true, message: "Address removed." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete address." });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const owned = await pool.query("SELECT id FROM customer_addresses WHERE id = $1 AND user_id = $2", [id, req.customer.id]);
        if (owned.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }
        await pool.query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1", [req.customer.id]);
        const result = await pool.query("UPDATE customer_addresses SET is_default = true WHERE id = $1 RETURNING *", [id]);
        res.status(200).json({ success: true, message: "Default address updated.", address: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to set default address." });
    }
};

// ==========================================
// ADMIN: LIST CUSTOMERS (with real order stats)
// ==========================================
export const getCustomers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id, u.first_name, u.last_name, u.email, u.phone, u.is_verified, u.created_at,
                COUNT(o.id)::int AS order_count,
                COALESCE(SUM(o.total), 0)::numeric AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        res.status(200).json({ success: true, count: result.rows.length, customers: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch customers." });
    }
};