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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get link details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await db.link.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("[API] Error fetching link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update link
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingLink = await db.link.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, slug: true },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = updateLinkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const updatedLink = await db.link.update({
      where: { id },
      data: {
        ...(data.originalUrl !== undefined && { originalUrl: data.originalUrl }),
        ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle }),
        ...(data.ogDescription !== undefined && { ogDescription: data.ogDescription }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
        ...(data.clickLimit !== undefined && { clickLimit: data.clickLimit }),
      },
    });

    // Update cache
    const cacheData: CachedLink = {
      id: updatedLink.id,
      originalUrl: updatedLink.originalUrl,
      isActive: updatedLink.isActive,
      ogTitle: updatedLink.ogTitle,
      ogDescription: updatedLink.ogDescription,
      ogImage: updatedLink.ogImage,
      iosUrl: updatedLink.iosUrl,
      androidUrl: updatedLink.androidUrl,
      expiresAt: updatedLink.expiresAt?.toISOString() ?? null,
      clickLimit: updatedLink.clickLimit,
      totalClicks: updatedLink.totalClicks,
    };

    setCachedLink(updatedLink.slug, cacheData).catch(console.error);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("[API] Error updating link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingLink = await db.link.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, slug: true },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await db.link.delete({ where: { id } });
    invalidateCachedLink(existingLink.slug).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
