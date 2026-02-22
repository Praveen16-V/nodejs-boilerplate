import { Response } from "express";
import { IAuthRequest, IApiResponse } from "@/types/index.js";
import { ChangePasswordInput } from "@/utils/validation.js";
import { AuthService } from "@/services/authService.js";
import { asyncHandler } from "@/middleware/errorHandler.js";

export const register = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const result = await AuthService.register(req.body);

    const response: IApiResponse = {
      success: true,
      message: "User registered successfully",
      data: result,
    };

    res.status(201).json(response);
  },
);

export const login = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);

    const response: IApiResponse = {
      success: true,
      message: "Login successful",
      data: result,
    };

    res.status(200).json(response);
  },
);

export const getProfile = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const result = await AuthService.getProfile(userId);

    const response: IApiResponse = {
      success: true,
      message: "Profile retrieved successfully",
      data: { user: result },
    };

    res.status(200).json(response);
  },
);

export const changePassword = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword }: ChangePasswordInput = req.body;
    const userId = req.user!._id.toString();

    const result = await AuthService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    const response: IApiResponse = {
      success: true,
      message: "Password changed successfully",
      data: result,
    };

    res.status(200).json(response);
  },
);

export const logout = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const result = await AuthService.logout(userId);

    const response: IApiResponse = {
      success: true,
      message: "Logout successful",
      data: result,
    };

    res.status(200).json(response);
  },
);
