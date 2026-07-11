import pool from "../config/db.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "../utils/emailService.js";
import { createNotification } from "../utils/notificationService.js";
// Runs the side-effects of a *confirmed* order: takes stock out of inventory,
// fires the low-stock alert if needed, sends the confirmation email, and
// creates customer/admin notifications. Called immediately for COD orders,
// or from a payment webhook once a gateway confirms payment.
// Guarded by finalized_at so a duplicate webhook can't double-decrement stock.
export async function finalizeOrder(orderId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const orderResult = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [orderId]);
        const order = orderResult.rows[0];
        if (!order) throw new Error("Order not found for finalization.");
        if (order.finalized_at) {
            await client.query("ROLLBACK");
            return order; // already finalized — ignore duplicate call
        }

        const itemsResult = await client.query("SELECT * FROM order_items WHERE order_id = $1", [orderId]);
        for (const item of itemsResult.rows) {
            const stockResult = await client.query(
                `UPDATE products SET stock = stock - $1, sold = sold + $1 WHERE id = $2 RETURNING stock, name`,
                [item.quantity, item.product_id]
            );
            if (stockResult.rows[0].stock <= 5) {
                createNotification({
                    userId: null,
                    title: "Low stock alert",
                    message: `${stockResult.rows[0].name} is down to ${stockResult.rows[0].stock} units left.`,
                    type: "admin_stock",
                    link: "/admin/products",
                });
            }
        }

        await client.query("UPDATE orders SET finalized_at = NOW() WHERE id = $1", [orderId]);
        await client.query("COMMIT");

        sendOrderConfirmationEmail(order, itemsResult.rows);
        if (order.user_id) {
            createNotification({
                userId: order.user_id,
                title: "Order placed",
                message: `Your order ${order.order_number} has been placed successfully.`,
                type: "order",
                link: "/dashboard/orders",
            });
        }
        createNotification({
            userId: null,
            title: "New order received",
            message: `${order.customer_name} placed order ${order.order_number} for Rs. ${Number(order.total).toLocaleString()}.`,
            type: "admin_order",
            link: "/admin/orders",
        });

        return order;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Generates a short, human-friendly order number like "ARW-241567"
function generateOrderNumber() {
    const rand = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `ARW-${rand}`;
}
export const getMyOrders = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
            [req.customer.id]
        );
        res.status(200).json({ success: true, orders: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch your orders." });
    }
};
// ==========================================
// CREATE ORDER (customer-facing — no login required, guest checkout works)
// ==========================================
export const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
       const {
            user_id: bodyUserId,  // ignored if a logged-in customer cookie is present — see below
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            shipping_city,
            shipping_province,
            shipping_postal,
            payment_method = "cod",
            discount = 0,
            shipping_fee = 0,
            notes,
            items,              // [{ product_id, quantity }]
        } = req.body;

        if (!customer_name || !customer_email || !customer_phone || !shipping_address || !shipping_city || !shipping_province) {
            return res.status(400).json({ success: false, message: "Missing required customer or shipping details." });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item." });
        }

        await client.query("BEGIN");

        // Look up real, current prices from the database — never trust prices sent from the browser.
        // FOR UPDATE locks these product rows until COMMIT/ROLLBACK, so two customers
        // buying the last unit at the same time can't both succeed (classic race condition).
        let subtotal = 0;
        const resolvedItems = [];
        for (const item of items) {
            const productResult = await client.query(
                "SELECT id, name, image_url, price, sale_price, stock FROM products WHERE id = $1 FOR UPDATE",
                [item.product_id]
            );
            if (productResult.rows.length === 0) {
                throw new Error(`Product not found: ${item.product_id}`);
            }
            const product = productResult.rows[0];
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new Error(`Invalid quantity for ${product.name}.`);
            }
            if (product.stock < quantity) {
                throw new Error(
                    product.stock > 0
                        ? `Only ${product.stock} left of ${product.name} — please adjust the quantity in your cart.`
                        : `${product.name} is currently out of stock.`
                );
            }
            const unitPrice = product.sale_price && Number(product.sale_price) > 0 ? Number(product.sale_price) : Number(product.price);
            const lineSubtotal = unitPrice * quantity;
            subtotal += lineSubtotal;
            resolvedItems.push({
                product_id: product.id,
                product_name: product.name,
                product_image: product.image_url,
                price: unitPrice,
                quantity,
                subtotal: lineSubtotal,
            });
        }

        const total = subtotal - Number(discount) + Number(shipping_fee);
        const orderNumber = generateOrderNumber();

        const orderResult = await client.query(
            `
            INSERT INTO orders
                (user_id, order_number, customer_name, customer_email, customer_phone,
                 shipping_address, shipping_city, shipping_province, shipping_postal,
                 payment_method, payment_status, order_status,
                 subtotal, discount, shipping_fee, total, notes)
            VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'unpaid','pending',$11,$12,$13,$14,$15)
            RETURNING *;
            `,
            [
                (req.customer?.id || bodyUserId || null), orderNumber, customer_name, customer_email, customer_phone,
                shipping_address, shipping_city, shipping_province, shipping_postal || null,
                payment_method, subtotal, discount, shipping_fee, total, notes || null,
            ]
        );
        const order = orderResult.rows[0];

        for (const item of resolvedItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [order.id, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.subtotal]
            );
            // Stock is NOT decremented here anymore — that now happens in finalizeOrder(),
            // either immediately below (for COD) or from a payment webhook (for gateways).
        }

        await client.query(
            `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, 'pending', 'Order placed by customer.')`,
            [order.id]
        );

        await client.query("COMMIT");

        if (payment_method === "cod") {
            await finalizeOrder(order.id); // COD is confirmed immediately, same as before
        }
        // For stripe/jazzcash/easypaisa: order exists as "pending" — finalizeOrder()
        // runs later from that gateway's payment-confirmation webhook/callback instead.

        res.status(201).json({
            success: true,
            message: payment_method === "cod" ? "Order placed successfully." : "Order created — proceed to payment.",
            order: { ...order, items: resolvedItems },
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to create order." });
    } finally {
        client.release();
    }
};

