/**
 * Slug Generation & Validation
 * 
 * Uses nanoid for unique, URL-safe short codes.
 */

import { customAlphabet } from "nanoid";
import { db } from "./db";
import { SLUG_CONFIG, RESERVED_SLUGS } from "./constants";

// Custom nanoid with URL-friendly alphabet (no confusing chars)
// const nanoid = customAlphabet(SLUG_CONFIG.ALPHABET, SLUG_CONFIG.DEFAULT_LENGTH);

// =============================================================================
// GENERATION
// =============================================================================

/**
 * Generate a unique slug
 * 
 * Checks database for collisions and retries if needed.
 */
export async function generateUniqueSlug(
  length: number = SLUG_CONFIG.DEFAULT_LENGTH,
  maxAttempts: number = 5
): Promise<string> {
  const generator = customAlphabet(SLUG_CONFIG.ALPHABET, length);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slug = generator();
    
    // Check if available
    if (await isSlugAvailable(slug)) {
      return slug;
    }
  }
  
  // Increase length if too many collisions
  return generateUniqueSlug(length + 1, maxAttempts);
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  // Check reserved
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return false;
  }
  
  // Check database
  const existing = await db.link.findUnique({
    where: { slug },
    select: { id: true },
  });
  
  return !existing;
}

/**
 * Normalize slug (lowercase, replace spaces/underscores)
 */
export function normalizeSlug(slug: string): string | null {
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Validate length
  if (normalized.length < SLUG_CONFIG.MIN_LENGTH) {
    return null;
  }
  
  if (normalized.length > SLUG_CONFIG.MAX_LENGTH) {
    return null;
  }
  
  return normalized;
}

/**
 * Suggest a slug from URL
 */
export function suggestSlugFromUrl(url: string): string | null {
  try {
    const { pathname, hostname } = new URL(url);
    
    // Try last path segment
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const normalized = normalizeSlug(lastSegment);
      if (normalized) return normalized;
    }
    
    // Fall back to domain
    const domainSlug = normalizeSlug(hostname.replace(/^www\./, "").split(".")[0]);
    return domainSlug;
  } catch {
    return null;
  }
}
