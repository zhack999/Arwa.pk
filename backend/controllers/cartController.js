import pool from "../config/db.js";

export const getMyCart = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT product_id, quantity FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC",
            [req.customer.id]
        );
        res.status(200).json({ success: true, items: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch your cart." });
    }
};

// Adds a product to the cart, or increments quantity if it's already there.
export const addCartItem = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        if (!product_id) {
            return res.status(400).json({ success: false, message: "product_id is required." });
        }
        const result = await pool.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
             RETURNING product_id, quantity`,
            [req.customer.id, product_id, quantity]
        );
        res.status(200).json({ success: true, item: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to add to cart." });
    }
};

// Sets the absolute quantity for a product already in the cart.
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "quantity must be at least 1." });
        }
        await pool.query(
            "UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3",
            [quantity, req.customer.id, productId]
        );
        res.status(200).json({ success: true, message: "Cart updated." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to update cart." });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        await pool.query(
            "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
            [req.customer.id, productId]
        );
        res.status(200).json({ success: true, message: "Removed from cart." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to remove from cart." });
    }
};

export const clearCart = async (req, res) => {
    try {
        await pool.query("DELETE FROM cart_items WHERE user_id = $1", [req.customer.id]);
        res.status(200).json({ success: true, message: "Cart cleared." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to clear cart." });
    }
};