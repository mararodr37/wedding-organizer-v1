import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/whoop/auth";
import { WHOOP_API_BASE, CRON_SECRET } from "@/lib/config/constants";
import { fetchTodayWhoopData } from "@/lib/whoop/client";

async function safeFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { error: `${res.status} ${res.statusText}` };
  }
  return res.json();
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getValidAccessToken();

    // Fetch raw responses from Whoop API (correct endpoints)
    const rawCycle = await safeFetch(
      `${WHOOP_API_BASE}/cycle?limit=1`,
      token
    );

    // If we got a cycle, fetch its recovery
    let rawRecovery = null;
    const cycleId = rawCycle?.records?.[0]?.id;
    if (cycleId) {
      rawRecovery = await safeFetch(
        `${WHOOP_API_BASE}/cycle/${cycleId}/recovery`,
        token
      );
    }

    const rawSleep = await safeFetch(
      `${WHOOP_API_BASE}/activity/sleep?limit=1`,
      token
    );

    // Also get our parsed version
    const parsed = await fetchTodayWhoopData();

    return NextResponse.json({
      raw: {
        cycle: rawCycle,
        recovery: rawRecovery,
        sleep: rawSleep,
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
