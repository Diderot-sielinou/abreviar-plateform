import { z } from "zod";

// URL validation regex
const urlRegex = /^https?:\/\/.+/i;

/**
 * Schema for creating a new link
 */
export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL is required")
    .regex(urlRegex, "Must be a valid URL starting with http:// or https://")
    .max(2048, "URL is too long"),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),

  ogTitle: z.string().max(70, "Title must be at most 70 characters").optional().or(z.literal("")),

  ogDescription: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .or(z.literal("")),

  ogImage: z.string().max(2048, "Image URL is too long").optional().or(z.literal("")),

  // Accepter string (datetime-local) ou Date, et transformer en Date
  expiresAt: z
    .union([
      z.string().datetime({ offset: true }),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid datetime format"),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid datetime format"),
      z.date(),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      if (val instanceof Date) return val;
      // Convertir string en Date
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),

  clickLimit: z
    .union([z.number().int().positive(), z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num <= 0 ? null : num;
    }),

  password: z.string().max(100, "Password is too long").optional().or(z.literal("")),

  iosUrl: z.string().regex(urlRegex, "Must be a valid URL").max(2048).optional().or(z.literal("")),

  androidUrl: z
    .string()
    .regex(urlRegex, "Must be a valid URL")
    .max(2048)
    .optional()
    .or(z.literal("")),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

/**
 * Schema for updating an existing link
 */
export const updateLinkSchema = z.object({
  originalUrl: z
    .string()
    .regex(urlRegex, "Must be a valid URL starting with http:// or https://")
    .max(2048, "URL is too long")
    .optional(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),

  ogTitle: z
    .string()
    .max(70, "Title must be at most 70 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),

  ogDescription: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),

  ogImage: z
    .string()
    .max(2048, "Image URL is too long")
    .optional()
    .nullable()
    .transform((val) => val || null),

  expiresAt: z
    .union([
      z.string().datetime({ offset: true }),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid datetime format"),
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid datetime format"),
      z.date(),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      if (val instanceof Date) return val;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),

  clickLimit: z
    .union([z.number().int().positive(), z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num <= 0 ? null : num;
    }),

  isActive: z.boolean().optional(),

  password: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),

  iosUrl: z
    .string()
    .regex(urlRegex, "Must be a valid URL")
    .max(2048)
    .optional()
    .nullable()
    .transform((val) => val || null),

  androidUrl: z
    .string()
    .regex(urlRegex, "Must be a valid URL")
    .max(2048)
    .optional()
    .nullable()
    .transform((val) => val || null),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

/**
 * Schema for checking slug availability
 */
export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid characters in slug"),
});
