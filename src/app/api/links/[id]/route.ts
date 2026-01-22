/**
 * Individual Link API
 * 
 * GET    /api/links/[id] - Get link details
 * PATCH  /api/links/[id] - Update link
 * DELETE /api/links/[id] - Delete link
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { updateLinkSchema } from "@/app/lib/validations";
import { setCachedLink, invalidateCachedLink, type CachedLink } from "@/app/lib/cache";
import { RESERVED_SLUGS } from "@/app/lib/constants";
import { isSlugAvailable } from "@/app/lib/slug";




interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/links/[id]
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const link = await db.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...link,
      hasPassword: !!link.password,
      password: undefined,
    });
  } catch (error) {
    console.error("[API] GET /api/links/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/links/[id]
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if link exists
    const existingLink = await db.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Parse body
    let body;
    try {
      body = await request.json();
      console.log("[API] PATCH body received:", body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate
    const validation = updateLinkSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten();
      console.log("[API] Validation errors:", errors);
      return NextResponse.json(
        { error: "Validation failed", details: errors.fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log("[API] Validated data:", data);

    // Check slug if changed
    if (data.slug && data.slug !== existingLink.slug) {
      const newSlug = data.slug.toLowerCase().trim();

      if (RESERVED_SLUGS.has(newSlug)) {
        return NextResponse.json(
          { error: "This slug is reserved", details: { slug: ["This slug is reserved"] } },
          { status: 400 }
        );
      }

      const available = await isSlugAvailable(newSlug);
      if (!available) {
        return NextResponse.json(
          { error: "Slug already taken", details: { slug: ["This slug is already in use"] } },
          { status: 400 }
        );
      }

      // Invalidate old cache
      try {
        await invalidateCachedLink(existingLink.slug);
      } catch (e) {
        console.error("[API] Cache invalidation error:", e);
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.originalUrl !== undefined) {
      updateData.originalUrl = data.originalUrl;
    }
    if (data.slug !== undefined && data.slug !== "") {
      updateData.slug = data.slug.toLowerCase().trim();
    }
    if (data.ogTitle !== undefined) {
      updateData.ogTitle = data.ogTitle || null;
    }
    if (data.ogDescription !== undefined) {
      updateData.ogDescription = data.ogDescription || null;
    }
    if (data.ogImage !== undefined) {
      updateData.ogImage = data.ogImage || null;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }
    if (data.clickLimit !== undefined) {
      updateData.clickLimit = data.clickLimit;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.password !== undefined) {
      updateData.password = data.password || null;
    }
    if (data.iosUrl !== undefined) {
      updateData.iosUrl = data.iosUrl || null;
    }
    if (data.androidUrl !== undefined) {
      updateData.androidUrl = data.androidUrl || null;
    }

    console.log("[API] Update data:", updateData);

    // Update
    const updatedLink = await db.link.update({
      where: { id },
      data: updateData,
    });

    console.log("[API] Link updated:", updatedLink.id);

    // Update cache
    try {
      await setCachedLink(updatedLink.slug, {
        id: updatedLink.id,
        originalUrl: updatedLink.originalUrl,
        isActive: updatedLink.isActive,
        ogTitle: updatedLink.ogTitle,
        ogDescription: updatedLink.ogDescription,
        ogImage: updatedLink.ogImage,
        expiresAt: updatedLink.expiresAt?.toISOString() || null,
        clickLimit: updatedLink.clickLimit,
        totalClicks: updatedLink.totalClicks,
        iosUrl: null,
        androidUrl: null
      });
    } catch (cacheError) {
      console.error("[API] Cache update error:", cacheError);
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("[API] PATCH /api/links/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/links/[id]
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const link = await db.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Delete clicks first (if not using cascade)
    await db.click.deleteMany({ where: { linkId: id } });

    // Delete link
    await db.link.delete({ where: { id } });

    // Invalidate cache
    try {
      await invalidateCachedLink(link.slug);
    } catch (cacheError) {
      console.error("[API] Cache invalidation error:", cacheError);
    }

    return NextResponse.json({ success: true, message: "Link deleted" });
  } catch (error) {
    console.error("[API] DELETE /api/links/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}