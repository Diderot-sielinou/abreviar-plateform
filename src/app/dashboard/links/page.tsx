import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { formatCompactNumber, formatRelativeTime } from "@/app/lib/utils";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { Link2, Plus, Search, ExternalLink, BarChart3 } from "lucide-react";
import { LinkActions } from "./link-actions";

export default async function LinksPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const links = await db.link.findMany({
    where: { userId },
    select: {
      id: true,
      slug: true,
      originalUrl: true,
      ogTitle: true,
      ogImage: true,
      totalClicks: true,
      isActive: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">Links</h1>
          <p className="mt-1 text-muted-foreground">Manage all your short links in one place.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/new">
            <Plus className="mr-2 h-4 w-4" />
            New Link
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search links..." className="pl-10" />
        </div>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LinkCardProps {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    ogTitle: string | null;
    ogImage: string | null;
    totalClicks: number;
    isActive: boolean;
    expiresAt: Date | null;
    createdAt: Date;
  };
}

function LinkCard({ link }: LinkCardProps) {
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://abreviar.io"}/s/${link.slug}`;
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <Card hover className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {link.ogImage && (
            <div className="h-32 shrink-0 bg-muted lg:h-auto lg:w-48">
              <img src={link.ogImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex-1 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Link
                    href={shortUrl}
                    target="_blank"
                    className="truncate font-medium text-tangerine hover:underline"
                  >
                    {shortUrl.replace("https://", "")}
                  </Link>
                  <Button variant="ghost" size="icon-sm" asChild title="Open">
                    <Link href={shortUrl} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <p className="mb-3 truncate text-sm text-muted-foreground">{link.originalUrl}</p>

                <div className="flex flex-wrap items-center gap-2">
                  {!link.isActive && <Badge variant="secondary">Disabled</Badge>}
                  {isExpired && <Badge variant="destructive">Expired</Badge>}
                  {link.ogTitle && <Badge variant="outline">Custom OG</Badge>}
                  <span className="text-xs text-muted-foreground">
                    Created {formatRelativeTime(link.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold">
                    {formatCompactNumber(link.totalClicks)}
                  </p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/analytics?link=${link.id}`}>
                      <BarChart3 className="mr-1 h-4 w-4" />
                      Stats
                    </Link>
                  </Button>
                  {/* Client component avec toutes les actions */}
                  <LinkActions
                    shortUrl={shortUrl}
                    slug={link.slug}
                    linkId={link.id}
                    isActive={link.isActive}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-tangerine/20 to-rust/20">
            <Link2 className="h-10 w-10 text-tangerine" />
          </div>
          <h3 className="mb-2 font-display text-xl font-semibold">No links yet</h3>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            Create your first short link to start tracking clicks and managing your URLs.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/links/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Link
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
