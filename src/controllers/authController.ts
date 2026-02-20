import { Response } from "express";
import {
  IAuthRequest,
  IApiResponse,
  ILoginRequest,
  IRegisterRequest,
} from "@/types";
import { SecurityUtils } from "@/utils/security";
import User from "@/models/User";
import { asyncHandler, AppError } from "@/middleware/errorHandler";

export const register = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { email, password, firstName, lastName }: IRegisterRequest = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    const token = SecurityUtils.generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response: IApiResponse = {
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token,
      },
    };

    res.status(201).json(response);
  },
);

export const login = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { email, password }: ILoginRequest = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isLocked) {
      throw new AppError(
        "Account is locked due to multiple failed login attempts",
        423,
      );
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new AppError("Invalid email or password", 401);
    }

    if ((user.loginAttempts || 0) > 0) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = SecurityUtils.generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response: IApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
        },
        token,
      },
    };

    res.status(200).json(response);
  },
);

export const getProfile = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user!;
    await Promise.resolve(); // Add await to satisfy linter

    const response: IApiResponse = {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    };

    res.status(200).json(response);
  },
);

export const changePassword = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    const userWithPassword = await User.findById(user._id);

    if (!userWithPassword) {
      throw new AppError("User not found", 404);
    }

    const isCurrentPasswordValid =
      await userWithPassword.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    userWithPassword.password = newPassword;
    await userWithPassword.save();

    const response: IApiResponse = {
      success: true,
      message: "Password changed successfully",
    };

    res.status(200).json(response);
  },
);

export const logout = asyncHandler(
  async (_req: IAuthRequest, res: Response): Promise<void> => {
    const response: IApiResponse = {
      success: true,
      message: "Logout successful",
    };

    await Promise.resolve(); // Add await to satisfy linter
    res.status(200).json(response);
  },
);
