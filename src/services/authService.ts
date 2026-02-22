import User from "@/models/User.js";
import { SecurityUtils } from "@/utils/security.js";
import { AppError } from "@/middleware/errorHandler.js";
import { ILoginRequest, IRegisterRequest } from "@/types/index.js";

export class AuthService {
  static async register(userData: IRegisterRequest) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Create new user
    const user = new (User as any)({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Generate JWT token
    const token = SecurityUtils.generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  static async login(loginData: ILoginRequest) {
    const { email, password } = loginData;

    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if account is locked
    if ((user as any).isLocked) {
      throw new AppError(
        "Account is temporarily locked due to multiple failed attempts",
        423,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.handleFailedLogin();
      throw new AppError("Invalid email or password", 401);
    }

    // Reset failed attempts on successful login
    await user.handleSuccessfulLogin();

    // Generate JWT token
    const token = SecurityUtils.generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async logout(_userId: string) {
    // In a real implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Remove the session from the session store
    // 3. Clear any refresh tokens

    return { message: "Logged out successfully" };
  }
}
