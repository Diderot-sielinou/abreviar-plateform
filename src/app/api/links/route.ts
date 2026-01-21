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

// GET - List user's links
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

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
        select: {
          id: true,
          slug: true,
          originalUrl: true,
          isActive: true,
          ogTitle: true,
          ogDescription: true,
          ogImage: true,
          totalClicks: true,
          expiresAt: true,
          clickLimit: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
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
        hasMore: skip + links.length < total,
      },
    });
  } catch (error) {
    console.error("[API] Error listing links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new link
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createLinkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    let slug: string;

    // Custom slug or generate
    if (data.slug && data.slug.trim() !== "") {
      const normalizedSlug = normalizeSlug(data.slug);
      if (!normalizedSlug) {
        return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
      }
      if (!(await isSlugAvailable(normalizedSlug))) {
        return NextResponse.json({ error: "This slug is already taken" }, { status: 409 });
      }
      slug = normalizedSlug;
    } else {
      slug = await generateUniqueSlug();
    }

    // Create link
    const link = await db.link.create({
      data: {
        userId: session.user.id,
        slug,
        originalUrl: data.originalUrl,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        clickLimit: data.clickLimit || null,
      },
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        isActive: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        totalClicks: true,
        expiresAt: true,
        clickLimit: true,
        createdAt: true,
      },
    });

    // Cache the new link
    const cacheData: CachedLink = {
      id: link.id,
      originalUrl: link.originalUrl,
      isActive: link.isActive,
      ogTitle: link.ogTitle,
      ogDescription: link.ogDescription,
      ogImage: link.ogImage,
      iosUrl: null,
      androidUrl: null,
      expiresAt: link.expiresAt?.toISOString() ?? null,
      clickLimit: link.clickLimit,
      totalClicks: link.totalClicks,
    };

    setCachedLink(slug, cacheData).catch(console.error);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
