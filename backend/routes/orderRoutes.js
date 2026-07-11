import express from "express";
import {
    createOrder, getOrders, getOrderById, trackOrder, updateOrderStatus, updateOrderNotes, getMyOrders,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import optionalCustomerAuth from "../middleware/optionalCustomerAuth.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";
import { validate } from "../middleware/validate.js";
import { placeOrderValidation } from "../validators/orderValidators.js";

const router = express.Router();

// Public — customers placing/tracking orders. optionalCustomerAuth recognizes
// a logged-in customer if present, but never blocks guest checkout.
router.post("/", optionalCustomerAuth, placeOrderValidation, validate, createOrder);
router.get("/track/:orderNumber", trackOrder);

// Logged-in customer — their own order history
router.get("/mine", customerAuthMiddleware, getMyOrders);

// Admin only
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.put("/:id/notes", authMiddleware, updateOrderNotes);

export default router;