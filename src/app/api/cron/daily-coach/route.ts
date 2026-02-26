import { NextRequest, NextResponse } from "next/server";
import { fetchTodayWhoopData } from "@/lib/whoop/client";
import { buildDailyContext, formatContextForPrompt, updateRollingContext } from "@/lib/ai/context";
import { generateDailyCoaching } from "@/lib/ai/coach";
import { buildDailyEmailHtml } from "@/lib/email/templates";
import { sendDailyCoachingEmail } from "@/lib/email/send";
import { setDailyLog } from "@/lib/redis";
import { CRON_SECRET } from "@/lib/config/constants";
import type { DailyLog } from "@/types";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  try {
    // 1. Fetch Whoop data
    let whoopData;
    try {
      whoopData = await fetchTodayWhoopData();
    } catch (error) {
      console.warn("Whoop data fetch failed, continuing without it:", error);
      whoopData = { recovery: null, sleep: null, strain: null };
    }

    // 2. Build context
    const context = await buildDailyContext(now, whoopData);

    // 3. Generate coaching content via Claude
    const coachingContent = await generateDailyCoaching(context);

    // 4. Build email HTML
    const html = buildDailyEmailHtml(
      context.weekNumber,
      context.dayOfWeek,
      whoopData,
      coachingContent
    );

    // 5. Build subject line
    const sessionFocus = context.scheduledSession.focus;
    const subject = `Week ${context.weekNumber}, ${context.dayOfWeek}: ${sessionFocus}`;

    // 6. Send email
    const emailId = await sendDailyCoachingEmail(subject, html);

    // 7. Store daily log
    const log: DailyLog = {
      date: dateStr,
      whoopData,
      coachingResponse: coachingContent,
      sentAt: now.toISOString(),
      emailId,
    };
    await setDailyLog(dateStr, log);

    // 8. Update rolling context
    const highlight =
      context.scheduledSession.type === "rest"
        ? "Rest day."
        : `${context.scheduledSession.session}.`;
    await updateRollingContext(now, whoopData, highlight);

    return NextResponse.json({
      success: true,
      date: dateStr,
      emailId,
      recoveryScore: whoopData.recovery?.recovery_score ?? null,
    });
  } catch (error) {
    console.error("Daily coach cron error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
