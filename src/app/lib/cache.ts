/**
 * Redis Cache (Vercel KV)
 * 
 * Provides ultra-fast link lookups for Edge redirects.
 * Cache-aside pattern: Redis first, then PostgreSQL.
 */

import { kv } from "@vercel/kv";

// =============================================================================
// TYPES
// =============================================================================

export interface CachedLink {
  id: string;
  originalUrl: string;
  isActive: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  iosUrl: string | null;
  androidUrl: string | null;
  expiresAt: string | null;
  clickLimit: number | null;
  totalClicks: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PREFIX = {
  LINK: "link:",
  STATS: "stats:",
} as const;

const TTL = 60 * 60 * 24; // 24 hours

// =============================================================================
// LINK CACHE OPERATIONS
// =============================================================================

/**
 * Get link data from cache
 */
export async function getCachedLink(slug: string): Promise<CachedLink | null> {
  try {
    return await kv.get<CachedLink>(`${PREFIX.LINK}${slug}`);
  } catch (error) {
    console.error("[Cache] getCachedLink error:", error);
    return null;
  }
}

/**
 * Set link data in cache
 */
export async function setCachedLink(
  slug: string,
  data: CachedLink,
  ttl: number = TTL
): Promise<void> {
  try {
    await kv.set(`${PREFIX.LINK}${slug}`, data, { ex: ttl });
  } catch (error) {
    console.error("[Cache] setCachedLink error:", error);
  }
}

/**
 * Delete link from cache
 */
export async function invalidateCachedLink(slug: string): Promise<void> {
  try {
    await kv.del(`${PREFIX.LINK}${slug}`);
  } catch (error) {
    console.error("[Cache] invalidateCachedLink error:", error);
  }
}

// =============================================================================
// STATS CACHE OPERATIONS
// =============================================================================

/**
 * Increment click counter (atomic)
 */
export async function incrementClickCount(linkId: string): Promise<number> {
  try {
    return await kv.incr(`${PREFIX.STATS}${linkId}`);
  } catch (error) {
    console.error("[Cache] incrementClickCount error:", error);
    return 0;
  }
}

/**
 * Get current click count
 */
export async function getClickCount(linkId: string): Promise<number> {
  try {
    return (await kv.get<number>(`${PREFIX.STATS}${linkId}`)) ?? 0;
  } catch (error) {
    console.error("[Cache] getClickCount error:", error);
    return 0;
  }
}
