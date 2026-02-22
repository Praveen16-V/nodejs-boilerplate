import { Router } from "express";
import * as authController from "@/controllers/authController.js";
import { authenticate } from "@/middleware/auth.js";
import { validate } from "@/middleware/validation.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "@/utils/validation.js";
import { authRateLimiter } from "@/middleware/security.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login,
);

router.post("/logout", authenticate, authController.logout);

router.get("/profile", authenticate, authController.getProfile);

router.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
