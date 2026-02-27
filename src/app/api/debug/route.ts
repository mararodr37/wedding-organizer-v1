import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/whoop/auth";
import { WHOOP_API_BASE, CRON_SECRET } from "@/lib/config/constants";
import { fetchTodayWhoopData } from "@/lib/whoop/client";

export async function GET(request: NextRequest) {
  // Protect with cron secret instead of blocking production
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getValidAccessToken();

    // Fetch raw responses from Whoop API
    const [rawRecovery, rawSleep, rawCycle] = await Promise.all([
      fetch(`${WHOOP_API_BASE}/recovery?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${WHOOP_API_BASE}/activity/sleep?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${WHOOP_API_BASE}/cycle?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ]);

    // Also get our parsed version
    const parsed = await fetchTodayWhoopData();

    return NextResponse.json({
      raw: {
        recovery: rawRecovery,
        sleep: rawSleep,
        cycle: rawCycle,
      },
      parsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
