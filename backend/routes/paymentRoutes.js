import express from "express";
import {
    createStripeSession,
    createJazzCashSession,
    jazzcashCallback,
    createEasypaisaSession,
    easypaisaCallback,
    getPaymentConfig,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/config", getPaymentConfig);

router.post("/stripe/create-session", createStripeSession);
// Note: the Stripe webhook route is mounted separately in server.js (needs raw body, not this router)

router.post("/jazzcash/create-session", createJazzCashSession);
// JazzCash POSTs this callback as application/x-www-form-urlencoded — the global
// express.urlencoded() parser in server.js handles it fine, since the secure hash is
// computed over the field values themselves (not over the raw request body), unlike
// Stripe's webhook signature which needs the untouched raw bytes.
router.post("/jazzcash/callback", jazzcashCallback);

router.post("/easypaisa/create-session", createEasypaisaSession);
router.post("/easypaisa/callback", easypaisaCallback);

export default router;
