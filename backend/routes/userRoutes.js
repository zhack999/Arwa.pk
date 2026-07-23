import express from "express";
import {
    registerCustomer, loginCustomer, logoutCustomer, checkCustomerAuth, getCustomers,
    updateProfile, changePassword, uploadProfilePicture, removeProfilePicture,
    getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
    getAuthConfig, verifyEmailOtp, verifyEmailToken, resendVerification,
    forgotPassword, verifyResetOtp, resetPassword,
    googleAuth, facebookAuth, logoutAllDevices,
} from "../controllers/userController.js";
import customerAuthMiddleware from "../middleware/customerAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
    registerValidation, loginValidation, forgotPasswordValidation, verifyOtpValidation,
    resendOtpValidation, resetPasswordValidation, verifyEmailTokenValidation, socialAuthValidation,
} from "../validators/authValidators.js";
import { updateProfileValidation, changePasswordValidation, addressValidation } from "../validators/profileValidators.js";
import { otpLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Public — lets the frontend know which social providers are actually usable
router.get("/auth-config", getAuthConfig);

// Public — customer-facing auth
router.post("/register", registerValidation, validate, registerCustomer);
router.post("/login", loginValidation, validate, loginCustomer);
router.post("/logout", logoutCustomer);
router.get("/check", customerAuthMiddleware, checkCustomerAuth);

// Email verification (public — the account isn't logged in yet at this point)
router.post("/verify-email/otp", otpLimiter, verifyOtpValidation, validate, verifyEmailOtp);
router.post("/verify-email/token", otpLimiter, verifyEmailTokenValidation, validate, verifyEmailToken);
router.post("/verify-email/resend", otpLimiter, resendOtpValidation, validate, resendVerification);

// Forgot / reset password (public)
router.post("/forgot-password", otpLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post("/verify-reset-otp", otpLimiter, verifyOtpValidation, validate, verifyResetOtp);
router.post("/reset-password", otpLimiter, resetPasswordValidation, validate, resetPassword);

// Social login (public)
router.post("/auth/google", socialAuthValidation, validate, googleAuth);
router.post("/auth/facebook", socialAuthValidation, validate, facebookAuth);

// Logged-in customer only
router.post("/logout-all", customerAuthMiddleware, logoutAllDevices);

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
