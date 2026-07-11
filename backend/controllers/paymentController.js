import pool from "../config/db.js";
import stripe from "../utils/stripeClient.js";
import { finalizeOrder } from "./orderController.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Creates a Stripe-hosted checkout page for an already-created (pending) order.
export const createStripeSession = async (req, res) => {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            return res.status(400).json({ success: false, message: "order_id is required." });
        }

        const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [order_id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        const order = orderResult.rows[0];
        if (order.finalized_at) {
            return res.status(409).json({ success: false, message: "This order has already been paid." });
        }

        const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order_id]);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: itemsResult.rows.map(item => ({
                price_data: {
                    currency: "pkr",
                    product_data: { name: item.product_name },
                    unit_amount: Math.round(Number(item.price) * 100), // Stripe wants the smallest currency unit
                },
                quantity: item.quantity,
            })),
            customer_email: order.customer_email,
            // order_number + email let the /order-success page use the existing public
            // track-order endpoint to confirm payment — no new customer-facing route needed.
            success_url: `${FRONTEND_URL}/order-success?order_number=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer_email)}`,
            cancel_url: `${FRONTEND_URL}/order-cancel?order_number=${encodeURIComponent(order.order_number)}`,
            metadata: { order_id: order.id },
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error("Stripe session creation failed:", error.message);
        res.status(500).json({ success: false, message: "We couldn't start your card payment. Please try again, or choose Cash on Delivery." });
    }
};

// Stripe calls this directly (not the browser) when a payment actually succeeds.
// IMPORTANT: this route must receive the RAW request body, not JSON-parsed —
// see the server.js instructions below. Signature verification fails otherwise.
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId) {
            try {
                // finalizeOrder() itself is idempotent (guarded by finalized_at), so even if
                // Stripe redelivers this event, stock/emails/notifications only fire once.
                await pool.query(
                    "UPDATE orders SET payment_status = 'paid' WHERE id = $1 AND payment_status != 'paid'",
                    [orderId]
                );
                await finalizeOrder(orderId);
            } catch (error) {
                console.error(`Failed to finalize order ${orderId} after Stripe payment:`, error.message);
            }
        }
    } else if (event.type === "checkout.session.expired") {
        // Customer abandoned the Stripe checkout page — nothing to finalize,
        // order simply stays pending/unpaid and can be retried from /order-cancel.
        const session = event.data.object;
        console.log(`Stripe checkout session expired for order ${session.metadata?.order_id || "unknown"}.`);
    }

    res.status(200).json({ received: true });
};
