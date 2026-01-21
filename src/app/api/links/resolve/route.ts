/**
 * Link Resolution API
 * 
 * GET /api/links/resolve?slug={slug}
 * 
 * Internal API used by Edge Middleware to fetch link data.
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { getCachedLink, setCachedLink, type CachedLink } from "@/app/lib/cache";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    // Try cache first
    const cached = await getCachedLink(slug);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    // Fallback to database
    const link = await db.link.findUnique({
      where: { slug },
      select: {
        id: true,
        originalUrl: true,
        isActive: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        iosUrl: true,
        androidUrl: true,
        expiresAt: true,
        clickLimit: true,
        totalClicks: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cache for next time
    const cacheData: CachedLink = {
      id: link.id,
      originalUrl: link.originalUrl,
      isActive: link.isActive,
      ogTitle: link.ogTitle,
      ogDescription: link.ogDescription,
      ogImage: link.ogImage,
      iosUrl: link.iosUrl,
      androidUrl: link.androidUrl,
      expiresAt: link.expiresAt?.toISOString() ?? null,
      clickLimit: link.clickLimit,
      totalClicks: link.totalClicks,
    };

    setCachedLink(slug, cacheData).catch(console.error);

    return NextResponse.json(cacheData, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("[API] Error resolving link:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
