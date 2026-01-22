/**
 * Analytics Query API
 * 
 * GET /api/analytics?linkId=&period=7d
 * 
 * Fetch aggregated analytics data.
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const linkId = searchParams.get("linkId");
    const period = searchParams.get("period") || "7d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "24h":
        startDate = subDays(now, 1);
        break;
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "30d":
        startDate = subDays(now, 30);
        break;
      case "90d":
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }

    const baseWhere = {
      link: {
        userId: session.user.id,
        ...(linkId && { id: linkId }),
      },
      createdAt: {
        gte: startOfDay(startDate),
        lte: endOfDay(now),
      },
      isBot: false,
    };

    const [totalClicks, clicksByDay, countries, devices, browsers, referrers] =
      await Promise.all([
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
      timeSeries.push({
        date: dateStr,
        clicks: dailyClicksMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      period,
      totalClicks,
      timeSeries,
      countries: countries.map((c) => ({
        country: c.country,
        clicks: c._count,
      })),
      devices: devices.map((d) => ({ device: d.device, clicks: d._count })),
      browsers: browsers.map((b) => ({ browser: b.browser, clicks: b._count })),
      referrers: referrers.map((r) => ({
        domain: r.refererDomain,
        clicks: r._count,
      })),
    });
  } catch (error) {
    console.error("[API] Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
