// JazzCash Hosted Checkout Page (Page Post) integration.
//
// Reference: JazzCash Payment Gateway Integration Guide for Merchants v4.2
// (https://sandbox.jazzcash.com.pk/SandboxDocumentation/) — Section 6.1.1 (Version 1.1
// input parameters) and Section 14 (secure hash calculation).
//
// This uses pp_TxnType left blank/omitted, which — per the integration guide — makes
// JazzCash show its own payment-method selection screen (card, mobile wallet, OTC,
// whichever the merchant has enabled), rather than forcing "mobile wallet only". This is
// the closest equivalent to Stripe Checkout's own method picker.

import crypto from "crypto";

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const PRODUCTION_URL = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

function getEnv() {
    return {
        merchantId: process.env.JAZZCASH_MERCHANT_ID,
        password: process.env.JAZZCASH_PASSWORD,
        integritySalt: process.env.JAZZCASH_INTEGRITY_SALT,
        returnUrl: process.env.JAZZCASH_RETURN_URL,
        env: process.env.JAZZCASH_ENV || "sandbox",
    };
}

// Used by the /payments/config endpoint so the frontend can grey out JazzCash instead of
// failing silently if the merchant hasn't finished onboarding yet.
export function isConfigured() {
    const { merchantId, password, integritySalt, returnUrl } = getEnv();
    return Boolean(merchantId && password && integritySalt && returnUrl);
}

function gatewayUrl() {
    return getEnv().env === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

// yyyyMMddHHmmss, as required by pp_TxnDateTime / pp_TxnExpiryDateTime
function formatDateTime(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

// Section 14.2: HMAC-SHA256 is computed over all NON-EMPTY pp_ fields, values
// concatenated in ascending alphabetical order of FIELD NAME (not value) with '&'
// between them, with the Integrity Salt prepended before hashing. Hex output.
function computeSecureHash(fields, integritySalt) {
    const sortedKeys = Object.keys(fields)
        .filter((key) => key.startsWith("pp_") && fields[key] !== undefined && fields[key] !== null && fields[key] !== "")
        .sort();
    const concatenatedValues = sortedKeys.map((key) => fields[key]).join("&");
    const stringToHash = `${integritySalt}&${concatenatedValues}`;
    return crypto.createHmac("sha256", integritySalt).update(stringToHash, "utf8").digest("hex");
}

// Builds the full set of pp_ fields (including pp_SecureHash) to be rendered as hidden
// form inputs and auto-posted to JazzCash from the frontend. txnRefNo is generated fresh
// per attempt (not reused across retries) so it can double as our payment_transactions
// dedup key.
export function buildCheckoutFields({ order }) {
    const { merchantId, password, integritySalt, returnUrl } = getEnv();
    if (!isConfigured()) {
        throw new Error("JazzCash is not configured (missing merchant credentials).");
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour to complete payment

    // pp_TxnRefNo allows AN, '/', '.' and is capped at 20 chars — keep it short & unique.
    const txnRefNo = `T${now.getTime()}`;

    // pp_Amount: no decimal places, smallest unit assumed at currency's default position
    // (PKR has 2 decimals) — e.g. Rs. 1,250.00 -> "125000".
    const amountInPaisa = Math.round(Number(order.total) * 100).toString();

    const fields = {
        pp_Version: "1.1",
        pp_TxnType: "", // left blank — see note above; JazzCash shows its own method picker
        pp_Language: "EN",
        pp_MerchantID: merchantId,
        pp_SubMerchantID: "",
        pp_Password: password,
        pp_BankID: "",
        pp_ProductID: "",
        pp_TxnRefNo: txnRefNo,
        pp_Amount: amountInPaisa,
        pp_DiscountedAmount: "",
        pp_DiscountBank: "",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: formatDateTime(now),
        pp_BillReference: order.order_number,
        pp_Description: `Payment for order ${order.order_number}`,
        pp_TxnExpiryDateTime: formatDateTime(expiry),
        pp_ReturnURL: returnUrl,
    };

    fields.pp_SecureHash = computeSecureHash(fields, integritySalt);

    return { url: gatewayUrl(), fields, txnRefNo };
}

// Verifies a callback POST from JazzCash by recomputing the secure hash over every
// non-empty pp_ field EXCEPT pp_SecureHash itself, and comparing to what was sent.
// Returns { valid, responseCode, isSuccess, txnRefNo, retrievalReferenceNo }.
export function verifyCallback(body) {
    const { integritySalt } = getEnv();
    const { pp_SecureHash, ...rest } = body;

    const recomputed = computeSecureHash(rest, integritySalt);
    const valid = Boolean(pp_SecureHash) && recomputed === pp_SecureHash;

    return {
        valid,
        responseCode: body.pp_ResponseCode,
        isSuccess: body.pp_ResponseCode === "000",
        txnRefNo: body.pp_TxnRefNo,
        retrievalReferenceNo: body.pp_RetreivalReferenceNo,
        responseMessage: body.pp_ResponseMessage,
    };
}
