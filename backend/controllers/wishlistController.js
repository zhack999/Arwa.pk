import pool from "../config/db.js";

export const getMyWishlist = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT product_id FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC",
            [req.customer.id]
        );
        res.status(200).json({ success: true, productIds: result.rows.map(r => r.product_id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch your wishlist." });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;
        if (!product_id) {
            return res.status(400).json({ success: false, message: "product_id is required." });
        }

        await pool.query(
            `INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)
             ON CONFLICT (user_id, product_id) DO NOTHING`,
            [req.customer.id, product_id]
        );

        res.status(201).json({ success: true, message: "Added to wishlist." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to add to wishlist." });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        await pool.query(
            "DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2",
            [req.customer.id, productId]
        );
        res.status(200).json({ success: true, message: "Removed from wishlist." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to remove from wishlist." });
    }
};