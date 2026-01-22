/**
 * Analytics Tracking API
 * 
 * POST /api/analytics/track
 * 
 * Internal API called by Edge Middleware to record click events.
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { DeviceType } from "@prisma/client";
import UAParser from "ua-parser-js";

interface TrackRequest {
  linkId: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  userAgent: string;
  referer: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify internal request
    const isInternal = request.headers.get("X-Internal-Request") === "true";
    if (!isInternal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: TrackRequest = await request.json();
    const { linkId, userAgent, referer, timestamp } = body;

    if (!linkId) {
      return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
    }

    // Parse User-Agent
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Determine device type
    let deviceType: DeviceType = DeviceType.UNKNOWN;
    const deviceTypeStr = result.device.type?.toLowerCase();

    if (deviceTypeStr === "mobile") {
      deviceType = DeviceType.MOBILE;
    } else if (deviceTypeStr === "tablet") {
      deviceType = DeviceType.TABLET;
    } else if (result.browser.name) {
      deviceType = DeviceType.DESKTOP;
    }

    // Check if bot
    const isBot = /bot|crawler|spider/i.test(userAgent);

    // Extract referer domain
    let refererDomain: string | null = null;
    if (referer) {
      try {
        const url = new URL(referer);
        refererDomain = url.hostname.replace(/^www\./, "");
      } catch {
        // Invalid URL
      }
    }

    // Record click
    await db.$transaction([
      db.click.create({
        data: {
          linkId,
          country: body.country || null,
          city: body.city || null,
          region: body.region || null,
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          device: deviceType,
          deviceName: result.device.model || null,
          browser: result.browser.name || null,
          os: result.os.name ? `${result.os.name} ${result.os.version || ""}`.trim() : null,
          referer: referer || null,
          refererDomain,
          isBot,
          createdAt: new Date(timestamp),
        },
      }),
      db.link.update({
        where: { id: linkId },
        data: { totalClicks: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error tracking click:", error);
    return NextResponse.json({ success: false });
  }
}

export const runtime = "nodejs";
