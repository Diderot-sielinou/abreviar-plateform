/**
 * Edge Middleware
 * 
 * Handles link redirections at the edge for ultra-low latency (<50ms).
 * 
 * Architecture:
 * 1. Check Vercel KV cache (Edge-compatible) - ~5ms
 * 2. If cache miss, call Node.js API to get from DB
 * 3. Bot detection → serve OG tags HTML
 * 4. Human → 307 redirect + async analytics
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

// =============================================================================
// BOT DETECTION PATTERNS
// =============================================================================

const BOT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /Pinterest/i,
  /Googlebot/i,
  /Bingbot/i,
  /bot/i,
  /crawler/i,
  /spider/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

// =============================================================================
// OG HTML GENERATOR (for social media bots)
// =============================================================================

function generateOgHtml(data: {
  title: string;
  description: string;
  image: string | null;
  url: string;
  originalUrl: string;
}): string {
  const { title, description, image, url, originalUrl } = data;

  const escape = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="title" content="${escape(title)}">
  <meta name="description" content="${escape(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escape(url)}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  ${image ? `<meta property="og:image" content="${escape(image)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escape(url)}">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  ${image ? `<meta name="twitter:image" content="${escape(image)}">` : ""}
  <meta http-equiv="refresh" content="0;url=${escape(originalUrl)}">
  <script>window.location.replace("${originalUrl.replace(/"/g, '\\"')}");</script>
</head>
<body>
  <p>Redirecting to <a href="${escape(originalUrl)}">${escape(originalUrl)}</a>...</p>
</body>
</html>`;
}

// =============================================================================
// TYPES
// =============================================================================

interface LinkData {
  id: string;
  originalUrl: string;
  isActive: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  expiresAt: string | null;
  clickLimit: number | null;
  totalClicks: number;
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /s/{slug} routes
  if (!pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  const slug = pathname.slice(3); // Remove "/s/"
  if (!slug) return NextResponse.next();

  try {
    const baseUrl = request.nextUrl.origin;
    let linkData: LinkData | null = null;

    // =========================================================================
    // STEP 1: Check Vercel KV cache (Edge-compatible, ~5ms)
    // =========================================================================
    try {
      linkData = await kv.get<LinkData>(`link:${slug}`);
    } catch (cacheError) {
      console.error("[Middleware] Cache error:", cacheError);
    }

    // =========================================================================
    // STEP 2: Cache miss → call Node.js API
    // =========================================================================
    if (!linkData) {
      const response = await fetch(
        `${baseUrl}/api/links/resolve?slug=${encodeURIComponent(slug)}`,
        { headers: { "X-Internal-Request": "true" } }
      );

      if (!response.ok) {
        return NextResponse.redirect(new URL("/404", request.url));
      }

      linkData = await response.json();
    }

    if (!linkData) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // =========================================================================
    // STEP 3: Validate link status
    // =========================================================================
    if (!linkData.isActive) {
      return NextResponse.redirect(new URL("/link-disabled", request.url));
    }

    if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }

    if (linkData.clickLimit && linkData.totalClicks >= linkData.clickLimit) {
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }

    // =========================================================================
    // STEP 4: Bot detection → serve OG tags
    // =========================================================================
    const userAgent = request.headers.get("user-agent");
    if (isBot(userAgent)) {
      const html = generateOgHtml({
        title: linkData.ogTitle || extractDomain(linkData.originalUrl),
        description: linkData.ogDescription || "",
        image: linkData.ogImage,
        url: `${baseUrl}/s/${slug}`,
        originalUrl: linkData.originalUrl,
      });

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // =========================================================================
    // STEP 5: Human → track click (fire-and-forget) and redirect
    // =========================================================================
    trackClick(request, linkData.id, baseUrl).catch(console.error);

    return NextResponse.redirect(linkData.originalUrl, { status: 307 });
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function trackClick(
  request: NextRequest,
  linkId: string,
  baseUrl: string
): Promise<void> {
  const geo = request.geo || {};

  await fetch(`${baseUrl}/api/analytics/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Request": "true",
    },
    body: JSON.stringify({
      linkId,
      country: geo.country,
      city: geo.city,
      region: geo.region,
      latitude: geo.latitude,
      longitude: geo.longitude,
      userAgent: request.headers.get("user-agent") || "",
      referer: request.headers.get("referer") || "",
      timestamp: new Date().toISOString(),
    }),
  });
}

// =============================================================================
// CONFIG
// =============================================================================

export const config = {
  matcher: ["/s/:slug*"],
};
