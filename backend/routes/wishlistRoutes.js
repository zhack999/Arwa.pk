import express from "express";
import { getMyWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";

const router = express.Router();

// All wishlist routes require a logged-in customer
router.get("/mine", customerAuthMiddleware, getMyWishlist);
router.post("/", customerAuthMiddleware, addToWishlist);
router.delete("/:productId", customerAuthMiddleware, removeFromWishlist);

export default router;