import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string().min(1).default("fallback-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  MONGODB_URI: z.string().url().default("mongodb://localhost:27017/secure-app"),
  MONGODB_TEST_URI: z
    .string()
    .url()
    .default("mongodb://localhost:27017/secure-app-test"),
  SESSION_SECRET: z
    .string()
    .min(1)
    .default("fallback-session-secret-change-in-production"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("logs/app.log"),
  API_KEY_ENCRYPTION_SECRET: z
    .string()
    .min(1)
    .default("fallback-api-key-secret"),
});

const env = envSchema.parse(process.env);

const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptRounds: env.BCRYPT_ROUNDS,
  mongodbUri: env.MONGODB_URI,
  mongodbTestUri: env.MONGODB_TEST_URI,
  sessionSecret: env.SESSION_SECRET,
  corsOrigin: env.CORS_ORIGIN,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  logLevel: env.LOG_LEVEL,
  logFile: env.LOG_FILE,
  apiKeyEncryptionSecret: env.API_KEY_ENCRYPTION_SECRET,
};

export default config;
