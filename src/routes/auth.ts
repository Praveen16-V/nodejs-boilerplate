import { Router } from "express";
import * as authController from "@/controllers/authController.js";
import { authenticate } from "@/middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from "@/utils/validation.js";
import { handleValidationErrors } from "@/middleware/validation.js";
import { authRateLimiter } from "@/middleware/security.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register,
);

router.post(
  "/login",
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login,
);

router.get("/profile", authenticate, authController.getProfile);

router.post(
  "/change-password",
  authenticate,
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword,
);

router.post("/logout", authenticate, authController.logout);

export default router;
