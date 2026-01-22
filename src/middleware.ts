/**
 * Edge Middleware
 * 
 * Handles link redirections at the edge for ultra-low latency (<50ms).
 * 
 * Features:
 * - Cache-first pattern with Vercel KV
 * - Bot detection for social media crawlers
 * - Custom OG tags for link previews
 * - Geo tracking via Vercel headers
 * - Link status validation (active, expired, click limit)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

// =============================================================================
// BOT DETECTION PATTERNS
// =============================================================================

const BOT_PATTERNS = [
  // Social Media Bots
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /Pinterest/i,
  /Instagram/i,
  /Viber/i,
  /Snapchat/i,
  /XING-contenttabreceiver/i,
  // Search Engine Bots
  /Googlebot/i,
  /Bingbot/i,
  /baiduspider/i,
  /yandex/i,
  /duckduckbot/i,
  // Generic Patterns
  /bot/i,
  /crawler/i,
  /spider/i,
  /preview/i,
  /curl/i,
  /wget/i,
  /HeadlessChrome/i,
  /Lighthouse/i,
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

// =============================================================================
// OG HTML GENERATOR (for social media bots)
// =============================================================================

interface OgHtmlData {
  title: string;
  description: string;
  image: string | null;
  url: string;
  originalUrl: string;
  siteName: string;
}

function generateOgHtml(data: OgHtmlData): string {
  const { title, description, image, url, originalUrl, siteName } = data;

  // Escape HTML special characters
  const escape = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // Ensure image is absolute URL
  let absoluteImage = image;
  if (image && !image.startsWith("http")) {
    try {
      const baseUrl = new URL(url).origin;
      absoluteImage = `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
    } catch {
      absoluteImage = image;
    }
  }

  // Escape URL for JavaScript
  const escapeJs = (str: string): string =>
    str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${escape(title)}">
  <meta name="description" content="${escape(description)}">
  
  <!-- Open Graph / Facebook / WhatsApp / Instagram -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escape(url)}">
  <meta property="og:site_name" content="${escape(siteName)}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  ${absoluteImage ? `<meta property="og:image" content="${escape(absoluteImage)}">` : ""}
  ${absoluteImage ? `<meta property="og:image:secure_url" content="${escape(absoluteImage)}">` : ""}
  ${absoluteImage ? `<meta property="og:image:type" content="image/jpeg">` : ""}
  ${absoluteImage ? `<meta property="og:image:width" content="1200">` : ""}
  ${absoluteImage ? `<meta property="og:image:height" content="630">` : ""}
  ${absoluteImage ? `<meta property="og:image:alt" content="${escape(title)}">` : ""}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${absoluteImage ? "summary_large_image" : "summary"}">
  <meta name="twitter:url" content="${escape(url)}">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  ${absoluteImage ? `<meta name="twitter:image" content="${escape(absoluteImage)}">` : ""}
  
  <!-- Redirect -->
  <meta http-equiv="refresh" content="0;url=${escape(originalUrl)}">
  <link rel="canonical" href="${escape(url)}">
  
  <script>
    window.location.replace("${escapeJs(originalUrl)}");
  </script>
  
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #0E0503 0%, #1a0a05 100%);
      color: #fff;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(209, 115, 3, 0.3);
      border-top-color: #D17303;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p { margin: 0 0 10px; opacity: 0.8; }
    a { color: #D17303; text-decoration: none; word-break: break-all; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Redirecting to</p>
    <a href="${escape(originalUrl)}">${escape(truncateUrl(originalUrl, 50))}</a>
  </div>
</body>
</html>`;
}

function truncateUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
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

interface GeoData {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

// =============================================================================
// GEO DATA EXTRACTION (from Vercel headers)
// =============================================================================

function getGeoData(request: NextRequest): GeoData {
  const latitude = request.headers.get("x-vercel-ip-latitude");
  const longitude = request.headers.get("x-vercel-ip-longitude");

  return {
    country: request.headers.get("x-vercel-ip-country") || undefined,
    city: decodeURIComponent(request.headers.get("x-vercel-ip-city") || "") || undefined,
    region: request.headers.get("x-vercel-ip-country-region") || undefined,
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// =============================================================================
// CLICK TRACKING (fire-and-forget)
// =============================================================================

async function trackClick(
  request: NextRequest,
  linkId: string,
  baseUrl: string
): Promise<void> {
  const geo = getGeoData(request);

  try {
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
  } catch (error) {
    // Fire-and-forget: don't block redirect on tracking failure
    console.error("[Middleware] Track click error:", error);
  }
}

// =============================================================================
// MAIN MIDDLEWARE
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /s/{slug} routes
  if (!pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  // Extract slug from path
  const slug = pathname.slice(3); // Remove "/s/"
  if (!slug || slug.includes("/")) {
    return NextResponse.next();
  }

  try {
    const baseUrl = request.nextUrl.origin;
    let linkData: LinkData | null = null;

    // =========================================================================
    // STEP 1: Check Vercel KV cache (Edge-compatible, ~5ms)
    // =========================================================================
    try {
      linkData = await kv.get<LinkData>(`link:${slug}`);
      if (linkData) {
        console.log(`[Middleware] Cache HIT for slug: ${slug}`);
      }
    } catch (cacheError) {
      console.error("[Middleware] Cache error:", cacheError);
      // Continue to API fallback
    }

    // =========================================================================
    // STEP 2: Cache miss → call Node.js API for database lookup
    // =========================================================================
    if (!linkData) {
      console.log(`[Middleware] Cache MISS for slug: ${slug}, calling API`);
      
      const response = await fetch(
        `${baseUrl}/api/links/resolve?slug=${encodeURIComponent(slug)}`,
        {
          method: "GET",
          headers: {
            "X-Internal-Request": "true",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.redirect(new URL("/404", request.url));
        }
        console.error(`[Middleware] API error: ${response.status}`);
        return NextResponse.redirect(new URL("/404", request.url));
      }

      linkData = await response.json();
    }

    // =========================================================================
    // STEP 3: Validate link exists
    // =========================================================================
    if (!linkData || !linkData.originalUrl) {
      console.log(`[Middleware] Link not found: ${slug}`);
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // =========================================================================
    // STEP 4: Validate link status
    // =========================================================================
    
    // Check if link is active
    if (!linkData.isActive) {
      console.log(`[Middleware] Link disabled: ${slug}`);
      return NextResponse.redirect(new URL("/link-disabled", request.url));
    }

    // Check if link has expired
    if (linkData.expiresAt) {
      const expiryDate = new Date(linkData.expiresAt);
      if (expiryDate < new Date()) {
        console.log(`[Middleware] Link expired: ${slug}`);
        return NextResponse.redirect(new URL("/link-expired", request.url));
      }
    }

    // Check click limit
    if (linkData.clickLimit !== null && linkData.totalClicks >= linkData.clickLimit) {
      console.log(`[Middleware] Link click limit reached: ${slug}`);
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }

    // =========================================================================
    // STEP 5: Bot detection → serve OG HTML for social previews
    // =========================================================================
    const userAgent = request.headers.get("user-agent");
    
    if (isBot(userAgent)) {
      console.log(`[Middleware] Bot detected: ${userAgent?.substring(0, 50)}...`);
      
      const html = generateOgHtml({
        title: linkData.ogTitle || extractDomain(linkData.originalUrl),
        description: linkData.ogDescription || `Visit ${extractDomain(linkData.originalUrl)}`,
        image: linkData.ogImage,
        url: `${baseUrl}/s/${slug}`,
        originalUrl: linkData.originalUrl,
        siteName: "Abreviar",
      });

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    // =========================================================================
    // STEP 6: Human visitor → track click and redirect
    // =========================================================================
    
    // Track click asynchronously (don't await to avoid blocking redirect)
    trackClick(request, linkData.id, baseUrl).catch((err) => {
      console.error("[Middleware] Failed to track click:", err);
    });

    // Redirect to original URL with 307 (preserves HTTP method)
    console.log(`[Middleware] Redirecting ${slug} → ${linkData.originalUrl}`);
    return NextResponse.redirect(linkData.originalUrl, { status: 307 });

  } catch (error) {
    console.error("[Middleware] Unexpected error:", error);
    // On error, let the request pass through to potentially show an error page
    return NextResponse.next();
  }
}

// =============================================================================
// MIDDLEWARE CONFIG
// =============================================================================

export const config = {
  matcher: [
    // Match all /s/{slug} routes
    "/s/:slug*",
  ],
};