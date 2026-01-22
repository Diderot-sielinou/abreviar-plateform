/**
 * Analytics Dashboard Page
 */

import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { formatCompactNumber } from "@/app/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";
import { BarChart3, Globe, Smartphone, Monitor, Tablet, MousePointerClick, TrendingUp, ExternalLink } from "lucide-react";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

interface Props {
  searchParams: Promise<{ period?: string; link?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const params = await searchParams;
  const period = params.period || "7d";
  const linkId = params.link;

  const data = await getAnalyticsData(userId, period, linkId);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track performance across all your links.</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "90d"].map((p) => (
            <Badge
              key={p}
              variant={period === p ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20"
            >
              {p === "24h" ? "24 hours" : p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clicks"
          value={formatCompactNumber(data.totalClicks)}
          icon={MousePointerClick}
          description={`Last ${period}`}
        />
        <StatCard
          title="Countries"
          value={data.countries.length.toString()}
          icon={Globe}
          description="Unique locations"
        />
        <StatCard
          title="Top Device"
          value={data.topDevice || "N/A"}
          icon={data.topDevice === "MOBILE" ? Smartphone : data.topDevice === "TABLET" ? Tablet : Monitor}
          description="Most used"
        />
        <StatCard
          title="Top Referrer"
          value={data.topReferrer || "Direct"}
          icon={ExternalLink}
          description="Traffic source"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Click Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-tangerine" />
              Click Trends
            </CardTitle>
            <CardDescription>Daily clicks over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {data.timeSeries.map((point, i) => {
                const maxClicks = Math.max(...data.timeSeries.map((p) => p.clicks), 1);
                const height = (point.clicks / maxClicks) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-tangerine to-amber rounded-t transition-all hover:opacity-80"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${point.date}: ${point.clicks} clicks`}
                    />
                    {data.timeSeries.length <= 14 && (
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(point.date), "dd")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-tangerine" />
              Top Countries
            </CardTitle>
            <CardDescription>Where your clicks come from</CardDescription>
          </CardHeader>
          <CardContent>
            {data.countries.length === 0 ? (
              <EmptyState message="No geographic data yet" />
            ) : (
              <div className="space-y-4">
                {data.countries.slice(0, 8).map((country, i) => {
                  const maxClicks = data.countries[0]?.clicks || 1;
                  const percentage = (country.clicks / maxClicks) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(country.country)}</span>
                          {getCountryName(country.country)}
                        </span>
                        <span className="font-medium">{formatCompactNumber(country.clicks)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-tangerine to-rust rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {data.devices.length === 0 ? (
              <EmptyState message="No device data yet" />
            ) : (
              <div className="space-y-4">
                {data.devices.map((device, i) => {
                  const Icon = device.device === "MOBILE" ? Smartphone : device.device === "TABLET" ? Tablet : Monitor;
                  const total = data.devices.reduce((acc, d) => acc + d.clicks, 0) || 1;
                  const percentage = Math.round((device.clicks / total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {device.device.charAt(0) + device.device.slice(1).toLowerCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{percentage}%</span>
                        <span className="text-xs text-muted-foreground">({formatCompactNumber(device.clicks)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.browsers.length === 0 ? (
              <EmptyState message="No browser data yet" />
            ) : (
              <div className="space-y-4">
                {data.browsers.slice(0, 5).map((browser, i) => {
                  const total = data.browsers.reduce((acc, b) => acc + b.clicks, 0) || 1;
                  const percentage = Math.round((browser.clicks / total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{browser.browser || "Unknown"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{percentage}%</span>
                        <span className="text-xs text-muted-foreground">({formatCompactNumber(browser.clicks)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {data.referrers.length === 0 ? (
              <EmptyState message="No referrer data yet" />
            ) : (
              <div className="space-y-4">
                {data.referrers.slice(0, 5).map((ref, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[150px]">{ref.domain || "Direct"}</span>
                    <span className="text-sm font-medium">{formatCompactNumber(ref.clicks)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tangerine/20 to-rust/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-tangerine" />
          </div>
        </div>
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground text-sm">{message}</div>
  );
}

function getCountryFlag(code: string | null): string {
  if (!code) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getCountryName(code: string | null): string {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

async function getAnalyticsData(userId: string, period: string, linkId?: string) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "24h": startDate = subDays(now, 1); break;
    case "7d": startDate = subDays(now, 7); break;
    case "30d": startDate = subDays(now, 30); break;
    case "90d": startDate = subDays(now, 90); break;
    default: startDate = subDays(now, 7);
  }

  const baseWhere = {
    link: { userId, ...(linkId && { id: linkId }) },
    createdAt: { gte: startOfDay(startDate), lte: endOfDay(now) },
    isBot: false,
  };

  const [totalClicks, clicksByDay, countries, devices, browsers, referrers] = await Promise.all([
    db.click.count({ where: baseWhere }),
    db.click.groupBy({
      by: ["createdAt"],
      where: baseWhere,
      _count: true,
      orderBy: { createdAt: "asc" },
    }),
    db.click.groupBy({
      by: ["country"],
      where: { ...baseWhere, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
    db.click.groupBy({
      by: ["device"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { device: "desc" } },
    }),
    db.click.groupBy({
      by: ["browser"],
      where: { ...baseWhere, browser: { not: null } },
      _count: true,
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
    db.click.groupBy({
      by: ["refererDomain"],
      where: baseWhere,
      _count: true,
      orderBy: { _count: { refererDomain: "desc" } },
      take: 10,
    }),
  ]);

  // Process time series
  const dailyClicksMap = new Map<string, number>();
  clicksByDay.forEach((item) => {
    const day = item.createdAt.toISOString().split("T")[0];
    dailyClicksMap.set(day, (dailyClicksMap.get(day) || 0) + item._count);
  });

  const timeSeries: Array<{ date: string; clicks: number }> = [];
  const currentDate = new Date(startDate);
  while (currentDate <= now) {
    const dateStr = currentDate.toISOString().split("T")[0];
    timeSeries.push({ date: dateStr, clicks: dailyClicksMap.get(dateStr) || 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const topDevice = devices[0]?.device || null;
  const topReferrer = referrers.find((r) => r.refererDomain)?.refererDomain || null;

  return {
    totalClicks,
    timeSeries,
    countries: countries.map((c) => ({ country: c.country, clicks: c._count })),
    devices: devices.map((d) => ({ device: d.device, clicks: d._count })),
    browsers: browsers.map((b) => ({ browser: b.browser, clicks: b._count })),
    referrers: referrers.map((r) => ({ domain: r.refererDomain, clicks: r._count })),
    topDevice,
    topReferrer,
  };
}
