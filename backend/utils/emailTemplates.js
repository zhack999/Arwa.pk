// Reusable email template system — every email in emailService.js is built from these
// pieces, so there's exactly one place that defines what an ARWAA.PK email looks like.
// (Part 7 of the spec: "Do NOT duplicate HTML... reusable template system.")

export const BRAND = {
    green: "#1A3D2B",
    gold: "#C9A84C",
    bg: "#F8F6F2",
    text: "#2D2D2D",
    muted: "#8a8578",
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
const SOCIAL = {
    instagram: process.env.SOCIAL_INSTAGRAM_URL || "",
    facebook: process.env.SOCIAL_FACEBOOK_URL || "",
    tiktok: process.env.SOCIAL_TIKTOK_URL || "",
    whatsapp: process.env.SOCIAL_WHATSAPP_URL || "",
};

// A real, primary call-to-action button — the one visual element every email needs at
// least one of.
export function button(label, url, { variant = "primary" } = {}) {
    const styles = variant === "primary"
        ? `background:${BRAND.green}; color:${BRAND.gold};`
        : `background:transparent; color:${BRAND.green}; border:1px solid ${BRAND.green};`;
    return `
    <a href="${url}" style="display:inline-block; ${styles} text-decoration:none; padding:14px 32px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; border-radius:2px;">
        ${label}
    </a>`;
}

// Row of buttons, evenly spaced — used wherever an email offers more than one action
// (e.g. order confirmation: Track Order / Dashboard / Continue Shopping).
export function buttonRow(buttons) {
    const cells = buttons.map(b => `<td style="padding:0 6px;">${button(b.label, b.url, { variant: b.variant })}</td>`).join("");
    return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr>${cells}</tr></table>`;
}

// A single icon+link social row, gracefully omitting any platform whose URL isn't set —
// so an unconfigured account doesn't render broken/dead icons.
function socialLinks() {
    const links = [
        SOCIAL.instagram && { label: "Instagram", url: SOCIAL.instagram },
        SOCIAL.facebook && { label: "Facebook", url: SOCIAL.facebook },
        SOCIAL.tiktok && { label: "TikTok", url: SOCIAL.tiktok },
        SOCIAL.whatsapp && { label: "WhatsApp", url: SOCIAL.whatsapp },
    ].filter(Boolean);
    if (links.length === 0) return "";
    return `<p style="margin:12px 0 0;">${links.map(l => `<a href="${l.url}" style="color:${BRAND.gold}; text-decoration:none; font-size:12px; margin:0 8px;">${l.label}</a>`).join("")}</p>`;
}

function header() {
    return `
    <tr>
        <td style="background:${BRAND.green}; padding:32px 24px; text-align:center;">
            <div style="font-family:'Georgia',serif; font-size:26px; font-weight:700; letter-spacing:3px; color:${BRAND.gold};">ARWAA.PK</div>
            <div style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:11px; letter-spacing:2px; color:rgba(245,240,232,0.6); margin-top:4px; text-transform:uppercase;">Luxury Botanical Skincare</div>
        </td>
    </tr>`;
}

function footer() {
    return `
    <tr>
        <td style="background:${BRAND.bg}; padding:28px 24px; text-align:center; border-top:1px solid rgba(26,61,43,0.08);">
            <p style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; color:${BRAND.muted};">
                <a href="${FRONTEND_URL}" style="color:${BRAND.green}; text-decoration:none;">arwaa.pk</a>
                &nbsp;·&nbsp;
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.green}; text-decoration:none;">${SUPPORT_EMAIL}</a>
            </p>
            ${socialLinks()}
            <p style="margin:16px 0 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:11px; color:${BRAND.muted};">
                © ${new Date().getFullYear()} Arwaa.pk. All rights reserved.
                &nbsp;·&nbsp;
                <a href="${FRONTEND_URL}/privacy" style="color:${BRAND.muted}; text-decoration:underline;">Privacy Policy</a>
            </p>
        </td>
    </tr>`;
}

// The one function every email in emailService.js calls. bodyHtml is whatever's unique
// to that specific email (its own message + tables + buttons); header/footer/wrapper
// styling is defined here ONCE.
export function layout({ preheader = "", bodyHtml }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ARWAA.PK</title>
</head>
<body style="margin:0; padding:0; background:${BRAND.bg};">
    <!-- Preheader: shows in the inbox preview line, invisible in the email body itself -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg}; padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 4px 24px rgba(26,61,43,0.08);">
                    ${header()}
                    <tr>
                        <td style="padding:36px 32px; font-family:'Helvetica Neue',Arial,sans-serif; color:${BRAND.text}; font-size:15px; line-height:1.65;">
                            ${bodyHtml}
                        </td>
                    </tr>
                    ${footer()}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Large, centered code display — used by both the verification email and the OTP email.
export function otpBox(code) {
    return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:24px auto;">
        <tr><td style="background:${BRAND.bg}; border:1px dashed ${BRAND.gold}; border-radius:6px; padding:18px 36px;">
            <span style="font-family:'Courier New',monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:${BRAND.green};">${code}</span>
        </td></tr>
    </table>`;
}

