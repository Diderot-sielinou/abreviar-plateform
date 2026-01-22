/**
 * Zod Validation Schemas
 * 
 * Type-safe validation for API requests and forms.
 */

import { z } from "zod";
import { SLUG_CONFIG, RESERVED_SLUGS, OG_CONFIG } from "./constants";

// =============================================================================
// LINK SCHEMAS
// =============================================================================

/**
 * Create link validation
 */
export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  
  slug: z
    .string()
    .min(SLUG_CONFIG.MIN_LENGTH, `Slug must be at least ${SLUG_CONFIG.MIN_LENGTH} characters`)
    .max(SLUG_CONFIG.MAX_LENGTH, `Slug must be at most ${SLUG_CONFIG.MAX_LENGTH} characters`)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .refine((slug) => !RESERVED_SLUGS.has(slug), "This slug is reserved")
    .optional()
    .or(z.literal("")),
  
  ogTitle: z
    .string()
    .max(OG_CONFIG.TITLE_MAX_LENGTH, `Title must be at most ${OG_CONFIG.TITLE_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  
  ogDescription: z
    .string()
    .max(OG_CONFIG.DESCRIPTION_MAX_LENGTH, `Description must be at most ${OG_CONFIG.DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  
  ogImage: z
    .string()
    .url("Please enter a valid image URL")
    .optional()
    .or(z.literal("")),
  
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),
  
  clickLimit: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

/**
 * Update link validation
 */
export const updateLinkSchema = z.object({
  originalUrl: z.string().url().optional(),
  ogTitle: z.string().max(OG_CONFIG.TITLE_MAX_LENGTH).optional().nullable(),
  ogDescription: z.string().max(OG_CONFIG.DESCRIPTION_MAX_LENGTH).optional().nullable(),
  ogImage: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  clickLimit: z.number().int().positive().optional().nullable(),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

// =============================================================================
// PARAMETER SCHEMAS
// =============================================================================

/**
 * Link ID parameter validation
 */
export const linkIdSchema = z.object({
  id: z.string().cuid(),
});

/**
 * Slug parameter validation
 */
export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(SLUG_CONFIG.MIN_LENGTH)
    .max(SLUG_CONFIG.MAX_LENGTH)
    .regex(/^[a-z0-9-]+$/),
});

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

/**
 * Analytics query validation
 */
export const analyticsQuerySchema = z.object({
  linkId: z.string().cuid().optional(),
  period: z.enum(["24h", "7d", "30d", "90d"]).default("7d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

/**
 * Pagination query validation
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "totalClicks", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
