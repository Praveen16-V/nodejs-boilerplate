import { Router } from "express";
import authRoutes from "./auth";

const router = Router();

router.use("/auth", authRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
