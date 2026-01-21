/**
 * Application Constants
 * 
 * Centralized configuration values and limits.
 */

// =============================================================================
// RESERVED SLUGS
// =============================================================================

/**
 * Slugs that cannot be used for short links
 */
export const RESERVED_SLUGS = new Set([
  // App routes
  "api",
  "auth",
  "dashboard",
  "admin",
  "login",
  "logout",
  "signup",
  "signin",
  "signout",
  "register",
  "links",
  "analytics",
  "settings",
  "account",
  "profile",
  "billing",
  
  // Marketing pages
  "about",
  "pricing",
  "terms",
  "privacy",
  "help",
  "support",
  "contact",
  "blog",
  "docs",
  "faq",
  
  // Features
  "bio",
  "qr",
  "s",
  
  // Static
  "static",
  "assets",
  "images",
  "public",
  "_next",
  
  // Common
  "www",
  "mail",
  "email",
  "app",
]);

// =============================================================================
// SLUG CONFIGURATION
// =============================================================================

export const SLUG_CONFIG = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  PATTERN: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
  ALPHABET: "23456789abcdefghjkmnpqrstuvwxyz", // No confusing chars (0, 1, l, o, i)
  DEFAULT_LENGTH: 7,
} as const;

// =============================================================================
// RATE LIMITS BY PLAN
// =============================================================================

export const RATE_LIMITS = {
  FREE: {
    linksPerDay: 10,
    totalLinks: 100,
    clicksPerMonth: 10_000,
    analyticsRetention: 30, // days
  },
  PRO: {
    linksPerDay: 100,
    totalLinks: 1_000,
    clicksPerMonth: 100_000,
    analyticsRetention: 90,
  },
  ENTERPRISE: {
    linksPerDay: Infinity,
    totalLinks: Infinity,
    clicksPerMonth: Infinity,
    analyticsRetention: 365,
  },
} as const;

// =============================================================================
// OG TAG CONFIGURATION
// =============================================================================

export const OG_CONFIG = {
  TITLE_MAX_LENGTH: 70,
  DESCRIPTION_MAX_LENGTH: 200,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_FORMATS: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

// =============================================================================
// BOT USER AGENTS
// =============================================================================

export const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "TelegramBot",
  "Slackbot",
  "Discordbot",
  "Pinterest",
  "Googlebot",
  "Bingbot",
  "bot",
  "crawler",
  "spider",
];

// =============================================================================
// NAVIGATION
// =============================================================================

export const DASHBOARD_NAV = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Links", href: "/dashboard/links", icon: "Link2" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;

export const MARKETING_NAV = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "GitHub", href: "https://github.com/yourusername/abreviar", external: true },
] as const;
