import { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUserModel {
  new (): IUser;
  create(data: any): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdWithPassword(id: string): Promise<IUser | null>;
  findByEmailVerificationToken(token: string): Promise<IUser | null>;
  findByPasswordResetToken(token: string): Promise<IUser | null>;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<void>;
  handleFailedLogin(): Promise<void>;
  handleSuccessfulLogin(): Promise<void>;
}

export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface IJWTPayload {
  userId: string | Types.ObjectId;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  mongodbUri: string;
  mongodbTestUri: string;
  sessionSecret: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
  logFile: string;
  apiKeyEncryptionSecret: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IPasswordResetRequest {
  email: string;
}

export interface IPasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}
