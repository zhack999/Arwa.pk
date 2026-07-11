import { body } from "express-validator";

export const registerValidation = [
  body("first_name").trim().notEmpty().withMessage("First name is required").isLength({ max: 60 }),
  body("last_name").trim().notEmpty().withMessage("Last name is required").isLength({ max: 60 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone number is required").isLength({ max: 20 }),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];