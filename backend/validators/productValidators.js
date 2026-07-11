import { body, param } from "express-validator";

export const createProductValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required").isLength({ max: 200 }),
  body("category_id").trim().notEmpty().withMessage("Category is required").isUUID().withMessage("Invalid category"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("old_price").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("discount").optional({ checkFalsy: true }).isInt({ min: 0, max: 100 }),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("sku").optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

export const updateProductValidation = [
  param("id").isUUID().withMessage("Invalid product ID"),
  ...createProductValidation,
];

export const productIdParam = [param("id").isUUID().withMessage("Invalid product ID")];
export const productSlugParam = [param("slug").trim().notEmpty().isLength({ max: 200 })];