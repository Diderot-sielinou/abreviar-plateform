# Abreviar — Free, Open-Source URL Shortener with Analytics

**Role:** Fullstack Developer
**Type:** Fullstack Web Application
**Live Demo:** [abreviar-plateform.vercel.app](https://abreviar-plateform.vercel.app)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Diderot-sielinou/abreviar-plateform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Problem Statement

**Who has the problem?**
Developers, marketers, content creators, and social media managers who regularly share long, unreadable URLs — in bios, campaigns, presentations, or printed materials — where link length, appearance, and performance all matter.

**Why it matters?**
Long URLs are visually unappealing, break formatting in plain-text environments, and give no feedback on whether anyone actually clicked. Existing commercial solutions like Bitly lock real analytics behind paid plans, and none offer control over how links appear when shared on social media (OG tags).

**Why this solution exists?**
Abreviar is a self-hosted, open-source alternative that provides custom slugs, full click analytics (countries, devices, browsers, referrers), QR code generation, and custom social preview tags — completely free, with no usage limits and no vendor lock-in.

---

## Project Goals

- Allow users to shorten any URL with a custom or auto-generated slug
- Override social media previews (OG title, description, image) per link
- Track clicks with geographic, device, and referrer breakdown
- Auto-generate a QR code for every shortened link
- Deliver redirects in under 50ms using edge functions
- Provide a clean, responsive dashboard for link management
- Keep the platform 100% free and open-source under MIT license

---

## Tech Stack

| Layer           | Technology                        |
|-----------------|-----------------------------------|
| Framework       | Next.js 15 (App Router)           |
| Language        | TypeScript                        |
| Styling         | Tailwind CSS                      |
| Database        | PostgreSQL (Neon — serverless)    |
| ORM             | Prisma                            |
| Cache           | Redis (Vercel KV / Upstash)       |
| Authentication  | NextAuth.js v5 (GitHub + Google)  |
| Hosting         | Vercel (Edge Functions)           |
| Validation      | Zod                               |

---

## Technical Architecture

**Frontend (Next.js App Router)**
The UI is built with Next.js 15 using the App Router. Server Components handle data fetching directly from the database where possible, reducing client-side JavaScript. Client Components are used for interactive elements (link creation form, dashboard tables, QR code display). Tailwind CSS with a custom warm color palette handles all styling.

**Backend (Next.js API Routes + Edge Middleware)**
API routes handle link creation, analytics ingestion, and authentication. The redirect logic lives in Edge Middleware (`middleware.ts`), which intercepts requests to `/s/[slug]`, checks the Redis cache first, falls back to PostgreSQL, and issues the redirect — achieving sub-50ms latency at the edge without a cold-start penalty.

**Database (PostgreSQL + Prisma)**
Neon's serverless PostgreSQL stores users, links, and analytics events. Prisma manages the schema and provides type-safe queries throughout the application. The schema separates link metadata from analytics events to allow efficient aggregation queries.

**Caching (Redis)**
Every slug lookup is cached in Redis with a 24-hour TTL after the first database hit. This achieves a ~95% cache hit rate and removes the database from the critical path for the majority of redirects.

---

## Features

- **Custom Short Links:** Create memorable slugs (e.g., `/s/my-launch`) instead of random strings
- **Custom OG Tags:** Override the title, description, and preview image that appear when a link is shared on Twitter, LinkedIn, or WhatsApp
- **Detailed Analytics:** Track click count, originating country (90+ countries), device type, browser, and referrer per link
- **QR Code Generation:** Every link automatically receives a downloadable QR code — update the destination without reprinting
- **Edge-Powered Redirects:** Redirects resolve in under 50ms p99 using Vercel Edge Functions and Redis caching
- **Authentication:** OAuth login via GitHub and Google using NextAuth.js v5. Session management with secure HTTP-only cookies
- **Privacy First:** No IP address storage, no visitor-side cookies — GDPR-friendly by design
- **Input Validation:** All form inputs and API payloads are validated with Zod schemas before any database operation
- **Error Handling:** Structured JSON error responses with appropriate HTTP status codes across all API routes
- **Responsive Design:** The dashboard and landing page adapt from 320px mobile to 1440px desktop without a CSS framework dependency beyond Tailwind utilities

---

## Screenshots

<img width="1747" height="940" alt="Screenshot from 2026-03-02 12-31-08" src="https://github.com/user-attachments/assets/084efd1a-bc34-4c0a-8d9e-a2a4a036a7ee" />

---

## Live Demo

**[abreviar-plateform.vercel.app](https://abreviar-plateform.vercel.app)**

Sign in with GitHub or Google to create your first short link.

---

## Project Structure

```
abreviar/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes (links, analytics, auth)
│   │   ├── auth/              # Sign-in page
│   │   ├── dashboard/         # Authenticated dashboard
│   │   ├── s/[slug]/          # Redirect route (handled by middleware)
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── cache.ts           # Redis utilities
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── slug.ts            # Slug generation logic
│   │   ├── utils.ts           # Helper functions
│   │   └── validations.ts     # Zod schemas
│   ├── middleware.ts           # Edge redirect logic
│   └── types/
├── .env.example
├── package.json
└── tailwind.config.ts
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database — [Neon](https://neon.tech) recommended (free tier available)
- Redis — [Upstash](https://upstash.com) or Vercel KV recommended
- GitHub OAuth app and/or Google OAuth credentials

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Diderot-sielinou/abreviar-plateform.git
cd abreviar-plateform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in all values — see Environment Variables section below

# 4. Generate Prisma client
npm run db:generate

# 5. Push database schema
npm run db:push

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Redis (Upstash or Vercel KV)
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Auth
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"
```

### OAuth Setup

**GitHub:** Go to [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App → set callback URL to `http://localhost:3000/api/auth/callback/github`

**Google:** Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth 2.0 credentials → add redirect URI `http://localhost:3000/api/auth/callback/google`

---

## Deployment (Vercel)

1. Click the **Deploy with Vercel** button at the top of this README
2. Connect your GitHub repository
3. Add all environment variables in the Vercel dashboard
4. Deploy — edge functions and Redis caching are configured automatically

---

## Performance

| Metric             | Value          |
|--------------------|----------------|
| Redirect latency   | < 50ms p99     |
| Cache hit rate     | ~95% (24h TTL) |
| JS bundle size     | < 100kb gzipped|
| Countries tracked  | 90+            |

---

## Challenges Faced

**Frontend Challenge — OG Tag Preview Before Saving**
Users expect to see how their link will look on social media before creating it. Implementing a live social preview component that updates as the user types the OG title, description, and image URL — without any external API call — required building a purely client-side preview card that mirrors the exact layout used by Twitter and LinkedIn cards. The tricky part was handling image load failures gracefully (broken image URLs) while keeping the preview useful.

**Backend Challenge — Edge Middleware and Database Access**
Edge Functions in Next.js run in a limited V8 isolate environment that does not support Node.js native modules. Prisma requires a Node.js runtime, so it cannot run directly in `middleware.ts`. I solved this by having the middleware query only Redis for the cached destination URL, and falling back to a standard API route (which runs in the Node.js runtime) on a cache miss — keeping the fast path at the edge while preserving full database access in the fallback.

**Debugging Experience — Redis Cache Returning Stale Destinations**
After adding the ability to edit a link's destination URL, I noticed that users were still being redirected to the old URL for up to 24 hours. The cache invalidation call was present in the update function, but it was using the wrong key format — it was constructed with the full URL path while the cache had been set with only the slug. A `console.log` on the key construction in both the set and delete operations revealed the mismatch immediately. The fix was centralizing key construction into a single `getCacheKey(slug)` utility function used everywhere.

---

## What I Learned

**Technical lesson:** Edge Functions are powerful but constrained. Understanding the difference between the Edge runtime (fast, global, limited APIs) and the Node.js runtime (full Node APIs, slightly slower cold start) — and designing the architecture to use each where it fits — was the most valuable architectural decision in this project.

**Workflow lesson:** Deploying to Vercel early (on day one, even with a blank page) and iterating with real environment variables caught infrastructure issues — Redis connection strings, OAuth callback mismatches, database connection pooling limits — long before they could block feature work.

**Code organization lesson:** Centralizing all external service clients (Prisma, Redis, NextAuth) as singletons in `src/lib/` and never instantiating them elsewhere prevented connection pool exhaustion in development and made swapping providers (e.g., from Vercel KV to Upstash) a one-file change.

---

## Future Improvements

- API access with personal tokens so developers can create links programmatically
- Link expiration dates with automatic deactivation
- Team workspaces for shared link management across an organization
- Geographic click heatmap visualization in the analytics dashboard
- Branded domains — allow users to use their own domain instead of the default short domain
- Bulk link import via CSV upload
- Webhook events on click milestones (e.g., first 100 clicks)

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](CONTRIBUTING.md) before opening a pull request.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request against main
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Design System

| Name       | Hex       | Usage              |
|------------|-----------|--------------------|
| Obsidian   | `#0E0503` | Background         |
| Mahogany   | `#7C3805` | Secondary elements |
| Tangerine  | `#D17303` | Primary / Accent   |
| Amber      | `#E19547` | Highlights         |
| Rust       | `#9B4F06` | Gradients          |
