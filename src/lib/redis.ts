import { Redis } from "@upstash/redis";
import type { WhoopTokens, DailyLog, UserReply } from "@/types";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

// Re-export as default for imports that use `import redis from "@/lib/redis"`
export default { get redis() { return getRedis(); } };

// --- Whoop Tokens ---

export async function getWhoopTokens(): Promise<WhoopTokens | null> {
  const data = await getRedis().hgetall("whoop:tokens");
  if (!data || Object.keys(data).length === 0) return null;
  const tokens = data as Record<string, unknown>;
  if (!tokens.access_token) return null;
  return {
    access_token: tokens.access_token as string,
    refresh_token: tokens.refresh_token as string,
    expires_at: Number(tokens.expires_at),
  };
}

export async function setWhoopTokens(tokens: WhoopTokens): Promise<void> {
  await getRedis().hset("whoop:tokens", {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: String(tokens.expires_at),
  });
}

// --- Daily Logs ---

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  return getRedis().get<DailyLog>(`daily-log:${date}`);
}

export async function setDailyLog(date: string, log: DailyLog): Promise<void> {
  await getRedis().set(`daily-log:${date}`, log);
}

// --- Replies ---

export async function addReply(date: string, reply: UserReply): Promise<void> {
  await getRedis().rpush(`replies:${date}`, JSON.stringify(reply));
}

export async function getReplies(date: string): Promise<UserReply[]> {
  const raw = await getRedis().lrange<string>(`replies:${date}`, 0, -1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// --- Rolling Context ---

export async function getRollingContext(): Promise<string> {
  return (await getRedis().get<string>("context:rolling")) ?? "";
}

export async function setRollingContext(context: string): Promise<void> {
  await getRedis().set("context:rolling", context);
}

// --- Last Sent Email ID ---

export async function getLastEmailId(): Promise<string | null> {
  return getRedis().get<string>("email:last-sent-id");
}

export async function setLastEmailId(id: string): Promise<void> {
  await getRedis().set("email:last-sent-id", id);
}

// --- OAuth State ---

export async function setOAuthState(state: string): Promise<void> {
  await getRedis().set(`whoop:oauth-state:${state}`, "1", { ex: 600 });
}

export async function validateAndDeleteOAuthState(
  state: string
): Promise<boolean> {
  const exists = await getRedis().get(`whoop:oauth-state:${state}`);
  if (!exists) return false;
  await getRedis().del(`whoop:oauth-state:${state}`);
  return true;
}
