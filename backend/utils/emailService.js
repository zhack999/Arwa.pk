import nodemailer from "nodemailer";
import {
    BRAND, layout, button, buttonRow, otpBox, productsTable, summaryRow, summaryTable, progressTracker,
} from "./emailTemplates.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// Every send* function swallows its own errors — a failed email should
// never break registration, checkout, or a password change.
async function safeSend(mailOptions) {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, ...mailOptions });
    } catch (error) {
        console.error("Email send failed:", error.message);
    }
}

// ============================================================
// PART 1 — CUSTOMER EMAILS
// ============================================================

export async function sendWelcomeEmail(user) {
    await safeSend({
        to: user.email,
        subject: "🌿 Welcome to ARWA.PK",
        html: layout({
            preheader: "Welcome to Arwaa.pk — your botanical skincare journey starts here.",
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:24px; color:${BRAND.green}; margin:0 0 12px;">Welcome, ${user.first_name}! 🌿</h1>
                <p>Thank you for creating an account with Arwaa.pk. We're so glad to have you.</p>
                <p>Explore our range of 100% botanical skincare, crafted with nature's finest ingredients.</p>
                ${buttonRow([
                    { label: "Shop Now", url: `${FRONTEND_URL}/shop` },
                    { label: "My Dashboard", url: `${FRONTEND_URL}/dashboard`, variant: "secondary" },
                ])}
                <p style="text-align:center; font-size:13px;"><a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="color:${BRAND.muted};">Need help? Contact support</a></p>
            `,
        }),
    });
}

export async function sendVerificationEmail(user, { token, otp }) {
    const verifyLink = `${FRONTEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    await safeSend({
        to: user.email,
        subject: "Verify Your Email Address",
        html: layout({
            preheader: "Verify your email to activate your Arwaa.pk account.",
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Verify Your Email</h1>
                <p>Hi ${user.first_name}, welcome to Arwaa.pk! Please verify your email to activate your account.</p>
                <p style="text-align:center; margin:8px 0 0; font-size:13px; color:${BRAND.muted};">Enter this code in the app:</p>
                ${otpBox(otp)}
                <p style="text-align:center; color:${BRAND.muted}; font-size:13px;">or</p>
                ${buttonRow([{ label: "Verify Email", url: verifyLink }])}
                <p style="text-align:center; font-size:12px; color:${BRAND.muted};">This code and link expire in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
            `,
        }),
    });
}

export async function sendOtpEmail(user, otp, purpose) {
    const purposeCopy = purpose === "reset"
        ? "Use this code to reset your password:"
        : "Use this code to verify your account:";
    await safeSend({
        to: user.email,
        subject: purpose === "reset" ? "Reset Your Password" : "Your Verification Code",
        html: layout({
            preheader: "Your one-time security code from Arwaa.pk.",
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Your One-Time Code</h1>
                <p>Hi ${user.first_name || ""}, ${purposeCopy}</p>
                ${otpBox(otp)}
                <p style="text-align:center; font-size:12px; color:${BRAND.muted};">Expires in 10 minutes.</p>
                <div style="background:${BRAND.bg}; border-radius:6px; padding:14px 18px; margin-top:20px; font-size:13px; color:${BRAND.muted};">
                    🔒 <strong style="color:${BRAND.text};">Security tip:</strong> Arwaa.pk will never ask you to share this code over phone, chat, or email. If you didn't request this, your account is still safe — just ignore this message.
                </div>
            `,
        }),
    });
}

export async function sendPasswordResetOtpEmail(user, otp) {
    return sendOtpEmail(user, otp, "reset");
}

export async function sendAccountLockedEmail(user, { unlockAt }) {
    await safeSend({
        to: user.email,
        subject: "Your Account Was Temporarily Locked",
        html: layout({
            preheader: "Multiple failed login attempts locked your account temporarily.",
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Account Temporarily Locked</h1>
                <p>Hi ${user.first_name || ""}, we noticed several failed login attempts on your account.</p>
                <p>For your security, your account has been temporarily locked until <strong>${unlockAt}</strong>.</p>
                <p style="color:${BRAND.muted}; font-size:13px;">If this wasn't you, we'd recommend resetting your password once the lock clears.</p>
                ${buttonRow([{ label: "Reset Password", url: `${FRONTEND_URL}/auth/forgot` }])}
            `,
        }),
    });
}

export async function sendPasswordChangedEmail(user) {
    await safeSend({
        to: user.email,
        subject: "Your Password Was Changed",
        html: layout({
            preheader: "Your Arwaa.pk password was just changed.",
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Password Changed</h1>
                <p>Hi ${user.first_name || ""}, this is a confirmation that your Arwaa.pk account password was just changed.</p>
                <div style="background:${BRAND.bg}; border-radius:6px; padding:14px 18px; margin-top:16px; font-size:13px; color:${BRAND.muted};">
                    🔒 <strong style="color:${BRAND.text};">Didn't do this?</strong> Contact us immediately — <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="color:${BRAND.green};">${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}</a>
                </div>
            `,
        }),
    });
}

export async function sendOrderConfirmationEmail(order, items) {
    const rows = [
        summaryRow("Subtotal", `Rs. ${Number(order.subtotal).toLocaleString()}`),
        Number(order.discount) > 0 ? summaryRow("Discount", `− Rs. ${Number(order.discount).toLocaleString()}`) : "",
        summaryRow("Shipping", Number(order.shipping_fee) > 0 ? `Rs. ${Number(order.shipping_fee).toLocaleString()}` : "Free"),
        summaryRow("Total", `Rs. ${Number(order.total).toLocaleString()}`, { bold: true }),
    ].filter(Boolean);

    const paymentLabel = { stripe: "Credit/Debit Card", jazzcash: "JazzCash", easypaisa: "Easypaisa", cod: "Cash on Delivery" }[order.payment_method] || order.payment_method;

    await safeSend({
        to: order.customer_email,
        subject: "🌿 Thank You! Your Order Has Been Confirmed",
        html: layout({
            preheader: `Your order ${order.order_number} is confirmed.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 4px;">Thank you, ${order.customer_name}!</h1>
                <p style="color:${BRAND.muted}; margin-top:0;">Your order <strong style="color:${BRAND.text};">${order.order_number}</strong> has been placed successfully.</p>
                ${productsTable(items)}
                ${summaryTable(rows)}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; font-size:13px; color:${BRAND.muted};">
                    <tr><td style="padding:3px 0;">Payment Method</td><td style="text-align:right;">${paymentLabel}</td></tr>
                    <tr><td style="padding:3px 0;">Shipping To</td><td style="text-align:right;">${order.shipping_address}, ${order.shipping_city}</td></tr>
                    <tr><td style="padding:3px 0;">Estimated Delivery</td><td style="text-align:right;">2–4 business days</td></tr>
                </table>
                ${buttonRow([
                    { label: "Track Order", url: `${FRONTEND_URL}/track/${order.id}` },
                    { label: "Dashboard", url: `${FRONTEND_URL}/dashboard/orders`, variant: "secondary" },
                    { label: "Continue Shopping", url: `${FRONTEND_URL}/shop`, variant: "secondary" },
                ])}
            `,
        }),
    });
}

export async function sendPaymentSuccessfulEmail(order, { paymentId, amount, method }) {
    await safeSend({
        to: order.customer_email,
        subject: "Payment Received Successfully",
        html: layout({
            preheader: `Payment received for order ${order.order_number}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Payment Received ✓</h1>
                <p>Hi ${order.customer_name}, we've received your payment for order <strong>${order.order_number}</strong>.</p>
                ${summaryTable([
                    summaryRow("Amount", `Rs. ${Number(amount).toLocaleString()}`, { bold: true }),
                    summaryRow("Method", method),
                    paymentId ? summaryRow("Payment ID", paymentId) : "",
                ].filter(Boolean))}
                ${buttonRow([
                    { label: "View Invoice", url: `${FRONTEND_URL}/track/${order.id}` },
                    { label: "Track Order", url: `${FRONTEND_URL}/track/${order.id}`, variant: "secondary" },
                ])}
            `,
        }),
    });
}

export async function sendPaymentFailedEmail(order, { reason } = {}) {
    await safeSend({
        to: order.customer_email,
        subject: "Payment Failed — Action Needed",
        html: layout({
            preheader: `Your payment for order ${order.order_number} didn't go through.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Payment Didn't Go Through</h1>
                <p>Hi ${order.customer_name}, we weren't able to process your payment for order <strong>${order.order_number}</strong>${reason ? ` (${reason})` : ""}.</p>
                <p style="color:${BRAND.muted}; font-size:13px;">No charge was made. You can try again with the same or a different payment method.</p>
                ${buttonRow([
                    { label: "Retry Payment", url: `${FRONTEND_URL}/order-cancel?order_number=${encodeURIComponent(order.order_number)}` },
                    { label: "Contact Support", url: `mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}`, variant: "secondary" },
                ])}
            `,
        }),
    });
}

const STATUS_LABELS = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

// Covers Order Processing / Shipped / Out for Delivery / Delivered / Cancelled — one
// function, driven by order.order_status, instead of five near-identical templates.
export async function sendOrderStatusEmail(order) {
    const label = STATUS_LABELS[order.order_status] || order.order_status;
    const trackingBlock = order.tracking_number
        ? summaryTable([
            summaryRow("Courier", order.courier || "—"),
            summaryRow("Tracking Number", order.tracking_number),
        ])
        : "";

    let extraBody = "";
    let extraButtons = [{ label: "Track Order", url: `${FRONTEND_URL}/track/${order.id}` }];

    if (order.order_status === "out_for_delivery") {
        extraBody = `<p style="color:${BRAND.muted}; font-size:13px;">Your order is out for delivery today — please make sure someone is available to receive it.</p>`;
    }
    if (order.order_status === "delivered") {
        extraButtons = [
            { label: "Leave a Review", url: `${FRONTEND_URL}/track/${order.id}` },
            { label: "Buy Again", url: `${FRONTEND_URL}/shop`, variant: "secondary" },
            { label: "Shop More", url: `${FRONTEND_URL}/shop`, variant: "secondary" },
        ];
    }

    await safeSend({
        to: order.customer_email,
        subject: order.order_status === "delivered" ? "Your Order Has Been Delivered" : `Order ${order.order_number} — ${label}`,
        html: layout({
            preheader: `Order ${order.order_number} is now ${label}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 4px;">Your order is now: ${label}</h1>
                <p style="color:${BRAND.muted}; margin-top:0;">Hi ${order.customer_name}, order <strong style="color:${BRAND.text};">${order.order_number}</strong> status has been updated.</p>
                ${["processing", "shipped", "out_for_delivery", "delivered"].includes(order.order_status) ? progressTracker(order.order_status) : ""}
                ${extraBody}
                ${trackingBlock}
                ${buttonRow(extraButtons)}
            `,
        }),
    });
}

export async function sendRefundEmail(order, { reason } = {}) {
    await safeSend({
        to: order.customer_email,
        subject: `Refund Issued — Order ${order.order_number}`,
        html: layout({
            preheader: `Your payment for order ${order.order_number} has been refunded.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Your Payment Has Been Refunded</h1>
                <p>Hi ${order.customer_name}, we're sorry — your order <strong>${order.order_number}</strong> could not be fulfilled${reason ? ` because ${reason}` : ""}, so it has been cancelled and your payment has been refunded in full.</p>
                ${summaryTable([
                    summaryRow("Refund Amount", `Rs. ${Number(order.total).toLocaleString()}`, { bold: true }),
                    summaryRow("Timeline", "5–10 business days"),
                ])}
                <p style="color:${BRAND.muted}; font-size:13px;">The refund has been issued to your original payment method. We're genuinely sorry for the inconvenience.</p>
                ${buttonRow([{ label: "Contact Support", url: `mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}`, variant: "secondary" }])}
            `,
        }),
    });
}

export async function sendInvoiceEmail(order, items) {
    // NOTE: this is a rich HTML invoice email, not a downloadable PDF attachment — no PDF
    // library (pdfkit/puppeteer) is installed yet. "Download Invoice" links to the
    // order-tracking page rather than attaching a file. If an actual PDF is wanted, that's
    // a separate small addition (needs a PDF-generation package) — flagging rather than
    // faking it.
    const rows = [
        summaryRow("Subtotal", `Rs. ${Number(order.subtotal).toLocaleString()}`),
        Number(order.discount) > 0 ? summaryRow("Discount", `− Rs. ${Number(order.discount).toLocaleString()}`) : "",
        summaryRow("Shipping", `Rs. ${Number(order.shipping_fee).toLocaleString()}`),
        summaryRow("Total", `Rs. ${Number(order.total).toLocaleString()}`, { bold: true }),
        summaryRow("Payment Status", order.payment_status === "paid" ? "Paid ✓" : "Unpaid"),
    ].filter(Boolean);

    await safeSend({
        to: order.customer_email,
        subject: `Invoice — Order ${order.order_number}`,
        html: layout({
            preheader: `Your invoice for order ${order.order_number}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 4px;">Invoice</h1>
                <p style="color:${BRAND.muted}; margin-top:0; font-size:13px;">Invoice #${order.order_number} · ${new Date(order.created_at).toLocaleDateString()}</p>
                <p style="font-size:13px;">Billed to: <strong>${order.customer_name}</strong> (${order.customer_email})</p>
                ${productsTable(items)}
                ${summaryTable(rows)}
                ${buttonRow([{ label: "Download Invoice", url: `${FRONTEND_URL}/track/${order.id}` }])}
            `,
        }),
    });
}

// ============================================================
// PART 3 — ADMIN EMAILS
// ============================================================

export async function sendAdminNewOrderEmail(order, items) {
    const productLines = items.map(i => `${i.product_name} × ${i.quantity}`).join(", ");
    await safeSend({
        to: ADMIN_EMAIL,
        subject: "🔔 New Order Received",
        html: layout({
            preheader: `New order ${order.order_number} from ${order.customer_name}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">New Order Received</h1>
                ${summaryTable([
                    summaryRow("Customer", order.customer_name),
                    summaryRow("Email", order.customer_email),
                    summaryRow("Phone", order.customer_phone),
                    summaryRow("Address", `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province}`),
                    summaryRow("Products", productLines),
                    summaryRow("Payment Method", order.payment_method),
                    summaryRow("Payment Status", order.payment_status),
                    Number(order.discount) > 0 ? summaryRow("Discount", `Rs. ${Number(order.discount).toLocaleString()}`) : "",
                    summaryRow("Total", `Rs. ${Number(order.total).toLocaleString()}`, { bold: true }),
                    summaryRow("Order Time", new Date(order.created_at).toLocaleString()),
                ].filter(Boolean))}
                ${buttonRow([
                    { label: "View Order", url: `${FRONTEND_URL}/admin/orders` },
                    { label: "Admin Dashboard", url: `${FRONTEND_URL}/admin`, variant: "secondary" },
                ])}
            `,
        }),
    });
}

export async function sendAdminNewCustomerEmail(user) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: "New Customer Registered",
        html: layout({
            preheader: `${user.first_name} ${user.last_name} just registered.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">New Customer Registered</h1>
                ${summaryTable([
                    summaryRow("Name", `${user.first_name} ${user.last_name}`),
                    summaryRow("Email", user.email),
                    summaryRow("Registered", new Date(user.created_at).toLocaleString()),
                ])}
                ${buttonRow([{ label: "View Customers", url: `${FRONTEND_URL}/admin/customers` }])}
            `,
        }),
    });
}

