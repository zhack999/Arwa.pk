import express from "express";

import {
    getProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createProductValidation, updateProductValidation, productSlugParam } from "../validators/productValidators.js";

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get All Products
router.get("/", getProducts);

// Get Single Product
router.get("/:slug", productSlugParam, validate, getSingleProduct);

// ======================================================
// PROTECTED ADMIN ROUTES
// ======================================================

// Create Product
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createProductValidation,
    validate,
    createProduct
);

// Update Product
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateProductValidation,
    validate,
    updateProduct
);

// Delete Product
router.delete(
    "/:id",
    authMiddleware,
    deleteProduct
);

export default router;