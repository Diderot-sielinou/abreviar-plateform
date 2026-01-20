# 🔗 Abreviar

**Free, open-source URL shortener with custom OG tags, detailed analytics, and QR codes.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/abreviar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Custom Short Links** - Create memorable slugs like `/s/my-launch`
- **Custom OG Tags** - Override social previews with your own title, description, and image
- **Detailed Analytics** - Track clicks, countries, devices, browsers, and referrers
- **QR Code Generation** - Auto-generated QR codes for every link
- **Lightning Fast** - Edge-powered redirects under 50ms
- **Privacy First** - No IP tracking, no cookies for visitors
- **100% Free** - No limits, no fees, forever

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Cache** | Redis (Vercel KV) |
| **Auth** | NextAuth.js v5 |
| **Hosting** | Vercel (Edge Functions) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (recommend [Neon](https://neon.tech))
- Redis (recommend [Vercel KV](https://vercel.com/storage/kv) or [Upstash](https://upstash.com))
- GitHub and/or Google OAuth app

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/abreviar.git
cd abreviar

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
# See Configuration section below

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## ⚙️ Configuration

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Redis (Vercel KV)
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"
```

### OAuth Setup

#### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

---

## 📁 Project Structure

```
abreviar/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── auth/           # Auth pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── s/[slug]/       # Redirect route
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   └── ui/             # UI components
│   ├── lib/
│   │   ├── auth.ts         # NextAuth config
│   │   ├── cache.ts        # Redis utilities
│   │   ├── constants.ts    # App constants
│   │   ├── db.ts           # Prisma client
│   │   ├── slug.ts         # Slug generation
│   │   ├── utils.ts        # Helper functions
│   │   └── validations.ts  # Zod schemas
│   ├── middleware.ts       # Edge middleware
│   └── types/              # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Design System

Abreviar uses a **LaunchLayer-inspired** warm color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| **Obsidian** | `#0E0503` | Background |
| **Mahogany** | `#7C3805` | Secondary |
| **Tangerine** | `#D17303` | Primary/Accent |
| **Amber** | `#E19547` | Highlights |
| **Rust** | `#9B4F06` | Gradients |

---

## 📊 Performance

- **Edge Redirects**: < 50ms p99 latency
- **Cache Hit Rate**: ~95% (24h TTL)
- **Bundle Size**: < 100kb gzipped

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Prisma](https://prisma.io) - Next-generation ORM
- [Vercel](https://vercel.com) - Hosting platform
- [Neon](https://neon.tech) - Serverless Postgres
- [shadcn/ui](https://ui.shadcn.com) - UI component inspiration

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Yvan</a>
</p>
