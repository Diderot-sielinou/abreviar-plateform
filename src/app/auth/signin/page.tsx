/**
 * Sign In Page
 * 
 * OAuth authentication with GitHub and Google.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/app/lib/auth";
import { Button } from "@/components/ui";
import { Link2, Github } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-obsidian via-mahogany/20 to-obsidian relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tangerine/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rust/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tangerine to-rust flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-3xl font-bold">Abreviar</span>
          </div>

          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Shorten Links,
            <br />
            <span className="text-gradient">Amplify Results</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md">
            Create beautiful short links with custom social previews, detailed analytics, and QR codes. 100% free and open source.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Custom OG tags for social media",
              "Detailed click analytics",
              "QR code generation",
              "No limits, forever free",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-tangerine" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tangerine to-rust flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Abreviar</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button type="submit" variant="outline" size="lg" className="w-full">
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button type="submit" variant="outline" size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Secure authentication</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
