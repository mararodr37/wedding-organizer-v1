import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Debug endpoint disabled in production" }, { status: 403 });
  }

  // Forward to the daily coach cron with the cron secret
  const cronUrl = new URL("/api/cron/daily-coach", request.url);
  const response = await fetch(cronUrl.toString(), {
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  });

  const data = await response.json();
  return NextResponse.json({ debug: true, ...data }, { status: response.status });
}
