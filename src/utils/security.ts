import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "@/config/index.js";
import { IJWTPayload } from "@/types/index.js";

export class SecurityUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateJWT(payload: IJWTPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
      issuer: "secure-nodejs-app",
      audience: "secure-nodejs-app-users",
    } as jwt.SignOptions);
  }

  static verifyJWT(token: string): IJWTPayload {
    return jwt.verify(token, config.jwtSecret) as IJWTPayload;
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static generateApiKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static encryptApiKey(apiKey: string): string {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(config.apiKeyEncryptionSecret, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(apiKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  static decryptApiKey(encryptedApiKey: string): string {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(config.apiKeyEncryptionSecret, "salt", 32);
    const parts = encryptedApiKey.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted API key format");
    }
    const iv = Buffer.from(parts[0] || "", "hex");
    const encrypted = parts[1];
    if (!encrypted) {
      throw new Error("Encrypted data is missing");
    }
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static rateLimitKeyGenerator(identifier: string): string {
    return `rate_limit:${identifier}`;
  }
}
