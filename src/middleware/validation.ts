import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { IApiResponse, IValidationError } from "@/types/index.js";

export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);

      // Attach validated data to request
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: IValidationError[] = error.issues.map(
          (err) => ({
            field: err.path.join("."),
            message: err.message,
            value: undefined, // Zod issues don't have a 'received' property
          }),
        );

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

      // Handle other unexpected errors
      const response: IApiResponse = {
        success: false,
        message: "Validation error",
        error: "An unexpected error occurred during validation",
      };

      res.status(500).json(response);
    }
  };
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
