import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateDto = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
          error: 'VALIDATION_ERROR',
        });
        return;
      }

      console.error('DTO validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse query parameters
      const queryParams: Record<string, any> = {};

      for (const [key, value] of Object.entries(req.query)) {
        if (value !== undefined && value !== null && value !== '') {
          // Try to parse numbers
          if (!isNaN(Number(value)) && value !== '') {
            queryParams[key] = Number(value);
          } else if (value === 'true') {
            queryParams[key] = true;
          } else if (value === 'false') {
            queryParams[key] = false;
          } else if (Array.isArray(value)) {
            queryParams[key] = value;
          } else {
            queryParams[key] = value;
          }
        }
      }

      const validatedData = schema.parse(queryParams);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: errorMessages,
          error: 'VALIDATION_ERROR',
        });
        return;
      }

      console.error('Query validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors: errorMessages,
          error: 'VALIDATION_ERROR',
        });
        return;
      }

      console.error('Parameter validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
      });
    }
  };
};
