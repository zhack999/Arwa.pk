import { body, param } from "express-validator";

export const createReviewValidation = [
  param("productId").isUUID().withMessage("Invalid product ID"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("title").optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body("text").trim().notEmpty().withMessage("Review text is required").isLength({ min: 3, max: 2000 }),
];