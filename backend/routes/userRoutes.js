import express from "express";
import {
    registerCustomer, loginCustomer, logoutCustomer, checkCustomerAuth, getCustomers,
    updateProfile, changePassword, uploadProfilePicture, removeProfilePicture,
    getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} from "../controllers/userController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import { registerValidation, loginValidation } from "../validators/authValidators.js";
import { updateProfileValidation, changePasswordValidation, addressValidation } from "../validators/profileValidators.js";

const router = express.Router();

// Public — customer-facing auth
router.post("/register", registerValidation, validate, registerCustomer);
router.post("/login", loginValidation, validate, loginCustomer);
router.post("/logout", logoutCustomer);
router.get("/check", customerAuthMiddleware, checkCustomerAuth);

// Customer profile & password (logged-in customer only)
router.get("/profile", customerAuthMiddleware, checkCustomerAuth);
router.put("/profile", customerAuthMiddleware, updateProfileValidation, validate, updateProfile);
router.put("/password", customerAuthMiddleware, changePasswordValidation, validate, changePassword);
router.post("/profile/picture", customerAuthMiddleware, upload.single("image"), uploadProfilePicture);
router.delete("/profile/picture", customerAuthMiddleware, removeProfilePicture);

// Customer addresses (logged-in customer only)
router.get("/addresses", customerAuthMiddleware, getAddresses);
router.post("/addresses", customerAuthMiddleware, addressValidation, validate, addAddress);
router.put("/addresses/:id", customerAuthMiddleware, addressValidation, validate, updateAddress);
router.delete("/addresses/:id", customerAuthMiddleware, deleteAddress);
router.put("/addresses/:id/default", customerAuthMiddleware, setDefaultAddress);

// Admin-only — list all customers
router.get("/", authMiddleware, getCustomers);

export default router;