import express from "express";
import { getMyCart, addCartItem, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get("/mine", customerAuthMiddleware, getMyCart);
router.post("/", customerAuthMiddleware, addCartItem);
router.put("/:productId", customerAuthMiddleware, updateCartItem);
router.delete("/:productId", customerAuthMiddleware, removeCartItem);
router.delete("/", customerAuthMiddleware, clearCart);

export default router;