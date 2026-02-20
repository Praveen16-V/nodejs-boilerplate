import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserModel } from "@/types";
import config from "@/config";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "First name can only contain letters and spaces",
      ],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
      match: [/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any): any {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ emailVerified: 1 });

userSchema.virtual("isLocked").get(function (this: any) {
  return !!(this["lockUntil"] && this["lockUntil"] > new Date());
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods["comparePassword"] = async function (
  this: IUser & Document,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods["incLoginAttempts"] = async function (
  this: IUser & Document,
): Promise<void> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  const loginAttempts = this.loginAttempts || 0;
  if (loginAttempts + 1 >= 5 && !(this as any).isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.statics["findByEmail"] = function (
  this: Model<IUser & Document>,
  email: string,
): Promise<(IUser & Document) | null> {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics["findByEmailVerificationToken"] = function (
  this: Model<IUser & Document>,
  token: string,
): Promise<(IUser & Document) | null> {
  const hashedToken = require("crypto")
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });
};

userSchema.statics["findByPasswordResetToken"] = function (
  this: Model<IUser & Document>,
  token: string,
): Promise<(IUser & Document) | null> {
  const hashedToken = require("crypto")
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });
};

const User = mongoose.model<IUser & Document, IUserModel>("User", userSchema);

export default User;