// ==========================================
// GET ALL ORDERS (admin only)
// ==========================================
export const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const params = [];
        let query = `
            SELECT o.*, (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count
            FROM orders o
        `;
        if (status) {
            params.push(status);
            query += ` WHERE o.order_status = $${params.length}`;
        }
        query += " ORDER BY o.created_at DESC";

        const result = await pool.query(query, params);
        res.status(200).json({ success: true, count: result.rows.length, orders: result.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch orders." });
    }
};

// ==========================================
// GET SINGLE ORDER (admin) — includes items + timeline
// ==========================================
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
        const timelineResult = await pool.query("SELECT * FROM order_timeline WHERE order_id = $1 ORDER BY created_at ASC", [id]);

        res.status(200).json({
            success: true,
            order: orderResult.rows[0],
            items: itemsResult.rows,
            timeline: timelineResult.rows,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch order." });
    }
};

// ==========================================
// GET ORDER BY ORDER NUMBER (public — for guest order tracking)
// Requires the email used at checkout too, so a random guess of the
// order number alone can't expose someone else's order.
// ==========================================
export const trackOrder = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required to track an order." });
        }

        const orderResult = await pool.query(
            "SELECT * FROM orders WHERE order_number = $1 AND customer_email = $2",
            [orderNumber, email]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        const order = orderResult.rows[0];

        const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
        const timelineResult = await pool.query("SELECT * FROM order_timeline WHERE order_id = $1 ORDER BY created_at ASC", [order.id]);

        res.status(200).json({ success: true, order, items: itemsResult.rows, timeline: timelineResult.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch order." });
    }
};

// ==========================================
// UPDATE ORDER STATUS (admin only)
// ==========================================
export const updateOrderStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { order_status, note, tracking_number, courier } = req.body;

        if (!order_status) {
            return res.status(400).json({ success: false, message: "order_status is required." });
        }

        await client.query("BEGIN");

        // Lock the order row so we know its current status hasn't changed underneath us
        const currentResult = await client.query("SELECT order_status FROM orders WHERE id = $1 FOR UPDATE", [id]);
        if (currentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        const previousStatus = currentResult.rows[0].order_status;

        // Cancelling an order returns its items to stock — but only the first time it's
        // cancelled, so flipping the status back and forth can't restock it repeatedly.
        if (order_status === "cancelled" && previousStatus !== "cancelled") {
            const itemsResult = await client.query(
                "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                [id]
            );
            for (const item of itemsResult.rows) {
                await client.query(
                    "UPDATE products SET stock = stock + $1, sold = GREATEST(sold - $1, 0) WHERE id = $2",
                    [item.quantity, item.product_id]
                );
            }
        }

        const result = await client.query(
            `
            UPDATE orders
            SET order_status = $1,
                tracking_number = COALESCE($2, tracking_number),
                courier = COALESCE($3, courier),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *;
            `,
            [order_status, tracking_number || null, courier || null, id]
        );

        await client.query(
            `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, $2, $3)`,
            [id, order_status, note || `Status changed to ${order_status}.`]
        );

        await client.query("COMMIT");

        sendOrderStatusEmail(result.rows[0]); // fire-and-forget
        if (result.rows[0].user_id) {
            createNotification({
                userId: result.rows[0].user_id,
                title: `Order ${result.rows[0].order_number} update`,
                message: `Your order status is now: ${order_status}.`,
                type: "order",
                link: "/dashboard/orders",
            });
        }

        res.status(200).json({ success: true, message: "Order status updated.", order: result.rows[0] });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to update order status." });
    } finally {
        client.release();
    }
};
// ==========================================
// UPDATE ORDER NOTES (admin only) — separate from status, for the "Admin Note" box
// ==========================================
export const updateOrderNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const result = await pool.query(
            `UPDATE orders SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
            [notes ?? "", id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.status(200).json({ success: true, message: "Note saved.", order: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Failed to save note." });
    }
};