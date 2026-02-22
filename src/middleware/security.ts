import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import hpp from "hpp";
import compression from "compression";
import config from "@/config/index.js";

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.corsOrigin.split(",").map((o) => o.trim());

    if (
      !origin ||
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
});

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (
      req.ip ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      "unknown"
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: "Too many password reset attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: "_",
});

export const xssConfig = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

export const hppConfig = hpp({
  whitelist: ["sort", "fields", "page", "limit"],
});

export const compressionConfig = compression();

export const addSecurityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  if (config.nodeEnv === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  next();
};

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      res.status(415).json({
        success: false,
        message: "Content-Type must be application/json",
      });
      return;
    }
  }

  next();
};

export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const contentLength = req.headers["content-length"];

  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB limit
    res.status(413).json({
      success: false,
      message: "Request entity too large",
    });
    return;
  }

  next();
};
