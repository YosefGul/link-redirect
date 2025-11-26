import { z } from 'zod';

export const createLinkSchema = z.object({
  targetUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must start with http:// or https://'),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores')
    .min(3, 'Slug must be at least 3 characters')
    .max(64, 'Slug must be at most 64 characters')
    .optional()
    .or(z.literal('')),
  expiresAt: z
    .string()
    .datetime('Invalid date format')
    .refine((date) => {
      const expirationDate = new Date(date);
      const now = new Date();
      return expirationDate > now;
    }, 'Expiration date must be in the future')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .optional()
    .or(z.literal('')),
  maxClicks: z
    .number()
    .int('Must be a whole number')
    .positive('Must be at least 1')
    .optional(),
});

export const updateLinkSchema = z.object({
  targetUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must start with http:// or https://')
    .optional(),
  isActive: z.boolean().optional(),
  allowEdit: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime('Invalid date format')
    .refine((date) => {
      const expirationDate = new Date(date);
      const now = new Date();
      return expirationDate > now;
    }, 'Expiration date must be in the future')
    .nullable()
    .optional(),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .nullable()
    .optional(),
  maxClicks: z
    .number()
    .int('Must be a whole number')
    .positive('Must be at least 1')
    .nullable()
    .optional(),
});

export type CreateLinkFormData = z.infer<typeof createLinkSchema>;
export type UpdateLinkFormData = z.infer<typeof updateLinkSchema>;

