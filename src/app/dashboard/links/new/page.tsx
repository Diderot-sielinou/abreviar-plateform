"use client";

/**
 * Create New Link Page
 * 
 * Form for creating short links with custom OG tags.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Link2, Sparkles, Image, Calendar, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";

export default function NewLinkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdLink, setCreatedLink] = useState<{ slug: string; shortUrl: string } | null>(null);

  const [formData, setFormData] = useState({
    originalUrl: "",
    slug: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    expiresAt: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: formData.originalUrl,
          slug: formData.slug || undefined,
          ogTitle: formData.ogTitle || undefined,
          ogDescription: formData.ogDescription || undefined,
          ogImage: formData.ogImage || undefined,
          expiresAt: formData.expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, value]) => {
            fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
          });
          setErrors(fieldErrors);
        } else {
          toast.error(data.error || "Failed to create link");
        }
        return;
      }

      const shortUrl = `${window.location.origin}/s/${data.slug}`;
      setCreatedLink({ slug: data.slug, shortUrl });
      toast.success("Link created successfully!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdLink) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-tangerine/30">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tangerine to-rust flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Link Created!</h2>
                <p className="text-muted-foreground mb-6">Your short link is ready to share.</p>

                <div className="bg-muted rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
                  <code className="text-tangerine font-mono text-lg truncate">
                    {createdLink.shortUrl}
                  </code>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={createdLink.shortUrl} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button onClick={() => { setCreatedLink(null); setFormData({ originalUrl: "", slug: "", ogTitle: "", ogDescription: "", ogImage: "", expiresAt: "" }); }}>
                    Create Another
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/links">View All Links</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/links"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to links
          </Link>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Create New Link</h1>
          <p className="text-muted-foreground mt-1">Shorten a URL and customize how it appears when shared.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-tangerine" />
                Destination URL
              </CardTitle>
              <CardDescription>The original URL you want to shorten.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                name="originalUrl"
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                value={formData.originalUrl}
                onChange={handleChange}
                error={errors.originalUrl}
                required
              />
            </CardContent>
          </Card>

          {/* Custom Slug */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-tangerine" />
                Custom Slug
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
              <CardDescription>Create a memorable short link. Leave empty for auto-generated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground shrink-0">abreviar.io/s/</span>
                <Input
                  name="slug"
                  placeholder="my-custom-link"
                  value={formData.slug}
                  onChange={handleChange}
                  error={errors.slug}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options Toggle */}
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Advanced Options
            </span>
            <Badge variant="outline">{showAdvanced ? "Hide" : "Show"}</Badge>
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <>
              {/* Social Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-tangerine" />
                    Social Preview
                    <Badge variant="secondary">Optional</Badge>
                  </CardTitle>
                  <CardDescription>Customize how your link appears when shared on social media.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      name="ogTitle"
                      placeholder="My awesome page"
                      value={formData.ogTitle}
                      onChange={handleChange}
                      maxLength={70}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.ogTitle.length}/70 characters</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      name="ogDescription"
                      placeholder="A brief description of your content..."
                      value={formData.ogDescription}
                      onChange={handleChange}
                      maxLength={200}
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:border-tangerine placeholder:text-muted-foreground resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.ogDescription.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Image URL</label>
                    <Input
                      name="ogImage"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.ogImage}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Preview */}
                  {(formData.ogTitle || formData.ogDescription || formData.ogImage) && (
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-2 block">Preview</label>
                      <div className="rounded-xl border border-border overflow-hidden bg-card">
                        {formData.ogImage && (
                          <div className="h-40 bg-muted">
                            <img src={formData.ogImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-medium truncate">{formData.ogTitle || "Your Title"}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {formData.ogDescription || "Your description will appear here..."}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">abreviar.io</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-tangerine" />
                    Expiration
                    <Badge variant="secondary">Optional</Badge>
                  </CardTitle>
                  <CardDescription>Set when this link should expire.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    name="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/links">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading || !formData.originalUrl}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Link
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