// One row per product line item — used by order confirmation and the invoice email.
export function productRow(item) {
    const imageCell = item.product_image
        ? `<img src="${item.product_image}" width="56" height="56" style="border-radius:4px; object-fit:cover; display:block;" alt="${item.product_name}" />`
        : "";
    return `
    <tr>
        <td style="padding:12px 0; border-bottom:1px solid rgba(26,61,43,0.08); width:64px;">${imageCell}</td>
        <td style="padding:12px 8px; border-bottom:1px solid rgba(26,61,43,0.08);">
            <div style="font-weight:600;">${item.product_name}</div>
            <div style="font-size:13px; color:${BRAND.muted};">Qty: ${item.quantity}</div>
        </td>
        <td style="padding:12px 0; border-bottom:1px solid rgba(26,61,43,0.08); text-align:right; white-space:nowrap;">Rs. ${Number(item.subtotal).toLocaleString()}</td>
    </tr>`;
}

export function productsTable(items) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">${items.map(productRow).join("")}</table>`;
}

// Key/value summary rows — subtotal, discount, shipping, total, payment method, etc.
export function summaryRow(label, value, { bold = false } = {}) {
    return `
    <tr>
        <td style="padding:4px 0; color:${bold ? BRAND.text : BRAND.muted}; font-weight:${bold ? 700 : 400};">${label}</td>
        <td style="padding:4px 0; text-align:right; font-weight:${bold ? 700 : 400}; color:${BRAND.text};">${value}</td>
    </tr>`;
}

export function summaryTable(rows) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${rows.join("")}</table>`;
}

// Order-progress tracker — Received → Preparing → Shipped → Delivered, with the current
// (and completed) steps in gold/green and the rest greyed out.
const PROGRESS_STEPS = [
    { key: "pending", label: "Order Received" },
    { key: "processing", label: "Preparing" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
];
export function progressTracker(currentStatus) {
    const steps = currentStatus === "out_for_delivery"
        ? PROGRESS_STEPS
        : PROGRESS_STEPS.filter(s => s.key !== "out_for_delivery"); // keep it a clean 4-step tracker unless actually used
    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    const cells = steps.map((step, i) => {
        const isDone = currentIndex >= 0 && i <= currentIndex;
        const dotColor = isDone ? BRAND.gold : "rgba(26,61,43,0.15)";
        const textColor = isDone ? BRAND.green : BRAND.muted;
        return `
        <td style="text-align:center; font-family:'Helvetica Neue',Arial,sans-serif;">
            <div style="width:14px; height:14px; border-radius:50%; background:${dotColor}; margin:0 auto 6px;"></div>
            <div style="font-size:11px; color:${textColor}; font-weight:${isDone ? 700 : 400};">${step.label}</div>
        </td>`;
    }).join(`<td style="width:24px;"><div style="height:2px; background:rgba(26,61,43,0.1); margin-top:6px;"></div></td>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr>${cells}</tr></table>`;
}
