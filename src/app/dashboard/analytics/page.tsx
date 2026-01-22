// ============================================================
// FICHIER 6: src/app/dashboard/analytics/page.tsx (REMPLACER)
// Correction: Période interactive avec useSearchParams
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";
import {
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MousePointerClick,
  TrendingUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatCompactNumber } from "@/app/lib/utils";

interface AnalyticsData {
  totalClicks: number;
  timeSeries: { date: string; clicks: number }[];
  countries: { country: string | null; clicks: number }[];
  devices: { device: string; clicks: number }[];
  browsers: { browser: string | null; clicks: number }[];
  referrers: { domain: string | null; clicks: number }[];
}

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const period = searchParams.get("period") || "7d";
  const linkId = searchParams.get("link") || undefined;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ period });
        if (linkId) params.set("linkId", linkId);

        const res = await fetch(`/api/analytics?${params}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, linkId]);

  // Changer la période
  const handlePeriodChange = (newPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    router.push(`/dashboard/analytics?${params.toString()}`);
  };

  const periods = [
    { value: "24h", label: "24 hours" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-tangerine" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{error || "No data available"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topDevice = data.devices[0]?.device || "N/A";
  const topReferrer = data.referrers.find((r) => r.domain)?.domain || "Direct";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track performance across all your links.</p>
        </div>

        {/* Period selector - INTERACTIF */}
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p.label}
            </button>
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
          value={topDevice}
          icon={topDevice === "MOBILE" ? Smartphone : topDevice === "TABLET" ? Tablet : Monitor}
          description="Most used"
        />
        <StatCard
          title="Top Referrer"
          value={topReferrer}
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
            {data.timeSeries.length === 0 || data.totalClicks === 0 ? (
              <EmptyChart message="No click data for this period" />
            ) : (
              <div className="h-64 flex items-end gap-1">
                {data.timeSeries.map((point, i) => {
                  const maxClicks = Math.max(...data.timeSeries.map((p) => p.clicks), 1);
                  const height = (point.clicks / maxClicks) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-gradient-to-t from-tangerine to-amber rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                        {point.clicks} clicks
                        <br />
                        {new Date(point.date).toLocaleDateString()}
                      </div>
                      {data.timeSeries.length <= 14 && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(point.date).getDate()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
              <EmptyChart message="No geographic data yet" />
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
              <EmptyChart message="No device data yet" />
            ) : (
              <div className="space-y-4">
                {data.devices.map((device, i) => {
                  const Icon =
                    device.device === "MOBILE"
                      ? Smartphone
                      : device.device === "TABLET"
                        ? Tablet
                        : Monitor;
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
                        <span className="text-xs text-muted-foreground">
                          ({formatCompactNumber(device.clicks)})
                        </span>
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
              <EmptyChart message="No browser data yet" />
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
                        <span className="text-xs text-muted-foreground">
                          ({formatCompactNumber(browser.clicks)})
                        </span>
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
              <EmptyChart message="No referrer data yet" />
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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
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

function EmptyChart({ message }: { message: string }) {
  return <div className="py-12 text-center text-muted-foreground text-sm">{message}</div>;
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