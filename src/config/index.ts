import dotenv from "dotenv";
import { IConfig } from "@/types";

dotenv.config();

const config: IConfig = {
  port: Number(process.env["PORT"]) || 3000,
  nodeEnv: process.env["NODE_ENV"] || "development",
  jwtSecret:
    process.env["JWT_SECRET"] || "fallback-secret-change-in-production",
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
  bcryptRounds: Number(process.env["BCRYPT_ROUNDS"]) || 12,
  mongodbUri:
    process.env["MONGODB_URI"] || "mongodb://localhost:27017/secure-app",
  mongodbTestUri:
    process.env["MONGODB_TEST_URI"] ||
    "mongodb://localhost:27017/secure-app-test",
  sessionSecret:
    process.env["SESSION_SECRET"] ||
    "fallback-session-secret-change-in-production",
  corsOrigin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
  rateLimitWindowMs: Number(process.env["RATE_LIMIT_WINDOW_MS"]) || 900000,
  rateLimitMaxRequests: Number(process.env["RATE_LIMIT_MAX_REQUESTS"]) || 100,
  logLevel: process.env["LOG_LEVEL"] || "info",
  logFile: process.env["LOG_FILE"] || "logs/app.log",
  apiKeyEncryptionSecret:
    process.env["API_KEY_ENCRYPTION_SECRET"] || "fallback-api-key-secret",
};

export default config;
