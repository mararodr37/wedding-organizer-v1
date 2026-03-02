import { NextResponse } from "next/server";
import { fetchTodayWhoopData } from "@/lib/whoop/client";
import { buildDailyContext, formatContextForPrompt } from "@/lib/ai/context";
import { getDailyLog } from "@/lib/redis";
import type { WhoopDayData } from "@/types";

export async function GET() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  try {
    let whoopData: WhoopDayData;
    try {
      whoopData = await fetchTodayWhoopData();
    } catch {
      whoopData = { recovery: null, sleep: null, strain: null };
    }

    // Fallback to yesterday's recovery if needed
    if (!whoopData.recovery) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayLog = await getDailyLog(yesterday.toISOString().split("T")[0]);
      if (yesterdayLog?.whoopData?.recovery) {
        whoopData = { ...whoopData, recovery: yesterdayLog.whoopData.recovery };
      }
    }

    const context = await buildDailyContext(now, whoopData);
    const formatted = formatContextForPrompt(context);

    return NextResponse.json({
      date: dateStr,
      context: formatted,
      beauty: context.beauty,
      whoop: {
        recovery: whoopData.recovery?.recovery_score ?? null,
        sleep: whoopData.sleep?.totalSleepHours ?? null,
        strain: whoopData.strain,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
