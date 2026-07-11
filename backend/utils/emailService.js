import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const BRAND_GREEN = "#1a3d2b";
const BRAND_GOLD = "#c9a84c";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function wrapper(bodyHtml) {
    return `
    <div style="font-family: Arial, sans-serif; background:#f5f0e8; padding:32px;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e5decf;">
        <div style="background:${BRAND_GREEN}; padding:24px; text-align:center;">
          <span style="color:${BRAND_GOLD}; font-size:22px; font-weight:bold; letter-spacing:2px;">ARWA BOTANIQS</span>
        </div>
        <div style="padding:32px; color:#2a2a2a; line-height:1.6;">
          ${bodyHtml}
        </div>
        <div style="padding:16px; text-align:center; font-size:12px; color:#999;">
          © ${new Date().getFullYear()} Arwa Botaniqs. All rights reserved.
        </div>
      </div>
    </div>`;
}

// Every send* function swallows its own errors — a failed email should
// never break registration, checkout, or a password change.
async function safeSend(mailOptions) {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, ...mailOptions });
    } catch (error) {
        console.error("Email send failed:", error.message);
    }
}

export async function sendWelcomeEmail(user) {
    await safeSend({
        to: user.email,
        subject: "Welcome to Arwa Botaniqs 🌿",
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Welcome, ${user.first_name}!</h2>
            <p>Thank you for creating an account with Arwa Botaniqs. We're so glad to have you.</p>
            <p>Explore our range of 100% botanical skincare, crafted with nature's finest ingredients.</p>
            <a href="${FRONTEND_URL}/auth/login" style="display:inline-block; margin-top:16px; padding:12px 28px; background:${BRAND_GREEN}; color:${BRAND_GOLD}; text-decoration:none; letter-spacing:1px;">SIGN IN</a>
        `),
    });
}

export async function sendOrderConfirmationEmail(order, items) {
    const itemRows = items.map(i =>
        `<tr>
            <td style="padding:8px 0; border-bottom:1px solid #eee;">${i.product_name} × ${i.quantity}</td>
            <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">Rs. ${Number(i.subtotal).toLocaleString()}</td>
        </tr>`
    ).join("");

    await safeSend({
        to: order.customer_email,
        subject: `Order Confirmed — ${order.order_number}`,
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Thank you, ${order.customer_name}!</h2>
            <p>Your order <strong>${order.order_number}</strong> has been placed successfully.</p>
            <table style="width:100%; border-collapse:collapse; margin:20px 0;">${itemRows}</table>
            <p><strong>Total: Rs. ${Number(order.total).toLocaleString()}</strong></p>
            <p style="margin-top:20px;">Shipping to:<br>${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province}</p>
            <p>Estimated delivery: 2–4 business days.</p>
            <a href="${FRONTEND_URL}/track/${order.id}" style="display:inline-block; margin-top:16px; padding:12px 28px; background:${BRAND_GREEN}; color:${BRAND_GOLD}; text-decoration:none; letter-spacing:1px;">TRACK ORDER</a>
        `),
    });
}

const STATUS_LABELS = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export async function sendOrderStatusEmail(order) {
    const label = STATUS_LABELS[order.order_status] || order.order_status;
    await safeSend({
        to: order.customer_email,
        subject: `Order ${order.order_number} — ${label}`,
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Your order is now: ${label}</h2>
            <p>Hi ${order.customer_name}, your order <strong>${order.order_number}</strong> status has been updated to <strong>${label}</strong>.</p>
            ${order.tracking_number ? `<p>Tracking number: <strong>${order.tracking_number}</strong>${order.courier ? ` (${order.courier})` : ""}</p>` : ""}
            <a href="${FRONTEND_URL}/track/${order.id}" style="display:inline-block; margin-top:16px; padding:12px 28px; background:${BRAND_GREEN}; color:${BRAND_GOLD}; text-decoration:none; letter-spacing:1px;">TRACK ORDER</a>
        `),
    });
}

export async function sendPasswordChangedEmail(user) {
    await safeSend({
        to: user.email,
        subject: "Your password was changed",
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Password changed</h2>
            <p>Hi ${user.first_name || ""}, this is a confirmation that your Arwa Botaniqs account password was just changed.</p>
            <p>If you didn't make this change, please contact us immediately.</p>
        `),
    });
}