import { getReplies, getRollingContext, getDailyLog, setRollingContext } from "@/lib/redis";
import { getTodaySchedule, getWeekNumber } from "@/lib/config/training-plan";
import { PROGRAM_START_DATE } from "@/lib/config/constants";
import type { WhoopDayData, CoachingContext } from "@/types";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getYesterday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
}

export async function buildDailyContext(
  date: Date,
  whoopData: WhoopDayData
): Promise<CoachingContext> {
  const dateStr = formatDate(date);
  const yesterdayStr = formatDate(getYesterday(date));
  const schedule = getTodaySchedule(date);
  const weekNumber = getWeekNumber(date, PROGRAM_START_DATE);

  const [yesterdayReplies, rollingContext] = await Promise.all([
    getReplies(yesterdayStr),
    getRollingContext(),
  ]);

  return {
    date: dateStr,
    dayOfWeek: schedule.dayName.charAt(0).toUpperCase() + schedule.dayName.slice(1),
    weekNumber,
    scheduledSession: {
      type: schedule.type,
      focus: schedule.focus,
      session: schedule.session,
      exercises: schedule.exercises,
      guidelines: schedule.guidelines,
      conditional: schedule.conditional,
    },
    whoop: whoopData,
    yesterdayReplies,
    rollingContext,
  };
}

export function formatContextForPrompt(context: CoachingContext): string {
  const lines: string[] = [];

  lines.push(`## Today: ${context.dayOfWeek}, ${context.date}`);
  lines.push(`Week ${context.weekNumber} of 14\n`);

  // Scheduled session
  lines.push(`## Scheduled Session`);
  lines.push(`- Type: ${context.scheduledSession.type}`);
  lines.push(`- Focus: ${context.scheduledSession.focus}`);
  lines.push(`- Session: ${context.scheduledSession.session}`);
  if (context.scheduledSession.exercises?.length) {
    lines.push(`- Exercises: ${context.scheduledSession.exercises.join(", ")}`);
  }
  if (context.scheduledSession.guidelines?.length) {
    lines.push(
      `- Guidelines: ${context.scheduledSession.guidelines.join("; ")}`
    );
  }
  if (context.scheduledSession.conditional) {
    lines.push(
      `- If fatigued: ${context.scheduledSession.conditional.if_fatigued}`
    );
    lines.push(
      `- If energized: ${context.scheduledSession.conditional.if_energized}`
    );
  }

  // Whoop data
  lines.push(`\n## Whoop Data`);
  if (context.whoopRecoveryFallback) {
    lines.push(`- Note: Today's recovery data not yet available. Using yesterday's recovery as reference.`);
  }
  if (context.whoop.recovery) {
    lines.push(
      `- Recovery Score: ${context.whoop.recovery.recovery_score}%${context.whoopRecoveryFallback ? " (yesterday)" : ""}`
    );
    lines.push(
      `- HRV: ${context.whoop.recovery.heart_rate_variability_rmssd.toFixed(1)} ms`
    );
    lines.push(
      `- Resting HR: ${context.whoop.recovery.resting_heart_rate} bpm`
    );
    if (context.whoop.recovery.spo2_percentage) {
      lines.push(`- SpO2: ${context.whoop.recovery.spo2_percentage}%`);
    }
  } else {
    lines.push("- Recovery data unavailable today");
  }

  if (context.whoop.sleep) {
    lines.push(`- Sleep: ${context.whoop.sleep.totalSleepHours} hours`);
    if (context.whoop.sleep.performancePercent !== null) {
      lines.push(
        `- Sleep Performance: ${context.whoop.sleep.performancePercent}%`
      );
    }
    if (context.whoop.sleep.efficiencyPercent !== null) {
      lines.push(
        `- Sleep Efficiency: ${context.whoop.sleep.efficiencyPercent}%`
      );
    }
  } else {
    lines.push("- Sleep data unavailable today");
  }

  if (context.whoop.strain !== null) {
    lines.push(`- Yesterday's Strain: ${context.whoop.strain.toFixed(1)}`);
  }

  // Yesterday's replies
  if (context.yesterdayReplies.length > 0) {
    lines.push(`\n## Mara's Feedback from Yesterday`);
    for (const reply of context.yesterdayReplies) {
      if (!reply.isAgentReply) {
        lines.push(`- "${reply.text}"`);
      }
    }
  }

  // Rolling context
  if (context.rollingContext) {
    lines.push(`\n## Recent History (7-day summary)`);
    lines.push(context.rollingContext);
  }

  return lines.join("\n");
}

export async function updateRollingContext(
  date: Date,
  whoopData: WhoopDayData,
  coachingHighlights: string
): Promise<void> {
  const dateStr = formatDate(date);
  const existing = await getRollingContext();

  // Build today's summary line
  const recoveryStr = whoopData.recovery
    ? `recovery ${whoopData.recovery.recovery_score}%`
    : "no recovery data";
  const sleepStr = whoopData.sleep
    ? `sleep ${whoopData.sleep.totalSleepHours}h`
    : "no sleep data";

  const todayLine = `${dateStr}: ${recoveryStr}, ${sleepStr}. ${coachingHighlights}`;

  // Parse existing lines, keep only last 6 days (+ today = 7)
  const existingLines = existing
    ? existing.split("\n").filter((l) => l.trim())
    : [];
  const recentLines = existingLines.slice(-6);
  recentLines.push(todayLine);

  await setRollingContext(recentLines.join("\n"));
}
