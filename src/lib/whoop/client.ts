import { getValidAccessToken } from "./auth";
import { WHOOP_API_BASE } from "@/lib/config/constants";
import type {
  WhoopRecovery,
  WhoopSleep,
  WhoopCycle,
  WhoopDayData,
} from "@/types";

async function whoopFetch<T>(path: string): Promise<T> {
  const token = await getValidAccessToken();

  const response = await fetch(`${WHOOP_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // If 401, token might have been invalidated — try once more with refresh
    if (response.status === 401) {
      const { refreshAccessToken } = await import("./auth");
      const { getWhoopTokens } = await import("@/lib/redis");
      const tokens = await getWhoopTokens();
      if (!tokens) throw new Error("Whoop not connected.");
      const newToken = await refreshAccessToken(tokens.refresh_token);

      const retryResponse = await fetch(`${WHOOP_API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });

      if (!retryResponse.ok) {
        throw new Error(`Whoop API error after retry: ${retryResponse.status}`);
      }

      return retryResponse.json();
    }

    throw new Error(`Whoop API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchLatestRecovery(): Promise<WhoopRecovery | null> {
  // Recovery is accessed through cycles — get latest cycle, then its recovery
  const cycleData = await whoopFetch<{ records: WhoopCycle[] }>(
    "/cycle?limit=1"
  );
  const latestCycle = cycleData.records?.[0];
  if (!latestCycle) return null;

  try {
    const recovery = await whoopFetch<WhoopRecovery>(
      `/cycle/${latestCycle.id}/recovery`
    );
    // Only return if actually scored
    if (recovery.score_state && recovery.score_state !== "SCORED") {
      console.log(`Recovery score_state: ${recovery.score_state}, skipping`);
      return null;
    }
    return recovery;
  } catch {
    // 404 means no recovery for this cycle yet
    return null;
  }
}

export async function fetchLatestSleep(): Promise<WhoopSleep | null> {
  const data = await whoopFetch<{ records: WhoopSleep[] }>(
    "/activity/sleep?limit=1"
  );
  // Filter out naps, get the most recent actual sleep
  const mainSleep = data.records?.find((s) => !s.nap);
  return mainSleep ?? data.records?.[0] ?? null;
}

export async function fetchLatestCycle(): Promise<WhoopCycle | null> {
  const data = await whoopFetch<{ records: WhoopCycle[] }>(
    "/cycle?limit=1"
  );
  return data.records?.[0] ?? null;
}

export async function fetchTodayWhoopData(): Promise<WhoopDayData> {
  const [recovery, sleep, cycle] = await Promise.all([
    fetchLatestRecovery().catch(() => null),
    fetchLatestSleep().catch(() => null),
    fetchLatestCycle().catch(() => null),
  ]);

  const totalSleepMs =
    sleep?.score?.stage_summary?.total_in_bed_time_milli ?? 0;
  const totalAwakeMs =
    sleep?.score?.stage_summary?.total_awake_time_milli ?? 0;
  const actualSleepMs = totalSleepMs - totalAwakeMs;

  return {
    recovery: recovery?.score ?? null,
    sleep: sleep
      ? {
          performancePercent: sleep.score?.sleep_performance_percentage ?? null,
          totalSleepHours: Math.round((actualSleepMs / 3600000) * 10) / 10,
          efficiencyPercent: sleep.score?.sleep_efficiency_percentage ?? null,
        }
      : null,
    strain: cycle?.score?.strain ?? null,
  };
}
