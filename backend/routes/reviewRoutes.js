import express from "express";
import { getProductReviews, getAllRatingSummaries, createReview, deleteReview } from "../controllers/reviewController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";
import optionalCustomerAuth from "../middleware/optionalCustomerAuth.js";
import { validate } from "../middleware/validate.js";
import { createReviewValidation } from "../validators/reviewValidators.js";

const router = express.Router();

router.get("/summary/all", getAllRatingSummaries); // must come before /:productId
router.get("/:productId", optionalCustomerAuth, getProductReviews);
router.post("/:productId", customerAuthMiddleware, createReviewValidation, validate, createReview);
router.delete("/:reviewId", customerAuthMiddleware, deleteReview);

export default router;