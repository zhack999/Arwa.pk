import express from "express";
import { subscribeNewsletter, getNewsletterSubscribers } from "../controllers/newsletterController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);
router.get("/", authMiddleware, getNewsletterSubscribers); // admin-only

export default router;