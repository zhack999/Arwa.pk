// Easypaisa hosted checkout — "Post Method" redirection integration
// (POST to easypay/Index.jsf, customer redirected to Easypaisa's page, Easypaisa
// posts back to postBackURL).
//
// Field names/URLs below are drawn from Easypaisa's publicly circulated Merchant
// Integration Guide (v4.1.2). Confirmed field names: amount, storeId, postBackURL,
// orderRefNum, expiryDate, merchantHashedReq, autoRedirect, paymentMethod, emailAddr,
// mobileNum, bankIdentifier.
//
// ⚠️ IMPORTANT — UNVERIFIED HASH FORMULA:
// Unlike JazzCash, Easypaisa's exact algorithm for computing `merchantHashedReq` is not
// consistently documented in public sources — Easypaisa hands each merchant a specific
// integration PDF at onboarding, and the formula has reportedly differed across versions.
// The implementation below uses a reasonable HMAC-SHA256-over-sorted-fields scheme (same
// spirit as JazzCash's), but you MUST confirm this against the exact PDF Easypaisa gives
// you before relying on it in production. Everything else in this integration (field
// names, URLs, callback handling, duplicate guard) is solid regardless of the hash
// formula, and the raw callback payload is always logged to `payment_transactions` /
// `orders.gateway_callback` for audit — so nothing is silently lost even if the hash
// check needs adjusting later.

import crypto from "crypto";

const SANDBOX_URL = "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";
const PRODUCTION_URL = "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

function getEnv() {
    return {
        storeId: process.env.EASYPAISA_STORE_ID,
        hashKey: process.env.EASYPAISA_HASH_KEY,
        returnUrl: process.env.EASYPAISA_RETURN_URL,
        env: process.env.EASYPAISA_ENV || "sandbox",
    };
}

export function isConfigured() {
    const { storeId, hashKey, returnUrl } = getEnv();
    return Boolean(storeId && hashKey && returnUrl);
}

function gatewayUrl() {
    return getEnv().env === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

// YYYYMMDD HHmmss per the integration guide's expiryDate format
function formatExpiry(date) {
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    return `${datePart} ${timePart}`;
}

// ⚠️ See file header — confirm this formula against your merchant-specific PDF.
// Best-effort: non-empty fields sorted by name, values joined with '&', HMAC-SHA256
// keyed with the hash key, hex output.
function computeHash(fields, hashKey) {
    const sortedKeys = Object.keys(fields)
        .filter((key) => fields[key] !== undefined && fields[key] !== null && fields[key] !== "")
        .sort();
    const concatenatedValues = sortedKeys.map((key) => fields[key]).join("&");
    return crypto.createHmac("sha256", hashKey).update(concatenatedValues, "utf8").digest("hex");
}

export function buildCheckoutFields({ order }) {
    const { storeId, hashKey, returnUrl } = getEnv();
    if (!isConfigured()) {
        throw new Error("Easypaisa is not configured (missing merchant credentials).");
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour to complete payment

    // orderRefNum must be unique per attempt (like JazzCash's pp_TxnRefNo) so it can
    // double as our payment_transactions dedup key and so a retried order doesn't reuse
    // a stale reference.
    const orderRefNum = `EP${now.getTime()}`;

    // Per the integration guide: "kindly set the amount to one decimal point e.g. 10.0".
    const amount = Number(order.total).toFixed(1);

    // order_number is appended to postBackURL so the callback handler can look the order
    // up directly — Easypaisa echoes back whatever query string is on the URL you send.
    const separator = returnUrl.includes("?") ? "&" : "?";
    const postBackURL = `${returnUrl}${separator}order_number=${encodeURIComponent(order.order_number)}`;

    const hashableFields = {
        amount,
        storeId,
        postBackURL,
        orderRefNum,
    };

    const fields = {
        ...hashableFields,
        expiryDate: formatExpiry(expiry),
        autoRedirect: "1",
        emailAddr: order.customer_email || "",
    };

    fields.merchantHashedReq = computeHash(hashableFields, hashKey);

    return { url: gatewayUrl(), fields, orderRefNum };
}

// Best-effort callback verification — see file header re: unverified hash formula.
// Easypaisa's postback field names for status/result also aren't consistently documented
// publicly; this reads the common ones reported by integrators (orderRefNum, plus
// whichever of transactionId/status/reason/paymentStatus is present) and always returns
// the full raw body so the caller can log it regardless of whether parsing matched.
export function parseCallback(body) {
    const orderRefNum = body.orderRefNum;
    const transactionId = body.transactionId || body.txnId || body.paymentToken || null;
    const status = (body.status || body.paymentStatus || body.reason || "").toString().toUpperCase();
    const isSuccess = status.includes("SUCCESS") || status === "0000" || status === "0";

    return { orderRefNum, transactionId, status, isSuccess, raw: body };
}
