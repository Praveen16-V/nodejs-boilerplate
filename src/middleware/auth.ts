import { Response, NextFunction } from "express";
import { IAuthRequest } from "@/types/index.js";
import { SecurityUtils } from "@/utils/security.js";
import User from "@/models/User.js";

export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = SecurityUtils.verifyJWT(token);

      const user = await User.findById(decoded.userId.toString());

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid token - user not found",
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
        return;
      }

      if (!user.emailVerified) {
        res.status(401).json({
          success: false,
          message: "Email verification required",
        });
        return;
      }

      if (user.isLocked) {
        res.status(423).json({
          success: false,
          message: "Account is locked due to multiple failed login attempts",
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = SecurityUtils.verifyJWT(token);

      const user = await User.findById(decoded.userId.toString());

      if (user && user.isActive && user.emailVerified && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};
