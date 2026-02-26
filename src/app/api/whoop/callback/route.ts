import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, validateAndDeleteOAuthState } from "@/lib/whoop/auth";
import { APP_URL } from "@/lib/config/constants";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  const validState = await validateAndDeleteOAuthState(state);
  if (!validState) {
    return NextResponse.json(
      { error: "Invalid or expired OAuth state" },
      { status: 403 }
    );
  }

  try {
    await exchangeCodeForTokens(code);
    return NextResponse.redirect(`${APP_URL}/whoop/setup?success=true`);
  } catch (error) {
    console.error("Whoop OAuth callback error:", error);
    return NextResponse.redirect(`${APP_URL}/whoop/setup?error=token_exchange_failed`);
  }
}