export async function sendAdminNewsletterSubscriberEmail(email) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: "New Newsletter Subscriber",
        html: layout({
            preheader: `${email} just subscribed to the newsletter.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">New Newsletter Subscriber</h1>
                ${summaryTable([
                    summaryRow("Email", email),
                    summaryRow("Date", new Date().toLocaleString()),
                ])}
            `,
        }),
    });
}

export async function sendAdminLowStockEmail(product) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: `⚠️ Low Stock Alert — ${product.name}`,
        html: layout({
            preheader: `${product.name} is running low on stock.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Low Stock Alert</h1>
                ${summaryTable([
                    summaryRow("Product", product.name),
                    summaryRow("Remaining Stock", String(product.stock), { bold: true }),
                    product.sold !== undefined ? summaryRow("Current Sales", String(product.sold)) : "",
                ].filter(Boolean))}
                ${buttonRow([{ label: "Restock Now", url: `${FRONTEND_URL}/admin/products` }])}
            `,
        }),
    });
}

export async function sendAdminOutOfStockEmail(product) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: `🚫 Out of Stock — ${product.name}`,
        html: layout({
            preheader: `${product.name} is now out of stock.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Product Out of Stock</h1>
                <p><strong>${product.name}</strong> has just sold out.</p>
                ${buttonRow([{ label: "Restock Now", url: `${FRONTEND_URL}/admin/products` }])}
            `,
        }),
    });
}

export async function sendAdminFailedPaymentEmail(order, reason) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: `Payment Failed — Order ${order.order_number}`,
        html: layout({
            preheader: `Payment failed for order ${order.order_number}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Payment Failed</h1>
                ${summaryTable([
                    summaryRow("Order", order.order_number),
                    summaryRow("Customer", order.customer_name),
                    summaryRow("Reason", reason || "Unknown"),
                ])}
            `,
        }),
    });
}

export async function sendAdminRefundIssuedEmail(order, reason) {
    await safeSend({
        to: ADMIN_EMAIL,
        subject: `Refund Issued — Order ${order.order_number}`,
        html: layout({
            preheader: `A refund was issued for order ${order.order_number}.`,
            bodyHtml: `
                <h1 style="font-family:'Georgia',serif; font-size:22px; color:${BRAND.green}; margin:0 0 12px;">Refund Issued</h1>
                ${summaryTable([
                    summaryRow("Order", order.order_number),
                    summaryRow("Customer", order.customer_name),
                    summaryRow("Amount", `Rs. ${Number(order.total).toLocaleString()}`),
                    summaryRow("Reason", reason || "—"),
                ])}
            `,
        }),
    });
}
