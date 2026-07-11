import express from "express";
import { createStripeSession } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/stripe/create-session", createStripeSession);
// Note: the webhook route is mounted separately in server.js (needs raw body, not this router)

export default router;