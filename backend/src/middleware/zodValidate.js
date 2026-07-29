import { z } from 'zod';

/**
 * Zod validation middleware
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
export const zodValidate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request data against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError || (error?.name === 'ZodError' && error?.errors)) {
        // Format Zod errors into a readable format
        const errors = (error.errors || []).map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Handle other errors
      next(error);
    }
  };
};
