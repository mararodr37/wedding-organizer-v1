import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "@/lib/whoop/auth";
import { WHOOP_AUTH_URL, WHOOP_SCOPES } from "@/lib/config/constants";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  await setOAuthState(state);

  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID!,
    redirect_uri: process.env.WHOOP_REDIRECT_URI!,
    response_type: "code",
    scope: WHOOP_SCOPES,
    state,
  });

  return NextResponse.redirect(`${WHOOP_AUTH_URL}?${params.toString()}`);
}
