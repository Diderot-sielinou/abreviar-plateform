/**
 * Landing Page
 * 
 * Marketing homepage for Abreviar.
 */

import Link from "next/link";
import {
  Link2,
  BarChart3,
  QrCode,
  Sparkles,
  Zap,
  Shield,
  Github,
  ArrowRight,
  Check,
  Globe,
  MousePointer,
} from "lucide-react";
import { Button } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-tangerine/20 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-rust/20 rounded-full blur-3xl" />

      <div className="relative">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-tangerine to-rust">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold">Abreviar</span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="https://github.com/yourusername/abreviar" target="_blank" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Github className="h-4 w-4" />
                  GitHub
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signin">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-tangerine/30 bg-tangerine/10 px-4 py-1.5 text-sm text-tangerine">
                <Sparkles className="h-4 w-4" />
                <span>100% Free & Open Source</span>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Shorten links.
                <br />
                <span className="text-gradient">Amplify reach.</span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Create short links with custom social previews, track every click with detailed analytics, and generate QR codes — all for free.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="glow" asChild>
                  <Link href="/auth/signin">
                    Start Shortening — It&apos;s Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="https://github.com/yourusername/abreviar" target="_blank">
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Link>
                </Button>
              </div>

              <div className="mt-16 mx-auto max-w-xl">
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-tangerine/10">
                    <div className="flex-1 flex items-center gap-3 px-4">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Paste your long URL here..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        disabled
                      />
                    </div>
                    <Button size="lg" disabled>
                      Shorten
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Sign in to start creating short links
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Everything you need to <span className="text-gradient">manage links</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Professional features that competitors charge for — completely free.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Link2, title: "Custom Short Links", description: "Create memorable links with custom slugs. Use your own words instead of random characters." },
                { icon: Sparkles, title: "Custom OG Tags", description: "Override social previews with your own title, description, and image. Stand out on every platform." },
                { icon: BarChart3, title: "Detailed Analytics", description: "Track clicks, countries, devices, browsers, and referrers. Know exactly how your links perform." },
                { icon: QrCode, title: "Dynamic QR Codes", description: "Auto-generated QR codes for every link. Change the destination without reprinting." },
                { icon: Zap, title: "Lightning Fast", description: "Edge-powered redirects under 50ms. Your audience won't notice the redirect." },
                { icon: Shield, title: "Privacy First", description: "No IP tracking, no cookies for visitors. GDPR-friendly by design." },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-tangerine/50 hover:shadow-lg hover:shadow-tangerine/5"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tangerine/20 to-rust/20 text-tangerine">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: "50ms", label: "Redirect latency", icon: Zap },
                { value: "∞", label: "Links per user", icon: Link2 },
                { value: "90+", label: "Countries tracked", icon: Globe },
                { value: "$0", label: "Forever", icon: Sparkles },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-3">
                    <stat.icon className="h-6 w-6 text-tangerine" />
                  </div>
                  <div className="font-display text-3xl font-bold text-gradient md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                How it <span className="text-gradient">works</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Create your first short link in under 30 seconds
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                { step: "01", title: "Paste your URL", description: "Enter any long URL you want to shorten", icon: Link2 },
                { step: "02", title: "Customize", description: "Add custom slug, OG tags, and expiration", icon: Sparkles },
                { step: "03", title: "Share", description: "Copy your short link or QR code and share", icon: MousePointer },
                { step: "04", title: "Track", description: "Watch real-time analytics as clicks come in", icon: BarChart3 },
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-tangerine/50 to-transparent" />
                  )}
                  <div className="text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tangerine to-rust text-white font-display text-xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Simple pricing: <span className="text-gradient">Free forever</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                No credit card required. No hidden fees. No catch.
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <div className="relative rounded-3xl border border-tangerine/30 bg-card p-8 shadow-2xl shadow-tangerine/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-tangerine to-rust px-4 py-1 text-sm font-medium text-white">
                    Open Source
                  </div>
                </div>

                <div className="text-center mb-8 pt-4">
                  <div className="font-display text-6xl font-bold">$0</div>
                  <div className="text-muted-foreground">per month, forever</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited short links",
                    "Custom slugs",
                    "Custom OG tags",
                    "Detailed analytics",
                    "QR code generation",
                    "90-day data retention",
                    "API access (coming soon)",
                    "No ads, ever",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-tangerine/20">
                        <Check className="h-3 w-3 text-tangerine" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg" variant="glow" asChild>
                  <Link href="/auth/signin">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl bg-gradient-to-br from-obsidian-100 to-obsidian-200 p-8 md:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-tangerine/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-rust/10 rounded-full blur-3xl" />

              <div className="relative text-center">
                <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl mb-6">
                  Ready to shorten your first link?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of creators and marketers who trust Abreviar for their link management needs.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="xl" variant="glow" asChild>
                    <Link href="/auth/signin">
                      Create Free Account
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                    <Link href="https://github.com/yourusername/abreviar" target="_blank">
                      <Github className="h-5 w-5" />
                      Star on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-tangerine to-rust">
                  <Link2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold">Abreviar</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="https://github.com/yourusername/abreviar" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link>
              </div>

              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Abreviar. Open source under MIT.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
