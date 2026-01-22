

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Link2,
  Sparkles,
  Image,
  Calendar,
  Loader2,
  Save,
  Trash2,
  Power,
  PowerOff,
  Hash,
} from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface LinkData {
  id: string;
  slug: string;
  originalUrl: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  isActive: boolean;
  expiresAt: string | null;
  clickLimit: number | null;
  totalClicks: number;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditLinkPage({ params }: PageProps) {
  const { id: linkId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [link, setLink] = useState<LinkData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    originalUrl: "",
    slug: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    expiresAt: "",
    clickLimit: "",
    isActive: true,
  });

  // Charger les données du lien
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/links/${linkId}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Link not found");
            router.push("/dashboard/links");
            return;
          }
          throw new Error("Failed to fetch link");
        }

        const data: LinkData = await res.json();
        setLink(data);

        // Formater la date pour datetime-local input
        let formattedExpiry = "";
        if (data.expiresAt) {
          const date = new Date(data.expiresAt);
          // Format: YYYY-MM-DDTHH:MM
          formattedExpiry = date.toISOString().slice(0, 16);
        }

        setFormData({
          originalUrl: data.originalUrl,
          slug: data.slug,
          ogTitle: data.ogTitle || "",
          ogDescription: data.ogDescription || "",
          ogImage: data.ogImage || "",
          expiresAt: formattedExpiry,
          clickLimit: data.clickLimit?.toString() || "",
          isActive: data.isActive,
        });
      } catch (error) {
        toast.error("Failed to load link");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [linkId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      // Préparer les données - envoyer null pour les champs vides
      const payload: Record<string, unknown> = {
        originalUrl: formData.originalUrl,
        isActive: formData.isActive,
      };

      // Slug - seulement si modifié
      if (formData.slug && formData.slug !== link?.slug) {
        payload.slug = formData.slug;
      }

      // OG fields - envoyer null si vide pour effacer
      payload.ogTitle = formData.ogTitle.trim() || null;
      payload.ogDescription = formData.ogDescription.trim() || null;
      payload.ogImage = formData.ogImage.trim() || null;

      // Date d'expiration
      if (formData.expiresAt) {
        // Convertir en ISO string
        const date = new Date(formData.expiresAt);
        payload.expiresAt = date.toISOString();
      } else {
        payload.expiresAt = null;
      }

      // Click limit
      if (formData.clickLimit && formData.clickLimit.trim() !== "") {
        const limit = parseInt(formData.clickLimit, 10);
        if (!isNaN(limit) && limit > 0) {
          payload.clickLimit = limit;
        } else {
          payload.clickLimit = null;
        }
      } else {
        payload.clickLimit = null;
      }

      console.log("[Edit] Sending payload:", payload);

      const res = await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Edit] Error response:", data);
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, value]) => {
            fieldErrors[key] = Array.isArray(value) ? value[0] : String(value);
          });
          setErrors(fieldErrors);
          toast.error("Please fix the errors below");
        } else {
          toast.error(data.error || "Failed to update link");
        }
        return;
      }

      toast.success("Link updated successfully!");
      router.push("/dashboard/links");
      router.refresh();
    } catch (error) {
      console.error("[Edit] Exception:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = !formData.isActive;
    setFormData((prev) => ({ ...prev, isActive: newStatus }));

    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (res.ok) {
        toast.success(newStatus ? "Link enabled" : "Link disabled");
        if (link) {
          setLink({ ...link, isActive: newStatus });
        }
      } else {
        setFormData((prev) => ({ ...prev, isActive: !newStatus }));
        toast.error("Failed to update status");
      }
    } catch (error) {
      setFormData((prev) => ({ ...prev, isActive: !newStatus }));
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Link deleted successfully");
        setShowDeleteDialog(false);
        router.push("/dashboard/links");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete link");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-tangerine" />
      </div>
    );
  }

  if (!link) {
    return null;
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://abreviar.io"}/s/${formData.slug}`;

  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/links"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to links
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-bold">Edit Link</h1>
                <p className="text-muted-foreground mt-1">Update your short link settings.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? "Active" : "Disabled"}
                </Badge>
                <span className="text-sm text-muted-foreground">{link.totalClicks} clicks</span>
              </div>
            </div>
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
                <CardDescription>The original URL your short link redirects to.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  name="originalUrl"
                  type="url"
                  placeholder="https://example.com/your-url"
                  value={formData.originalUrl}
                  onChange={handleChange}
                  error={errors.originalUrl}
                  required
                />
                {errors.originalUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.originalUrl}</p>
                )}
              </CardContent>
            </Card>

            {/* Custom Slug */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-tangerine" />
                  Short URL
                </CardTitle>
                <CardDescription>Your custom short link slug.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground shrink-0 text-sm">abreviar.io/s/</span>
                  <Input
                    name="slug"
                    placeholder="my-custom-link"
                    value={formData.slug}
                    onChange={handleChange}
                    error={errors.slug}
                  />
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Preview: <code className="text-tangerine">{shortUrl}</code>
                </p>
              </CardContent>
            </Card>

            {/* Social Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-tangerine" />
                  Social Preview
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.ogDescription.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Image</label>
                  <ImageUpload
                    value={formData.ogImage}
                    onChange={(url) => setFormData((prev) => ({ ...prev, ogImage: url }))}
                  />
                </div>

                {/* Preview */}
                {(formData.ogTitle || formData.ogDescription || formData.ogImage) && (
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Preview</label>
                    <div className="rounded-xl border border-border overflow-hidden bg-card">
                      {formData.ogImage && (
                        <div className="h-40 bg-muted">
                          <img
                            src={formData.ogImage}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
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

            {/* Expiration & Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-tangerine" />
                  Expiration & Limits
                </CardTitle>
                <CardDescription>Set when or how this link should expire.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Expiration Date</label>
                  <Input
                    name="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for no expiration
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Click Limit
                  </label>
                  <Input
                    name="clickLimit"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.clickLimit}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {link.totalClicks} clicks
                    {formData.clickLimit && parseInt(formData.clickLimit) > 0 && (
                      <span> / {formData.clickLimit} limit</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border">
              {/* Left side - danger actions */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleActive}
                  className={!formData.isActive ? "border-green-500/50 text-green-500 hover:bg-green-500/10" : ""}
                >
                  {formData.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Enable
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Right side - save actions */}
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/links">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Link"
        description={`Are you sure you want to delete "${link.slug}"? This action cannot be undone. All analytics data for this link will also be deleted.`}
        confirmText="Delete Link"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}