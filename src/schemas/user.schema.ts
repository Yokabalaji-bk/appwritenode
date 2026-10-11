import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Zod schema for creating a user
 */
export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address format' }),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int({ message: 'Age must be an integer' })
    .min(0, { message: 'Age cannot be negative' })
    .max(150, { message: 'Age must be under 150' })
    .optional()
    .nullable(),
  role: z
    .enum(['user', 'admin', 'moderator'], {
      errorMap: () => ({ message: "Role must be 'user', 'admin', or 'moderator'" }),
    })
    .default('user')
    .optional(),
  isActive: z
    .boolean({ invalid_type_error: 'isActive must be a boolean' })
    .default(true)
    .optional(),
});

/**
 * Zod schema for updating a user
 */
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(100, { message: 'Name cannot exceed 100 characters' })
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'Invalid email address format' })
      .optional(),
    age: z
      .number({ invalid_type_error: 'Age must be a number' })
      .int({ message: 'Age must be an integer' })
      .min(0, { message: 'Age cannot be negative' })
      .max(150, { message: 'Age must be under 150' })
      .optional()
      .nullable(),
    role: z
      .enum(['user', 'admin', 'moderator'], {
        errorMap: () => ({ message: "Role must be 'user', 'admin', or 'moderator'" }),
      })
      .optional(),
    isActive: z
      .boolean({ invalid_type_error: 'isActive must be a boolean' })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Zod schema for MongoDB ObjectId URL params
 */
export const userIdParamSchema = z.object({
  id: z
    .string({ required_error: 'User ID is required' })
    .regex(objectIdRegex, {
      message: 'Invalid User ID format (must be a 24-character hexadecimal ObjectId)',
    }),
});

/**
 * Zod schema for pagination and query filters
 */
export const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Page must be a positive integer >= 1',
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be an integer between 1 and 100',
    }),
  search: z.string().trim().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
