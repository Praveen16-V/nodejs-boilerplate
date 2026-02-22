import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { IApiResponse, IValidationError } from "@/types/index.js";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: IValidationError[] = errors
      .array()
      .map((error) => ({
        field: error.type === "field" ? error.path : "unknown",
        message: error.msg,
        value: error.type === "field" ? error.value : undefined,
      }));

    const response: IApiResponse = {
      success: false,
      message: "Validation failed",
      error: validationErrors
        .map((ve) => `${ve.field}: ${ve.message}`)
        .join(", "),
    };

    res.status(400).json(response);
    return;
  }

  next();
};

export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { id } = req.params;

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  next();
};
