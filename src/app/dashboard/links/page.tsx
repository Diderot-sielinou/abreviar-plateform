/**
 * Links List Page
 */

import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { formatCompactNumber, formatRelativeTime } from "@/app/lib/utils";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { Link2, Plus, Search, ExternalLink, Copy, BarChart3, QrCode, MoreHorizontal } from "lucide-react";

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
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Links</h1>
          <p className="text-muted-foreground mt-1">Manage all your short links in one place.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/new">
            <Plus className="w-4 h-4 mr-2" />
            New Link
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
            <div className="lg:w-48 h-32 lg:h-auto bg-muted shrink-0">
              <img src={link.ogImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={shortUrl}
                    target="_blank"
                    className="font-medium text-tangerine hover:underline truncate"
                  >
                    {shortUrl.replace("https://", "")}
                  </Link>
                  <Button variant="ghost" size="icon-sm" title="Copy">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild title="Open">
                    <Link href={shortUrl} target="_blank">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground truncate mb-3">{link.originalUrl}</p>

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
                  <p className="text-2xl font-display font-bold">{formatCompactNumber(link.totalClicks)}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/analytics?link=${link.id}`}>
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Stats
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-1" />
                    QR
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tangerine/20 to-rust/20 flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-10 h-10 text-tangerine" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No links yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first short link to start tracking clicks and managing your URLs.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/links/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Link
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
