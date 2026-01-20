/**
 * Root Layout
 */

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Abreviar - Free URL Shortener with Analytics",
    template: "%s | Abreviar",
  },
  description:
    "Free, open-source URL shortener with custom OG tags, detailed analytics, and QR codes. No limits, no fees.",
  keywords: ["url shortener", "link shortener", "short links", "analytics", "qr codes", "open source"],
  authors: [{ name: "Yvan" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abreviar.io",
    siteName: "Abreviar",
    title: "Abreviar - Free URL Shortener with Analytics",
    description: "Free, open-source URL shortener with custom OG tags, detailed analytics, and QR codes.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Abreviar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abreviar - Free URL Shortener",
    description: "Free, open-source URL shortener with analytics.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0503" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </body>
    </html>
  );
}
