/**
 * Links API
 * 
 * GET  /api/links - List user's links
 * POST /api/links - Create new link
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { createLinkSchema } from "@/app/lib/validations";
import { generateUniqueSlug, normalizeSlug, isSlugAvailable } from "@/app/lib/slug";
import { setCachedLink, type CachedLink } from "@/app/lib/cache";
import { RESERVED_SLUGS } from "@/app/lib/constants";




/**
 * GET /api/links
 * List all links for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { slug: { contains: search, mode: "insensitive" as const } },
          { originalUrl: { contains: search, mode: "insensitive" as const } },
          { ogTitle: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [links, total] = await Promise.all([
      db.link.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          originalUrl: true,
          ogTitle: true,
          ogDescription: true,
          ogImage: true,
          totalClicks: true,
          isActive: true,
          expiresAt: true,
          clickLimit: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.link.count({ where }),
    ]);

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/links error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/links
 * Create a new short link
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate input
    const validation = createLinkSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten();
      console.log("[API] Validation errors:", errors);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: errors.fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate or validate slug
    let slug: string;
    if (data.slug && data.slug.trim() !== "") {
      // Custom slug provided
      slug = data.slug.toLowerCase().trim();

      // Check if reserved
      if (RESERVED_SLUGS.has(slug)) {
        return NextResponse.json(
          { error: "This slug is reserved", details: { slug: ["This slug is reserved"] } },
          { status: 400 }
        );
      }

      // Check availability
      const available = await isSlugAvailable(slug);
      if (!available) {
        return NextResponse.json(
          { error: "Slug already taken", details: { slug: ["This slug is already in use"] } },
          { status: 400 }
        );
      }
    } else {
      // Generate unique slug
      slug = await generateUniqueSlug();
    }

    // Prepare data for database
    const linkData: {
      userId: string;
      slug: string;
      originalUrl: string;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      expiresAt?: Date | null;
      clickLimit?: number | null;
      password?: string | null;
      iosUrl?: string | null;
      androidUrl?: string | null;
    } = {
      userId: session.user.id,
      slug,
      originalUrl: data.originalUrl,
      ogTitle: data.ogTitle || null,
      ogDescription: data.ogDescription || null,
      ogImage: data.ogImage || null,
      expiresAt: data.expiresAt || null,
      clickLimit: data.clickLimit || null,
      password: data.password || null,
      iosUrl: data.iosUrl || null,
      androidUrl: data.androidUrl || null,
    };

    // Create link in database
    const link = await db.link.create({
      data: linkData,
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        totalClicks: true,
        isActive: true,
        expiresAt: true,
        clickLimit: true,
        createdAt: true,
      },
    });

    // Cache the link for fast edge access
    try {
      await setCachedLink(slug, {
        id: link.id,
        originalUrl: link.originalUrl,
        isActive: link.isActive,
        ogTitle: link.ogTitle,
        ogDescription: link.ogDescription,
        ogImage: link.ogImage,
        expiresAt: link.expiresAt?.toISOString() || null,
        clickLimit: link.clickLimit,
        totalClicks: link.totalClicks,
        iosUrl: null,
        androidUrl: null
      });
    } catch (cacheError) {
      console.error("[API] Cache error:", cacheError);
      // Continue without cache
    }

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/links error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}