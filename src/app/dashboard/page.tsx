/**
 * Dashboard Overview Page
 */

import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { formatCompactNumber, formatRelativeTime } from "@/app/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Link2, MousePointerClick, Globe, TrendingUp, ArrowRight, Plus, ExternalLink, Copy } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const [stats, recentLinks] = await Promise.all([
    getDashboardStats(userId),
    getRecentLinks(userId),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}! Here&apos;s your overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/new">
            <Plus className="w-4 h-4 mr-2" />
            New Link
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Links" value={formatCompactNumber(stats.totalLinks)} icon={Link2} description="All time" />
        <StatCard title="Total Clicks" value={formatCompactNumber(stats.totalClicks)} icon={MousePointerClick} description="All time" />
        <StatCard title="Clicks Today" value={formatCompactNumber(stats.clicksToday)} icon={TrendingUp} trend={stats.clicksTrend} />
        <StatCard title="Countries" value={stats.uniqueCountries.toString()} icon={Globe} description="Unique visitors" />
      </div>

      {/* Recent links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription>Your most recently created short links</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/links">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLinks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {recentLinks.map((link) => (
                <LinkRow key={link.id} link={link} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: number;
}

function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tangerine/20 to-rust/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-tangerine" />
          </div>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? "success" : "destructive"}>
              {trend >= 0 ? "+" : ""}{trend}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-display font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{description || title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface LinkRowProps {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    totalClicks: number;
    isActive: boolean;
    createdAt: Date;
  };
}

function LinkRow({ link }: LinkRowProps) {
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://abreviar.io"}/s/${link.slug}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
        <Link2 className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{link.slug}</p>
          {!link.isActive && <Badge variant="secondary">Disabled</Badge>}
        </div>
        <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
      </div>

      <div className="text-right hidden sm:block">
        <p className="font-medium">{formatCompactNumber(link.totalClicks)}</p>
        <p className="text-sm text-muted-foreground">clicks</p>
      </div>

      <div className="text-right hidden md:block">
        <p className="text-sm text-muted-foreground">{formatRelativeTime(link.createdAt)}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" title="Copy link">
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" asChild title="Open link">
          <Link href={shortUrl} target="_blank">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Link2 className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">No links yet</h3>
      <p className="text-sm text-muted-foreground mb-4">Create your first short link to get started.</p>
      <Button asChild>
        <Link href="/dashboard/links/new">
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Link>
      </Button>
    </div>
  );
}

async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [totalLinks, totalClicks, clicksToday, clicksYesterday, uniqueCountries] = await Promise.all([
    db.link.count({ where: { userId } }),
    db.click.count({ where: { link: { userId } } }),
    db.click.count({ where: { link: { userId }, createdAt: { gte: today } } }),
    db.click.count({
      where: { link: { userId }, createdAt: { gte: yesterday, lt: today } },
    }),
    db.click.groupBy({
      by: ["country"],
      where: { link: { userId }, country: { not: null } },
    }),
  ]);

  const clicksTrend =
    clicksYesterday === 0
      ? clicksToday > 0 ? 100 : 0
      : Math.round(((clicksToday - clicksYesterday) / clicksYesterday) * 100);

  return {
    totalLinks,
    totalClicks,
    clicksToday,
    clicksTrend,
    uniqueCountries: uniqueCountries.length,
  };
}

async function getRecentLinks(userId: string) {
  return db.link.findMany({
    where: { userId },
    select: {
      id: true,
      slug: true,
      originalUrl: true,
      totalClicks: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}
