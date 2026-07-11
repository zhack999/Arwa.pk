import express from "express";
import { adminLogin, adminLogout, checkAuth } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { loginValidation } from "../validators/authValidators.js";

const router = express.Router();

router.post("/login", loginValidation, validate, adminLogin);
router.post("/logout", adminLogout);
router.get("/check", authMiddleware, checkAuth);

export default router;