import {
  getWhoopTokens,
  setWhoopTokens,
  setOAuthState,
  validateAndDeleteOAuthState,
} from "@/lib/redis";
import { getRedis } from "@/lib/redis";
import { WHOOP_TOKEN_URL } from "@/lib/config/constants";
import type { WhoopTokens } from "@/types";

export async function getValidAccessToken(): Promise<string> {
  const tokens = await getWhoopTokens();
  if (!tokens) {
    throw new Error("Whoop not connected. Please authorize via /whoop/setup.");
  }

  const now = Date.now();
  const expiresAt =
    typeof tokens.expires_at === "string"
      ? parseInt(tokens.expires_at, 10)
      : tokens.expires_at;

  // Refresh if within 5 minutes of expiry
  if (expiresAt - now < 5 * 60 * 1000) {
    return refreshAccessToken(tokens.refresh_token);
  }

  return tokens.access_token;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  // Use a Redis lock to prevent concurrent refresh race conditions
  const lockKey = "whoop:refresh-lock";
  const locked = await getRedis().set(lockKey, "1", { nx: true, ex: 30 });

  if (!locked) {
    // Another function is refreshing — wait and re-read tokens
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const tokens = await getWhoopTokens();
    if (!tokens) throw new Error("Whoop tokens lost during refresh.");
    return tokens.access_token;
  }

  try {
    const response = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whoop token refresh failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    const tokens: WhoopTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    await setWhoopTokens(tokens);
    return tokens.access_token;
  } finally {
    await getRedis().del(lockKey);
  }
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      redirect_uri: process.env.WHOOP_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Whoop token exchange failed: ${response.status} ${error}`
    );
  }

  const data = await response.json();
  const tokens: WhoopTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await setWhoopTokens(tokens);
}

export { setOAuthState, validateAndDeleteOAuthState };
