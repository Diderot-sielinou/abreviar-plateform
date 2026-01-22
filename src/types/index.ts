/**
 * TypeScript Type Definitions
 */

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// =============================================================================
// LINK TYPES
// =============================================================================

export interface Link {
  id: string;
  userId: string;
  slug: string;
  originalUrl: string;
  isActive: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  iosUrl: string | null;
  androidUrl: string | null;
  password: string | null;
  expiresAt: Date | null;
  clickLimit: number | null;
  totalClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkWithStats extends Link {
  clicksToday: number;
  clicksThisWeek: number;
}

export interface LinkListItem {
  id: string;
  slug: string;
  originalUrl: string;
  isActive: boolean;
  ogTitle: string | null;
  ogImage: string | null;
  totalClicks: number;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CreateLinkInput {
  originalUrl: string;
  slug?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  expiresAt?: string;
  clickLimit?: number;
}

export interface UpdateLinkInput {
  originalUrl?: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  isActive?: boolean;
  expiresAt?: string | null;
  clickLimit?: number | null;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface AnalyticsData {
  period: string;
  totalClicks: number;
  timeSeries: TimeSeriesPoint[];
  countries: GeoData[];
  devices: DeviceData[];
  browsers: BrowserData[];
  referrers: ReferrerData[];
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface GeoData {
  country: string | null;
  clicks: number;
}

export interface DeviceData {
  device: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  clicks: number;
}

export interface BrowserData {
  browser: string | null;
  clicks: number;
}

export interface ReferrerData {
  domain: string | null;
  clicks: number;
}

export interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  clicksTrend: number;
  uniqueCountries: number;
}

// =============================================================================
// USER TYPES
// =============================================================================

export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan: Plan;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FormState<T = unknown> {
  data: T;
  errors: FieldErrors;
  isLoading: boolean;
  isValid: boolean;
}

export type FieldErrors = Record<string, string>;

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type WithClassName = {
  className?: string;
};

export type WithChildren = {
  children: React.ReactNode;
};

export type Awaited<T> = T extends Promise<infer U> ? U : T;
